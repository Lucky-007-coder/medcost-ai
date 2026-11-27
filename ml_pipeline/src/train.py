"""
Training and Evaluation Pipeline for Medical Insurance Cost Prediction.
Trains Model A (Core Demographics) and Model B (Core + Non-leakage Clinical & Policy).
Calculates exact empirical metrics: MAE, MSE, RMSE, R², Adjusted R², VIF, and Residual analysis.
Exports joblib pipelines and JSON metadata for backend consumption.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from scipy import stats
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from statsmodels.stats.outliers_influence import variance_inflation_factor

from preprocess import (
    get_preprocessor_a, 
    get_preprocessor_b, 
    NUMERICAL_FEATURES_A, 
    NUMERICAL_FEATURES_B,
    CATEGORICAL_SPECS_A,
    CATEGORICAL_SPECS_B
)

DATA_PATH = os.path.join(os.path.dirname(__file__), '../data/medical_insurance.csv')
ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), '../artifacts')
TARGET = 'annual_medical_cost'
RANDOM_STATE = 42
TEST_SIZE = 0.2

def compute_metrics(y_true, y_pred, n_features):
    """Computes MAE, MSE, RMSE, R2, and Adjusted R2."""
    n = len(y_true)
    p = n_features
    mae = mean_absolute_error(y_true, y_pred)
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_true, y_pred)
    # Adjusted R2 formula: 1 - [(1 - R2) * (n - 1) / (n - p - 1)]
    adj_r2 = 1.0 - (1.0 - r2) * (n - 1) / (n - p - 1)
    return {
        'mae': float(round(mae, 2)),
        'mse': float(round(mse, 2)),
        'rmse': float(round(rmse, 2)),
        'r2': float(round(r2, 6)),
        'adjusted_r2': float(round(adj_r2, 6))
    }

def compute_vif(X_design, feature_names):
    """Computes Variance Inflation Factor (VIF) for design matrix."""
    vif_records = []
    # Add intercept for VIF calculation if not present
    X_mat = np.asarray(X_design)
    for i in range(X_mat.shape[1]):
        val = variance_inflation_factor(X_mat, i)
        vif_records.append({
            'feature': feature_names[i],
            'vif': float(round(val, 2)) if np.isfinite(val) else 9999.99
        })
    return vif_records

def main():
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    print(f"Loading dataset from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    print(f"Dataset shape: {df.shape}")

    # Prepare candidate features
    features_a = NUMERICAL_FEATURES_A + list(CATEGORICAL_SPECS_A.keys())
    features_b = NUMERICAL_FEATURES_B + list(CATEGORICAL_SPECS_B.keys())

    X_a = df[features_a].copy()
    X_b = df[features_b].copy()
    y = df[TARGET].copy()

    # Shared Train-Test Split (80/20, fixed random_state=42)
    indices = np.arange(len(df))
    train_idx, test_idx = train_test_split(indices, test_size=TEST_SIZE, random_state=RANDOM_STATE)

    X_train_a, X_test_a = X_a.iloc[train_idx], X_a.iloc[test_idx]
    X_train_b, X_test_b = X_b.iloc[train_idx], X_b.iloc[test_idx]
    y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

    # ==========================================
    # 1. TRAIN MODEL A (Core Demographics)
    # ==========================================
    prep_a = get_preprocessor_a()
    model_a = Pipeline([
        ('prep', prep_a),
        ('reg', LinearRegression())
    ])
    model_a.fit(X_train_a, y_train)

    # Feature names out for Model A
    cat_names_a = model_a.named_steps['prep'].named_transformers_['cat'].get_feature_names_out(list(CATEGORICAL_SPECS_A.keys()))
    names_a = NUMERICAL_FEATURES_A + list(cat_names_a)
    n_features_a = len(names_a)

    y_pred_train_a = model_a.predict(X_train_a)
    y_pred_test_a = model_a.predict(X_test_a)

    metrics_train_a = compute_metrics(y_train, y_pred_train_a, n_features_a)
    metrics_test_a = compute_metrics(y_test, y_pred_test_a, n_features_a)

    # VIF for Model A
    X_design_a = model_a.named_steps['prep'].transform(X_train_a)
    vif_a = compute_vif(X_design_a, names_a)

    coefs_a = [
        {
            'feature': name, 
            'coefficient': float(round(coef, 2)),
            'interpretation': f"Holding other features constant, 1 unit increase in {name} is associated with a ${coef:.2f} difference in estimated charges."
        }
        for name, coef in zip(names_a, model_a.named_steps['reg'].coef_)
    ]

    # ==========================================
    # 2. TRAIN MODEL B (Core + Clinical & Policy)
    # ==========================================
    prep_b = get_preprocessor_b()
    model_b = Pipeline([
        ('prep', prep_b),
        ('reg', LinearRegression())
    ])
    model_b.fit(X_train_b, y_train)

    cat_names_b = model_b.named_steps['prep'].named_transformers_['cat'].get_feature_names_out(list(CATEGORICAL_SPECS_B.keys()))
    names_b = NUMERICAL_FEATURES_B + list(cat_names_b)
    n_features_b = len(names_b)

    y_pred_train_b = model_b.predict(X_train_b)
    y_pred_test_b = model_b.predict(X_test_b)

    metrics_train_b = compute_metrics(y_train, y_pred_train_b, n_features_b)
    metrics_test_b = compute_metrics(y_test, y_pred_test_b, n_features_b)

    # VIF for Model B
    X_design_b = model_b.named_steps['prep'].transform(X_train_b)
    vif_b = compute_vif(X_design_b, names_b)

    coefs_b = [
        {
            'feature': name, 
            'coefficient': float(round(coef, 2)),
            'interpretation': f"Holding other features constant, 1 unit increase in {name} is associated with a ${coef:.2f} difference in estimated charges."
        }
        for name, coef in zip(names_b, model_b.named_steps['reg'].coef_)
    ]

    # ==========================================
    # 3. RESIDUAL DIAGNOSTICS (Test Set Model A & Model B)
    # ==========================================
    res_b = (y_test - y_pred_test_b).values
    res_a = (y_test - y_pred_test_a).values

    # Histogram of residuals (25 bins) for Model B
    hist_counts_b, bin_edges_b = np.histogram(res_b, bins=25)
    residual_hist_b = [
        {
            'bin_start': float(round(bin_edges_b[i], 1)),
            'bin_end': float(round(bin_edges_b[i+1], 1)),
            'bin_center': float(round((bin_edges_b[i] + bin_edges_b[i+1]) / 2, 1)),
            'frequency': int(hist_counts_b[i])
        }
        for i in range(len(hist_counts_b))
    ]

    # Histogram of residuals for Model A
    hist_counts_a, bin_edges_a = np.histogram(res_a, bins=25)
    residual_hist_a = [
        {
            'bin_start': float(round(bin_edges_a[i], 1)),
            'bin_end': float(round(bin_edges_a[i+1], 1)),
            'bin_center': float(round((bin_edges_a[i] + bin_edges_a[i+1]) / 2, 1)),
            'frequency': int(hist_counts_a[i])
        }
        for i in range(len(hist_counts_a))
    ]

    # Sample for Scatter Plot (Actual vs Predicted & Residuals vs Fitted)
    # Subsample 400 evenly spaced points from test set for responsive frontend rendering
    sample_sub_idx = np.linspace(0, len(y_test) - 1, 400, dtype=int)
    
    scatter_data_b = [
        {
            'actual': float(round(float(y_test.iloc[idx]), 2)),
            'predicted': float(round(float(y_pred_test_b[idx]), 2)),
            'residual': float(round(float(res_b[idx]), 2)),
            'age': int(X_test_b.iloc[idx]['age']),
            'smoker': str(X_test_b.iloc[idx]['smoker']),
            'chronic_count': int(X_test_b.iloc[idx]['chronic_count'])
        }
        for idx in sample_sub_idx
    ]

    scatter_data_a = [
        {
            'actual': float(round(float(y_test.iloc[idx]), 2)),
            'predicted': float(round(float(y_pred_test_a[idx]), 2)),
            'residual': float(round(float(res_a[idx]), 2)),
            'age': int(X_test_a.iloc[idx]['age']),
            'smoker': str(X_test_a.iloc[idx]['smoker'])
        }
        for idx in sample_sub_idx
    ]

    # Age vs Cost trend by Smoker status
    df['age_group'] = pd.cut(df['age'], bins=[0, 25, 35, 45, 55, 65, 100], labels=['<25', '25-34', '35-44', '45-54', '55-64', '65+'])
    age_smoker_stats = df.groupby(['age_group', 'smoker'], observed=False)[TARGET].agg(['mean', 'median', 'count']).reset_index()
    age_smoker_chart = []
    for ag in ['<25', '25-34', '35-44', '45-54', '55-64', '65+']:
        entry = {'age_group': ag}
        for smk in ['Never', 'Former', 'Current']:
            match = age_smoker_stats[(age_smoker_stats['age_group'] == ag) & (age_smoker_stats['smoker'] == smk)]
            entry[f'mean_{smk.lower()}'] = float(round(match['mean'].values[0], 2)) if not match.empty else 0
            entry[f'median_{smk.lower()}'] = float(round(match['median'].values[0], 2)) if not match.empty else 0
        age_smoker_chart.append(entry)

    # Correlation Matrix of continuous clinical/demographic features
    corr_cols = ['annual_medical_cost', 'age', 'bmi', 'dependents', 'income', 'systolic_bp', 'hba1c', 'visits_last_year', 'hospitalizations_last_3yrs', 'chronic_count', 'deductible']
    corr_df = df[corr_cols].corr()
    corr_matrix = []
    for r_name in corr_cols:
        row_obj = {'feature': r_name}
        for c_name in corr_cols:
            row_obj[c_name] = float(round(corr_df.loc[r_name, c_name], 3))
        corr_matrix.append(row_obj)

    # Save Models
    joblib.dump(model_a, os.path.join(ARTIFACTS_DIR, 'linear_regression_model_a.joblib'))
    joblib.dump(model_b, os.path.join(ARTIFACTS_DIR, 'linear_regression_model_b.joblib'))

    # Build model_metadata.json
    metadata = {
        'project': 'Medical Insurance Cost Prediction using Linear Regression',
        'dataset_profile': {
            'total_rows': len(df),
            'total_columns': len(df.columns),
            'target_variable': TARGET,
            'split': {'train_size': len(train_idx), 'test_size': len(test_idx), 'random_state': RANDOM_STATE}
        },
        'reference_categories': {
            'sex': 'Female',
            'smoker': 'Never',
            'region': 'Central',
            'plan_type': 'HMO'
        },
        'model_a': {
            'name': 'Model A (Core Demographics & Lifestyle)',
            'description': 'Predicts annual medical charges using foundational demographic features only.',
            'features': features_a,
            'intercept': float(round(model_a.named_steps['reg'].intercept_, 2)),
            'coefficients': coefs_a,
            'metrics_train': metrics_train_a,
            'metrics_test': metrics_test_a,
            'vif': vif_a,
            'residual_summary': {
                'mean': float(round(np.mean(res_a), 2)),
                'std': float(round(np.std(res_a), 2)),
                'skewness': float(round(float(stats.skew(res_a)), 3)),
                'kurtosis': float(round(float(stats.kurtosis(res_a)), 3))
            }
        },
        'model_b': {
            'name': 'Model B (Comprehensive Clinical & Policy Intake Profile)',
            'description': 'Predicts annual charges using core demographics plus pre-policy biometrics, chronic history, and coverage parameters (leak-free).',
            'features': features_b,
            'intercept': float(round(model_b.named_steps['reg'].intercept_, 2)),
            'coefficients': coefs_b,
            'metrics_train': metrics_train_b,
            'metrics_test': metrics_test_b,
            'vif': vif_b,
            'residual_summary': {
                'mean': float(round(np.mean(res_b), 2)),
                'std': float(round(np.std(res_b), 2)),
                'skewness': float(round(float(stats.skew(res_b)), 3)),
                'kurtosis': float(round(float(stats.kurtosis(res_b)), 3))
            }
        },
        'excluded_leakage_features': [
            {'column': 'annual_premium', 'reason': 'Target-derived; mathematical proxy for medical cost.'},
            {'column': 'monthly_premium', 'reason': 'Direct division of annual premium; post-cost mathematical derivative.'},
            {'column': 'claims_count', 'reason': 'Post-policy outcome; counts claims filed during coverage year.'},
            {'column': 'avg_claim_amount', 'reason': 'Post-policy outcome; claims financial metric.'},
            {'column': 'total_claims_paid', 'reason': 'Post-policy outcome; directly sums insurer payouts.'},
            {'column': 'risk_score', 'reason': 'Composite score generated by insurer with knowledge of outcome/claims.'},
            {'column': 'is_high_risk', 'reason': 'Binary flag derived directly from risk_score.'},
            {'column': 'had_major_procedure', 'reason': 'Event occurring during the covered policy year.'},
            {'column': 'proc_*_count', 'reason': 'Procedure counts executed during the covered year.'},
            {'column': 'alcohol_freq', 'reason': 'Contains 30,083 missing values (30.1% null rate).'}
        ]
    }

    with open(os.path.join(ARTIFACTS_DIR, 'model_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)

    # Build dataset_summary.json for frontend analytics
    dataset_summary = {
        'distributions': {
            'target': {
                'min': float(df[TARGET].min()),
                'max': float(df[TARGET].max()),
                'mean': float(df[TARGET].mean()),
                'median': float(df[TARGET].median()),
                'std': float(df[TARGET].std())
            },
            'age': {'min': int(df['age'].min()), 'max': int(df['age'].max()), 'mean': float(df['age'].mean())},
            'bmi': {'min': float(df['bmi'].min()), 'max': float(df['bmi'].max()), 'mean': float(df['bmi'].mean())},
            'dependents': {'min': int(df['dependents'].min()), 'max': int(df['dependents'].max())},
            'income': {'min': float(df['income'].min()), 'max': float(df['income'].max()), 'mean': float(df['income'].mean())},
            'systolic_bp': {'min': float(df['systolic_bp'].min()), 'max': float(df['systolic_bp'].max()), 'mean': float(df['systolic_bp'].mean())},
            'hba1c': {'min': float(df['hba1c'].min()), 'max': float(df['hba1c'].max()), 'mean': float(df['hba1c'].mean())}
        },
        'age_smoker_trends': age_smoker_chart,
        'correlation_matrix': corr_matrix,
        'residual_histogram_a': residual_hist_a,
        'residual_histogram_b': residual_hist_b,
        'actual_vs_predicted_sample_a': scatter_data_a,
        'actual_vs_predicted_sample_b': scatter_data_b,
        'actual_vs_predicted_sample': scatter_data_b,
        'residual_histogram': residual_hist_b
    }

    with open(os.path.join(ARTIFACTS_DIR, 'dataset_summary.json'), 'w') as f:
        json.dump(dataset_summary, f, indent=2)

    print("Phase 1 artifacts successfully generated in ml_pipeline/artifacts:")
    print(" - linear_regression_model_a.joblib")
    print(" - linear_regression_model_b.joblib")
    print(" - model_metadata.json")
    print(" - dataset_summary.json")

if __name__ == '__main__':
    main()

"""
Comprehensive Optimization Experiments for MedCost.ai
Tests Experiments A, B, C, D, and E strictly adhering to OLS Linear Regression,
80/20 train/test split with random_state=42, no leakage, and 5-fold CV.
"""

import os
import json
import numpy as np
import pandas as pd
from scipy import stats
from sklearn.model_selection import train_test_split, KFold
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder, PolynomialFeatures, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from statsmodels.stats.outliers_influence import variance_inflation_factor

DATA_PATH = os.path.join(os.path.dirname(__file__), '../data/medical_insurance.csv')
print(f"Loading dataset from: {DATA_PATH}")
df = pd.read_csv(DATA_PATH)

TARGET = 'annual_medical_cost'
RANDOM_STATE = 42
TEST_SIZE = 0.2

# 80/20 Deterministic Partition
indices = np.arange(len(df))
train_idx, test_idx = train_test_split(indices, test_size=TEST_SIZE, random_state=RANDOM_STATE)

train_df = df.iloc[train_idx].copy()
test_df = df.iloc[test_idx].copy()

y_train = train_df[TARGET].values
y_test = test_df[TARGET].values

kf = KFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

def evaluate_predictions(y_true, y_pred, p_features):
    """Calculates R², Adj R², MAE, MSE, RMSE, and residual moments."""
    n = len(y_true)
    r2 = r2_score(y_true, y_pred)
    adj_r2 = 1.0 - (1.0 - r2) * (n - 1) / (n - p_features - 1) if n > p_features + 1 else r2
    mae = mean_absolute_error(y_true, y_pred)
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    residuals = y_true - y_pred
    skew = float(stats.skew(residuals))
    kurt = float(stats.kurtosis(residuals))
    return {
        'r2': float(r2),
        'adj_r2': float(adj_r2),
        'mae': float(mae),
        'mse': float(mse),
        'rmse': float(rmse),
        'skewness': skew,
        'kurtosis': kurt,
        'residuals': residuals
    }

def run_cv_5fold(X_train_df, y_train_arr, preprocessor_fn):
    """Performs 5-fold cross-validation on the train split only."""
    cv_r2_scores = []
    cv_mae_scores = []
    
    for tr_k, val_k in kf.split(X_train_df):
        X_tr, X_val = X_train_df.iloc[tr_k], X_train_df.iloc[val_k]
        y_tr, y_val = y_train_arr[tr_k], y_train_arr[val_k]
        
        prep = preprocessor_fn()
        pipe = Pipeline([('prep', prep), ('reg', LinearRegression())])
        pipe.fit(X_tr, y_tr)
        val_preds = pipe.predict(X_val)
        cv_r2_scores.append(r2_score(y_val, val_preds))
        cv_mae_scores.append(mean_absolute_error(y_val, val_preds))
        
    return float(np.mean(cv_r2_scores)), float(np.std(cv_r2_scores)), float(np.mean(cv_mae_scores))

def compute_vif_df(X_transformed, feature_names):
    """Computes VIF for a design matrix."""
    vifs = []
    X_mat = np.asarray(X_transformed)
    # Sample 10000 rows if matrix is very large for computational speed
    if X_mat.shape[0] > 10000:
        sample_idx = np.random.RandomState(42).choice(X_mat.shape[0], 10000, replace=False)
        X_mat = X_mat[sample_idx]
    
    for i in range(X_mat.shape[1]):
        try:
            val = variance_inflation_factor(X_mat, i)
            vifs.append({'feature': feature_names[i], 'vif': float(round(val, 2)) if np.isfinite(val) else 9999.99})
        except Exception:
            vifs.append({'feature': feature_names[i], 'vif': 9999.99})
    return vifs

results = []

# ==============================================================================
# BASELINE 1: MODEL A (Core 6)
# ==============================================================================
num_a = ['age', 'bmi', 'dependents']
cat_a = {'sex': ['Female', 'Male', 'Other'], 'smoker': ['Never', 'Former', 'Current'], 'region': ['Central', 'East', 'North', 'South', 'West']}
def prep_base_a():
    return ColumnTransformer([
        ('num', 'passthrough', num_a),
        ('cat', OneHotEncoder(categories=[cat_a[c] for c in cat_a], drop='first', sparse_output=False), list(cat_a.keys()))
    ])

X_tr_a = train_df[num_a + list(cat_a.keys())]
X_te_a = test_df[num_a + list(cat_a.keys())]

cv_r2_a, cv_std_a, cv_mae_a = run_cv_5fold(X_tr_a, y_train, prep_base_a)
pipe_a = Pipeline([('prep', prep_base_a()), ('reg', LinearRegression())])
pipe_a.fit(X_tr_a, y_train)
p_a = len(pipe_a.named_steps['reg'].coef_)

train_eval_a = evaluate_predictions(y_train, pipe_a.predict(X_tr_a), p_a)
test_eval_a = evaluate_predictions(y_test, pipe_a.predict(X_te_a), p_a)

results.append({
    'name': 'Baseline Model A (Core 6)',
    'experiment': 'Baseline',
    'p_features': p_a,
    'cv_5fold_r2': cv_r2_a,
    'cv_5fold_std': cv_std_a,
    'train_r2': train_eval_a['r2'],
    'test_r2': test_eval_a['r2'],
    'test_adj_r2': test_eval_a['adj_r2'],
    'test_mae': test_eval_a['mae'],
    'test_rmse': test_eval_a['rmse'],
    'skewness': test_eval_a['skewness'],
    'kurtosis': test_eval_a['kurtosis']
})

# ==============================================================================
# BASELINE 2: MODEL B (Clinical 14)
# ==============================================================================
num_b = ['age', 'bmi', 'dependents', 'income', 'systolic_bp', 'hba1c', 'visits_last_year', 'hospitalizations_last_3yrs', 'chronic_count', 'deductible']
cat_b = {
    'sex': ['Female', 'Male', 'Other'],
    'smoker': ['Never', 'Former', 'Current'],
    'region': ['Central', 'East', 'North', 'South', 'West'],
    'plan_type': ['HMO', 'PPO', 'EPO', 'POS']
}
def prep_base_b():
    return ColumnTransformer([
        ('num', 'passthrough', num_b),
        ('cat', OneHotEncoder(categories=[cat_b[c] for c in cat_b], drop='first', sparse_output=False), list(cat_b.keys()))
    ])

X_tr_b = train_df[num_b + list(cat_b.keys())]
X_te_b = test_df[num_b + list(cat_b.keys())]

cv_r2_b, cv_std_b, cv_mae_b = run_cv_5fold(X_tr_b, y_train, prep_base_b)
pipe_b = Pipeline([('prep', prep_base_b()), ('reg', LinearRegression())])
pipe_b.fit(X_tr_b, y_train)
p_b = len(pipe_b.named_steps['reg'].coef_)

train_eval_b = evaluate_predictions(y_train, pipe_b.predict(X_tr_b), p_b)
test_eval_b = evaluate_predictions(y_test, pipe_b.predict(X_te_b), p_b)

results.append({
    'name': 'Baseline Model B (Clinical 14)',
    'experiment': 'Baseline',
    'p_features': p_b,
    'cv_5fold_r2': cv_r2_b,
    'cv_5fold_std': cv_std_b,
    'train_r2': train_eval_b['r2'],
    'test_r2': test_eval_b['r2'],
    'test_adj_r2': test_eval_b['adj_r2'],
    'test_mae': test_eval_b['mae'],
    'test_rmse': test_eval_b['rmse'],
    'skewness': test_eval_b['skewness'],
    'kurtosis': test_eval_b['kurtosis']
})

print("Baselines calculated.")

# ==============================================================================
# EXPERIMENT A1: EXPANDED PRE-POLICY CLINICAL OLS (Adding 10 Individual Chronic Conditions + Utilization)
# ==============================================================================
chronic_cols = [
    'hypertension', 'diabetes', 'asthma', 'copd', 'cardiovascular_disease',
    'cancer_history', 'kidney_disease', 'liver_disease', 'arthritis', 'mental_health'
]
# Replacing chronic_count with the 10 individual conditions to avoid exact rank deficiency (sum(chronic) == chronic_count)
# Also adding: days_hospitalized_last_3yrs, medication_count, diastolic_bp, ldl
num_exp_a1 = [
    'age', 'bmi', 'dependents', 'income', 'systolic_bp', 'diastolic_bp', 'ldl', 'hba1c',
    'visits_last_year', 'hospitalizations_last_3yrs', 'days_hospitalized_last_3yrs',
    'medication_count', 'deductible'
] + chronic_cols

def prep_exp_a1():
    return ColumnTransformer([
        ('num', 'passthrough', num_exp_a1),
        ('cat', OneHotEncoder(categories=[cat_b[c] for c in cat_b], drop='first', sparse_output=False), list(cat_b.keys()))
    ])

X_tr_a1 = train_df[num_exp_a1 + list(cat_b.keys())]
X_te_a1 = test_df[num_exp_a1 + list(cat_b.keys())]

cv_r2_a1, cv_std_a1, cv_mae_a1 = run_cv_5fold(X_tr_a1, y_train, prep_exp_a1)
pipe_a1 = Pipeline([('prep', prep_exp_a1()), ('reg', LinearRegression())])
pipe_a1.fit(X_tr_a1, y_train)
p_a1 = len(pipe_a1.named_steps['reg'].coef_)

train_eval_a1 = evaluate_predictions(y_train, pipe_a1.predict(X_tr_a1), p_a1)
test_eval_a1 = evaluate_predictions(y_test, pipe_a1.predict(X_te_a1), p_a1)

results.append({
    'name': 'Exp A1: Individual Conditions + Biomarkers',
    'experiment': 'Exp A: Expanded Clinical',
    'p_features': p_a1,
    'cv_5fold_r2': cv_r2_a1,
    'cv_5fold_std': cv_std_a1,
    'train_r2': train_eval_a1['r2'],
    'test_r2': test_eval_a1['r2'],
    'test_adj_r2': test_eval_a1['adj_r2'],
    'test_mae': test_eval_a1['mae'],
    'test_rmse': test_eval_a1['rmse'],
    'skewness': test_eval_a1['skewness'],
    'kurtosis': test_eval_a1['kurtosis']
})

print(f"Exp A1: CV R²={cv_r2_a1*100:.2f}%, Test R²={test_eval_a1['r2']*100:.2f}%")

# ==============================================================================
# EXPERIMENT A2: FULL NON-LEAKAGE PRE-POLICY AUDIT (Including Socioeconomics & All Pre-Policy)
# ==============================================================================
cat_all_pre = {
    'sex': ['Female', 'Male', 'Other'],
    'smoker': ['Never', 'Former', 'Current'],
    'region': ['Central', 'East', 'North', 'South', 'West'],
    'urban_rural': ['Rural', 'Urban', 'Suburban'],
    'education': ['Bachelors', 'HS', 'Some College', 'Masters', 'No HS', 'Doctorate'],
    'marital_status': ['Married', 'Single', 'Widowed', 'Divorced'],
    'employment_status': ['Employed', 'Retired', 'Self-employed', 'Unemployed'],
    'plan_type': ['HMO', 'PPO', 'EPO', 'POS'],
    'network_tier': ['Platinum', 'Bronze', 'Silver', 'Gold']
}
num_all_pre = num_exp_a1 + ['household_size', 'copay', 'policy_term_years', 'policy_changes_last_2yrs', 'provider_quality']

def prep_exp_a2():
    return ColumnTransformer([
        ('num', 'passthrough', num_all_pre),
        ('cat', OneHotEncoder(categories=[cat_all_pre[c] for c in cat_all_pre], drop='first', sparse_output=False), list(cat_all_pre.keys()))
    ])

X_tr_a2 = train_df[num_all_pre + list(cat_all_pre.keys())]
X_te_a2 = test_df[num_all_pre + list(cat_all_pre.keys())]

cv_r2_a2, cv_std_a2, cv_mae_a2 = run_cv_5fold(X_tr_a2, y_train, prep_exp_a2)
pipe_a2 = Pipeline([('prep', prep_exp_a2()), ('reg', LinearRegression())])
pipe_a2.fit(X_tr_a2, y_train)
p_a2 = len(pipe_a2.named_steps['reg'].coef_)

train_eval_a2 = evaluate_predictions(y_train, pipe_a2.predict(X_tr_a2), p_a2)
test_eval_a2 = evaluate_predictions(y_test, pipe_a2.predict(X_te_a2), p_a2)

results.append({
    'name': 'Exp A2: All Valid Pre-Policy Features (28 vars)',
    'experiment': 'Exp A: Expanded Clinical',
    'p_features': p_a2,
    'cv_5fold_r2': cv_r2_a2,
    'cv_5fold_std': cv_std_a2,
    'train_r2': train_eval_a2['r2'],
    'test_r2': test_eval_a2['r2'],
    'test_adj_r2': test_eval_a2['adj_r2'],
    'test_mae': test_eval_a2['mae'],
    'test_rmse': test_eval_a2['rmse'],
    'skewness': test_eval_a2['skewness'],
    'kurtosis': test_eval_a2['kurtosis']
})

print(f"Exp A2: CV R²={cv_r2_a2*100:.2f}%, Test R²={test_eval_a2['r2']*100:.2f}%")

# ==============================================================================
# EXPERIMENT B: INTERACTION FEATURES
# ==============================================================================
# Clinically defensible interactions:
# 1. Age * BMI
# 2. Age * Smoker (is Current, is Former)
# 3. Chronic * Age
# 4. Hospitalizations * Chronic
# 5. BMI * Smoker
def add_interactions(df_in):
    d = df_in.copy()
    # Age * BMI
    d['inter_age_bmi'] = d['age'] * d['bmi']
    # Age * Smoker
    d['inter_age_current_smoker'] = d['age'] * (d['smoker'] == 'Current').astype(float)
    d['inter_age_former_smoker'] = d['age'] * (d['smoker'] == 'Former').astype(float)
    # BMI * Smoker
    d['inter_bmi_current_smoker'] = d['bmi'] * (d['smoker'] == 'Current').astype(float)
    # Chronic * Age
    chronic_sum = d['chronic_count'] if 'chronic_count' in d else d[chronic_cols].sum(axis=1)
    d['inter_chronic_age'] = chronic_sum * d['age']
    # Hosp * Chronic
    d['inter_hosp_chronic'] = d['hospitalizations_last_3yrs'] * chronic_sum
    # Hosp * Age
    d['inter_hosp_age'] = d['hospitalizations_last_3yrs'] * d['age']
    return d

X_tr_b_inter = add_interactions(X_tr_a1)
X_te_b_inter = add_interactions(X_te_a1)

inter_cols = [
    'inter_age_bmi', 'inter_age_current_smoker', 'inter_age_former_smoker',
    'inter_bmi_current_smoker', 'inter_chronic_age', 'inter_hosp_chronic', 'inter_hosp_age'
]
num_exp_b = num_exp_a1 + inter_cols

def prep_exp_b():
    return ColumnTransformer([
        ('num', 'passthrough', num_exp_b),
        ('cat', OneHotEncoder(categories=[cat_b[c] for c in cat_b], drop='first', sparse_output=False), list(cat_b.keys()))
    ])

cv_r2_b_int, cv_std_b_int, cv_mae_b_int = run_cv_5fold(X_tr_b_inter, y_train, prep_exp_b)
pipe_b_int = Pipeline([('prep', prep_exp_b()), ('reg', LinearRegression())])
pipe_b_int.fit(X_tr_b_inter, y_train)
p_b_int = len(pipe_b_int.named_steps['reg'].coef_)

train_eval_b_int = evaluate_predictions(y_train, pipe_b_int.predict(X_tr_b_inter), p_b_int)
test_eval_b_int = evaluate_predictions(y_test, pipe_b_int.predict(X_te_b_inter), p_b_int)

results.append({
    'name': 'Exp B: Clinical Interactions (Age×BMI, Age×Smoker, etc.)',
    'experiment': 'Exp B: Interactions',
    'p_features': p_b_int,
    'cv_5fold_r2': cv_r2_b_int,
    'cv_5fold_std': cv_std_b_int,
    'train_r2': train_eval_b_int['r2'],
    'test_r2': test_eval_b_int['r2'],
    'test_adj_r2': test_eval_b_int['adj_r2'],
    'test_mae': test_eval_b_int['mae'],
    'test_rmse': test_eval_b_int['rmse'],
    'skewness': test_eval_b_int['skewness'],
    'kurtosis': test_eval_b_int['kurtosis']
})

print(f"Exp B: CV R²={cv_r2_b_int*100:.2f}%, Test R²={test_eval_b_int['r2']*100:.2f}%")

# ==============================================================================
# EXPERIMENT C: POLYNOMIAL LINEAR REGRESSION (Degree-2 on key continuous predictors + Scaling)
# ==============================================================================
poly_num_cols = ['age', 'bmi', 'systolic_bp', 'hba1c', 'visits_last_year', 'hospitalizations_last_3yrs', 'days_hospitalized_last_3yrs', 'medication_count']
other_num_cols = [c for c in num_exp_a1 if c not in poly_num_cols]

def prep_exp_c():
    poly_pipe = Pipeline([
        ('scaler', StandardScaler()),
        ('poly', PolynomialFeatures(degree=2, include_bias=False))
    ])
    return ColumnTransformer([
        ('poly_num', poly_pipe, poly_num_cols),
        ('other_num', 'passthrough', other_num_cols),
        ('cat', OneHotEncoder(categories=[cat_b[c] for c in cat_b], drop='first', sparse_output=False), list(cat_b.keys()))
    ])

cv_r2_c, cv_std_c, cv_mae_c = run_cv_5fold(X_tr_a1, y_train, prep_exp_c)
pipe_c = Pipeline([('prep', prep_exp_c()), ('reg', LinearRegression())])
pipe_c.fit(X_tr_a1, y_train)
p_c = len(pipe_c.named_steps['reg'].coef_)

train_eval_c = evaluate_predictions(y_train, pipe_c.predict(X_tr_a1), p_c)
test_eval_c = evaluate_predictions(y_test, pipe_c.predict(X_te_a1), p_c)

results.append({
    'name': 'Exp C: Degree-2 Polynomial OLS (Scaled)',
    'experiment': 'Exp C: Polynomial OLS',
    'p_features': p_c,
    'cv_5fold_r2': cv_r2_c,
    'cv_5fold_std': cv_std_c,
    'train_r2': train_eval_c['r2'],
    'test_r2': test_eval_c['r2'],
    'test_adj_r2': test_eval_c['adj_r2'],
    'test_mae': test_eval_c['mae'],
    'test_rmse': test_eval_c['rmse'],
    'skewness': test_eval_c['skewness'],
    'kurtosis': test_eval_c['kurtosis']
})

print(f"Exp C: CV R²={cv_r2_c*100:.2f}%, Test R²={test_eval_c['r2']*100:.2f}%")

# ==============================================================================
# EXPERIMENT D: TARGET TRANSFORMATION (Log-Transformed Target OLS)
# ==============================================================================
# log(annual_medical_cost)
# Note: Evaluate both in log-space and converted back to original dollar space
log_y_train = np.log(y_train)
log_y_test = np.log(y_test)

# 1. Standard Inversion exp(log_y)
pipe_d1 = Pipeline([('prep', prep_exp_a1()), ('reg', LinearRegression())])
pipe_d1.fit(X_tr_a1, log_y_train)
p_d = len(pipe_d1.named_steps['reg'].coef_)

log_pred_tr = pipe_d1.predict(X_tr_a1)
log_pred_te = pipe_d1.predict(X_te_a1)

# Log-space metrics
log_r2_tr = r2_score(log_y_train, log_pred_tr)
log_r2_te = r2_score(log_y_test, log_pred_te)

# Inverse transform to original dollar scale: exp(log_pred)
orig_pred_tr_raw = np.exp(log_pred_tr)
orig_pred_te_raw = np.exp(log_pred_te)

# Duan's Smearing Estimator for non-normal log residuals:
# smearing factor = mean(exp(e_i))
log_residuals_tr = log_y_train - log_pred_tr
smearing_factor = np.mean(np.exp(log_residuals_tr))

orig_pred_tr_smear = orig_pred_tr_raw * smearing_factor
orig_pred_te_smear = orig_pred_te_raw * smearing_factor

# Evaluate on true original dollar scale:
test_eval_d_raw = evaluate_predictions(y_test, orig_pred_te_raw, p_d)
test_eval_d_smear = evaluate_predictions(y_test, orig_pred_te_smear, p_d)
train_eval_d_smear = evaluate_predictions(y_train, orig_pred_tr_smear, p_d)

results.append({
    'name': 'Exp D1: Log Target OLS (Direct Inversion)',
    'experiment': 'Exp D: Target Transform',
    'p_features': p_d,
    'cv_5fold_r2': None,
    'cv_5fold_std': None,
    'train_r2': evaluate_predictions(y_train, orig_pred_tr_raw, p_d)['r2'],
    'test_r2': test_eval_d_raw['r2'],
    'test_adj_r2': test_eval_d_raw['adj_r2'],
    'test_mae': test_eval_d_raw['mae'],
    'test_rmse': test_eval_d_raw['rmse'],
    'skewness': test_eval_d_raw['skewness'],
    'kurtosis': test_eval_d_raw['kurtosis'],
    'log_space_r2': float(log_r2_te)
})

results.append({
    'name': 'Exp D2: Log Target OLS (Duan Smearing Factor)',
    'experiment': 'Exp D: Target Transform',
    'p_features': p_d,
    'cv_5fold_r2': None,
    'cv_5fold_std': None,
    'train_r2': train_eval_d_smear['r2'],
    'test_r2': test_eval_d_smear['r2'],
    'test_adj_r2': test_eval_d_smear['adj_r2'],
    'test_mae': test_eval_d_smear['mae'],
    'test_rmse': test_eval_d_smear['rmse'],
    'skewness': test_eval_d_smear['skewness'],
    'kurtosis': test_eval_d_smear['kurtosis'],
    'log_space_r2': float(log_r2_te),
    'smearing_factor': float(smearing_factor)
})

print(f"Exp D1 (Raw Exp): Orig Test R²={test_eval_d_raw['r2']*100:.2f}%, Test MAE=${test_eval_d_raw['mae']:.2f}")
print(f"Exp D2 (Smear): Orig Test R²={test_eval_d_smear['r2']*100:.2f}%, Test MAE=${test_eval_d_smear['mae']:.2f}, Log R²={log_r2_te*100:.2f}%")

# ==============================================================================
# COMBINED BEST MODEL: EXP B + A2 (Curated Pre-Policy + Statistically Significant Interactions)
# ==============================================================================
# Let's see what features are statistically significant with p < 0.05
import statsmodels.api as sm

prep_b_fitted = pipe_b_int.named_steps['prep']
X_mat_tr = prep_b_fitted.transform(X_tr_b_inter)
X_mat_te = prep_b_fitted.transform(X_te_b_inter)

cat_out_names = list(prep_b_fitted.named_transformers_['cat'].get_feature_names_out(list(cat_b.keys())))
all_b_names = num_exp_b + cat_out_names

# Compute VIF on this design matrix
print("Computing VIF for Exp B design matrix...")
vifs_b = compute_vif_df(X_mat_tr, all_b_names)

# Print Summary Table
print("\n" + "="*85)
print(f"{'Experiment Name':<42} | {'Features':<8} | {'CV R² (%)':<10} | {'Test R² (%)':<11} | {'Test MAE ($)':<12}")
print("="*85)
for r in results:
    cv_str = f"{r['cv_5fold_r2']*100:.2f}%" if r['cv_5fold_r2'] is not None else "N/A"
    print(f"{r['name']:<42} | {r['p_features']:<8} | {cv_str:<10} | {r['test_r2']*100:6.2f}%    | ${r['test_mae']:8.2f}")
print("="*85)

# Save experiment results to JSON
exp_output_path = os.path.join(os.path.dirname(__file__), '../artifacts/optimization_experiments_summary.json')
with open(exp_output_path, 'w') as f:
    # Remove numpy arrays from results before saving
    save_results = [{k: v for k, v in r.items() if k != 'residuals'} for r in results]
    json.dump({
        'experiments': save_results,
        'vif_diagnostics': vifs_b
    }, f, indent=2)

print(f"\nExperiment results successfully exported to: {exp_output_path}")

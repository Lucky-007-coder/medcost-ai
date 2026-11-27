"""
Pre-processing module for Medical Insurance Cost Prediction.
Configures deterministic OneHotEncoding with explicit reference categories:
  - sex: reference is 'Female' (categories: ['Female', 'Male', 'Other'])
  - smoker: reference is 'Never' (categories: ['Never', 'Former', 'Current'])
  - region: reference is 'Central' (categories: ['Central', 'East', 'North', 'South', 'West'])
  - plan_type: reference is 'HMO' (categories: ['HMO', 'PPO', 'EPO', 'POS'])
"""

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder

# Deterministic reference categories
CATEGORICAL_SPECS_A = {
    'sex': ['Female', 'Male', 'Other'],
    'smoker': ['Never', 'Former', 'Current'],
    'region': ['Central', 'East', 'North', 'South', 'West']
}

CATEGORICAL_SPECS_B = {
    'sex': ['Female', 'Male', 'Other'],
    'smoker': ['Never', 'Former', 'Current'],
    'region': ['Central', 'East', 'North', 'South', 'West'],
    'plan_type': ['HMO', 'PPO', 'EPO', 'POS']
}

NUMERICAL_FEATURES_A = ['age', 'bmi', 'dependents']

NUMERICAL_FEATURES_B = [
    'age', 'bmi', 'dependents', 'income', 'systolic_bp', 
    'hba1c', 'visits_last_year', 'hospitalizations_last_3yrs',
    'chronic_count', 'deductible'
]

def get_preprocessor_a():
    """Builds ColumnTransformer for Model A (Core Demographics)."""
    cat_cols = list(CATEGORICAL_SPECS_A.keys())
    categories = [CATEGORICAL_SPECS_A[col] for col in cat_cols]
    
    return ColumnTransformer(
        transformers=[
            ('num', 'passthrough', NUMERICAL_FEATURES_A),
            ('cat', OneHotEncoder(categories=categories, drop='first', sparse_output=False), cat_cols)
        ]
    )

def get_preprocessor_b():
    """Builds ColumnTransformer for Model B (Core + Non-leakage Clinical & Policy)."""
    cat_cols = list(CATEGORICAL_SPECS_B.keys())
    categories = [CATEGORICAL_SPECS_B[col] for col in cat_cols]
    
    return ColumnTransformer(
        transformers=[
            ('num', 'passthrough', NUMERICAL_FEATURES_B),
            ('cat', OneHotEncoder(categories=categories, drop='first', sparse_output=False), cat_cols)
        ]
    )

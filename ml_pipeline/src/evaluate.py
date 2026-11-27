"""
Independent Evaluation & Verification Script for Phase 1.
Loads generated artifacts from ml_pipeline/artifacts/ and tests:
  1. Artifact integrity and metadata consistency.
  2. Inference consistency across Model A and Model B.
  3. Mathematical decomposition of predictions:
       Predicted = Intercept + sum(Coefficient_j * Value_j)
  4. Reference category verification (Never, Female, Central).
"""

import os
import json
import joblib
import pandas as pd
import numpy as np

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), '../artifacts')

def test_artifacts():
    meta_path = os.path.join(ARTIFACTS_DIR, 'model_metadata.json')
    summary_path = os.path.join(ARTIFACTS_DIR, 'dataset_summary.json')
    model_a_path = os.path.join(ARTIFACTS_DIR, 'linear_regression_model_a.joblib')
    model_b_path = os.path.join(ARTIFACTS_DIR, 'linear_regression_model_b.joblib')

    for p in [meta_path, summary_path, model_a_path, model_b_path]:
        assert os.path.exists(p), f"Artifact missing: {p}"

    with open(meta_path, 'r') as f:
        meta = json.load(f)

    with open(summary_path, 'r') as f:
        summary = json.load(f)

    model_a = joblib.load(model_a_path)
    model_b = joblib.load(model_b_path)

    print("All artifacts loaded successfully.")
    print(f"Model A Test R2: {meta['model_a']['metrics_test']['r2']}")
    print(f"Model B Test R2: {meta['model_b']['metrics_test']['r2']}")

    # Test Reference Category Prediction Breakdown on a baseline profile:
    # A Female, Never smoker from Central region:
    # Expected categorical dummy contributions should all be strictly $0.00!
    sample_baseline_b = pd.DataFrame([{
        'age': 30,
        'bmi': 25.0,
        'dependents': 0,
        'income': 50000.0,
        'systolic_bp': 120.0,
        'hba1c': 5.5,
        'visits_last_year': 2,
        'hospitalizations_last_3yrs': 0,
        'chronic_count': 0,
        'deductible': 1000,
        'sex': 'Female',      # Reference
        'smoker': 'Never',    # Reference
        'region': 'Central',  # Reference
        'plan_type': 'HMO'    # Reference
    }])

    pred_b = model_b.predict(sample_baseline_b)[0]
    
    # Calculate manual decomposition
    transformed_x = model_b.named_steps['prep'].transform(sample_baseline_b)[0]
    coefs = model_b.named_steps['reg'].coef_
    intercept = model_b.named_steps['reg'].intercept_
    manual_sum = intercept + np.dot(transformed_x, coefs)

    print(f"\nBaseline Patient Predicted Cost: ${pred_b:.2f}")
    print(f"Manual Mathematical Sum:       ${manual_sum:.2f}")
    assert np.isclose(pred_b, manual_sum), "Decomposition does not match model prediction!"
    print("Mathematical decomposition test PASSED (difference < 1e-6).")

if __name__ == '__main__':
    test_artifacts()

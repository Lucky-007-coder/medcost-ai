import os
import json
import joblib
import pandas as pd
import numpy as np

class MLService:
    def __init__(self, config=None):
        self.model_a = None
        self.model_b = None
        self.metadata = None
        self.dataset_summary = None
        self.is_loaded = False
        if config:
            self.load_artifacts(config)

    def load_artifacts(self, config):
        """Loads serialized models and metadata into memory."""
        try:
            # Support both dict-like and object-like config
            def get_cfg(k):
                if hasattr(config, k):
                    return getattr(config, k)
                return config[k]

            model_a_path = get_cfg('MODEL_A_PATH')
            model_b_path = get_cfg('MODEL_B_PATH')
            meta_path = get_cfg('METADATA_PATH')
            summary_path = get_cfg('SUMMARY_PATH')

            self.model_a = joblib.load(model_a_path)
            self.model_b = joblib.load(model_b_path)

            with open(meta_path, 'r') as f:
                self.metadata = json.load(f)

            with open(summary_path, 'r') as f:
                self.dataset_summary = json.load(f)

            self.is_loaded = True
            print("MLService: All models and metadata loaded successfully.")
        except Exception as e:
            self.is_loaded = False
            print(f"MLService Error loading artifacts: {e}")
            raise e

    def predict(self, model_type, data):
        """
        Executes Linear Regression prediction and returns an exact mathematical contribution breakdown.
        """
        if not self.is_loaded:
            raise RuntimeError("ML models are not loaded.")

        if model_type == 'model_a':
            pipeline = self.model_a
            meta_info = self.metadata['model_a']
            feature_order = meta_info['features']
        else:
            pipeline = self.model_b
            meta_info = self.metadata['model_b']
            feature_order = meta_info['features']

        # Build 1-row DataFrame with strict column order
        row_dict = {f: data[f] for f in feature_order if f in data}
        input_df = pd.DataFrame([row_dict])

        # Execute Pipeline prediction (raw precision)
        raw_prediction = float(pipeline.predict(input_df)[0])
        predicted_cost = float(round(raw_prediction, 2))

        # Extract fitted preprocessor & regressor
        prep = pipeline.named_steps['prep']
        reg = pipeline.named_steps['reg']

        # Transform single input row
        transformed_row = prep.transform(input_df)[0]
        coefs = reg.coef_
        raw_intercept = float(reg.intercept_)

        # Reconstruct transformed feature names
        num_cols = prep.transformers_[0][2]
        cat_cols = prep.transformers_[1][2]
        cat_names_out = prep.named_transformers_['cat'].get_feature_names_out(cat_cols)
        transformed_feature_names = list(num_cols) + list(cat_names_out)

        # Compute exact linear contributions using unrounded float values:
        # contribution_j = beta_j * x_j
        contributions = []
        unrounded_sum = raw_intercept

        for name, x_val, beta in zip(transformed_feature_names, transformed_row, coefs):
            x_val_f = float(x_val)
            beta_f = float(beta) # Full unrounded precision
            raw_contrib = x_val_f * beta_f
            unrounded_sum += raw_contrib
            display_contrib = float(round(raw_contrib, 2))

            # Build human-interpretable description based on reference categories
            ref_category = None
            parent_col = None
            cat_val = None

            for col, ref_val in self.metadata['reference_categories'].items():
                if name.startswith(f"{col}_"):
                    parent_col = col
                    ref_category = ref_val
                    cat_val = name[len(col)+1:]
                    break

            # Avoid premature rounding in display strings (e.g. -0.00 for small weights)
            if abs(beta_f) < 0.005 and abs(beta_f) > 0:
                beta_display_str = f"${beta_f:.6f}/unit"
            else:
                beta_display_str = f"${beta_f:.2f}/unit"

            if parent_col:
                if x_val_f == 1.0:
                    interpretation = f"Category is '{cat_val}' (vs reference '{ref_category}'), differential impact: ${display_contrib:+.2f}."
                else:
                    interpretation = f"Category is not '{cat_val}', differential impact: $0.00."
            else:
                interpretation = f"Raw value {x_val_f} * weight {beta_display_str} = ${display_contrib:+.2f}."

            contributions.append({
                'feature': name,
                'encoded_value': float(x_val_f),
                'coefficient': beta_f,               # Full float precision
                'coefficient_display': round(beta_f, 6 if abs(beta_f) < 0.005 else 2),
                'contribution': display_contrib,     # Currency rounded to 2 decimals
                'contribution_raw': float(raw_contrib), # Full numerical precision
                'interpretation': interpretation
            })

        # Add explicit baseline reference category markers for complete transparency
        for col, ref_val in self.metadata['reference_categories'].items():
            if col in feature_order:
                is_active = (data.get(col) == ref_val)
                contributions.append({
                    'feature': f"{col}_{ref_val} (Reference Baseline)",
                    'encoded_value': 1.0 if is_active else 0.0,
                    'coefficient': 0.0,
                    'coefficient_display': 0.0,
                    'contribution': 0.0,
                    'contribution_raw': 0.0,
                    'is_reference_baseline': True,
                    'interpretation': f"Baseline reference level '{ref_val}'. Encoded as zero-difference benchmark."
                })

        # Mathematical verification: unrounded decomposition sum must match pipeline prediction within 1e-6
        tolerance_delta = float(abs(unrounded_sum - raw_prediction))
        if not np.isclose(unrounded_sum, raw_prediction, atol=1e-6):
            raise ValueError(
                f"Mathematical decomposition discrepancy: sum={unrounded_sum:.8f}, raw_prediction={raw_prediction:.8f}, delta={tolerance_delta}"
            )

        sum_of_contributions_raw = float(unrounded_sum - raw_intercept)

        return {
            'predicted_annual_cost': max(0.0, predicted_cost),
            'predicted_annual_cost_raw': raw_prediction,
            'model_name': meta_info['name'],
            'model_type': model_type,
            'intercept': raw_intercept, # Full float precision
            'intercept_display': round(raw_intercept, 2),
            'sum_of_contributions': round(sum_of_contributions_raw, 2),
            'sum_of_contributions_raw': sum_of_contributions_raw,
            'calculated_sum': round(unrounded_sum, 2),
            'calculated_sum_raw': unrounded_sum,
            'mathematical_tolerance_delta': tolerance_delta,
            'rounding_policy': {
                'display': 'Currency amounts rounded to 2 decimal places (half to even).',
                'internal_precision': 'Unrounded 64-bit floating point maintained for all calculations.',
                'verification_status': 'Decomposition sum equals raw model output within 1e-6.'
            },
            'feature_contributions': contributions,
            'input_summary': data,
            'model_evaluation': {
                'r2_score': meta_info['metrics_test']['r2'],
                'adjusted_r2': meta_info['metrics_test']['adjusted_r2'],
                'mae': meta_info['metrics_test']['mae'],
                'rmse': meta_info['metrics_test']['rmse'],
                'test_samples': self.metadata['dataset_profile']['split']['test_size']
            }
        }

ml_service = MLService()

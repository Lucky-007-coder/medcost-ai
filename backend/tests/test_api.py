import os
import sys
import json
import unittest
import numpy as np

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Set environment before importing app
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'

from app import create_app
from app.config import TestingConfig
from app.models import db
from app.models.prediction import PredictionHistory
from app.services.ml_service import ml_service

class APITestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestingConfig)
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    # 1. Health Endpoint Test
    def test_health_endpoint(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'healthy')
        self.assertTrue(data['models_loaded'])

    # 2. Valid Model A (Basic) Prediction Test with 1e-6 Verification
    def test_valid_model_a_prediction(self):
        payload = {
            'model_type': 'model_a',
            'age': 35,
            'sex': 'Male',
            'bmi': 26.5,
            'dependents': 1,
            'smoker': 'Never',
            'region': 'Central'
        }
        res = self.client.post('/api/predict', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()

        self.assertIn('predicted_annual_cost', data)
        self.assertEqual(data['model_type'], 'model_a')
        self.assertGreater(data['predicted_annual_cost'], 0)
        self.assertIn('feature_contributions', data)
        self.assertIn('intercept', data)
        self.assertIn('record_id', data)

        # Mathematical verification: unrounded sum must match pipeline raw prediction within 1e-6
        unrounded_contrib_sum = data['intercept'] + sum(c['contribution_raw'] for c in data['feature_contributions'])
        self.assertAlmostEqual(unrounded_contrib_sum, data['predicted_annual_cost_raw'], delta=1e-6)
        self.assertAlmostEqual(data['calculated_sum_raw'], data['predicted_annual_cost_raw'], delta=1e-6)
        self.assertLessEqual(data['mathematical_tolerance_delta'], 1e-6)

        # Full coefficient precision check: coefficients should be floating point values
        for c in data['feature_contributions']:
            self.assertIsInstance(c['coefficient'], float)
            self.assertIn('coefficient_display', c)

    # 3. Valid Model B (Clinical) Prediction Test with 1e-6 Verification
    def test_valid_model_b_prediction(self):
        payload = {
            'model_type': 'model_b',
            'age': 45,
            'sex': 'Female',
            'bmi': 29.0,
            'dependents': 2,
            'smoker': 'Current',
            'region': 'North',
            'income': 65000.0,
            'systolic_bp': 130.0,
            'hba1c': 5.8,
            'visits_last_year': 3,
            'hospitalizations_last_3yrs': 1,
            'chronic_count': 1,
            'deductible': 1500.0,
            'plan_type': 'PPO'
        }
        res = self.client.post('/api/predict', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()

        self.assertIn('predicted_annual_cost', data)
        self.assertEqual(data['model_type'], 'model_b')
        self.assertGreater(data['predicted_annual_cost'], 0)

        # Mathematical verification within 1e-6
        unrounded_contrib_sum = data['intercept'] + sum(c['contribution_raw'] for c in data['feature_contributions'])
        self.assertAlmostEqual(unrounded_contrib_sum, data['predicted_annual_cost_raw'], delta=1e-6)
        self.assertAlmostEqual(data['calculated_sum_raw'], data['predicted_annual_cost_raw'], delta=1e-6)
        self.assertLessEqual(data['mathematical_tolerance_delta'], 1e-6)

        # Income coefficient: should NOT be premature -0.00 in raw coefficient
        income_item = next(c for c in data['feature_contributions'] if c['feature'] == 'income')
        self.assertNotEqual(income_item['coefficient'], 0.0) # raw float is ~ -0.000381
        self.assertNotIn('$-0.00/unit', income_item['interpretation'])

        # Reference Category Check:
        sex_male_contrib = next(c for c in data['feature_contributions'] if c['feature'] == 'sex_Male')
        self.assertEqual(sex_male_contrib['contribution'], 0.0)

        smoker_cur_contrib = next(c for c in data['feature_contributions'] if c['feature'] == 'smoker_Current')
        self.assertGreater(smoker_cur_contrib['contribution'], 1000.0)

    # 4. Missing Fields Validation Test
    def test_missing_fields_validation(self):
        # Missing 'bmi' and 'region'
        payload = {
            'model_type': 'model_a',
            'age': 30,
            'sex': 'Female',
            'dependents': 0,
            'smoker': 'Never'
        }
        res = self.client.post('/api/predict', json=payload)
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertEqual(data['error'], 'Validation Error')
        self.assertTrue(any('Missing required fields' in err for err in data['details']))

    # 5. Missing Clinical Fields in Model B Test
    def test_missing_clinical_fields_in_model_b(self):
        # Provide only Model A fields to Model B
        payload = {
            'model_type': 'model_b',
            'age': 30,
            'sex': 'Female',
            'bmi': 22.0,
            'dependents': 0,
            'smoker': 'Never',
            'region': 'Central'
        }
        res = self.client.post('/api/predict', json=payload)
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertEqual(data['error'], 'Validation Error')
        # Ensure it does NOT silently substitute missing values
        self.assertTrue(any('Missing required fields' in err for err in data['details']))

    # 6. Combined Multi-Error Validation Test
    def test_combined_multiple_validation_errors(self):
        # Payload with missing fields, invalid category, and out-of-range numeric simultaneously
        payload = {
            'model_type': 'model_a',
            'age': 200,             # Out of range (>120)
            'sex': 'AlienGender',    # Invalid category
            'bmi': -10.0            # Out of range (<10)
            # missing: dependents, smoker, region
        }
        res = self.client.post('/api/predict', json=payload)
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertEqual(data['error'], 'Validation Error')
        
        # Verify ALL error categories are captured in a single response
        err_text = " | ".join(data['details'])
        self.assertIn('Missing required fields for model_a', err_text)
        self.assertIn('dependents', err_text)
        self.assertIn('smoker', err_text)
        self.assertIn('region', err_text)
        self.assertIn('Invalid sex', err_text)
        self.assertIn('Age (age) must be between', err_text)
        self.assertIn('BMI (bmi) must be between', err_text)
        self.assertGreaterEqual(len(data['details']), 4)

    # 7. Invalid Numeric Values & Non-finite Values Test
    def test_invalid_numeric_values(self):
        payload = {
            'model_type': 'model_a',
            'age': 250,        # Out of bounds (>120)
            'sex': 'Male',
            'bmi': -5.0,       # Out of bounds (<10)
            'dependents': 'two',# Not a number
            'smoker': 'Never',
            'region': 'Central'
        }
        res = self.client.post('/api/predict', json=payload)
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertEqual(data['error'], 'Validation Error')
        self.assertTrue(len(data['details']) >= 3)

    # 8. Prediction History Saving & Retrieval Test
    def test_history_logging_and_retrieval(self):
        # Post 2 predictions
        payload1 = {
            'model_type': 'model_a',
            'age': 28, 'sex': 'Male', 'bmi': 24.0,
            'dependents': 0, 'smoker': 'Never', 'region': 'East'
        }
        payload2 = {
            'model_type': 'model_a',
            'age': 55, 'sex': 'Female', 'bmi': 32.0,
            'dependents': 2, 'smoker': 'Current', 'region': 'South'
        }
        self.client.post('/api/predict', json=payload1)
        self.client.post('/api/predict', json=payload2)

        # Retrieve history
        res = self.client.get('/api/history')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['total_count'], 2)
        self.assertEqual(len(data['records']), 2)

        # Filter by model_type
        res_filt = self.client.get('/api/history?model_type=model_a')
        self.assertEqual(res_filt.get_json()['total_count'], 2)

        res_empty = self.client.get('/api/history?model_type=model_b')
        self.assertEqual(res_empty.get_json()['total_count'], 0)

    # 9. Prediction Deletion Test
    def test_history_deletion(self):
        payload = {
            'model_type': 'model_a',
            'age': 30, 'sex': 'Female', 'bmi': 25.0,
            'dependents': 0, 'smoker': 'Never', 'region': 'Central'
        }
        post_res = self.client.post('/api/predict', json=payload)
        record_id = post_res.get_json()['record_id']

        # Delete existing
        del_res = self.client.delete(f'/api/history/{record_id}')
        self.assertEqual(del_res.status_code, 200)
        self.assertTrue(del_res.get_json()['success'])

        # Verify deletion in history
        hist_res = self.client.get('/api/history')
        self.assertEqual(hist_res.get_json()['total_count'], 0)

        # Attempt to delete non-existent ID
        del_404 = self.client.delete(f'/api/history/{record_id}')
        self.assertEqual(del_404.status_code, 404)

    # 10. Model Loading Failure Handling Test
    def test_model_unloaded_handling(self):
        # Temporarily set is_loaded to False
        ml_service.is_loaded = False
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        self.assertFalse(res.get_json()['models_loaded'])

        # Predict when unloaded should fail gracefully
        payload = {
            'model_type': 'model_a',
            'age': 30, 'sex': 'Female', 'bmi': 25.0,
            'dependents': 0, 'smoker': 'Never', 'region': 'Central'
        }
        res_p = self.client.post('/api/predict', json=payload)
        self.assertEqual(res_p.status_code, 500)
        self.assertIn('Inference Error', res_p.get_json()['error'])

        # Metrics when unloaded
        res_m = self.client.get('/api/metrics')
        self.assertEqual(res_m.status_code, 503)

        # Restore
        ml_service.is_loaded = True

    # 11. Metrics and Analytics Endpoints Test
    def test_metrics_and_analytics_endpoints(self):
        # Metrics
        res_m = self.client.get('/api/metrics')
        self.assertEqual(res_m.status_code, 200)
        data_m = res_m.get_json()
        self.assertIn('model_a', data_m)
        self.assertIn('model_b', data_m)
        self.assertIn('reference_categories', data_m)
        self.assertIn('vif', data_m['model_a'])
        self.assertIn('vif', data_m['model_b'])

        # Analytics
        res_a = self.client.get('/api/analytics')
        self.assertEqual(res_a.status_code, 200)
        data_a = res_a.get_json()
        self.assertIn('distributions', data_a)
        self.assertIn('age_smoker_trends', data_a)
        self.assertIn('correlation_matrix', data_a)
        self.assertIn('residual_histogram', data_a)
        self.assertIn('actual_vs_predicted_sample', data_a)

    # 12. Advanced History Search, Sort, Stats, and Persistence Test
    def test_history_advanced_features(self):
        # Insert Model A prediction
        p_a = {
            'model_type': 'model_a',
            'age': 30, 'sex': 'Female', 'bmi': 22.0,
            'dependents': 0, 'smoker': 'Never', 'region': 'Central'
        }
        res_a = self.client.post('/api/predict', json=p_a)
        rec_a = res_a.get_json()

        # Insert Model B prediction with higher cost
        p_b = {
            'model_type': 'model_b',
            'age': 60, 'sex': 'Male', 'bmi': 35.0,
            'dependents': 2, 'smoker': 'Current', 'region': 'South',
            'income': 80000.0, 'systolic_bp': 150.0, 'hba1c': 7.5,
            'visits_last_year': 5, 'hospitalizations_last_3yrs': 2,
            'chronic_count': 3, 'deductible': 1000.0, 'plan_type': 'PPO'
        }
        res_b = self.client.post('/api/predict', json=p_b)
        rec_b = res_b.get_json()

        # Retrieve history with sorting: cost_desc
        res_sort = self.client.get('/api/history?sort=cost_desc')
        self.assertEqual(res_sort.status_code, 200)
        data_sort = res_sort.get_json()
        self.assertEqual(data_sort['total_count'], 2)
        self.assertGreater(data_sort['records'][0]['predicted_cost'], data_sort['records'][1]['predicted_cost'])

        # Check that stored record contains complete decomposition
        top_rec = data_sort['records'][0]
        self.assertIn('intercept', top_rec)
        self.assertIn('feature_contributions', top_rec)
        self.assertIn('evaluation_metrics', top_rec)
        self.assertGreater(len(top_rec['feature_contributions']), 0)

        # Search test by keyword
        res_search = self.client.get('/api/history?search=Current')
        self.assertEqual(res_search.get_json()['total_count'], 1)
        self.assertEqual(res_search.get_json()['records'][0]['id'], rec_b['record_id'])

        # Stats test
        self.assertIn('stats', data_sort)
        stats = data_sort['stats']
        self.assertEqual(stats['total_predictions'], 2)
        self.assertEqual(stats['model_a_count'], 1)
        self.assertEqual(stats['model_b_count'], 1)
        self.assertGreater(stats['avg_predicted_cost'], 0)

    # 13. PDF Report Generation Tests (Phase 9)
    def test_pdf_report_by_id(self):
        # Create a prediction record first
        payload = {
            'model_type': 'model_a',
            'age': 40,
            'sex': 'Male',
            'bmi': 28.0,
            'dependents': 1,
            'smoker': 'Former',
            'region': 'Central'
        }
        res_pred = self.client.post('/api/predict', json=payload)
        self.assertEqual(res_pred.status_code, 200)
        rec_id = res_pred.get_json()['record_id']

        # Request PDF
        res_pdf = self.client.get(f'/api/reports/prediction/{rec_id}/pdf')
        self.assertEqual(res_pdf.status_code, 200)
        self.assertEqual(res_pdf.content_type, 'application/pdf')
        self.assertTrue(res_pdf.data.startswith(b'%PDF'))
        self.assertGreater(len(res_pdf.data), 1000)

    def test_pdf_report_not_found(self):
        res_pdf = self.client.get('/api/reports/prediction/999999/pdf')
        self.assertEqual(res_pdf.status_code, 404)

    def test_pdf_report_post_export(self):
        # Predict Model B
        payload = {
            'model_type': 'model_b',
            'age': 52,
            'sex': 'Female',
            'bmi': 31.5,
            'dependents': 2,
            'smoker': 'Never',
            'region': 'North',
            'income': 72000.0,
            'systolic_bp': 135.0,
            'hba1c': 6.1,
            'visits_last_year': 4,
            'hospitalizations_last_3yrs': 0,
            'chronic_count': 1,
            'deductible': 1500.0,
            'plan_type': 'PPO'
        }
        res_pred = self.client.post('/api/predict', json=payload)
        pred_data = res_pred.get_json()

        # POST to export PDF
        res_pdf = self.client.post('/api/reports/prediction/pdf', json=pred_data)
        self.assertEqual(res_pdf.status_code, 200)
        self.assertEqual(res_pdf.content_type, 'application/pdf')
        self.assertTrue(res_pdf.data.startswith(b'%PDF'))
        self.assertGreater(len(res_pdf.data), 1000)

if __name__ == '__main__':
    unittest.main()

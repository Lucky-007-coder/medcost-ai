import sys
import json

sys.path.insert(0, 'backend')
from app import create_app
from app.config import Config

app = create_app(Config)
client = app.test_client()

# Check default form values
# In EstimatorView.jsx:
# age: 38, sex: Female, bmi: 27.5, dependents: 1, smoker: Never, region: Central
payload_a = {
    'model_type': 'model_a',
    'age': 38,
    'sex': 'Female',
    'bmi': 27.5,
    'dependents': 1,
    'smoker': 'Never',
    'region': 'Central'
}

res = client.post('/api/predict', json=payload_a)
data = res.get_json()
print("=== MODEL A WITH DEFAULT VALUES ===")
print("Intercept:", data["intercept"])
print("Calculated Sum:", data["calculated_sum"])
print("Predicted Annual Cost:", data["predicted_annual_cost"])
sum_contribs = sum(c["contribution"] for c in data["feature_contributions"])
print("Sum of contribution list:", sum_contribs)
print("Intercept + sum_contribs:", data["intercept"] + sum_contribs)
for c in data["feature_contributions"]:
    print(f"  {c['feature']}: contrib={c['contribution']}, raw={c['contribution_raw']}")

# What if age: 35, sex: Female, bmi: 26.0?
payload_a_report = {
    'model_type': 'model_a',
    'age': 35,
    'sex': 'Female',
    'bmi': 26.0,
    'dependents': 1,
    'smoker': 'Never',
    'region': 'Central'
}
res_rep = client.post('/api/predict', json=payload_a_report)
data_rep = res_rep.get_json()
print("\n=== MODEL A WITH REPORT VALUES (35, 26.0) ===")
print("Intercept:", data_rep["intercept"])
print("Calculated Sum:", data_rep["calculated_sum"])
print("Predicted Annual Cost:", data_rep["predicted_annual_cost"])
sum_rep = sum(c["contribution"] for c in data_rep["feature_contributions"])
print("Sum of contribution list:", sum_rep)
print("Intercept + sum_rep:", data_rep["intercept"] + sum_rep)

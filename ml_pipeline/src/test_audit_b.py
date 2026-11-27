import sys
sys.path.insert(0, 'backend')
from app import create_app
from app.config import Config

app = create_app(Config)
client = app.test_client()

# Preset: smoker_profile
# age: 38, sex: Male, bmi: 29.8, dependents: 1, smoker: Current, region: North,
# income: 62000, systolic_bp: 135, hba1c: 5.7, visits_last_year: 4,
# hospitalizations_last_3yrs: 1, chronic_count: 1, deductible: 1500, plan_type: PPO

payload_b = {
    'model_type': 'model_b',
    'age': 38,
    'sex': 'Male',
    'bmi': 29.8,
    'dependents': 1,
    'smoker': 'Current',
    'region': 'North',
    'income': 62000.0,
    'systolic_bp': 135.0,
    'hba1c': 5.7,
    'visits_last_year': 4,
    'hospitalizations_last_3yrs': 1,
    'chronic_count': 1,
    'deductible': 1500.0,
    'plan_type': 'PPO'
}

res = client.post('/api/predict', json=payload_b)
data = res.get_json()
print("=== MODEL B INVESTIGATION ===")
print("Intercept:", data["intercept"])
print("Calculated Sum:", data["calculated_sum"])
print("Predicted Annual Cost:", data["predicted_annual_cost"])
sum_contribs = sum(c["contribution"] for c in data["feature_contributions"])
print("Sum of contribution list:", sum_contribs)
print("Intercept + sum_contribs:", data["intercept"] + sum_contribs)
for c in data["feature_contributions"]:
    print(f"  {c['feature']}: contrib={c['contribution']}, raw={c['contribution_raw']}")

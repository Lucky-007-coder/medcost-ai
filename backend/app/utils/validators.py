import math

VALID_SEX = ['Female', 'Male', 'Other']
VALID_SMOKER = ['Never', 'Former', 'Current']
VALID_REGION = ['Central', 'East', 'North', 'South', 'West']
VALID_PLAN_TYPE = ['HMO', 'PPO', 'EPO', 'POS']

NUMERICAL_RANGES = {
    'age': {'min': 0, 'max': 120, 'type': int, 'label': 'Age'},
    'bmi': {'min': 10.0, 'max': 70.0, 'type': float, 'label': 'BMI'},
    'dependents': {'min': 0, 'max': 20, 'type': int, 'label': 'Dependents'},
    'income': {'min': 0.0, 'max': 10000000.0, 'type': float, 'label': 'Annual Income'},
    'systolic_bp': {'min': 50.0, 'max': 260.0, 'type': float, 'label': 'Systolic BP'},
    'hba1c': {'min': 3.0, 'max': 20.0, 'type': float, 'label': 'HbA1c'},
    'visits_last_year': {'min': 0, 'max': 365, 'type': int, 'label': 'Visits Last Year'},
    'hospitalizations_last_3yrs': {'min': 0, 'max': 100, 'type': int, 'label': 'Hospitalizations (Last 3 Yrs)'},
    'chronic_count': {'min': 0, 'max': 15, 'type': int, 'label': 'Chronic Conditions Count'},
    'deductible': {'min': 0.0, 'max': 1000000.0, 'type': float, 'label': 'Deductible'}
}

MODEL_A_REQUIRED = ['age', 'sex', 'bmi', 'dependents', 'smoker', 'region']
MODEL_B_REQUIRED = [
    'age', 'sex', 'bmi', 'dependents', 'smoker', 'region',
    'income', 'systolic_bp', 'hba1c', 'visits_last_year',
    'hospitalizations_last_3yrs', 'chronic_count', 'deductible', 'plan_type'
]

def validate_prediction_input(payload):
    """
    Validates prediction payload for Model A or Model B.
    Accumulates all detectable errors (missing fields, invalid categories, out-of-range numerics)
    into a single comprehensive error list.
    Returns: (is_valid, cleaned_data, errors)
    """
    errors = []
    cleaned = {}

    if not isinstance(payload, dict):
        return False, None, ["Request body must be a valid JSON object."]

    # 1. Determine model mode
    model_type = str(payload.get('model_type', 'model_b')).lower().strip()
    if model_type in ['basic', 'model_a', 'a']:
        target_model = 'model_a'
        required_fields = MODEL_A_REQUIRED
    elif model_type in ['clinical', 'model_b', 'b']:
        target_model = 'model_b'
        required_fields = MODEL_B_REQUIRED
    else:
        errors.append(f"Invalid model_type '{model_type}'. Choose 'model_a' (basic) or 'model_b' (clinical).")
        return False, None, errors

    cleaned['model_type'] = target_model

    # 2. Check for missing fields (do NOT return early; continue validating present fields)
    missing = [f for f in required_fields if f not in payload or payload[f] is None or payload[f] == '']
    if missing:
        errors.append(f"Missing required fields for {target_model}: {', '.join(missing)}")

    # 3. Validate Categorical Fields if present
    if 'sex' in payload and payload['sex'] not in [None, '']:
        raw_sex = str(payload.get('sex')).strip()
        if raw_sex not in VALID_SEX:
            errors.append(f"Invalid sex '{raw_sex}'. Permitted options: {VALID_SEX}")
        else:
            cleaned['sex'] = raw_sex

    if 'smoker' in payload and payload['smoker'] not in [None, '']:
        raw_smoker = str(payload.get('smoker')).strip()
        if raw_smoker not in VALID_SMOKER:
            errors.append(f"Invalid smoker status '{raw_smoker}'. Permitted options: {VALID_SMOKER}")
        else:
            cleaned['smoker'] = raw_smoker

    if 'region' in payload and payload['region'] not in [None, '']:
        raw_region = str(payload.get('region')).strip()
        if raw_region not in VALID_REGION:
            errors.append(f"Invalid region '{raw_region}'. Permitted options: {VALID_REGION}")
        else:
            cleaned['region'] = raw_region

    if target_model == 'model_b' and 'plan_type' in payload and payload['plan_type'] not in [None, '']:
        raw_plan = str(payload.get('plan_type')).strip()
        if raw_plan not in VALID_PLAN_TYPE:
            errors.append(f"Invalid plan_type '{raw_plan}'. Permitted options: {VALID_PLAN_TYPE}")
        else:
            cleaned['plan_type'] = raw_plan

    # 4. Validate Numerical Fields if present
    numerical_to_check = [f for f in required_fields if f in NUMERICAL_RANGES]
    for field in numerical_to_check:
        if field in payload and payload[field] not in [None, '']:
            rule = NUMERICAL_RANGES[field]
            val = payload.get(field)
            try:
                val_float = float(val)
                if math.isnan(val_float) or math.isinf(val_float):
                    errors.append(f"Field '{field}' must be a finite numerical value.")
                    continue

                if val_float < rule['min'] or val_float > rule['max']:
                    errors.append(
                        f"{rule['label']} ({field}) must be between {rule['min']} and {rule['max']}. Received: {val}"
                    )
                    continue

                cleaned[field] = rule['type'](val_float) if rule['type'] == int else float(val_float)
            except (ValueError, TypeError):
                errors.append(f"Field '{field}' must be a valid numeric {rule['type'].__name__}.")

    if errors:
        return False, None, errors

    return True, cleaned, []

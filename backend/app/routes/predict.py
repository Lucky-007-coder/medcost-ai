from flask import Blueprint, request, jsonify
from ..utils.validators import validate_prediction_input
from ..services.ml_service import ml_service
from ..services.db_service import db_service

predict_bp = Blueprint('predict', __name__)

@predict_bp.route('/predict', methods=['POST'])
def predict_charges():
    """
    Accepts patient parameters, validates inputs, performs inference,
    decomposes linear contributions, and saves record to SQLite.
    """
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({
            'error': 'Bad Request',
            'details': ['Request payload must be a valid JSON object with Content-Type: application/json.']
        }), 400

    is_valid, cleaned_data, errors = validate_prediction_input(payload)
    if not is_valid:
        return jsonify({
            'error': 'Validation Error',
            'details': errors
        }), 400

    try:
        model_type = cleaned_data['model_type']
        prediction_result = ml_service.predict(model_type, cleaned_data)

        # Log to SQLite with full decomposition persistence
        logged_record = db_service.save_prediction(
            model_type=model_type,
            input_params=cleaned_data,
            predicted_cost=prediction_result['predicted_annual_cost'],
            intercept=prediction_result.get('intercept'),
            feature_contributions=prediction_result.get('feature_contributions'),
            evaluation_metrics=prediction_result.get('model_evaluation')
        )

        prediction_result['record_id'] = logged_record['id']
        prediction_result['timestamp'] = logged_record['timestamp']

        return jsonify(prediction_result), 200

    except Exception as e:
        return jsonify({
            'error': 'Inference Error',
            'message': str(e)
        }), 500

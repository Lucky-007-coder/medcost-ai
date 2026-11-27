from flask import Blueprint, jsonify
from datetime import datetime, timezone
from ..services.ml_service import ml_service

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Health status and model readiness endpoint."""
    return jsonify({
        'status': 'healthy',
        'models_loaded': ml_service.is_loaded,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'available_models': ['model_a (basic)', 'model_b (clinical)'],
        'service': 'Medical Insurance Cost Prediction API'
    }), 200

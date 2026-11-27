from flask import Blueprint, jsonify
from ..services.ml_service import ml_service

metrics_bp = Blueprint('metrics', __name__)

@metrics_bp.route('/metrics', methods=['GET'])
def get_metrics():
    """Serves model metadata, comparison metrics, VIF, and OLS parameters."""
    if not ml_service.is_loaded or ml_service.metadata is None:
        return jsonify({'error': 'Metadata not available.'}), 503

    return jsonify(ml_service.metadata), 200

from flask import Blueprint, jsonify
from ..services.ml_service import ml_service

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/analytics', methods=['GET'])
def get_analytics():
    """Serves empirical dataset distributions, correlation matrix, and chart-ready data."""
    if not ml_service.is_loaded or ml_service.dataset_summary is None:
        return jsonify({'error': 'Analytics data not available.'}), 503

    return jsonify(ml_service.dataset_summary), 200

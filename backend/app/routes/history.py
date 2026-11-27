from flask import Blueprint, request, jsonify
from ..services.db_service import db_service

history_bp = Blueprint('history', __name__)

@history_bp.route('/history', methods=['GET'])
def get_prediction_history():
    """Returns paginated prediction history with optional model filtering, search, and sorting."""
    model_type = request.args.get('model_type')
    sort_by = request.args.get('sort', 'newest')
    search = request.args.get('search')
    is_export = request.args.get('export', 'false').lower() == 'true'

    try:
        limit = int(request.args.get('limit', 1000 if is_export else 50))
        offset = int(request.args.get('offset', 0))
    except ValueError:
        return jsonify({'error': 'Limit and offset must be valid integers.'}), 400

    limit = max(1, min(limit, 5000 if is_export else 200))
    offset = max(0, offset)

    history_data = db_service.get_history(
        model_type=model_type,
        limit=limit,
        offset=offset,
        sort=sort_by,
        search=search
    )
    return jsonify(history_data), 200

@history_bp.route('/history/<int:record_id>', methods=['DELETE'])
def delete_history_record(record_id):
    """Deletes a specific prediction entry by ID."""
    success = db_service.delete_prediction(record_id)
    if not success:
        return jsonify({
            'error': 'Not Found',
            'message': f"Prediction history record with ID {record_id} does not exist."
        }), 404

    return jsonify({
        'success': True,
        'message': f"Record {record_id} successfully deleted."
    }), 200

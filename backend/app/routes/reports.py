from flask import Blueprint, request, jsonify, send_file
from ..models import db
from ..models.prediction import PredictionHistory
from ..services.pdf_service import pdf_service

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/reports/prediction/<int:record_id>/pdf', methods=['GET'])
def download_prediction_pdf(record_id):
    """Generates and serves a publication-grade PDF report for a saved prediction record."""
    record = db.session.get(PredictionHistory, record_id)
    if not record:
        return jsonify({
            'error': 'Not Found',
            'message': f"Prediction history record with ID {record_id} does not exist."
        }), 404

    try:
        record_dict = record.to_dict()
        pdf_buffer = pdf_service.generate_prediction_pdf(record_dict)

        filename = f"MedCost_Report_REF-{str(record_id).zfill(6)}.pdf"
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        return jsonify({
            'error': 'Report Generation Error',
            'message': str(e)
        }), 500

@reports_bp.route('/reports/prediction/pdf', methods=['POST'])
def export_prediction_pdf():
    """Generates a downloadable PDF report directly from an active prediction result object."""
    payload = request.get_json(silent=True)
    if not payload or not isinstance(payload, dict):
        return jsonify({
            'error': 'Bad Request',
            'message': 'Request payload must be a valid prediction result JSON object.'
        }), 400

    try:
        pdf_buffer = pdf_service.generate_prediction_pdf(payload)
        rec_id = payload.get('record_id') or payload.get('id') or 'custom'
        filename = f"MedCost_Report_REF-{str(rec_id).zfill(6)}.pdf"
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        return jsonify({
            'error': 'Report Generation Error',
            'message': str(e)
        }), 500

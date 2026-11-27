import json
from ..models import db
from ..models.prediction import PredictionHistory

class DBService:
    @staticmethod
    def save_prediction(model_type, input_params, predicted_cost, intercept=None, feature_contributions=None, evaluation_metrics=None):
        """Persists a prediction record to the SQLite database with full mathematical decomposition."""
        try:
            record = PredictionHistory(
                model_type=model_type,
                input_parameters=json.dumps(input_params),
                predicted_cost=float(predicted_cost),
                intercept=float(intercept) if intercept is not None else None,
                feature_contributions=json.dumps(feature_contributions) if feature_contributions is not None else None,
                evaluation_metrics=json.dumps(evaluation_metrics) if evaluation_metrics is not None else None
            )
            db.session.add(record)
            db.session.commit()
            return record.to_dict()
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_history(model_type=None, limit=50, offset=0, sort='newest', search=None):
        """Retrieves prediction history with optional filtering, search, sorting, and pagination."""
        # Calculate global aggregate statistics across all records in database
        all_records = PredictionHistory.query.all()
        total_db_records = len(all_records)
        model_a_count = sum(1 for r in all_records if r.model_type == 'model_a')
        model_b_count = sum(1 for r in all_records if r.model_type == 'model_b')
        avg_cost = round(sum(r.predicted_cost for r in all_records) / total_db_records, 2) if total_db_records > 0 else 0.0
        latest_timestamp = max((r.timestamp for r in all_records), default=None)
        latest_iso = latest_timestamp.isoformat() if latest_timestamp else None

        query = PredictionHistory.query

        # Filter by model type if specified
        if model_type and model_type in ['model_a', 'model_b']:
            query = query.filter_by(model_type=model_type)

        # Apply search filter if provided
        if search:
            search_str = str(search).strip().lower()
            clean_search_id = search_str.lstrip('#').strip()
            if clean_search_id.isdigit():
                query = query.filter(
                    (PredictionHistory.id == int(clean_search_id)) |
                    (PredictionHistory.input_parameters.ilike(f'%{search_str}%'))
                )
            else:
                query = query.filter(
                    (PredictionHistory.model_type.ilike(f'%{search_str}%')) |
                    (PredictionHistory.input_parameters.ilike(f'%{search_str}%'))
                )

        # Apply ordering
        if sort == 'oldest':
            query = query.order_by(PredictionHistory.timestamp.asc())
        elif sort == 'cost_desc':
            query = query.order_by(PredictionHistory.predicted_cost.desc())
        elif sort == 'cost_asc':
            query = query.order_by(PredictionHistory.predicted_cost.asc())
        else: # 'newest' default
            query = query.order_by(PredictionHistory.timestamp.desc())

        filtered_count = query.count()
        records = query.offset(offset).limit(limit).all()

        return {
            'total_count': filtered_count,
            'limit': limit,
            'offset': offset,
            'stats': {
                'total_predictions': total_db_records,
                'model_a_count': model_a_count,
                'model_b_count': model_b_count,
                'avg_predicted_cost': avg_cost,
                'latest_timestamp': latest_iso
            },
            'records': [r.to_dict() for r in records]
        }

    @staticmethod
    def delete_prediction(prediction_id):
        """Deletes a specific prediction entry by ID."""
        record = db.session.get(PredictionHistory, prediction_id)
        if not record:
            return False

        try:
            db.session.delete(record)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            raise e

db_service = DBService()

import json
from datetime import datetime, timezone
from . import db

class PredictionHistory(db.Model):
    """Stores inference audit logs and predictions in SQLite."""
    __tablename__ = 'prediction_history'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    model_type = db.Column(db.String(32), nullable=False) # 'model_a' or 'model_b'
    input_parameters = db.Column(db.Text, nullable=False)  # JSON serialized dictionary
    predicted_cost = db.Column(db.Float, nullable=False)
    intercept = db.Column(db.Float, nullable=True)
    feature_contributions = db.Column(db.Text, nullable=True)
    evaluation_metrics = db.Column(db.Text, nullable=True)

    def to_dict(self):
        try:
            params = json.loads(self.input_parameters) if self.input_parameters else {}
        except Exception:
            params = {}

        try:
            contribs = json.loads(self.feature_contributions) if self.feature_contributions else []
        except Exception:
            contribs = []

        try:
            eval_metrics = json.loads(self.evaluation_metrics) if self.evaluation_metrics else {}
        except Exception:
            eval_metrics = {}

        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'model_type': self.model_type,
            'input_parameters': params,
            'predicted_cost': round(self.predicted_cost, 2),
            'intercept': round(self.intercept, 2) if self.intercept is not None else None,
            'intercept_raw': self.intercept,
            'feature_contributions': contribs,
            'evaluation_metrics': eval_metrics
        }

import os
import re
from flask import Flask
from flask_cors import CORS
from .config import Config
from .models import db
from .services.ml_service import ml_service

from .routes.health import health_bp
from .routes.predict import predict_bp
from .routes.metrics import metrics_bp
from .routes.analytics import analytics_bp
from .routes.history import history_bp
from .routes.reports import reports_bp

def create_app(config_class=Config):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_class)

    # Ensure instance folder exists for SQLite storage
    try:
        os.makedirs(app.instance_path, exist_ok=True)
    except OSError:
        pass

    # Enable CORS for React frontend (local dev + Vercel deployments + custom FRONTEND_URL)
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        re.compile(r"^https://.*\.vercel\.app$"),
    ]
    extra_origins = os.environ.get("FRONTEND_URL", "")
    for origin in extra_origins.split(","):
        cleaned = origin.strip().rstrip("/")
        if cleaned:
            allowed_origins.append(cleaned)

    CORS(app, resources={
        r"/api/*": {
            "origins": allowed_origins,
            "methods": ["GET", "POST", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Initialize Database
    db.init_app(app)

    # Load ML artifacts once during app creation
    with app.app_context():
        db.create_all()
        # Only load models if not already loaded or if testing with different config
        if not ml_service.is_loaded:
            ml_service.load_artifacts(app.config)

    # Register Blueprints with /api prefix
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(predict_bp, url_prefix='/api')
    app.register_blueprint(metrics_bp, url_prefix='/api')
    app.register_blueprint(analytics_bp, url_prefix='/api')
    app.register_blueprint(history_bp, url_prefix='/api')
    app.register_blueprint(reports_bp, url_prefix='/api')

    return app

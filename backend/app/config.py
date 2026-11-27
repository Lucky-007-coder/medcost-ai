import os

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
PROJECT_ROOT = os.path.abspath(os.path.dirname(BASE_DIR))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'medical-insurance-secret-2026')
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 
        f"sqlite:///{os.path.join(BASE_DIR, 'instance', 'insurance.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Path to ML Artifacts
    ARTIFACTS_DIR = os.path.join(PROJECT_ROOT, 'ml_pipeline', 'artifacts')
    MODEL_A_PATH = os.path.join(ARTIFACTS_DIR, 'linear_regression_model_a.joblib')
    MODEL_B_PATH = os.path.join(ARTIFACTS_DIR, 'linear_regression_model_b.joblib')
    METADATA_PATH = os.path.join(ARTIFACTS_DIR, 'model_metadata.json')
    SUMMARY_PATH = os.path.join(ARTIFACTS_DIR, 'dataset_summary.json')

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"

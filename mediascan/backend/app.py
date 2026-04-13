"""
MediScan AI - Backend Application Factory
Main entry point for the Flask-based health diagnostics API.
"""

import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
from dotenv import load_dotenv

# Load Local Imports
from database import db, init_db
from routes import auth_bp, predictions_bp, reports_bp, admin_bp, chatbot_bp, ml_bp
from models.ai_models import model_manager

def create_app():
    # Load environment variables
    load_dotenv()
    
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'mediascan-secret-dev')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-dev')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Paths
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    app.config['MODELS_FOLDER'] = os.path.join(BASE_DIR, 'models')
    app.config['UPLOAD_FOLDER'] = os.path.join(BASE_DIR, 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
    
    # Ensure Upload Directories Exist
    subfolders = ['eye', 'palm', 'retina', 'skin', 'gradcam', 'temp']
    for sf in subfolders:
        os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], sf), exist_ok=True)
    
    # Initialize Extensions
    CORS(app)
    db.init_app(app)
    JWTManager(app)
    
    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(predictions_bp, url_prefix='/api/predictions')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')
    app.register_blueprint(ml_bp, url_prefix='/api/ml')
    
    # Serving uploads
    @app.route('/api/uploads/<path:filename>')
    def serve_uploads(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    # Health check
    @app.route('/api/health')
    def health_check():
        from datetime import datetime
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'service': 'MediScan AI Backend'
        }), 200

    # Initialize Database & Models on Startup
    with app.app_context():
        init_db(app)
        model_manager.load_models(app.config['MODELS_FOLDER'])
        
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000)

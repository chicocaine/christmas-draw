from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from db import db
from routes.auth import auth_bp
from routes.admin import admin_bp
from routes.user import user_bp
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)

    # Load environment variables for JWT, DB
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    app.config["JWT_CSRF_PROTECTION"] = False  # Disable CSRF for API

    # SQLite database
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URI", "sqlite:///database.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # CORS configuration for frontend access
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://172.24.232.8:5173",
        "http://172.24.232.8:5174"
    ]
    CORS(app, supports_credentials=True, origins=allowed_origins)
    jwt = JWTManager(app)
    
    # JWT error handlers
    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        return jsonify({"msg": "Invalid token", "error": str(error_string)}), 422
    
    @jwt.unauthorized_loader
    def unauthorized_callback(error_string):
        return jsonify({"msg": "Missing authorization", "error": str(error_string)}), 401
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"msg": "Token has expired"}), 401
    
    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({"msg": "Token has been revoked"}), 401
    
    db.init_app(app)

    # Register routes
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(admin_bp, url_prefix="/admin")
    app.register_blueprint(user_bp, url_prefix="/user")
    
    return app


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()  
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)

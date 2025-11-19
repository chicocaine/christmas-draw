from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models import User
import bcrypt
from db import db

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/login")
def login():
    data = request.json
    
    # Input validation
    if not data:
        return jsonify({"msg": "No data provided"}), 400
    
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        return jsonify({"msg": "Username and password required"}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"msg": "Invalid credentials"}), 401

    if not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        return jsonify({"msg": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user.id), additional_claims={"is_admin": user.is_admin})
    return jsonify({"token": token, "is_admin": user.is_admin})

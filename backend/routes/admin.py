from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import User
from db import db
from utils.derangement import generate_derangement
import bcrypt

admin_bp = Blueprint("admin", __name__)


def admin_required():
    """Verify that the user is an admin"""
    claims = get_jwt()
    if not claims.get("is_admin", False):
        return jsonify({"msg": "Admin access required"}), 403
    return None


# Create users
@admin_bp.post("/create-users")
@jwt_required()
def create_users():
    """Create new users in the system"""
    # Check admin permission
    error_response = admin_required()
    if error_response:
        return error_response
    
    try:
        data = request.json
        if not data or "users" not in data:
            return jsonify({"msg": "No users data provided"}), 400
        
        users = data.get("users")
        if not users or not isinstance(users, list):
            return jsonify({"msg": "Users must be a non-empty list"}), 400

        created = []
        errors = []
        
        for u in users:
            # Validate each user
            if not isinstance(u, dict):
                errors.append("Invalid user format")
                continue
                
            if not u.get("name") or not u.get("username") or not u.get("password"):
                errors.append(f"Missing fields for user: {u.get('username', 'unknown')}")
                continue
            
            # Check if username already exists
            if User.query.filter_by(username=u["username"]).first():
                errors.append(f"Username already exists: {u['username']}")
                continue
            
            # Ensure password is string
            password = str(u["password"])
            password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
            is_admin = u.get("is_admin", False)
            user = User(name=u["name"], username=u["username"], password_hash=password_hash, is_admin=is_admin)
            db.session.add(user)
            created.append(u["username"])
        
        if created:
            db.session.commit()

        return jsonify({"created": created, "errors": errors})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Server error: {str(e)}"}), 500


@admin_bp.post("/generate-assignments")
@jwt_required()
def generate_assignments():
    """Generate Secret Santa assignments using derangement algorithm"""
    # Check admin permission
    error_response = admin_required()
    if error_response:
        return error_response
    
    users = User.query.filter_by(is_admin=False).all()
    
    if len(users) < 2:
        return jsonify({"msg": "Need at least 2 non-admin users for assignments"}), 400
    
    ids = [u.id for u in users]
    assigned = generate_derangement(ids)

    for user, target_id in zip(users, assigned):
        user.assigned_user_id = target_id
        user.has_drawn = False
    db.session.commit()

    return jsonify({"msg": "Assignments generated", "count": len(users)})


@admin_bp.get("/users")
@jwt_required()
def get_users():
    """Get list of all users with their status"""
    # Check admin permission
    error_response = admin_required()
    if error_response:
        return error_response
    
    users = User.query.all()
    users_list = [
        {
            "id": u.id,
            "name": u.name,
            "username": u.username,
            "is_admin": u.is_admin,
            "has_drawn": u.has_drawn,
            "has_assignment": u.assigned_user_id is not None
        }
        for u in users
    ]
    
    return jsonify({"users": users_list})


@admin_bp.delete("/users/<int:user_id>")
@jwt_required()
def delete_user(user_id):
    """Delete a user from the system"""
    # Check admin permission
    error_response = admin_required()
    if error_response:
        return error_response
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    # Prevent deleting the last admin
    if user.is_admin:
        admin_count = User.query.filter_by(is_admin=True).count()
        if admin_count <= 1:
            return jsonify({"msg": "Cannot delete the last admin user"}), 400
    
    username = user.username
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({"msg": f"User {username} deleted successfully"})


@admin_bp.get("/assignments")
@jwt_required()
def get_assignments():
    """Get all Secret Santa assignments"""
    # Check admin permission
    error_response = admin_required()
    if error_response:
        return error_response
    
    users = User.query.filter_by(is_admin=False).all()
    assignments = []
    
    for user in users:
        if user.assigned_user_id:
            target = User.query.get(user.assigned_user_id)
            if target:
                assignments.append({
                    "giver": user.name,
                    "receiver": target.name
                })
    
    return jsonify({"assignments": assignments})


@admin_bp.put("/users/<int:user_id>/password")
@jwt_required()
def change_user_password(user_id):
    """Change a user's password"""
    # Check admin permission
    error_response = admin_required()
    if error_response:
        return error_response
    
    data = request.json
    if not data or not data.get("new_password"):
        return jsonify({"msg": "New password is required"}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    # Hash the new password
    new_password = str(data["new_password"])
    password_hash = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
    user.password_hash = password_hash
    db.session.commit()
    
    return jsonify({"msg": f"Password updated for {user.username}"})

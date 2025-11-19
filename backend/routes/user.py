from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User

user_bp = Blueprint("user", __name__)

@user_bp.get("/assignment")
@jwt_required()
def get_assignment():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"msg": "User not found"}), 404

    if not user.assigned_user_id:
        return jsonify({"msg": "Assignment not ready yet"}), 400

    target = User.query.get(user.assigned_user_id)
    if not target:
        return jsonify({"msg": "Assignment error"}), 500
    
    return jsonify({
        "assigned_to": target.name,
        "has_drawn": user.has_drawn
    })

@user_bp.post("/mark-viewed")
@jwt_required()
def mark_assignment_viewed():
    """
    Mark that the user has viewed their assignment.
    Called after the reveal animation completes.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    if not user.has_drawn:
        user.has_drawn = True
        from db import db
        db.session.commit()
    
    return jsonify({"msg": "Marked as viewed"})

@user_bp.get("/all-users")
@jwt_required()
def get_all_users():
    """
    Get list of all users (non-sensitive info only).
    Used for rolling animation effect.
    """
    users = User.query.all()
    
    user_list = [
        {
            "id": user.id,
            "name": user.name,
            "username": user.username,
            "is_admin": user.is_admin,
            "has_drawn": user.has_drawn,
            "has_assignment": user.assigned_user_id is not None
        }
        for user in users
    ]
    
    return jsonify({"users": user_list})

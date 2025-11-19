from db import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    username = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    has_drawn = db.Column(db.Boolean, default=False)
    assigned_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    assigned_user = db.relationship("User", remote_side=[id])

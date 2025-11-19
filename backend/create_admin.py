#!/usr/bin/env python3
"""
Script to create the first admin user for the Christmas Draw application.
"""
from app import create_app
from models import User
from db import db
import bcrypt
import sys

def create_admin():
    app = create_app()
    
    with app.app_context():
        # Check if admin already exists
        existing_admin = User.query.filter_by(is_admin=True).first()
        if existing_admin:
            print(f"⚠️  Admin user already exists: {existing_admin.username}")
            response = input("Do you want to create another admin? (yes/no): ")
            if response.lower() not in ['yes', 'y']:
                print("Exiting...")
                return
        
        # Get admin details
        print("\n=== Create Admin User ===")
        name = input("Admin name: ").strip()
        username = input("Admin username: ").strip()
        password = input("Admin password: ").strip()
        
        if not name or not username or not password:
            print("❌ All fields are required!")
            sys.exit(1)
        
        # Check if username exists
        if User.query.filter_by(username=username).first():
            print(f"❌ Username '{username}' already exists!")
            sys.exit(1)
        
        # Create admin user
        password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        admin = User(
            name=name,
            username=username,
            password_hash=password_hash,
            is_admin=True
        )
        
        db.session.add(admin)
        db.session.commit()
        
        print(f"\n✅ Admin user '{username}' created successfully!")
        print(f"   Name: {name}")
        print(f"   Username: {username}")
        print("\nYou can now login with these credentials.")

if __name__ == "__main__":
    try:
        create_admin()
    except KeyboardInterrupt:
        print("\n\nOperation cancelled.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

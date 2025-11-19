# Christmas Draw Backend

A Flask-based Secret Santa assignment system with JWT authentication.

## Features

- 🔐 JWT-based authentication
- 👥 User management with admin roles
- 🎲 Automated Secret Santa assignments (derangement algorithm)
- 🔒 Secure environment variable configuration
- 📊 SQLite database

## Setup

### 1. Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy the example environment file and configure:

```bash
cp .env.example .env
# Edit .env with your own secure keys
```

### 4. Run the Application

```bash
python app.py
```

The server will start on `http://0.0.0.0:5000`

## API Endpoints

### Authentication

**POST** `/auth/login`
- Body: `{"username": "string", "password": "string"}`
- Returns: `{"token": "jwt_token", "is_admin": boolean}`

### Admin Routes (Require Admin JWT)

**POST** `/admin/create-users`
- Body: `{"users": [{"name": "string", "username": "string", "password": "string", "is_admin": boolean}]}`
- Returns: `{"created": ["usernames"], "errors": ["error messages"]}`

**POST** `/admin/generate-assignments`
- Generates Secret Santa assignments for all non-admin users
- Returns: `{"msg": "Assignments generated", "count": number}`

### User Routes (Require JWT)

**GET** `/user/assignment`
- Returns: `{"assigned_to": "name"}`

## Security Features

- ✅ Environment-based configuration (no hardcoded secrets)
- ✅ JWT authentication with role-based access
- ✅ Password hashing with bcrypt
- ✅ Input validation on all endpoints
- ✅ Admin-only routes protected
- ✅ CORS enabled for frontend integration

## Database Schema

### User Model
- `id`: Integer (Primary Key)
- `name`: String (120)
- `username`: String (120, Unique)
- `password_hash`: String (200)
- `is_admin`: Boolean
- `has_drawn`: Boolean
- `assigned_user_id`: Integer (Foreign Key)

## Development

To create a fresh database:

```bash
rm -f instance/database.db
python app.py  # Will auto-create tables
```

## Creating the First Admin User

You'll need to manually create the first admin user. You can do this via Python:

```python
from app import create_app
from models import User
from db import db
import bcrypt

app = create_app()
with app.app_context():
    password_hash = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode()
    admin = User(name="Admin", username="admin", password_hash=password_hash, is_admin=True)
    db.session.add(admin)
    db.session.commit()
```

Or use the included script:

```bash
python create_admin.py
```

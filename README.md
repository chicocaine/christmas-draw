# 🎄 Christmas Draw - Secret Santa App For The Family

## Features
- 🎅 **Automated Assignments** - Uses derangement algorithm to assign a secret santa to each member while also not getting assigned to themselves
- 🔐 **Secure Authentication** - JWT-based auth with role-based access control
- 👥 **User Management** - Admins can create and manage participants
- 🎁 **Secret Reveal** - Simple animation for members to see their assignments

## Tech Stack

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - Database ORM (SQLite)
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Flask-CORS** - Cross-origin support

### Frontend
- **React 19** - Modern UI library
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Tailwind CSS** - Utility-first styling

## Project Structure

```
christmas-draw/
├── backend/           # Flask API
│   ├── app.py        # Main application
│   ├── models.py     # Database models
│   ├── routes/       # API endpoints
│   ├── utils/        # Helper functions
│   └── README.md     # Backend docs
└── frontend/         # React app
    ├── src/
    │   ├── api/      # API integration
    │   ├── pages/    # UI pages
    │   └── context/  # State management
    └── README.md     # Frontend docs
```

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 16+
- WSL2 (if on Windows)

### 1. Setup Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server (creates database automatically)
python app.py
```

Backend runs on `http://localhost:5000`

### 2. Create Admin User

```bash
cd backend
source venv/bin/activate
python create_admin.py
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs on `http://localhost:5173`

## Usage

### Admin Workflow

1. **Login** with admin credentials
2. **Create Users** - Add all Secret Santa participants
3. **Generate Assignments** - Click to create random assignments
4. Share login credentials with members

### User Workflow

1. **Login** with provided credentials
2. **View Assignment** - Click to reveal who they're gifting for
3. Tell no one

## API Endpoints

### Authentication
- `POST /auth/login` - User login

### Admin (Protected)
- `POST /admin/create-users` - Batch create users
- `POST /admin/generate-assignments` - Generate Secret Santa pairs

### User (Protected)
- `GET /user/assignment` - Get assigned person

## Security Features

✅ Environment-based configuration  
✅ JWT authentication with role-based access  
✅ Password hashing with bcrypt  
✅ Input validation on all endpoints  
✅ Admin-only route protection  
✅ Automatic token expiration handling  
✅ CORS configured for frontend integration  

## Development

Both servers support hot-reload for development:

```bash
# Terminal 1 - Backend
cd backend && source venv/bin/activate && python app.py

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

## Environment Variables

### Backend `.env`
```env
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret
DATABASE_URI=sqlite:///database.db
PORT=5000
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000
```

## Production Deployment

### Backend
1. Use a production WSGI server (gunicorn, waitress)
2. Set secure environment variables
3. Use PostgreSQL or MySQL instead of SQLite

### Frontend
1. Build: `npm run build`
2. Deploy `dist/` folder to hosting service
3. Update `VITE_API_URL` to production backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this for your own Secret Santa events!

## Support

For issues or questions, please open an issue on GitHub.

---

Made with ❤️ (obligations) for spreading holiday cheer 🎄 (survival)

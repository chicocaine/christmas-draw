# Christmas Draw Frontend

React + TypeScript + Vite frontend for the Christmas Draw Secret Santa application.

## Features

- 🎨 Modern React with TypeScript
- 🔐 JWT-based authentication with automatic token management
- 🎯 Role-based routing (Admin & User dashboards)
- 🎄 Beautiful Christmas-themed UI with Tailwind CSS
- ⚡ Fast development with Vite
- 🔄 Automatic proxy to backend API

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Tailwind CSS** - Styling

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will run on `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── api/
│   ├── axios.ts          # Axios instance with JWT interceptors
│   └── index.ts          # API service functions
├── components/
│   └── ProtectedRoute.tsx # Route wrapper for authentication
├── context/
│   ├── AuthContext.tsx   # Auth state provider
│   └── useAuth.ts        # Auth hook
├── pages/
│   ├── Login.tsx         # Login page
│   ├── Dashboard.tsx     # Route redirector
│   ├── AdminDashboard.tsx # Admin interface
│   └── UserDashboard.tsx  # User interface
├── App.tsx               # Main app with routing
└── main.tsx              # App entry point
```

## Features by Role

### Admin Dashboard
- Create multiple users at once
- Set admin privileges for users
- Generate Secret Santa assignments

### User Dashboard  
- View Secret Santa assignment
- Reveal assigned person with animation

## Development

### With Backend

1. Start backend: `cd ../backend && source venv/bin/activate && python app.py`
2. Start frontend: `npm run dev`
3. Access at `http://localhost:5173`

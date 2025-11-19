import { useAuth } from '@/context/useAuth';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { isAdmin } = useAuth();

  // Redirect to appropriate dashboard based on role
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/user" replace />;
}

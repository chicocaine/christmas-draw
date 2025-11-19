import { useState, type ReactNode } from 'react';
import { authAPI, type LoginResponse } from '@/api';
import { AuthContext } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('token');
  const adminStatus = localStorage.getItem('isAdmin');
  
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [isAdmin, setIsAdmin] = useState(adminStatus === 'true');
  const loading = false;

  const login = async (username: string, password: string) => {
    const data: LoginResponse = await authAPI.login(username, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('isAdmin', String(data.is_admin));
    setIsAuthenticated(true);
    setIsAdmin(data.is_admin);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

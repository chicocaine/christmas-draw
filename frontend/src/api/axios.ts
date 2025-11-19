import axios from 'axios';

// IMPORTANT
// In production, use relative URLs so requests go to the same domain
// In development, use the environment variable or localhost
const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD ? '' : 'http://localhost:5000'
);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

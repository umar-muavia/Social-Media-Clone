import axios from 'axios';
import { isTokenExpired } from './utils/auth';
import { useNavigate } from 'react-router-dom';

/// create new instance
const api = axios.create({
  baseURL: 'http://localhost:4000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    if (isTokenExpired()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user-Name');
      const navigate = useNavigate();
      navigate('/login');
      throw new Error('Token expired');
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

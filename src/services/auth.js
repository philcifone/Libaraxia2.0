// services/auth.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login({ username, password }) {
    try {
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', data.token);
      return data.user;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  async register({ username, email, password }) {
    try {
      const { data } = await api.post('/auth/register', {
        username,
        email,
        password
      });
      localStorage.setItem('token', data.token);
      return data.user;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  },

  async logout() {
    localStorage.removeItem('token');
  },

  async getCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const { data } = await api.get('/auth/me');
      return data;
    } catch (error) {
      localStorage.removeItem('token');
      return null;
    }
  }
};
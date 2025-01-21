const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = './src';

// Directory structure
const directories = [
  'components/layout',
  'components/auth',
  'components/books',
  'components/common',
  'contexts',
  'hooks',
  'services',
  'utils',
  'pages',
];

// File contents
const files = {
  // Components
  'components/layout/Header.jsx': `
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Library Catalog</Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span>Welcome, {user.username}</span>
              <button 
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              to="/login"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}`,

  'components/layout/Layout.jsx': `
import React from 'react';
import Header from './Header';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}`,

  'components/auth/LoginForm.jsx': `
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function LoginForm() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(credentials);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          type="text"
          id="username"
          value={credentials.username}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Login
      </button>
    </form>
  );
}`,

  // Contexts
  'contexts/AuthContext.jsx': `
import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    const userData = await authService.login(credentials);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}`,

  // Hooks
  'hooks/useAuth.js': `
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}`,

  'hooks/useBooks.js': `
import { useState, useCallback } from 'react';
import { bookService } from '../services/books';

export function useBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBooks = useCallback(async (userId) => {
    setLoading(true);
    try {
      const data = await bookService.getUserBooks(userId);
      setBooks(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { books, loading, error, fetchBooks };
}`,

  // Services
  'services/api.js': `
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

export default api;`,

  'services/auth.js': `
import api from './api';

export const authService = {
  async login({ username, password }) {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('token', data.token);
    return data.user;
  },

  async logout() {
    localStorage.removeItem('token');
    await api.post('/auth/logout');
  },

  async getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const { data } = await api.get('/auth/me');
      return data;
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  },
};`,

  'services/books.js': `
import api from './api';

export const bookService = {
  async searchBooks(query) {
    const { data } = await api.get('/books/search', { params: { q: query } });
    return data;
  },

  async getUserBooks(userId) {
    const { data } = await api.get(\`/users/\${userId}/books\`);
    return data;
  },

  async addBook(bookData) {
    const { data } = await api.post('/books', bookData);
    return data;
  },

  async removeBook(bookId) {
    await api.delete(\`/books/\${bookId}\`);
  },
};`,

  // Pages
  'pages/Home.jsx': `
import React from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to Library Catalog</h1>
        {user ? (
          <p>Welcome back, {user.username}!</p>
        ) : (
          <p>Please login to manage your library.</p>
        )}
      </div>
    </Layout>
  );
}`,

  'pages/Login.jsx': `
import React from 'react';
import Layout from '../components/layout/Layout';
import LoginForm from '../components/auth/LoginForm';

export default function Login() {
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">Login</h1>
        <LoginForm />
      </div>
    </Layout>
  );
}`,

  // Utils
  'utils/constants.js': `
export const READ_STATUS = {
  READ: 'read',
  WANT_TO_READ: 'want to read',
  CURRENTLY_READING: 'currently reading',
  DID_NOT_FINISH: 'did not finish',
};

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  CURRENT_USER: '/auth/me',
  BOOKS: '/books',
  USERS: '/users',
};`,
};

// Create directories
directories.forEach(dir => {
  const dirPath = path.join(PROJECT_ROOT, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Create files
Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(PROJECT_ROOT, filePath);
  fs.writeFileSync(fullPath, content.trim());
  console.log(`Created ${fullPath}`);
});

console.log('Project structure created successfully!');

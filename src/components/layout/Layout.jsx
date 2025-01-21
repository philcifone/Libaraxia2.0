import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Search, Library, LogOut, Home } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left side navigation */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
              
              {user && (
                <>
                  <Link to="/library" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                    <Library className="h-5 w-5" />
                    <span>Library</span>
                  </Link>
                  <Link to="/search" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                    <Search className="h-5 w-5" />
                    <span>Search</span>
                  </Link>
                </>
              )}
            </div>

            {/* Right side - auth buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700">Hi, {user.username}!</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="space-x-4">
                  <Link to="/login" className="text-gray-700 hover:text-blue-600">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="py-8">
        {children}
      </main>
    </div>
  );
}
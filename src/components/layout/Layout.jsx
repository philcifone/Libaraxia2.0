import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Search, Library, LogOut, Home } from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left side navigation */}
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-2 text-foreground hover:text-foreground/80">
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
              
              {user && (
                <>
                  <Link to="/library" className="flex items-center space-x-2 text-foreground hover:text-foreground/80">
                    <Library className="h-5 w-5" />
                    <span>Library</span>
                  </Link>
                  <Link to="/search" className="flex items-center space-x-2 text-foreground hover:text-foreground/80">
                    <Search className="h-5 w-5" />
                    <span>Search</span>
                  </Link>
                </>
              )}
            </div>

            {/* Right side - auth buttons and theme toggle */}
            <div className="flex items-center space-x-6">
              <ThemeToggle />
              {user ? (
                <>
                  <span className="text-foreground">Hi, {user.username}!</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-foreground hover:text-foreground/80"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="space-x-4">
                  <Link to="/login" className="text-foreground hover:text-foreground/80">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-foreground text-background hover:bg-foreground/90 px-4 py-2 rounded-md"
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
      <main className="py-8 px-4">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
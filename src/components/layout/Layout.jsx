import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Search, Library, LogOut, Home, Menu, X } from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const NavLinks = () => (
    <>
      <Link 
        to="/" 
        className="flex items-center space-x-2 text-foreground hover:text-foreground/80"
        onClick={() => setIsMenuOpen(false)}
      >
        <Home className="h-5 w-5" />
        <span>Home</span>
      </Link>
      
      {user && (
        <>
          <Link 
            to="/library" 
            className="flex items-center space-x-2 text-foreground hover:text-foreground/80"
            onClick={() => setIsMenuOpen(false)}
          >
            <Library className="h-5 w-5" />
            <span>Library</span>
          </Link>
          <Link 
            to="/search" 
            className="flex items-center space-x-2 text-foreground hover:text-foreground/80"
            onClick={() => setIsMenuOpen(false)}
          >
            <Search className="h-5 w-5" />
            <span>Search</span>
          </Link>
        </>
      )}
    </>
  );

  const AuthButtons = () => (
    <>
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
        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <Link 
            to="/login" 
            className="block md:inline text-foreground hover:text-foreground/80"
            onClick={() => setIsMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="block md:inline bg-foreground text-background hover:bg-foreground/90 px-4 py-2 rounded-md"
            onClick={() => setIsMenuOpen(false)}
          >
            Register
          </Link>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-foreground hover:text-foreground/80"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <NavLinks />
            </div>

            {/* Right side - theme toggle and auth (desktop) */}
            <div className="hidden md:flex items-center space-x-6">
              <ThemeToggle />
              <AuthButtons />
            </div>

            {/* Theme toggle (mobile) */}
            <div className="md:hidden">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-4 border-t border-border/40">
              <div className="flex flex-col space-y-4">
                <NavLinks />
              </div>
              <div className="flex flex-col space-y-4 pt-4 border-t border-border/40">
                <AuthButtons />
              </div>
            </div>
          )}
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
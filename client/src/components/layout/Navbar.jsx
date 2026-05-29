import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Activity, Menu, X, User, LogOut } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Sync auth state on mount and token changes
  useEffect(() => {
    const handleAuthChange = () => {
      const storedUser = localStorage.getItem('theralign_user');
      const token = localStorage.getItem('theralign_token');
      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    handleAuthChange();
    window.addEventListener('storage', handleAuthChange);
    return () => window.removeEventListener('storage', handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('theralign_token');
    localStorage.removeItem('theralign_user');
    setUser(null);
    navigate('/login');
    // Force storage event for other tabs/components
    window.dispatchEvent(new Event('storage'));
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'doctor') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Main Nav */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-secondary hover:opacity-90 transition-opacity">
              <Activity className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg tracking-tight">Theralign</span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                    isActive 
                      ? 'border-primary text-secondary' 
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink 
                to="/doctors" 
                className={({ isActive }) => 
                  `inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                    isActive 
                      ? 'border-primary text-secondary' 
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                  }`
                }
              >
                Find Doctors
              </NavLink>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <NotificationBell />
                <Link 
                  to={getDashboardLink()} 
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-button shadow-sm hover:shadow transition-all"
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-500 hover:text-danger rounded-button hover:bg-slate-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-button shadow-sm hover:shadow transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            {user && <NotificationBell />}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-50 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 py-3 px-4 space-y-3">
          <NavLink 
            to="/" 
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => 
              `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive ? 'bg-slate-50 text-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink 
            to="/doctors" 
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => 
              `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive ? 'bg-slate-50 text-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            Find Doctors
          </NavLink>
          <hr className="border-slate-100" />
          {user ? (
            <div className="space-y-2">
              <Link
                to={getDashboardLink()}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-base font-semibold text-white bg-primary hover:bg-primary-dark rounded-button shadow-sm transition-all"
              >
                <User className="w-5 h-5" />
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-base font-semibold text-slate-600 hover:text-danger hover:bg-slate-50 rounded-button transition-all border border-slate-200"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link 
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center px-4 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50 rounded-button border border-slate-200 transition-colors"
              >
                Log In
              </Link>
              <Link 
                to="/register"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center px-4 py-2 text-base font-semibold text-white bg-primary hover:bg-primary-dark rounded-button shadow-sm transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

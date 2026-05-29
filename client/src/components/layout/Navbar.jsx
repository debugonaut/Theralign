import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Menu, X, LogOut, ChevronDown, User } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { user, clearCredentials } = useAuthStore();

  const handleLogout = () => {
    clearCredentials();
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    navigate('/');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.user-menu-container')) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const publicLinks = [
    { label: 'Find Doctors', to: '/doctors' },
  ];

  const roleLinks = {
    patient: [
      { label: 'Dashboard', to: '/patient/dashboard' },
      { label: 'Appointments', to: '/patient/appointments' },
      { label: 'Payments', to: '/patient/payments' },
    ],
    doctor: [
      { label: 'Dashboard', to: '/doctor/dashboard' },
      { label: 'Availability', to: '/doctor/availability' },
      { label: 'Appointments', to: '/doctor/appointments' },
      { label: 'Earnings', to: '/doctor/earnings' },
    ],
    admin: [
      { label: 'Admin Panel', to: '/admin/dashboard' },
    ],
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const linkClass = (to) =>
    isActive(to)
      ? 'inline-flex items-center px-1 pt-1 border-b-2 border-primary text-sm font-semibold text-primary transition-colors'
      : 'inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors';

  const mobileLinkClass = (to) =>
    isActive(to)
      ? 'block pl-3 pr-4 py-2 border-l-4 border-primary text-base font-semibold text-primary bg-sky-50/50 rounded-r-md transition-all'
      : 'block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all';

  const currentRoleLinks = user ? roleLinks[user.role] || [] : [];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 border-b border-slate-100 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Main Nav Links */}
          <div className="flex">
            <Link to="/" className="flex items-center gap-2 text-secondary hover:opacity-90 transition-opacity">
              <Activity className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg tracking-tight">Theralign</span>
            </Link>

            <div className="hidden md:ml-8 md:flex md:space-x-6">
              {publicLinks.map((link) => (
                <Link key={link.to} to={link.to} className={linkClass(link.to)}>
                  {link.label}
                </Link>
              ))}

              {currentRoleLinks.map((link) => (
                <Link key={link.to} to={link.to} className={linkClass(link.to)}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex md:items-center md:gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <NotificationBell />

                {/* User Dropdown */}
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{user.name}</span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <Link
                        to={`/${user.role}/profile`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>
                      <hr className="border-slate-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-semibold text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  Log In
                </Link>
                <Link to="/register">
                  <button className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-button shadow-sm hover:shadow transition-all duration-150">
                    Get Started
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu trigger */}
          <div className="flex items-center gap-2 md:hidden">
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-50 focus:outline-none transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 py-2 px-3 space-y-1.5 shadow-inner">
          {publicLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass(link.to)}
            >
              {link.label}
            </Link>
          ))}

          {currentRoleLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass(link.to)}
            >
              {link.label}
            </Link>
          ))}

          <hr className="border-slate-100 my-2" />

          {user ? (
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Logged in as {user.name}
              </div>
              <Link
                to={`/${user.role}/profile`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-rose-600 hover:bg-rose-50 font-semibold rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 pb-1">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-button text-sm bg-white hover:bg-slate-50 transition-all"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center px-4 py-2 bg-primary text-white font-semibold rounded-button text-sm hover:bg-primary-dark transition-all"
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

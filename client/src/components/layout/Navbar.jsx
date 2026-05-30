import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ChevronDown, User } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import NotificationBell from './NotificationBell';
import Button from '../common/Button';

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
    { label: 'FIND DOCTORS', to: '/doctors' },
    { label: 'FOR PHYSIOTHERAPISTS', to: '/register' },
  ];

  const roleLinks = {
    patient: [
      { label: 'FIND DOCTORS', to: '/doctors' },
      { label: 'MY APPOINTMENTS', to: '/patient/appointments' },
    ],
    doctor: [
      { label: 'DASHBOARD', to: '/doctor/dashboard' },
      { label: 'APPOINTMENTS', to: '/doctor/appointments' },
    ],
    admin: [
      { label: 'ADMIN PANEL', to: '/admin/dashboard' },
    ],
  };

  const currentRoleLinks = user ? roleLinks[user.role] || [] : publicLinks;

  // Reusable NavLink with the swiss vertical slide micro-interaction
  const SwissNavLink = ({ to, label }) => {
    // For mobile menu or simple links where animation isn't needed, we just use standard text
    // But Phase 2 spec asks for .swiss-nav-link micro-interaction
    return (
      <Link to={to} className="swiss-nav-link swiss-label">
        <span className="nav-text-default text-swiss-black">{label}</span>
        <span className="nav-text-hover">{label}</span>
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-swiss-white border-b-4 border-swiss-black">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-16">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex">
            <Link to="/" className="flex items-center text-swiss-black">
              <span className="font-black text-2xl tracking-tighter uppercase font-swiss">
                PHYSIOCONNECT
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            <div className="flex space-x-8">
              {currentRoleLinks.map((link) => (
                <SwissNavLink key={link.to} to={link.to} label={link.label} />
              ))}
            </div>

            {/* Auth Actions / User Menu */}
            <div className="flex items-center gap-4 ml-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <NotificationBell />

                  {/* User Dropdown */}
                  <div className="relative user-menu-container">
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 px-2 py-1 bg-swiss-white border-2 border-transparent hover:border-swiss-black transition-all duration-fast"
                    >
                      <div className="w-8 h-8 rounded-full bg-swiss-black text-swiss-white flex items-center justify-center text-sm font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="text-sm font-bold text-swiss-black uppercase tracking-widest">{user.name}</span>
                      <ChevronDown className="w-4 h-4 text-swiss-black" />
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-swiss-white border-2 border-swiss-black py-1 z-50">
                        <Link
                          to={`/${user.role}/profile`}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-swiss-black hover:bg-swiss-gray-100 font-bold uppercase tracking-widest transition-colors"
                        >
                          <User className="w-4 h-4" />
                          PROFILE
                        </Link>
                        <div className="border-t-2 border-swiss-gray-200 my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-swiss-red hover:bg-swiss-gray-100 font-bold uppercase tracking-widest text-left transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          LOGOUT
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile hamburger menu trigger */}
          <div className="flex items-center gap-4 md:hidden">
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border-2 border-swiss-black bg-swiss-white text-swiss-black font-bold uppercase tracking-widest text-xs hover:bg-swiss-black hover:text-swiss-white transition-colors duration-fast"
            >
              {mobileMenuOpen ? 'CLOSE' : 'MENU'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-swiss-white border-b-4 border-swiss-black px-6 py-4 space-y-4">
          {currentRoleLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-lg font-bold uppercase tracking-widest text-swiss-black border-l-4 border-transparent hover:border-swiss-red hover:text-swiss-red transition-all pl-2"
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t-2 border-swiss-gray-200 my-4" />

          {user ? (
            <div className="space-y-4">
              <div className="py-2 text-xs font-bold text-swiss-gray-400 uppercase tracking-widest">
                LOGGED IN AS {user.name}
              </div>
              <Link
                to={`/${user.role}/profile`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 font-bold uppercase tracking-widest text-swiss-black hover:text-swiss-red transition-colors"
              >
                <User className="w-5 h-5" />
                MY PROFILE
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 py-2 font-bold uppercase tracking-widest text-left text-swiss-red hover:text-swiss-black transition-colors"
              >
                <LogOut className="w-5 h-5" />
                LOGOUT
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2 pb-4">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" fullWidth size="md">
                  Log In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" fullWidth size="md">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

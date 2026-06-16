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

  const getLogoRedirectPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'doctor') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

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
    { label: 'For Physiotherapists', to: '/register' },
  ];

  const roleLinks = {
    patient: [
      { label: 'Find Doctors', to: '/doctors' },
      { label: 'My Appointments', to: '/patient/appointments' },
    ],
    doctor: [
      { label: 'Dashboard', to: '/doctor/dashboard' },
      { label: 'Appointments', to: '/doctor/appointments' },
    ],
    admin: [
      { label: 'Admin Panel', to: '/admin/dashboard' },
    ],
  };

  const currentRoleLinks = user ? roleLinks[user.role] || [] : publicLinks;

  const SwissNavLink = ({ to, label }) => {
    return (
      <Link
        to={to}
        className="swiss-nav-slide-link"
        aria-label={label}
      >
        {/* Clipping wrapper */}
        <span className="swiss-nav-slide-wrap">
          {/* Default black text — slides up on hover */}
          <span className="swiss-nav-slide-default">{label}</span>
          {/* Swiss Red text — slides in from below on hover */}
          <span className="swiss-nav-slide-hover">{label}</span>
        </span>
      </Link>
    );
  };

  const isLandingPage = location.pathname === '/';

  return (
    <nav className="swiss-navbar">
      <div className={isLandingPage ? "w-full px-6 sm:px-16" : "max-w-[1440px] mx-auto px-6 sm:px-16"}>
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex">
            <Link to={getLogoRedirectPath()} className="flex items-center gap-3 text-primary">
              <span className="font-black text-xl tracking-tighter uppercase font-swiss">
                THERALIGN
              </span>
              <img src="/theralign-logo.svg" alt="Theralign Logo" className="w-8 h-8 object-contain" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-4">
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
                      className="flex items-center gap-2 px-2 py-1 bg-white border border-transparent hover:border-neutral-200 rounded-md transition-all duration-fast"
                    >
                      {user.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={user.name} 
                          className="w-8 h-8 rounded-full object-cover border border-neutral-200 shrink-0"
                          onError={(e) => {
                            e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/default-avatar.png';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <span className="text-sm font-semibold text-neutral-900 normal-case">{user.name}</span>
                      <ChevronDown className="w-4 h-4 text-neutral-500" />
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 shadow-dropdown rounded-lg py-1 z-50">
                        <Link
                          to={`/${user.role}/profile`}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-100 font-medium normal-case transition-colors"
                        >
                          <User className="w-4 h-4 text-neutral-500" />
                          Profile
                        </Link>
                        <div className="border-t border-neutral-200 my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-neutral-100 font-medium normal-case text-left transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="border-0 text-primary hover:bg-primary-light">
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
              className="p-2 border border-neutral-200 bg-white text-neutral-900 rounded-md font-bold text-xs hover:bg-neutral-100 transition-colors duration-fast"
            >
              {mobileMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-6 py-4 space-y-4 shadow-sm">
          {currentRoleLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-neutral-700 hover:text-primary transition-all pl-2"
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t border-neutral-200 my-4" />

          {user ? (
            <div className="space-y-4">
              <div className="py-1 text-xs font-semibold text-neutral-500 normal-case">
                Logged in as {user.name}
              </div>
              <Link
                to={`/${user.role}/profile`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 font-medium text-neutral-900 hover:text-primary transition-colors"
              >
                <User className="w-5 h-5 text-neutral-500" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 py-2 font-medium text-left text-danger hover:text-neutral-900 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2 pb-4">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" fullWidth size="md" className="border-0 text-primary hover:bg-primary-light">
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

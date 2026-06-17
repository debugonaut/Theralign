import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ChevronDown, User, Menu, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
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

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.explore-container')) {
        setExploreOpen(false);
      }
      if (!e.target.closest('.user-menu-container')) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Handle smooth scroll for Explore links
  const handleExploreClick = (hash) => {
    setExploreOpen(false);
    setMobileMenuOpen(false);
    
    if (location.pathname === '/') {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `#${hash}`);
      }
    } else {
      navigate(`/#${hash}`);
    }
  };

  // 8 Explore Links requested by user
  const exploreLinks = [
    { label: 'AI Doctor Matching', hash: 'ai-matching' },
    { label: 'Areas of Care', hash: 'specializations' },
    { label: "What's different", hash: 'features' },
    { label: 'Why it works', hash: 'benefits' },
    { label: 'How it works', hash: 'how-it-works' },
    { label: 'Stats', hash: 'platform-scale' },
    { label: 'Patient Reviews', hash: 'testimonials' },
    { label: 'Pricing', hash: 'pricing' },
  ];

  const publicLinks = [
    { label: 'Find Doctors', to: '/doctors' },
    { label: 'Explore', isExplore: true },
    { label: 'For Physiotherapists', to: '/register' },
  ];

  const roleLinks = {
    patient: [
      { label: 'Find Doctors', to: '/doctors' },
      { label: 'Explore', isExplore: true },
      { label: 'My Appointments', to: '/patient/appointments' },
    ],
    doctor: [
      { label: 'Dashboard', to: '/doctor/dashboard' },
      { label: 'Explore', isExplore: true },
      { label: 'Appointments', to: '/doctor/appointments' },
    ],
    admin: [
      { label: 'Admin Panel', to: '/admin/dashboard' },
      { label: 'Explore', isExplore: true },
    ],
  };

  const currentRoleLinks = user ? roleLinks[user.role] || [] : publicLinks;
  const isLandingPage = location.pathname === '/';

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-4 border-obsidian w-full select-none">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="relative flex justify-between items-center h-16">
          
          {/* Logo Column */}
          <div className="flex items-center">
            <Link to={getLogoRedirectPath()} className="flex items-center gap-3 text-primary group">
              {/* Custom SVG Badge icon */}
              <div className="bg-[#edf4ff] p-1.5 border border-primary/10 rounded-sm group-hover:bg-[#e3efff] transition-all">
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-7 h-7 text-primary" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="16" rx="1" />
                  <path d="M9 2h6" />
                  <circle cx="9" cy="11" r="2" />
                  <path d="M5 17.5c0-1 1-2 4-2s4 1 4 2" />
                  <line x1="15" y1="9" x2="19" y2="9" />
                  <line x1="15" y1="13" x2="19" y2="13" />
                  <line x1="15" y1="17" x2="17" y2="17" />
                </svg>
              </div>
              <span className="font-black text-[22px] tracking-tight uppercase font-swiss text-[#00374e] select-none">
                THERALIGN
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links — absolutely centered */}
          <div className="hidden md:absolute md:left-1/2 md:-translate-x-1/2 md:flex md:items-center">
            <div className="flex items-center gap-4">
              {currentRoleLinks.map((link) => {
                if (link.isExplore) {
                  return (
                    <div key="explore" className="relative explore-container">
                      <button
                        onClick={() => setExploreOpen(!exploreOpen)}
                        className={`flex items-center gap-2 border-2 border-primary text-primary px-4 py-2 font-black text-[11px] tracking-widest uppercase rounded-none transition-all duration-fast select-none ${
                          exploreOpen ? 'bg-primary-light' : 'bg-transparent hover:bg-primary-light'
                        }`}
                      >
                        EXPLORE
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-fast ${exploreOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Explore Dropdown */}
                      {exploreOpen && (
                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-white border-2 border-primary shadow-level-2 rounded-none py-1 z-50 animate-swiss-slide-in">
                          {exploreLinks.map((item, idx) => (
                            <button
                              key={item.hash}
                              onClick={() => handleExploreClick(item.hash)}
                              className={`w-full text-left px-5 py-3 text-[11px] font-black text-primary tracking-widest uppercase transition-colors select-none ${
                                idx !== exploreLinks.length - 1 ? 'border-b border-neutral-100' : ''
                              } hover:bg-primary-light`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="border-2 border-primary text-primary px-4 py-2 font-black text-[11px] tracking-widest uppercase rounded-none bg-transparent hover:bg-primary-light transition-all duration-fast select-none"
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

          </div>

          {/* Auth — right side */}
          <div className="hidden md:flex md:items-center md:gap-4">
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <NotificationBell />

                  {/* User dropdown for logged-in users */}
                  <div className="relative user-menu-container">
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className={`flex items-center gap-2 px-3 py-2 bg-white border-2 border-primary rounded-none transition-all duration-fast select-none hover:bg-primary-light`}
                    >
                      {user.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={user.name} 
                          className="w-6 h-6 rounded-full object-cover shrink-0 border border-primary/10"
                          onError={(e) => {
                            e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/default-avatar.png';
                          }}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <span className="text-[11px] font-black tracking-widest text-primary uppercase">{user.name}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-primary transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-primary shadow-level-2 rounded-none py-1 z-50">
                        <Link
                          to={`/${user.role}/profile`}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 text-[11px] font-black text-primary tracking-widest uppercase hover:bg-primary-light border-b border-neutral-100 transition-colors"
                        >
                          <User className="w-4 h-4 text-primary" />
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-black text-danger tracking-widest uppercase hover:bg-primary-light text-left transition-colors"
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
                  <Link to="/login" className="text-[11px] font-black text-primary tracking-widest uppercase hover:text-secondary-container transition-colors py-2 px-1 select-none">
                    LOG IN
                  </Link>
                  <Link to="/register" className="bg-primary text-white border-2 border-primary px-5 py-2.5 font-black text-[11px] tracking-widest uppercase rounded-none transition-all duration-200 select-none hover:bg-white hover:text-primary">
                    GET STARTED
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
              className="p-2 border-2 border-primary bg-white text-primary rounded-none font-black text-[11px] tracking-widest uppercase hover:bg-primary-light transition-colors duration-fast"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile navigation menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b-4 border-obsidian px-6 py-5 space-y-4 shadow-level-2 animate-swiss-slide-in">
          {currentRoleLinks.map((link) => {
            if (link.isExplore) {
              return (
                <div key="mobile-explore" className="space-y-2">
                  <div className="text-[10px] font-black tracking-widest text-neutral-400 uppercase py-1 border-b border-neutral-100">
                    EXPLORE SECTIONS
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {exploreLinks.map((item) => (
                      <button
                        key={item.hash}
                        onClick={() => handleExploreClick(item.hash)}
                        className="text-left py-2 px-3 bg-neutral-50 text-[10px] font-black text-primary border border-neutral-200 uppercase tracking-wider hover:bg-primary-light hover:border-primary transition-all rounded-none"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[11px] font-black text-primary border-2 border-primary px-4 py-2.5 uppercase tracking-widest rounded-none text-center bg-transparent hover:bg-primary-light transition-colors"
              >
                {link.label}
              </Link>
            );
          })}

          <div className="border-t-2 border-neutral-200 my-4" />

          {user ? (
            <div className="space-y-3">
              <div className="py-1 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                Logged in as {user.name}
              </div>
              <Link
                to={`/${user.role}/profile`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2.5 text-[11px] font-black uppercase text-primary hover:text-secondary-container transition-colors pl-1"
              >
                <User className="w-4 h-4 text-primary" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 py-2.5 text-[11px] font-black uppercase text-danger hover:text-[#FF3000] transition-colors text-left pl-1"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2 pb-2">
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center border-2 border-primary py-2.5 text-[11px] font-black text-primary uppercase tracking-widest rounded-none hover:bg-primary-light transition-all"
              >
                LOG IN
              </Link>
              <Link 
                to="/register" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-primary border-2 border-primary py-2.5 text-[11px] font-black text-white uppercase tracking-widest rounded-none hover:bg-primary-dark transition-all"
              >
                GET STARTED
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

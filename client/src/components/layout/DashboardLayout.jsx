import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, LogOut, LayoutDashboard, Calendar, Search, 
  CreditCard, Star, Clock, DollarSign, User, ClipboardList, Users
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { getDoctorProfileAPI } from '../../api/doctor.api';
import { getDoctorAppointments } from '../../api/appointment.api';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [pendingCount, setPendingCount] = useState(0);
  const [showVerificationSuccessModal, setShowVerificationSuccessModal] = useState(false);
  const [doctorType, setDoctorType] = useState('independent');
  const [maxJuniorDoctors, setMaxJuniorDoctors] = useState(0);
  const isInitiallyVerified = useRef(null);

  const user = useAuthStore((state) => state.user);
  const clearCredentials = useAuthStore((state) => state.clearCredentials);

  const handleLogout = () => {
    clearCredentials();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  useEffect(() => {
    if (user?.role === 'doctor') {
      const fetchDoctorData = async () => {
        try {
          const profileRes = await getDoctorProfileAPI();
          if (profileRes.success && profileRes.data?.profile) {
            const currentStatus = profileRes.data.profile.verificationStatus;
            const currentType = profileRes.data.profile.doctorType || 'independent';
            const currentMaxJuniors = profileRes.data.profile.maxJuniorDoctors || 0;
            
            setDoctorType(currentType);
            setMaxJuniorDoctors(currentMaxJuniors);
            
            if (isInitiallyVerified.current === null) {
              isInitiallyVerified.current = currentStatus === 'verified';
            } else if (!isInitiallyVerified.current && currentStatus === 'verified') {
              setShowVerificationSuccessModal(true);
              isInitiallyVerified.current = true;
            }

            setVerificationStatus(currentStatus);
          }
        } catch (err) {
          console.error('Failed to fetch doctor profile in layout:', err);
        }

        try {
          const apptRes = await getDoctorAppointments();
          const appts = apptRes.data?.appointments || apptRes.data || apptRes.appointments || [];
          const activeAppts = appts.filter(
            (a) => a.status === 'pending' || a.status === 'confirmed'
          );
          setPendingCount(activeAppts.length);
        } catch (err) {
          console.error('Failed to fetch doctor appointments in layout:', err);
        }
      };

      fetchDoctorData();
      const interval = setInterval(fetchDoctorData, 15000);
      return () => clearInterval(interval);
    }
  }, [user, location.pathname]);

  const patientNavigation = [
    { name: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'My Appointments', href: '/patient/appointments', icon: Calendar },
    { name: 'Care History', href: '/patient/care-timeline', icon: ClipboardList },
    { name: 'Find Doctors', href: '/doctors', icon: Search },
    { name: 'Payment History', href: '/patient/payments', icon: CreditCard },
    { name: 'My Profile', href: '/patient/profile', icon: User },
    { name: 'My Reviews', href: '/patient/reviews', icon: Star },
  ];

  const doctorNavigation = [
    { name: 'Overview', href: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', href: '/doctor/appointments', icon: Calendar, showBadge: true },
    ...(doctorType !== 'junior' ? [
      { name: 'Availability', href: '/doctor/availability', icon: Clock },
      { name: 'Earnings', href: '/doctor/earnings', icon: DollarSign },
    ] : []),
    { name: 'My Profile', href: '/doctor/profile', icon: User },
    ...(doctorType === 'senior' || maxJuniorDoctors > 0 ? [
      { name: 'Practice', href: '/doctor/practice', icon: Users }
    ] : []),
    { name: 'My Reviews', href: '/doctor/reviews', icon: Star },
  ];

  const navigation = user?.role === 'doctor' ? doctorNavigation : patientNavigation;

  return (
    <div className="min-h-screen bg-neutral-50 flex select-none text-neutral-900">
      {/* Mobile Sidebar Backing Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-none md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col bg-white text-neutral-900 border-r-2 border-neutral-200 
        transition-[width] duration-300 ease-in-out transform group/sidebar
        md:translate-x-0 md:static md:h-screen shrink-0
        ${sidebarOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full w-[240px] md:w-[72px] md:hover:w-[240px]'}
      `}>
        {/* Sidebar Brand header */}
        <div className="flex items-center justify-between py-5 px-5 border-b border-neutral-200 overflow-hidden h-[73px]">
          <Link to={user?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} className="flex items-center gap-3 shrink-0">
            <img src="/theralign-logo.svg" alt="Theralign" className="w-8 h-8 object-contain shrink-0" />
            <span className="font-black text-2xl tracking-tighter uppercase font-swiss text-primary md:opacity-0 md:group-hover/sidebar:opacity-100 transition-opacity duration-300 truncate">
              THERALIGN
            </span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-neutral-900 hover:text-danger md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 py-4 overflow-y-auto space-y-1 overflow-x-hidden">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center h-12 px-4 mx-2 rounded-md text-sm font-semibold transition-all duration-300 border-l-4 overflow-hidden relative
                  ${isActive 
                    ? 'border-neutral-900 bg-neutral-900 text-white font-bold' 
                    : 'text-neutral-500 bg-white border-transparent hover:bg-neutral-100 hover:text-neutral-900'
                  }
                `}
              >
                <div className="flex items-center gap-3 min-w-[200px]">
                  {Icon && <Icon className="w-5 h-5 shrink-0" />}
                  <span className="md:opacity-0 md:group-hover/sidebar:opacity-100 transition-opacity duration-300 truncate">
                    {item.name}
                  </span>
                </div>
                {item.showBadge && pendingCount > 0 && (
                  <span className={`ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-sm shrink-0 md:opacity-0 md:group-hover/sidebar:opacity-100 transition-opacity duration-300 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-primary-light text-primary'
                  }`}>
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer User & Logout */}
        <div className="border-t border-neutral-200 p-4 bg-neutral-50 flex flex-col gap-3 overflow-hidden">
          <div className="flex items-center gap-3 min-w-[200px]">
            {user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={user.name || 'User'} 
                className="w-8 h-8 rounded-full object-cover border border-neutral-200 shrink-0"
                onError={(e) => {
                  e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/default-avatar.png';
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm select-none shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            )}
            <div className="overflow-hidden flex-1 text-left md:opacity-0 md:group-hover/sidebar:opacity-100 transition-opacity duration-300">
              <h4 className="text-sm font-semibold truncate text-neutral-900 normal-case">
                {user?.name || 'User'}
              </h4>
              {user?.role === 'doctor' ? (
                verificationStatus === 'verified' ? (
                  <span className="inline-block bg-primary-light text-primary text-[9px] font-bold px-1.5 py-0.5 mt-1 rounded-sm select-none uppercase tracking-wider">
                    Verified Specialist
                  </span>
                ) : (
                  <span className="inline-block bg-warning/10 text-warning text-[9px] font-bold px-1.5 py-0.5 mt-1 rounded-sm select-none uppercase tracking-wider">
                    Pending Verification
                  </span>
                )
              ) : (
                <span className="inline-block bg-neutral-100 text-neutral-500 text-[9px] font-bold px-1.5 py-0.5 mt-1 rounded-sm select-none uppercase tracking-wider">
                  Patient Portal
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-start gap-3 h-10 px-3 w-full text-sm font-semibold text-neutral-900 border border-neutral-300 rounded-md hover:border-danger hover:text-danger hover:bg-danger/5 transition-all duration-300 select-none cursor-pointer overflow-hidden min-w-[200px]"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="md:opacity-0 md:group-hover/sidebar:opacity-100 transition-opacity duration-300">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-neutral-50">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 text-neutral-900 hover:text-danger md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-bold text-base text-neutral-900 normal-case tracking-wide hidden md:block">
              {user?.role === 'doctor' ? 'Practitioner Portal' : 'Patient Portal'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Logged In As</p>
              <p className="text-xs font-semibold text-neutral-900">{user?.email}</p>
            </div>
            <NotificationBell />
            {user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={user.name || 'User'} 
                className="w-8 h-8 rounded-full object-cover border border-neutral-200 shrink-0"
                onError={(e) => {
                  e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/default-avatar.png';
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            )}
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 page-fade-in">
          <div className="max-w-[1200px] mx-auto w-full px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
      {showVerificationSuccessModal && (
        <div 
          className="fixed inset-0 z-[99999] bg-neutral-950/80 backdrop-blur-md select-none animate-fade-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999
          }}
        >
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes theralignFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes theralignScaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            .animate-fade-in { animation: theralignFadeIn 0.3s ease-out forwards; }
            .animate-scale-in { animation: theralignScaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          `}} />
          <div 
            className="bg-white border border-neutral-200/80 p-8 text-center rounded-2xl shadow-2xl animate-scale-in border-t-4 border-t-primary"
            style={{
              maxWidth: '440px',
              width: 'calc(100% - 32px)',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px'
            }}
          >
            {/* Verified Badge Check Icon */}
            <div className="w-16 h-16 rounded-full bg-[#E8F8F5] border border-success/30 text-success flex items-center justify-center shrink-0 shadow-sm animate-circle-pop">
              <span className="text-3xl font-black leading-none">✓</span>
            </div>
            
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tighter leading-tight">
                YOUR APPLICATION IS ACCEPTED!
              </h2>
              <p className="text-[11px] font-black text-success uppercase tracking-widest mt-1">
                Verified Specialist Status Active
              </p>
            </div>

            <p className="text-xs text-neutral-500 font-bold uppercase tracking-wide leading-relaxed">
              Your professional qualifications and clinic details have been successfully verified. Your clinic profile is now live on the public directory map and search radar!
            </p>

            <button
              type="button"
              onClick={() => {
                setShowVerificationSuccessModal(false);
                window.location.reload(); // Re-sync layouts
              }}
              className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs uppercase tracking-widest transition-all select-none rounded-xl cursor-pointer shadow-md border-0 active-press"
            >
              GO LIVE & ENTER DASHBOARD →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;

import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
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
            setVerificationStatus(profileRes.data.profile.verificationStatus);
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
    }
  }, [user, location.pathname]);

  const patientNavigation = [
    { name: 'Dashboard', href: '/patient/dashboard' },
    { name: 'My Appointments', href: '/patient/appointments' },
    { name: 'Find Doctors', href: '/doctors' },
    { name: 'Payment History', href: '/patient/payments' },
    { name: 'My Reviews', href: '/patient/reviews' },
  ];

  const doctorNavigation = [
    { name: 'Overview', href: '/doctor/dashboard' },
    { name: 'Appointments', href: '/doctor/appointments', showBadge: true },
    { name: 'Availability', href: '/doctor/availability' },
    { name: 'Earnings', href: '/doctor/earnings' },
    { name: 'My Profile', href: '/doctor/profile' },
    { name: 'My Reviews', href: '/doctor/reviews' },
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
        fixed inset-y-0 left-0 z-50 flex flex-col w-[240px] bg-white text-neutral-900 border-r-2 border-neutral-200 transition-transform duration-fast transform
        md:translate-x-0 md:static md:h-screen shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Brand header */}
        <div className="flex items-center justify-between py-5 px-6 border-b border-neutral-200">
          <Link to="/" className="flex items-center">
            <span className="font-black text-2xl tracking-tighter uppercase font-swiss text-primary">
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
        <nav className="flex-1 py-4 overflow-y-auto space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center justify-between h-12 px-4 mx-2 rounded-md text-sm font-semibold transition-all duration-fast border-l-4
                  ${isActive 
                    ? 'border-neutral-900 bg-neutral-900 text-white font-bold' 
                    : 'text-neutral-500 bg-white border-transparent hover:bg-neutral-100 hover:text-neutral-900'
                  }
                `}
              >
                <span>{item.name}</span>
                {item.showBadge && pendingCount > 0 && (
                  <span className={`ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-sm ${
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
        <div className="border-t border-neutral-200 p-4 bg-neutral-50 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm select-none shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden flex-1 text-left">
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
            className="flex items-center justify-center gap-2 h-10 w-full text-sm font-semibold text-neutral-900 border border-neutral-300 rounded-md hover:border-danger hover:text-danger hover:bg-danger/5 transition-all duration-fast select-none cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
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
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 page-fade-in">
          <div className="max-w-[1440px] mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

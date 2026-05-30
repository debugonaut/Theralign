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
          // Count appointments requiring action: newly booked (pending) or requiring completion (confirmed)
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
    { name: 'DASHBOARD', href: '/patient/dashboard' },
    { name: 'MY APPOINTMENTS', href: '/patient/appointments' },
    { name: 'FIND DOCTORS', href: '/doctors' },
    { name: 'PAYMENT HISTORY', href: '/patient/payments' },
    { name: 'MY REVIEWS', href: '/patient/reviews' },
  ];

  const doctorNavigation = [
    { name: 'OVERVIEW', href: '/doctor/dashboard' },
    { name: 'APPOINTMENTS', href: '/doctor/appointments', showBadge: true },
    { name: 'AVAILABILITY', href: '/doctor/availability' },
    { name: 'EARNINGS', href: '/doctor/earnings' },
    { name: 'MY PROFILE', href: '/doctor/profile' },
    { name: 'MY REVIEWS', href: '/doctor/reviews' },
  ];

  const navigation = user?.role === 'doctor' ? doctorNavigation : patientNavigation;

  return (
    <div className="min-h-screen bg-swiss-white flex select-none">
      {/* Mobile Sidebar Backing Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-swiss-black/40 backdrop-blur-none md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-240 bg-swiss-white text-swiss-black border-r-2 border-swiss-black transition-transform duration-fast transform
        md:translate-x-0 md:static md:h-screen shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Brand header - py-6 is 24px vertical padding */}
        <div className="flex items-center justify-between py-6 px-6 border-b-2 border-swiss-black">
          <Link to="/" className="flex items-center">
            <span className="font-black text-2xl tracking-tighter uppercase font-swiss">
              PHYSIOCONNECT
            </span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-swiss-black hover:text-swiss-red md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 py-4 overflow-y-auto space-y-0.5">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center h-12 px-6 text-ui-sm font-bold uppercase tracking-wider transition-all duration-fast
                  ${isActive 
                    ? 'border-l-4 border-swiss-black bg-swiss-black text-swiss-white font-black' 
                    : 'text-swiss-black bg-swiss-white hover:bg-swiss-gray-100 border-l-4 border-transparent'
                  }
                `}
              >
                <span>{item.name}</span>
                {item.showBadge && pendingCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 border border-swiss-black font-bold text-[10px] text-swiss-black bg-swiss-white rounded-none">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer User & Logout */}
        <div className="border-t-2 border-swiss-black p-4 bg-swiss-white flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-swiss-black text-swiss-white flex items-center justify-center font-bold text-sm select-none shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden flex-1 text-left">
              <h4 className="text-ui-sm font-bold truncate uppercase tracking-wide text-swiss-black">
                {user?.name || 'USER'}
              </h4>
              {user?.role === 'doctor' ? (
                verificationStatus === 'verified' ? (
                  <span className="inline-block border border-swiss-teal text-swiss-teal text-[8px] font-black tracking-widest px-1 py-0.5 mt-1 uppercase select-none rounded-none">
                    VERIFIED SPECIALIST
                  </span>
                ) : (
                  <span className="inline-block border border-swiss-amber text-swiss-amber text-[8px] font-black tracking-widest px-1 py-0.5 mt-1 uppercase select-none rounded-none">
                    PENDING VERIFICATION
                  </span>
                )
              ) : (
                <span className="text-[10px] text-swiss-gray-400 font-bold uppercase tracking-wider block">
                  PATIENT PORTAL
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 h-10 w-full text-ui-xs font-bold uppercase tracking-widest text-swiss-red border-2 border-swiss-red hover:bg-swiss-red hover:text-swiss-white transition-all duration-fast select-none cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-swiss-white">
        {/* Top Header */}
        <header className="h-16 bg-swiss-white border-b-2 border-swiss-black flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 text-swiss-black hover:text-swiss-red md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-black text-ui-lg text-swiss-black uppercase tracking-widest hidden md:block">
              {user?.role === 'doctor' ? 'PRACTITIONER PORTAL' : 'PATIENT PORTAL'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-swiss-gray-400 font-bold uppercase tracking-wider">LOGGED IN AS</p>
              <p className="text-ui-xs font-bold text-swiss-black uppercase tracking-wide">{user?.email}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-swiss-black text-swiss-white flex items-center justify-center font-bold text-sm">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto bg-swiss-white">
          <div className="max-w-[1440px] mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

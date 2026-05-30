import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, Menu, X, ShieldAlert, Users, 
  Calendar, DollarSign, Award, LogOut, ChevronRight, Star, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { getPendingDoctorsAPI } from '../../api/admin.api';
import NotificationBell from './NotificationBell';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Read user from Zustand — RoleRoute guarantees this is a non-null admin
  const user = useAuthStore((state) => state.user);
  const clearCredentials = useAuthStore((state) => state.clearCredentials);

  const fetchPending = async () => {
    try {
      const res = await getPendingDoctorsAPI();
      const d = res.data?.data || res.data;
      const count = d?.total ?? (d?.profiles?.length ?? 0);
      setPendingCount(count);
    } catch { /* fail silently */ }
  };

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    clearCredentials();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Swiss ordered admin navigation links
  const adminNavigation = [
    { name: 'OVERVIEW', href: '/admin/dashboard', icon: ShieldAlert },
    { name: 'DOCTORS', href: '/admin/doctors', icon: Award, showBadge: true },
    { name: 'APPOINTMENTS', href: '/admin/bookings', icon: Calendar },
    { name: 'REVENUE', href: '/admin/revenue', icon: DollarSign },
    { name: 'USERS', href: '/admin/users', icon: Users },
    { name: 'ANALYTICS', href: '/admin/analytics', icon: Activity },
    { name: 'AI TOOLS', href: '/admin/ai-tools', icon: Sparkles },
    { name: 'REVIEWS', href: '/admin/reviews', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-swiss-white flex select-none text-swiss-black">
      {/* Mobile Sidebar Backing Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-swiss-black/40 backdrop-blur-none md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-240 bg-swiss-gray-100 text-swiss-black border-r-2 border-swiss-black transition-transform duration-fast transform
        md:translate-x-0 md:static md:h-screen shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Brand header */}
        <div className="flex items-center justify-between py-6 px-6 border-b-2 border-swiss-black bg-swiss-gray-100">
          <Link to="/" className="flex items-center">
            <span className="font-black text-2xl tracking-tighter uppercase font-swiss text-swiss-black">
              THERALIGN
            </span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-swiss-black hover:text-swiss-red md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links with dense 8px spacing */}
        <nav className="flex-1 py-4 overflow-y-auto space-y-1">
          {adminNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center justify-between h-11 px-6 text-ui-sm font-bold uppercase tracking-wider transition-all duration-fast
                  ${isActive 
                    ? 'border-l-4 border-swiss-black bg-swiss-black text-swiss-white font-black' 
                    : 'text-swiss-black bg-swiss-gray-100 hover:bg-swiss-gray-200 border-l-4 border-transparent'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  {item.showBadge && pendingCount > 0 && (
                    <span className={`border font-bold text-[10px] px-1.5 py-0.5 rounded-none leading-none ${
                      isActive 
                        ? 'border-swiss-white bg-swiss-white text-swiss-black' 
                        : 'border-swiss-black bg-swiss-white text-swiss-black'
                    }`}>
                      {pendingCount}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-current" />}
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info & Logout */}
        <div className="border-t-2 border-swiss-black p-4 bg-swiss-gray-100 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-swiss-black text-swiss-white flex items-center justify-center font-bold text-sm select-none shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="overflow-hidden flex-1 text-left">
              <h4 className="text-ui-sm font-bold truncate uppercase tracking-wide text-swiss-black">
                {user?.name || 'ADMIN'}
              </h4>
              <span className="text-[9px] text-swiss-gray-400 font-bold uppercase tracking-wider block">
                ADMIN CONTROL CENTER
              </span>
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
              ADMINISTRATIVE CONTROL CENTER
            </h2>
          </div>

          <div className="flex items-center gap-6">
            {/* Global Notification Bell */}
            <NotificationBell />

            <div className="flex items-center gap-3 border-l-2 border-swiss-gray-200 pl-6 h-8">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-swiss-gray-400 font-bold uppercase tracking-wider">SECURE PROFILE</p>
                <p className="text-ui-xs font-bold text-swiss-black uppercase tracking-wide">{user?.email}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-swiss-black text-swiss-white flex items-center justify-center font-bold text-sm">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
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

export default AdminLayout;

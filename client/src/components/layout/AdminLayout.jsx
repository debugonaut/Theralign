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

  const monitorGroup = [
    { name: 'Overview', href: '/admin/dashboard', icon: ShieldAlert },
    { name: 'Analytics', href: '/admin/analytics', icon: Activity },
    { name: 'AI Tools', href: '/admin/ai-tools', icon: Sparkles },
  ];

  const manageGroup = [
    { name: 'Doctors', href: '/admin/doctors', icon: Award, showBadge: true },
    { name: 'Appointments', href: '/admin/bookings', icon: Calendar },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
  ];

  const financeGroup = [
    { name: 'Revenue', href: '/admin/revenue', icon: DollarSign },
  ];

  const renderNavGroup = (title, items) => {
    return (
      <div className="border-b border-white/15 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
        <span className="block px-6 mb-2 text-[9px] uppercase tracking-wider text-white/40 font-bold">
          {title}
        </span>
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center justify-between h-11 px-4 mx-2 rounded-md text-sm font-semibold transition-all duration-fast border-l-[3px]
                  ${isActive 
                    ? 'border-white bg-white/15 text-white font-bold' 
                    : 'text-white/65 bg-transparent border-transparent hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  {item.showBadge && pendingCount > 0 && (
                    <span className="bg-accent text-white font-bold text-[10px] px-1.5 py-0.5 rounded-sm leading-none border-0 shadow-sm">
                      {pendingCount}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex select-none text-neutral-900">
      {/* Mobile Sidebar Backing Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-none md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-primary text-white transition-transform duration-fast transform
        md:translate-x-0 md:static md:h-screen shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Brand header */}
        <div className="flex items-center justify-between py-5 px-6 border-b border-white/15 bg-primary-dark">
          <Link to="/" className="flex items-center">
            <span className="font-black text-2xl tracking-tighter uppercase font-swiss text-white">
              THERALIGN
            </span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-white hover:text-accent md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 py-4 overflow-y-auto bg-primary">
          {renderNavGroup('MONITOR', monitorGroup)}
          {renderNavGroup('MANAGE', manageGroup)}
          {renderNavGroup('FINANCE', financeGroup)}
        </nav>

        {/* Sidebar Footer User Info & Logout */}
        <div className="border-t border-white/15 p-4 bg-primary-dark flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-sm select-none shrink-0 border border-white/15">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="overflow-hidden flex-1 text-left">
              <h4 className="text-sm font-semibold truncate text-white normal-case">
                {user?.name || 'Admin'}
              </h4>
              <span className="text-[9px] text-white/60 font-bold uppercase tracking-wider block mt-0.5">
                Admin Control Center
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 h-10 w-full text-sm font-semibold text-white/75 border border-white/30 rounded-md hover:border-white hover:text-white hover:bg-white/10 transition-all duration-fast select-none cursor-pointer"
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
              Administrative Control Center
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <NotificationBell />

            <div className="flex items-center gap-3 border-l border-neutral-200 pl-6 h-8">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Secure Profile</p>
                <p className="text-xs font-semibold text-neutral-900">{user?.email}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
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

export default AdminLayout;

import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, Menu, X, ShieldAlert, Users, 
  Calendar, DollarSign, Award, LogOut, ChevronRight, Star, Sparkles,
  Coins
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { getPendingDoctorsAPI } from '../../api/admin.api';
import NotificationBell from './NotificationBell';
import { getPendingRefundsAPI } from '../../api/refund.api';
import ChatbotWidget from '../common/ChatbotWidget';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [refundBadgeCount, setRefundBadgeCount] = useState(0);

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

  const fetchRefundStats = async () => {
    try {
      const res = await getPendingRefundsAPI();
      const list = res.data?.data;
      setRefundBadgeCount(Array.isArray(list) ? list.length : 0);
    } catch { /* fail silently */ }
  };

  useEffect(() => {
    fetchPending();
    fetchRefundStats();
    const interval = setInterval(() => {
      fetchPending();
      fetchRefundStats();
    }, 30000);
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
    { name: 'Refunds', href: '/admin/refunds', icon: Coins, showRefundBadge: true },
  ];

  const renderNavGroup = (title, items) => {
    return (
      <div className="border-b border-white/15 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0 overflow-x-hidden">
        <span className="block px-6 mb-2 text-[9px] uppercase tracking-wider text-white/40 font-bold md:opacity-0 md:group-hover/sidebar:opacity-100 transition-opacity duration-300 truncate">
          {title}
        </span>
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isEmoji = typeof Icon === 'string';
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center justify-between h-11 px-4 mx-2 rounded-md text-sm font-semibold transition-all duration-300 border-l-[3px] overflow-hidden relative
                  ${isActive 
                    ? 'border-white bg-white/15 text-white font-bold' 
                    : 'text-white/65 bg-transparent border-transparent hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-3 min-w-[200px]">
                  {isEmoji ? (
                    <span className="w-4 h-4 shrink-0 text-sm flex items-center justify-center select-none">{Icon}</span>
                  ) : (
                    <Icon className="w-4 h-4 shrink-0" />
                  )}
                  <span className="md:opacity-0 md:group-hover/sidebar:opacity-100 transition-opacity duration-300 truncate">{item.name}</span>
                </div>
                
                <div className="flex items-center gap-1.5 md:opacity-0 md:group-hover/sidebar:opacity-100 transition-opacity duration-300 shrink-0">
                  {item.showBadge && pendingCount > 0 && (
                    <span className="bg-accent text-white font-bold text-[10px] px-1.5 py-0.5 rounded-sm leading-none border-0 shadow-sm">
                      {pendingCount}
                    </span>
                  )}
                  {item.showRefundBadge && refundBadgeCount > 0 && (
                    <span className="nav-badge">
                      {refundBadgeCount}
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
        fixed inset-y-0 left-0 z-50 flex flex-col bg-primary text-white transition-[width] duration-300 ease-in-out transform group/sidebar
        md:translate-x-0 md:static md:h-screen shrink-0 overflow-x-hidden
        ${sidebarOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full w-[240px] md:w-[72px] md:hover:w-[240px]'}
      `}>
        {/* Sidebar Brand header */}
        <div className="flex items-center justify-between py-5 px-5 border-b border-white/15 bg-primary-dark overflow-hidden h-[73px]">
          <Link to="/admin/dashboard" className="flex items-center gap-3 shrink-0">
            <img src="/theralign-logo.svg" alt="Theralign" className="w-8 h-8 object-contain shrink-0 brightness-0 invert" />
            <span className="font-black text-2xl tracking-tighter uppercase font-swiss text-white md:opacity-0 md:group-hover/sidebar:opacity-100 transition-opacity duration-300 truncate">
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
        <nav className="flex-1 py-4 overflow-y-auto bg-primary overflow-x-hidden">
          {renderNavGroup('MONITOR', monitorGroup)}
          {renderNavGroup('MANAGE', manageGroup)}
          {renderNavGroup('FINANCE', financeGroup)}
        </nav>

        {/* Sidebar Footer User Info & Logout */}
        <div className="border-t border-white/15 p-4 bg-primary-dark flex flex-col gap-3 overflow-hidden">
          <div className="flex items-center gap-3 min-w-[200px]">
            {user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={user.name || 'Admin'} 
                className="w-8 h-8 rounded-full object-cover border border-white/15 shrink-0"
                onError={(e) => {
                  e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/default-avatar.png';
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-sm select-none shrink-0 border border-white/15">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
            )}
            <div className="overflow-hidden flex-1 text-left md:opacity-0 md:group-hover/sidebar:opacity-100 transition-opacity duration-300">
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
            className="flex items-center justify-start gap-3 h-10 px-3 w-full text-sm font-semibold text-white/75 border border-white/30 rounded-md hover:border-white hover:text-white hover:bg-white/10 transition-all duration-300 select-none cursor-pointer overflow-hidden min-w-[200px]"
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
              {user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.name || 'Admin'} 
                  className="w-8 h-8 rounded-full object-cover border border-neutral-200 shrink-0"
                  onError={(e) => {
                    e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/default-avatar.png';
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  {user?.name ? user.name[0].toUpperCase() : 'A'}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 page-fade-in">
          <div className="max-w-[1200px] mx-auto w-full px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
      <ChatbotWidget />
    </div>
  );
};

export default AdminLayout;

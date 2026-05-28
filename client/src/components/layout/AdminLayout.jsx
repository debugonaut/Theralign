import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, Menu, X, ShieldAlert, Users, 
  Calendar, DollarSign, Award, LogOut, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Read user from Zustand — RoleRoute guarantees this is a non-null admin
  const user = useAuthStore((state) => state.user);
  const clearCredentials = useAuthStore((state) => state.clearCredentials);

  const handleLogout = () => {
    clearCredentials();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const adminNavigation = [
    { name: 'System Overview', href: '/admin/dashboard', icon: ShieldAlert },
    { name: 'Doctor Verification', href: '/admin/doctors', icon: Award },
    { name: 'All Bookings', href: '/admin/bookings', icon: Calendar },
    { name: 'User Directory', href: '/admin/users', icon: Users },
    { name: 'Revenue Reports', href: '/admin/revenue', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-100">
      {/* Mobile Sidebar Backing */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-950 text-white transition-transform duration-300 transform border-r border-slate-800
        md:translate-x-0 md:static md:h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800 bg-slate-950">
          <Link to="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              Theralign <span className="text-[10px] uppercase font-semibold bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/30">Admin</span>
            </span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Card */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-primary text-base border border-slate-700">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold truncate text-slate-200">{user?.name || 'Admin'}</h4>
            <span className="text-xs text-primary font-medium">Control Center</span>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {adminNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={() =>
                  `flex items-center justify-between px-3 py-2.5 rounded-button text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-slate-800 text-white font-semibold border-l-4 border-primary pl-2' 
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-primary" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-danger hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-900">
        {/* Top Header */}
        <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-md text-slate-400 hover:text-white md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-semibold text-lg text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              Administrative Command Center
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-500">Security Profile</p>
              <p className="text-sm font-semibold text-slate-300">{user?.email}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 text-primary flex items-center justify-center font-bold text-sm border border-slate-700">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto bg-slate-900 text-slate-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

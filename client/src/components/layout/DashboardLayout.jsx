import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, Menu, X, LayoutDashboard, Calendar, 
  CreditCard, UserCircle, Clock, DollarSign, LogOut, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Read user from Zustand — ProtectedRoute guarantees this is non-null
  const user = useAuthStore((state) => state.user);
  const clearCredentials = useAuthStore((state) => state.clearCredentials);

  const handleLogout = () => {
    clearCredentials();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Navigation config based on role
  const patientNavigation = [
    { name: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', href: '/patient/appointments', icon: Calendar },
    { name: 'Payments', href: '/patient/payments', icon: CreditCard },
    { name: 'My Profile', href: '/patient/profile', icon: UserCircle },
  ];

  const doctorNavigation = [
    { name: 'Overview', href: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', href: '/doctor/appointments', icon: Calendar },
    { name: 'My Availability', href: '/doctor/availability', icon: Clock },
    { name: 'Earnings', href: '/doctor/earnings', icon: DollarSign },
    { name: 'Edit Profile', href: '/doctor/profile', icon: UserCircle },
  ];

  const navigation = user.role === 'doctor' ? doctorNavigation : patientNavigation;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Backing */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop and Mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-secondary text-white transition-transform duration-300 transform border-r border-slate-800
        md:translate-x-0 md:static md:h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Brand header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">Theralign</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-primary text-base border border-slate-600">
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold truncate">{user.name}</h4>
            <span className="text-xs text-slate-400 capitalize">{user.role} Portal</span>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
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
                      ? 'bg-primary text-white font-semibold' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-danger hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-md text-slate-500 hover:text-slate-900 md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-semibold text-lg text-secondary hidden md:block">
              {user.role === 'doctor' ? 'Practitioner Dashboard' : 'Patient Portal'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400">Logged in as</p>
              <p className="text-sm font-semibold text-secondary">{user.email}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

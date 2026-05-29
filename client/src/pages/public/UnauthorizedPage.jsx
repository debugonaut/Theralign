import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut, LayoutDashboard } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Button from '../../components/common/Button';

const DASHBOARD_ROUTES = {
  patient: '/patient/dashboard',
  doctor: '/doctor/dashboard',
  admin: '/admin/dashboard',
};

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user, clearCredentials } = useAuthStore();

  React.useEffect(() => {
    document.title = 'Access Restricted — PhysioConnect';
  }, []);

  const handleGoToDashboard = () => {
    if (user && user.role) {
      navigate(DASHBOARD_ROUTES[user.role] || '/');
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    clearCredentials();
    navigate('/');
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50 text-center px-6">
      <div className="p-4 bg-rose-50 border border-rose-100 rounded-full text-rose-600 mb-6 animate-bounce">
        <ShieldAlert size={48} />
      </div>
      <h1 className="text-4xl font-extrabold text-secondary tracking-tight">Access Restricted</h1>
      <p className="text-slate-500 mt-3 max-w-sm font-medium leading-relaxed">
        You don&apos;t have authorization credentials to view this page. If you believe this is in error, please consult platform administration.
      </p>
      
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
        <Button
          onClick={handleGoToDashboard}
          variant="primary"
          size="lg"
          className="inline-flex items-center gap-2"
        >
          <LayoutDashboard size={18} />
          Go to Dashboard
        </Button>
        <Button
          onClick={handleLogout}
          variant="secondary"
          size="lg"
          className="inline-flex items-center gap-2 bg-white"
        >
          <LogOut size={18} />
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

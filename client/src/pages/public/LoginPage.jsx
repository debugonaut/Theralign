import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, HeartPulse } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginAPI } from '../../api/auth.api';
import useAuthStore from '../../store/authStore';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const DASHBOARD_ROUTES = {
  patient: '/patient/dashboard',
  doctor: '/doctor/dashboard',
  admin: '/admin/dashboard',
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCredentials } = useAuthStore();

  useEffect(() => {
    document.title = 'Login — Theralign';
  }, []);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginAPI(formData);
      setCredentials(result.data.user, result.data.token);
      toast.success(`Welcome back, ${result.data.user.name.split(' ')[0]}!`);
      const from = location.state?.from || DASHBOARD_ROUTES[result.data.user.role] || '/';
      navigate(from, { replace: true });
    } catch (err) {
      // Do NOT clear email on error — users shouldn't have to retype it
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-neutral-50 flex items-center justify-center p-6 py-12 page-fade-in px-6 sm:px-6">
      {/* Card */}
      <div className="w-full max-w-[480px] mx-auto">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-lg shadow-level-1 mb-4 sm:mb-4">
            <HeartPulse className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-[32px] leading-[1.1] font-black text-neutral-900 tracking-tight font-swiss text-center">Theralign</h1>
          <p className="text-neutral-500 mt-2 text-ui-sm font-semibold uppercase tracking-wider hidden sm:block">Sign in to your Theralign account</p>
        </div>

        <Card variant="default" className="p-6 sm:p-8 rounded-[12px] md:rounded-lg shadow-level-1">
          {/* Inline Error Banner */}
          {error && (
            <div className="mb-5 bg-accent/5 border border-accent text-accent px-4 py-3 rounded-md text-ui-sm flex items-start gap-2">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span className="font-bold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <Input
              id="login-email"
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. you@example.com"
              required
              autoComplete="email"
              disabled={isLoading}
            />

            {/* Password */}
            <div className="flex flex-col gap-1.5 text-left relative">
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-[38px] text-neutral-400 hover:text-neutral-900 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Submit */}
            <Button
              id="login-submit-btn"
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              loadingText="Signing in..."
              disabled={!formData.email || !formData.password}
              className="h-[56px] sm:h-10 mt-2"
            >
              Sign In
            </Button>
          </form>

          {/* Footer Link */}
          <p className="mt-6 text-center text-ui-sm text-neutral-500 font-semibold">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-accent font-bold hover:underline transition"
            >
              Register here
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;

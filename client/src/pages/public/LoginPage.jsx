import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, HeartPulse } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginAPI } from '../../api/auth.api';
import useAuthStore from '../../store/authStore';

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
    document.title = 'Login — PhysioConnect';
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
    <div className="min-h-[85vh] bg-swiss-white flex items-center justify-center p-6 py-12">
      {/* Card */}
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-swiss-black border-2 border-swiss-black rounded-none mb-4">
            <HeartPulse className="w-7 h-7 text-swiss-white" />
          </div>
          <h1 className="text-[32px] leading-[1.1] font-black text-swiss-black uppercase tracking-tight font-swiss">Welcome back</h1>
          <p className="text-swiss-gray-600 mt-2 text-ui-sm font-bold uppercase tracking-[0.06em]">Sign in to your Theralign account</p>
        </div>

        <div className="bg-swiss-white border-2 border-swiss-black p-8 rounded-none shadow-none">
          {/* Inline Error Banner */}
          {error && (
            <div className="mb-5 bg-swiss-red/5 border-2 border-swiss-red text-swiss-red px-4 py-3 rounded-none text-ui-sm flex items-start gap-2">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span className="font-bold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5 text-left">
              <label
                htmlFor="login-email"
                className="text-ui-xs font-black text-swiss-black uppercase tracking-[0.08em]"
              >
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                autoComplete="email"
                disabled={isLoading}
                className="w-full px-4 py-3 border-2 border-swiss-black rounded-none bg-swiss-white text-swiss-black text-ui-md placeholder-swiss-gray-400 focus:outline-none focus:border-4 focus:border-swiss-black focus:px-[14px] focus:py-[10px] disabled:opacity-60 transition-all duration-fast"
                style={{ minHeight: '48px' }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 text-left">
              <label
                htmlFor="login-password"
                className="text-ui-xs font-black text-swiss-black uppercase tracking-[0.08em]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-12 border-2 border-swiss-black rounded-none bg-swiss-white text-swiss-black text-ui-md placeholder-swiss-gray-400 focus:outline-none focus:border-4 focus:border-swiss-black focus:px-[14px] focus:py-[10px] disabled:opacity-60 transition-all duration-fast"
                  style={{ minHeight: '48px' }}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-swiss-gray-400 hover:text-swiss-black focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-swiss-black hover:bg-swiss-red active:scale-[0.98] text-swiss-white font-bold uppercase tracking-widest rounded-none border-2 border-swiss-black disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-fast text-ui-sm mt-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-swiss-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <p className="mt-6 text-center text-ui-sm text-swiss-gray-600 font-medium">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-swiss-red font-bold hover:underline transition"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

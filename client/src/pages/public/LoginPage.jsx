import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const { setCredentials } = useAuthStore();

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
      navigate(DASHBOARD_ROUTES[result.data.user.role] || '/');
    } catch (err) {
      // Do NOT clear email on error — users shouldn't have to retype it
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Card */}
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <HeartPulse className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome back</h1>
          <p className="text-slate-500 mt-1 text-sm">Sign in to your Theralign account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
          {/* Inline Error Banner */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
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
                  className="w-full px-4 py-2.5 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 transition"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
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
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 text-sm mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition"
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

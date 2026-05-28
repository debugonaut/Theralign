import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, HeartPulse, Stethoscope, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerAPI } from '../../api/auth.api';
import useAuthStore from '../../store/authStore';

const DASHBOARD_ROUTES = {
  patient: '/patient/dashboard',
  doctor: '/doctor/dashboard',
};

/** Returns a strength label and color class based on password content */
const getPasswordStrength = (password) => {
  if (!password) return { label: '', color: '', width: '0%' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' };
  if (score <= 3) return { label: 'Medium', color: 'bg-amber-500', width: '66%' };
  return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setCredentials } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2)
      errors.name = 'Name must be at least 2 characters';
    if (!formData.email) errors.email = 'Email is required';
    if (formData.password.length < 8)
      errors.password = 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      errors.password = 'Must include uppercase, lowercase, and a number';
    if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { name, email, password, role } = formData;
      const result = await registerAPI({ name, email, password, role });
      setCredentials(result.data.user, result.data.token);
      toast.success('Account created! Welcome to Theralign 🎉');
      navigate(DASHBOARD_ROUTES[result.data.user.role] || '/');
    } catch (err) {
      // Show API error inline; do NOT clear the form
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <HeartPulse className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Create your account</h1>
          <p className="text-slate-500 mt-1 text-sm">Join Theralign — it&apos;s free</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
          {/* API Error Banner */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Role Toggle */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">I am a…</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'patient', label: 'Patient', icon: User },
                  { value: 'doctor', label: 'Doctor', icon: Stethoscope },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    id={`role-${value}`}
                    onClick={() => setFormData((p) => ({ ...p, role: value }))}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all duration-150 ${
                      formData.role === value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Smith"
                required
                disabled={isLoading}
                className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 text-sm placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 transition ${
                  fieldErrors.name ? 'border-red-400' : 'border-slate-200'
                }`}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                id="reg-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                autoComplete="email"
                disabled={isLoading}
                className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 text-sm placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 transition ${
                  fieldErrors.email ? 'border-red-400' : 'border-slate-200'
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 chars, upper, lower, number"
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  className={`w-full px-4 py-2.5 pr-12 rounded-xl border text-slate-800 text-sm placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 transition ${
                    fieldErrors.password ? 'border-red-400' : 'border-slate-200'
                  }`}
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
              {/* Strength indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className={`text-xs mt-1 font-medium ${
                    strength.label === 'Weak' ? 'text-red-500' :
                    strength.label === 'Medium' ? 'text-amber-500' : 'text-emerald-600'
                  }`}>
                    {strength.label} password
                  </p>
                </div>
              )}
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  className={`w-full px-4 py-2.5 pr-12 rounded-xl border text-slate-800 text-sm placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 transition ${
                    fieldErrors.confirmPassword ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                <button
                  type="button"
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 text-sm mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

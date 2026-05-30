import { useState, useEffect } from 'react';
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

  useEffect(() => {
    document.title = 'Create Account — Theralign';
  }, []);

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
    <div className="min-h-[85vh] bg-swiss-white flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-swiss-black border-2 border-swiss-black rounded-none mb-4">
            <HeartPulse className="w-7 h-7 text-swiss-white" />
          </div>
          <h1 className="text-[32px] leading-[1.1] font-black text-swiss-black uppercase tracking-tight font-swiss">Create your account</h1>
          <p className="text-swiss-gray-600 mt-2 text-ui-sm font-bold uppercase tracking-[0.06em]">Join Theralign — it&apos;s free</p>
        </div>

        <div className="bg-swiss-white border-2 border-swiss-black p-8 rounded-none shadow-none">
          {/* API Error Banner */}
          {error && (
            <div className="mb-5 bg-swiss-red/5 border-2 border-swiss-red text-swiss-red px-4 py-3 rounded-none text-ui-sm flex items-start gap-2">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span className="font-bold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Role Toggle */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-ui-xs font-black text-swiss-black uppercase tracking-[0.08em] mb-0.5">I am a…</label>
              <div className="flex w-full border-2 border-swiss-black rounded-none">
                {[
                  { value: 'patient', label: 'Patient' },
                  { value: 'doctor', label: 'Physiotherapist' },
                ].map(({ value, label }, i) => (
                  <button
                    key={value}
                    type="button"
                    id={`role-${value}`}
                    onClick={() => setFormData((p) => ({ ...p, role: value }))}
                    className={`
                      flex-1 py-3 text-sm font-bold tracking-wide uppercase
                      transition-colors duration-100 cursor-pointer
                      ${i > 0 ? 'border-l-2 border-swiss-black' : ''}
                      ${formData.role === value
                        ? 'bg-swiss-black text-swiss-white'
                        : 'bg-swiss-white text-swiss-black hover:bg-swiss-gray-100'
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="reg-name" className="text-ui-xs font-black text-swiss-black uppercase tracking-[0.08em]">
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
                className={`w-full px-4 py-3 border-2 rounded-none bg-swiss-white text-swiss-black text-ui-md placeholder-swiss-gray-400 focus:outline-none focus:border-4 focus:px-[14px] focus:py-[10px] disabled:opacity-60 transition-all duration-fast ${
                  fieldErrors.name ? 'border-swiss-red focus:border-swiss-red' : 'border-swiss-black focus:border-swiss-black'
                }`}
                style={{ minHeight: '48px' }}
              />
              {fieldErrors.name && (
                <p className="text-[11px] font-bold text-swiss-red mt-1 uppercase tracking-wide">ERROR: {fieldErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="reg-email" className="text-ui-xs font-black text-swiss-black uppercase tracking-[0.08em]">
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
                className={`w-full px-4 py-3 border-2 rounded-none bg-swiss-white text-swiss-black text-ui-md placeholder-swiss-gray-400 focus:outline-none focus:border-4 focus:px-[14px] focus:py-[10px] disabled:opacity-60 transition-all duration-fast ${
                  fieldErrors.email ? 'border-swiss-red focus:border-swiss-red' : 'border-swiss-black focus:border-swiss-black'
                }`}
                style={{ minHeight: '48px' }}
              />
              {fieldErrors.email && (
                <p className="text-[11px] font-bold text-swiss-red mt-1 uppercase tracking-wide">ERROR: {fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="reg-password" className="text-ui-xs font-black text-swiss-black uppercase tracking-[0.08em]">
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
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-none bg-swiss-white text-swiss-black text-ui-md placeholder-swiss-gray-400 focus:outline-none focus:border-4 focus:px-[14px] focus:py-[10px] disabled:opacity-60 transition-all duration-fast ${
                    fieldErrors.password ? 'border-swiss-red focus:border-swiss-red' : 'border-swiss-black focus:border-swiss-black'
                  }`}
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
              {/* Strength indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="h-1.5 bg-swiss-gray-100 rounded-none overflow-hidden border border-swiss-black">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className={`text-[11px] mt-1 font-bold uppercase tracking-wider ${
                    strength.label === 'Weak' ? 'text-swiss-red' :
                    strength.label === 'Medium' ? 'text-swiss-amber' : 'text-swiss-teal'
                  }`}>
                    {strength.label} password
                  </p>
                </div>
              )}
              {fieldErrors.password && (
                <p className="text-[11px] font-bold text-swiss-red mt-1 uppercase tracking-wide">ERROR: {fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="reg-confirm" className="text-ui-xs font-black text-swiss-black uppercase tracking-[0.08em]">
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
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-none bg-swiss-white text-swiss-black text-ui-md placeholder-swiss-gray-400 focus:outline-none focus:border-4 focus:px-[14px] focus:py-[10px] disabled:opacity-60 transition-all duration-fast ${
                    fieldErrors.confirmPassword ? 'border-swiss-red focus:border-swiss-red' : 'border-swiss-black focus:border-swiss-black'
                  }`}
                  style={{ minHeight: '48px' }}
                />
                <button
                  type="button"
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-swiss-gray-400 hover:text-swiss-black focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-[11px] font-bold text-swiss-red mt-1 uppercase tracking-wide">ERROR: {fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-swiss-black hover:bg-swiss-red active:scale-[0.98] text-swiss-white font-bold uppercase tracking-widest rounded-none border-2 border-swiss-black disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-fast text-ui-sm mt-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-swiss-white" fill="none" viewBox="0 0 24 24">
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

          <p className="mt-6 text-center text-ui-sm text-swiss-gray-600 font-medium">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-swiss-red font-bold hover:underline transition"
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

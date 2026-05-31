import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, HeartPulse, Stethoscope, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerAPI } from '../../api/auth.api';
import useAuthStore from '../../store/authStore';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

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
    <div className="min-h-[85vh] bg-neutral-50 flex items-center justify-center p-6 py-12 page-fade-in px-6 sm:px-6">
      <div className="w-full max-w-[480px] mx-auto">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-lg shadow-level-1 mb-4">
            <HeartPulse className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-[32px] leading-[1.1] font-black text-neutral-900 tracking-tight font-swiss text-center">Theralign</h1>
          <p className="text-neutral-500 mt-2 text-ui-sm font-semibold uppercase tracking-wider hidden sm:block">Join Theralign — it&apos;s free</p>
        </div>

        <Card variant="default" className="p-6 sm:p-8 rounded-[12px] md:rounded-lg shadow-level-1">
          {/* API Error Banner */}
          {error && (
            <div className="mb-5 bg-accent/5 border border-accent text-accent px-4 py-3 rounded-md text-ui-sm flex items-start gap-2">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span className="font-bold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Role Toggle */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[12px] font-semibold text-neutral-700 mb-0.5">I am a…</label>
              <div className="flex w-full border border-neutral-200 rounded-md overflow-hidden bg-neutral-50 p-1">
                {[
                  { value: 'patient', label: 'Patient' },
                  { value: 'doctor', label: 'Physiotherapist' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    id={`role-${value}`}
                    onClick={() => setFormData((p) => ({ ...p, role: value }))}
                    className={`
                      flex-1 py-2 text-xs font-bold tracking-wide uppercase
                      transition-all duration-fast cursor-pointer rounded-md
                      ${formData.role === value
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-transparent text-neutral-500 hover:text-neutral-900'
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <Input
              id="reg-name"
              type="text"
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Jane Smith"
              required
              disabled={isLoading}
              error={fieldErrors.name}
            />

            {/* Email */}
            <Input
              id="reg-email"
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. you@example.com"
              required
              autoComplete="email"
              disabled={isLoading}
              error={fieldErrors.email}
            />

            {/* Password */}
            <div className="flex flex-col gap-1.5 text-left relative">
              <Input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 8 chars, upper, lower, number"
                required
                autoComplete="new-password"
                disabled={isLoading}
                error={fieldErrors.password}
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
              {/* Strength indicator */}
              {formData.password && (
                <div className="mt-1">
                  <div className="h-1.5 bg-neutral-100 rounded-md overflow-hidden border border-neutral-200">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className={`text-[11px] mt-1 font-bold uppercase tracking-wider ${
                    strength.label === 'Weak' ? 'text-accent' :
                    strength.label === 'Medium' ? 'text-warning' : 'text-success'
                  }`}>
                    {strength.label} password
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5 text-left relative">
              <Input
                id="reg-confirm"
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
                autoComplete="new-password"
                disabled={isLoading}
                error={fieldErrors.confirmPassword}
              />
              <button
                type="button"
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-4 top-[38px] text-neutral-400 hover:text-neutral-900 focus:outline-none"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Submit */}
            <Button
              id="register-submit-btn"
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              loadingText="Creating account..."
              disabled={isLoading}
              className="h-[56px] sm:h-10 mt-2"
            >
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-ui-sm text-neutral-500 font-semibold">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-accent font-bold hover:underline transition"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;

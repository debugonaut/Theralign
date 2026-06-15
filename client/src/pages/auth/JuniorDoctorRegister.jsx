import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, HeartPulse, AlertTriangle, CheckCircle, UserPlus, Stethoscope, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { acceptJuniorInviteAPI } from '../../api/junior.api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

/**
 * JuniorDoctorRegister — Public page for accepting a junior doctor invitation.
 *
 * URL format: /register/junior?token=<invite-token>&email=<invite-email>
 *
 * If no token is present, renders an "invalid invitation" state.
 * On success, redirects to /login with a toast.
 */
const JuniorDoctorRegister = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const initialEmail = searchParams.get('email') || '';

  useEffect(() => {
    document.title = 'Join as Junior Physiotherapist — Theralign';
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: initialEmail,
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDone, setIsDone] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone Number is required.');
      return;
    }
    if (!/^\+?[0-9]{10,13}$/.test(formData.phone.trim())) {
      setError('Please provide a valid phone number (10–13 digits).');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      setError('Password must contain at least one number.');
      return;
    }

    setIsLoading(true);
    try {
      await acceptJuniorInviteAPI(token, {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        phone: formData.phone.trim(),
      });
      setIsDone(true);
      toast.success('Welcome to Theralign. You can now log in.');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed. The invitation may have expired.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // No token: show invalid state
  if (!token) {
    return (
      <div className="min-h-[85vh] bg-neutral-50 flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-accent/10 rounded-lg shadow-level-1 mb-4">
            <AlertTriangle className="w-7 h-7 text-accent" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mb-2">Invitation Not Found</h1>
          <p className="text-ui-sm text-neutral-500 font-medium mb-6">
            This invitation link is invalid or has already been used. Contact your senior doctor to request a new one.
          </p>
          <Link to="/login" className="text-primary font-bold hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (isDone) {
    return (
      <div className="min-h-[85vh] bg-neutral-50 flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-success/10 rounded-lg shadow-level-1 mb-4">
            <CheckCircle className="w-7 h-7 text-success" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mb-2">Account Created!</h1>
          <p className="text-ui-sm text-neutral-600 font-medium mb-6">
            Your junior physiotherapist account has been created and linked to your practice.
            You can now sign in and complete your profile.
          </p>
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate('/login', { replace: true })}
          >
            Sign In to Theralign →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-neutral-50 flex items-center justify-center p-6 py-12 page-fade-in">
      <div className="w-full max-w-[480px] mx-auto">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-lg shadow-level-1 mb-4">
            <HeartPulse className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-[32px] leading-[1.1] font-black text-neutral-900 tracking-tight font-swiss">
            Theralign
          </h1>
          <p className="text-neutral-500 mt-2 text-ui-sm font-semibold uppercase tracking-wider">
            Join as a Junior Physiotherapist
          </p>
        </div>

        <Card variant="default" className="p-6 sm:p-8 rounded-[12px] shadow-level-1">
          {/* Context banner */}
          <div className="flex items-center gap-3 p-4 bg-[#E8F4F8] border border-primary/20 rounded-lg mb-6">
            <Stethoscope size={18} className="text-primary shrink-0" />
            <div className="text-left">
              <p className="text-ui-sm font-bold text-primary">You have been invited to join a practice</p>
              <p className="text-ui-xs text-neutral-500 font-medium mt-0.5">
                Complete your registration to get started. You will be added to your senior physiotherapist&apos;s practice automatically.
              </p>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 bg-accent/5 border border-accent text-accent px-4 py-3 rounded-md text-ui-sm flex items-start gap-2 text-left">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5 text-left">
            <Input
              id="junior-name"
              type="text"
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Dr. Aisha Sharma"
              required
              disabled={isLoading}
            />

            {/* Read-only email field */}
            <div className="relative">
              <Input
                id="junior-email"
                type="email"
                name="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                disabled={true}
                showLock={true}
              />
            </div>

            <Input
              id="junior-phone"
              type="text"
              name="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              required
              disabled={isLoading}
            />

            {/* Password */}
            <div className="relative">
              <Input
                id="junior-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                required
                autoComplete="new-password"
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

            <Input
              id="junior-confirm-password"
              type="password"
              name="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
              disabled={isLoading}
            />

            <Button
              id="junior-register-submit"
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              loadingText="Creating account..."
              disabled={!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone}
              className="h-[56px] sm:h-10 mt-2"
            >
              <UserPlus size={16} />
              Create My Account
            </Button>
          </form>

          <p className="mt-6 text-center text-ui-sm text-neutral-500 font-semibold">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default JuniorDoctorRegister;

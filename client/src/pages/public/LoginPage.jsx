import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, HeartPulse, ChevronLeft, Copy, Check, AlertTriangle, UserCheck, Stethoscope, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginAPI, forgotPasswordAPI, resetPasswordAPI } from '../../api/auth.api';
import useAuthStore from '../../store/authStore';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const DASHBOARD_ROUTES = {
  patient: '/patient/dashboard',
  doctor: '/doctor/dashboard',
  admin: '/admin/dashboard',
};

// Demo credentials for quick-login
const DEMO_ACCOUNTS = [
  { label: 'Patient Demo', email: 'patient@demo.com', password: 'Demo@123456', role: 'patient' },
  { label: 'Doctor Demo',  email: 'doctor@demo.com',  password: 'Demo@123456', role: 'doctor'  },
  { label: 'Admin Demo',   email: 'admin@theralign.com', password: 'Admin@123456', role: 'admin' },
];

// ─── Forgot Password Panel (3 steps) ─────────────────────────────────────────
const ForgotPasswordPanel = ({ onBack }) => {
  // step: 'email' | 'token' | 'reset' | 'done'
  const [step, setStep] = useState('email');
  const [email, setEmail]         = useState('');
  const [resetToken, setResetToken] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [copied, setCopied]       = useState(false);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await forgotPasswordAPI(email);
      // Demo: server returns resetToken directly
      if (res?.data?.resetToken) {
        setResetToken(res.data.resetToken);
        setStep('token');
      } else {
        // If email not found or no token returned, still advance gracefully
        setStep('token');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to request reset. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(resetToken).then(() => {
      setCopied(true);
      setTokenInput(resetToken); // auto-fill next step
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await resetPasswordAPI({ token: tokenInput, newPassword });
      setStep('done');
      toast.success('Password updated! You can now log in.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Reset failed. Token may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-neutral-200">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-neutral-500 hover:text-neutral-900 font-medium text-ui-sm uppercase tracking-widest transition-colors"
        >
          <ChevronLeft size={14} /> Back
        </button>
        <span className="text-ui-sm font-semibold text-neutral-900 uppercase tracking-wider">
          {step === 'done' ? 'Password Reset' : 'Forgot Password'}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-accent/5 border border-accent text-accent px-4 py-3 rounded-md text-ui-sm font-medium">
          {error}
        </div>
      )}

      {/* Step 1: Email */}
      {step === 'email' && (
        <form onSubmit={handleRequestToken} className="space-y-4">
          <p className="text-ui-sm text-neutral-600 font-medium">
            Enter your account email. We'll generate a reset token instantly (demo mode — no email required).
          </p>
          <Input
            id="forgot-email"
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            loadingText="Generating token..."
            disabled={!email}
            className="h-10"
          >
            Get Reset Token →
          </Button>
        </form>
      )}

      {/* Step 2: Token display */}
      {step === 'token' && (
        <div className="space-y-4">
          {resetToken ? (
            <>
              <p className="text-ui-sm text-neutral-600 font-medium">
                Your reset token is ready. In production this would be emailed — for demo, copy it below:
              </p>
              <div className="bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-lg p-4 flex items-center justify-between gap-3">
                <code className="text-sm font-mono text-neutral-800 break-all flex-1 select-all">
                  {resetToken}
                </code>
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="shrink-0 flex items-center gap-1 text-primary hover:text-primary/80 font-medium text-ui-sm uppercase tracking-widest transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </>
          ) : (
            <p className="text-ui-sm text-neutral-600 font-medium">
              If an account exists for <strong>{email}</strong>, a reset link has been sent. Paste the token below.
            </p>
          )}
          <Input
            id="reset-token-input"
            type="text"
            label="Reset Token"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Paste your reset token here"
            required
          />
          <Button
            type="button"
            variant="primary"
            fullWidth
            disabled={!tokenInput.trim()}
            onClick={() => setStep('reset')}
            className="h-10"
          >
            Continue →
          </Button>
        </div>
      )}

      {/* Step 3: New password */}
      {step === 'reset' && (
        <form onSubmit={handleReset} className="space-y-4">
          <p className="text-ui-sm text-neutral-600 font-medium">
            Set a new password for your account.
          </p>
          <Input
            id="new-password"
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            required
          />
          <Input
            id="confirm-password"
            type="password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            required
          />
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            loadingText="Resetting..."
            disabled={!newPassword || !confirmPassword}
            className="h-10"
          >
            Reset Password →
          </Button>
        </form>
      )}

      {/* Step 4: Done */}
      {step === 'done' && (
        <div className="space-y-4 text-center py-4">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-success/10 rounded-full mb-2">
            <Check className="w-7 h-7 text-success" />
          </div>
          <p className="text-ui-md font-semibold text-neutral-900">Password updated!</p>
          <p className="text-ui-sm text-neutral-500 font-medium">
            You can now sign in with your new password.
          </p>
          <Button variant="primary" fullWidth onClick={onBack} className="h-10">
            Back to Sign In →
          </Button>
        </div>
      )}
    </div>
  );
};

// ─── Main Login Page ──────────────────────────────────────────────────────────
const LoginPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { setCredentials } = useAuthStore();

  useEffect(() => {
    document.title = 'Login — Theralign';
  }, []);

  const [formData, setFormData]       = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState(null);
  const [showForgot, setShowForgot]   = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const performLogin = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginAPI({ email, password });
      setCredentials(result.data.user, result.data.token);
      toast.success(`Welcome back, ${result.data.user.name.split(' ')[0]}!`);
      const from = location.state?.from || DASHBOARD_ROUTES[result.data.user.role] || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performLogin(formData.email, formData.password);
  };

  const handleDemoLogin = (account) => {
    performLogin(account.email, account.password);
  };

  return (
    <div className="min-h-[85vh] bg-neutral-50 flex items-center justify-center p-6 py-12 page-fade-in px-6 sm:px-6">
      <div className="w-full max-w-[480px] mx-auto">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-lg shadow-level-1 mb-4 sm:mb-4">
            <HeartPulse className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-[32px] leading-[1.1] font-medium text-neutral-900 tracking-tight font-swiss text-center">Theralign</h1>
          <p className="text-neutral-500 mt-2 text-ui-sm font-normal uppercase tracking-wider hidden sm:block">
            {showForgot ? 'Reset your password' : 'Sign in to your Theralign account'}
          </p>
        </div>

        <Card variant="default" className="p-6 sm:p-8 rounded-[12px] md:rounded-lg shadow-level-1">
          {/* Panel Switch with smooth transition */}
          <div
            className="transition-all duration-200"
            style={{ minHeight: showForgot ? '360px' : undefined }}
          >
            {showForgot ? (
              <ForgotPasswordPanel onBack={() => setShowForgot(false)} />
            ) : (
              <>
                {/* Inline Error Banner */}
                {error && (
                  <div className="mb-5 bg-accent/5 border border-accent text-accent px-4 py-3 rounded-md text-ui-sm flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="font-medium">{error}</span>
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

                  {/* Password + Forgot link */}
                  <div className="space-y-1">
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
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => { setShowForgot(true); setError(null); }}
                        className="text-sm font-medium text-primary hover:underline uppercase tracking-wider transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
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

                {/* ─── Demo Account Quick-Login ─────────────────────── */}
                <div className="mt-6 pt-5 border-t border-neutral-100">
                  <p className="text-sm font-semibold text-neutral-400 uppercase tracking-widest text-center mb-3">
                    Demo Accounts
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {DEMO_ACCOUNTS.map((account) => (
                      <button
                        key={account.role}
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleDemoLogin(account)}
                        className="flex flex-col items-center gap-1 py-3 px-2 border border-neutral-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-150 text-center group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="h-6 flex items-center justify-center">
                          {account.role === 'patient' ? (
                            <UserCheck className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-200" />
                          ) : account.role === 'doctor' ? (
                            <Stethoscope className="w-5 h-5 text-success group-hover:scale-110 transition-transform duration-200" />
                          ) : (
                            <Lock className="w-5 h-5 text-accent group-hover:scale-110 transition-transform duration-200" />
                          )}
                        </span>
                        <span className="text-sm font-semibold text-neutral-600 uppercase tracking-widest group-hover:text-primary transition-colors">
                          {account.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-neutral-400 font-medium text-center mt-2">
                    Click any button to auto-login with demo credentials
                  </p>
                </div>

                {/* Footer Link */}
                <p className="mt-6 text-center text-ui-sm text-neutral-500 font-normal">
                  Don&apos;t have an account?{' '}
                  <Link
                    to="/register"
                    className="text-accent font-medium hover:underline transition"
                  >
                    Register here
                  </Link>
                </p>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;

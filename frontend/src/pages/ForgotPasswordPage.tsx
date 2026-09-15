import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import Logo from '../components/Logo';
import { Sparkles, Mail, KeyRound, Lock, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<'EMAIL' | 'VERIFY_OTP' | 'RESET_PASSWORD' | 'SUCCESS'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Restore saved reset state if returning to reset screen
  useEffect(() => {
    const savedEmail = sessionStorage.getItem('sn_reset_email');
    const savedToken = sessionStorage.getItem('sn_reset_token');
    if (savedEmail && savedToken) {
      setEmail(savedEmail);
      setResetToken(savedToken);
    }
  }, []);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-rose-500' };
      case 2:
        return { score: 50, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 75, label: 'Good', color: 'bg-blue-500' };
      case 4:
        return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 0, label: '', color: 'bg-slate-700' };
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // STEP 1: Request Password Reset OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMsg(null);

    try {
      const res = await apiClient.post('/auth/forgot-password', { email: cleanEmail });
      if (res.data?.success) {
        setEmail(cleanEmail);
        setInfoMsg(res.data.message || 'If the account exists, a password reset OTP has been sent.');
        setResendCooldown(res.data.data?.resendCooldownSeconds || 60);
        setStep('VERIFY_OTP');
      } else {
        setError(res.data?.message || 'Failed to send reset code.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request password reset code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Email address is missing. Please re-enter your email.');
      setStep('EMAIL');
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMsg(null);

    try {
      const res = await apiClient.post('/auth/forgot-password', { email: cleanEmail });
      if (res.data?.success) {
        setInfoMsg('A new verification code has been sent to your email.');
        setResendCooldown(60);
        setOtp('');
      } else {
        setError(res.data?.message || 'Failed to resend OTP.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanEmail) {
      setError('Registered email address is missing. Please start from Step 1.');
      setStep('EMAIL');
      return;
    }

    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMsg(null);

    try {
      const res = await apiClient.post('/auth/verify-reset-otp', {
        email: cleanEmail,
        otp: cleanOtp,
      });

      if (res.data?.success && res.data?.data?.resetToken) {
        const token = res.data.data.resetToken;
        const verifiedEmail = (res.data.data.email || cleanEmail).toLowerCase().trim();

        // Preserve both email and resetToken in state & sessionStorage
        setResetToken(token);
        setEmail(verifiedEmail);
        sessionStorage.setItem('sn_reset_email', verifiedEmail);
        sessionStorage.setItem('sn_reset_token', token);

        setStep('RESET_PASSWORD');
      } else {
        setError(res.data?.message || 'Invalid verification code.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please check the OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check both state and sessionStorage for fallback
    const targetEmail = (email || sessionStorage.getItem('sn_reset_email') || '').trim().toLowerCase();
    const targetToken = (resetToken || sessionStorage.getItem('sn_reset_token') || '').trim();

    // Strict validation before calling API
    if (!targetEmail) {
      setError('Registered email address is missing. Please restart the password reset process.');
      return;
    }

    if (!targetToken) {
      setError('Reset token is missing or invalid. Please verify your OTP code again.');
      return;
    }

    if (!newPassword) {
      setError('New password is required.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMsg(null);

    try {
      const res = await apiClient.post('/auth/reset-password', {
        email: targetEmail,
        resetToken: targetToken,
        newPassword,
        confirmPassword,
      });

      if (res.data?.success) {
        // Clear temporary reset token storage on success
        sessionStorage.removeItem('sn_reset_email');
        sessionStorage.removeItem('sn_reset_token');
        setStep('SUCCESS');
      } else {
        setError(res.data?.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password reset failed. Token may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    sessionStorage.removeItem('sn_reset_email');
    sessionStorage.removeItem('sn_reset_token');
    setEmail('');
    setOtp('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setInfoMsg(null);
    setStep('EMAIL');
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header Logo */}
        <div className="text-center space-y-3">
          <Logo size="lg" className="mx-auto" />
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Reset Password</h2>
          <p className="text-sm text-slate-400">Secure Gmail OTP Password Recovery</p>
        </div>

        {/* Progress Indicator Steps */}
        <div className="flex items-center justify-center space-x-2 text-xs font-semibold">
          <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border ${step === 'EMAIL' ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            <span>1. Email</span>
          </div>
          <span className="text-slate-700">&rarr;</span>
          <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border ${step === 'VERIFY_OTP' ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            <span>2. OTP Verification</span>
          </div>
          <span className="text-slate-700">&rarr;</span>
          <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border ${step === 'RESET_PASSWORD' || step === 'SUCCESS' ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            <span>3. New Password</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-sm flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{infoMsg}</span>
            </div>
          )}

          {/* STEP 1: EMAIL ENTRY */}
          {step === 'EMAIL' && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Registered Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full glass-button text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Verification OTP</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 'VERIFY_OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>OTP sent to <span className="text-white font-medium">{email}</span></span>
                <button type="button" onClick={handleRestart} className="text-purple-400 hover:underline">Change</button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Enter 6-Digit OTP Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-center font-mono text-xl tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="text-purple-400 font-semibold hover:underline disabled:opacity-40 flex items-center space-x-1"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>{resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full glass-button text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verify OTP Code</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 'RESET_PASSWORD' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
                Setting new password for <span className="text-white font-medium">{email || sessionStorage.getItem('sn_reset_email')}</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                  />
                </div>
                {newPassword && (
                  <div className="space-y-1 pt-1">
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: `${passwordStrength.score}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold block text-right">
                      Strength: {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !newPassword || newPassword !== confirmPassword}
                className="w-full glass-button text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="text-center space-y-6 py-4">
              <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Password Reset Successfully</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your password has been updated. You can now log in using your new credentials.
                </p>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full glass-button text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/30"
              >
                <span>Go to Login</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400 flex items-center justify-between">
            {step !== 'EMAIL' && step !== 'SUCCESS' && (
              <button type="button" onClick={handleRestart} className="text-slate-400 hover:text-white transition font-medium">
                &larr; Start Over
              </button>
            )}
            <div className="ml-auto">
              Remember your password?{' '}
              <Link to="/login" className="text-purple-400 font-semibold hover:underline">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

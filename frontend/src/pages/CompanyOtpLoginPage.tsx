import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { Building2, Mail, Lock, KeyRound, RefreshCw, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, Globe, MapPin } from 'lucide-react';

export const CompanyOtpLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSessionToken } = useAuth();

  const [step, setStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaChallenge, setCaptchaChallenge] = useState<{ challengeId: string; challengeText: string; captchaToken: string } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const fetchCaptcha = async () => {
    try {
      setError(null);
      const res = await apiClient.get('/auth/captcha');
      if (res.data?.success) {
        setCaptchaChallenge(res.data.data);
        setCaptchaAnswer('');
      }
    } catch (err: any) {
      setError('Failed to load CAPTCHA challenge.');
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !captchaAnswer) {
      setError('Please enter your Official Email, Password, and solve the CAPTCHA question.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await apiClient.post('/auth/company/login/request-otp', {
        email,
        password,
        captchaToken: captchaChallenge?.captchaToken,
        captchaAnswer,
      });

      if (res.data?.success) {
        setStep('VERIFY');
        setSuccessMsg(res.data.message || 'OTP verification code sent to your official email.');
        setResendCooldown(res.data.data?.resendCooldownSeconds || 60);
      } else {
        setError(res.data?.message || 'Failed to send verification code.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initiate Company OTP verification.');
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.post('/auth/company/login/verify-otp', {
        email,
        otp,
      });

      if (res.data?.success) {
        const { user, token } = res.data.data;
        await setSessionToken(token, user);
        navigate('/company/dashboard');
      } else {
        setError(res.data?.message || 'Invalid verification code.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.post('/auth/company/login/request-otp', {
        email,
        password,
        captchaToken: captchaChallenge?.captchaToken,
        captchaAnswer,
      });

      if (res.data?.success) {
        setSuccessMsg('A new verification code has been sent to your email.');
        setResendCooldown(60);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header Logo */}
        <div className="text-center space-y-3">
          <Logo size="lg" className="mx-auto" />
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Company Portal Login</h2>
          <p className="text-sm text-slate-400">Recruiter Authentication with Gmail SMTP Email OTP</p>
        </div>

        {/* Card Panel */}
        <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center space-x-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === 'REQUEST' ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Official HR Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hr@company.com"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Account Password</label>
                  <Link to="/forgot-password" className="text-xs text-emerald-400 font-semibold hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              {/* CAPTCHA Challenge */}
              {captchaChallenge && (
                <div className="space-y-2 p-4 rounded-2xl bg-slate-950/90 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Security Verification (CAPTCHA)</span>
                    <button type="button" onClick={fetchCaptcha} className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" /> Refresh
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-center font-mono font-bold text-emerald-300 text-lg">
                    {captchaChallenge.challengeText}
                  </div>
                  <input
                    type="text"
                    required
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    placeholder="Enter answer"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white text-center placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-600/25 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Login OTP</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center space-y-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>OTP Sent to {email}</span>
                </span>
                <p className="text-xs text-slate-400">Enter the 6-digit code delivered via Gmail SMTP</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider text-center block">6-Digit Verification Code</label>
                <div className="relative max-w-xs mx-auto">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl py-3 pl-12 pr-4 text-center font-mono font-bold text-xl text-white tracking-[8px] placeholder-slate-700 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-600/25 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verify OTP & Sign In</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep('REQUEST')}
                  className="text-slate-400 hover:text-white transition"
                >
                  &larr; Change Email / Details
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="text-emerald-400 font-semibold hover:underline disabled:text-slate-600"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400 flex items-center justify-between">
            <Link to="/student-login" className="text-slate-400 hover:text-white transition">
              Student OTP Portal &rarr;
            </Link>
            <div>
              New Company?{' '}
              <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyOtpLoginPage;

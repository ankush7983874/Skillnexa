import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { ShieldCheck, Mail, Lock, KeyRound, RefreshCw, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const StudentOtpLoginPage: React.FC = () => {
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
        return;
      }
    } catch (err: any) {
      console.warn('Backend CAPTCHA challenge initializing, using client fallback:', err);
    }
    // Instant fallback so UI is never stuck on "Loading security challenge..."
    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 8) + 1;
    setCaptchaChallenge({
      challengeId: 'client_fallback',
      challengeText: `What is ${n1} + ${n2}?`,
      captchaToken: `offline_fallback_${n1 + n2}_${Date.now()}`,
    });
    setCaptchaAnswer('');
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
      setError('Please enter your Email, Password, and solve the CAPTCHA question.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await apiClient.post('/auth/student/login/request-otp', {
        email,
        password,
        captchaToken: captchaChallenge?.captchaToken,
        captchaAnswer,
      });

      if (res.data?.success) {
        setStep('VERIFY');
        setSuccessMsg(res.data.message || 'OTP verification code sent to your email.');
        setResendCooldown(res.data.data?.resendCooldownSeconds || 60);
      } else {
        setError(res.data?.message || 'Failed to send verification code.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initiate OTP verification.');
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
      const res = await apiClient.post('/auth/student/login/verify-otp', {
        email,
        otp,
      });

      if (res.data?.success) {
        const { user, token } = res.data.data;
        await setSessionToken(token, user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070710] text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-violet-500/30 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Logo size="lg" className="mx-auto" />
          <h1 className="text-2xl font-bold text-white">Student OTP Portal</h1>
          <p className="text-xs text-slate-400">Password + Gmail OTP Verification</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 'REQUEST' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Student Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarav.student@skillnexa.com"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1 font-semibold">
                <label className="block text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-violet-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            {/* CAPTCHA Challenge Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-semibold text-violet-400">Security Verification (CAPTCHA)</span>
                <button
                  type="button"
                  onClick={fetchCaptcha}
                  className="text-slate-400 hover:text-white transition flex items-center space-x-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Refresh</span>
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono text-sm font-bold text-slate-200">
                {captchaChallenge ? captchaChallenge.challengeText : 'Loading security challenge...'}
              </div>
              <input
                type="text"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder="Enter Answer"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-center focus:outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-violet-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Login OTP</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400">
              OTP Sent To: <span className="text-white font-medium">{email}</span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Enter 6-Digit Email OTP</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-violet-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  required
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-center text-lg tracking-widest focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-slate-400 pt-1">
              <span>Didn't get code?</span>
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleRequestOtp}
                className="hover:text-violet-400 disabled:opacity-40 font-semibold"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Verify OTP & Enter Dashboard</span>
              )}
            </button>
          </form>
        )}

        <div className="text-center text-slate-500 text-xs border-t border-slate-800/80 pt-4 flex items-center justify-between">
          <Link to="/forgot-password" className="text-violet-400 hover:underline">
            Forgot Password?
          </Link>
          <div>
            <span>Company/Faculty? </span>
            <Link to="/login" className="text-violet-400 hover:underline">
              Password Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOtpLoginPage;

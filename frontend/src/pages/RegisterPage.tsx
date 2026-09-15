import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { apiClient } from '../services/api';
import { UserRole } from '../types/api';
import {
  Sparkles,
  Mail,
  Lock,
  User as UserIcon,
  Building2,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  RefreshCw,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  Phone,
  Globe,
  MapPin,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');

  // Company-specific fields
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('Technology / IT');
  const [companySize, setCompanySize] = useState('50-200');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const [institutionName, setInstitutionName] = useState('');

  // OTP state
  const [step, setStep] = useState<'DETAILS' | 'OTP_VERIFY'>('DETAILS');
  const [captchaChallenge, setCaptchaChallenge] = useState<{ challengeId: string; challengeText: string; captchaToken: string } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, setSessionToken } = useAuth();
  const navigate = useNavigate();

  const fetchCaptcha = async () => {
    try {
      const res = await apiClient.get('/auth/captcha');
      if (res.data?.success) {
        setCaptchaChallenge(res.data.data);
        setCaptchaAnswer('');
      }
    } catch (e) {
      console.error('Failed to load CAPTCHA:', e);
    }
  };

  useEffect(() => {
    if (role === 'STUDENT' || role === 'COMPANY') {
      fetchCaptcha();
    }
  }, [role]);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Standard Registration for Faculty/College/Admin
  const handleStandardRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({
        name,
        email,
        password,
        role,
        phone,
        companyName: role === 'COMPANY' ? companyName : undefined,
        institutionName: role === 'INSTITUTION' ? institutionName : undefined,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Student OTP Registration
  const handleRequestStudentRegistrationOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !captchaAnswer) {
      setError('Please fill in your Name, Email, Password, and solve the CAPTCHA question.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await apiClient.post('/auth/student/register/request-otp', {
        name,
        email,
        password,
        captchaToken: captchaChallenge?.captchaToken,
        captchaAnswer,
        college,
        branch,
        phone,
      });

      if (res.data?.success) {
        setSuccessMsg(res.data.message || 'Verification code sent to your email.');
        setStep('OTP_VERIFY');
        setResendCooldown(60);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send registration OTP.');
      fetchCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyStudentRegistrationOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await apiClient.post('/auth/student/register/verify-otp', {
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
      setIsSubmitting(false);
    }
  };

  // Company OTP Registration
  const handleRequestCompanyRegistrationOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!name && !companyName) || !captchaAnswer) {
      setError('Please fill in Company / HR Name, Official Email, Password, and solve the CAPTCHA question.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await apiClient.post('/auth/company/register/request-otp', {
        name: name || companyName,
        companyName: companyName || name,
        email,
        password,
        phone,
        website,
        industry,
        companySize,
        description,
        location,
        captchaToken: captchaChallenge?.captchaToken,
        captchaAnswer,
      });

      if (res.data?.success) {
        setSuccessMsg(res.data.message || 'Verification code sent to your official email.');
        setStep('OTP_VERIFY');
        setResendCooldown(60);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send company registration OTP.');
      fetchCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCompanyRegistrationOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await apiClient.post('/auth/company/register/verify-otp', {
        email,
        otp,
      });

      if (res.data?.success) {
        const { user, token } = res.data.data;
        await setSessionToken(token, user);
        navigate('/company/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Glow Effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl space-y-8 relative z-10 py-10">
        {/* Header Logo */}
        <div className="text-center space-y-3">
          <Logo size="lg" className="mx-auto" />
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Create Account</h2>
          <p className="text-sm text-slate-400">Join the SkillNexa Academia–Industry Ecosystem</p>
        </div>

        {/* Register Card */}
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

          {/* Role Selection Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Select Account Role</label>
            <div className="grid grid-cols-4 gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
              <RoleOption active={role === 'STUDENT'} onClick={() => { setRole('STUDENT'); setStep('DETAILS'); }} icon={<GraduationCap className="h-4 w-4" />} label="Student" />
              <RoleOption active={role === 'COMPANY'} onClick={() => { setRole('COMPANY'); setStep('DETAILS'); }} icon={<Building2 className="h-4 w-4" />} label="Company" />
              <RoleOption active={role === 'FACULTY'} onClick={() => { setRole('FACULTY'); setStep('DETAILS'); }} icon={<BookOpen className="h-4 w-4" />} label="Faculty" />
              <RoleOption active={role === 'INSTITUTION'} onClick={() => { setRole('INSTITUTION'); setStep('DETAILS'); }} icon={<Building2 className="h-4 w-4" />} label="College" />
            </div>
          </div>

          {/* STUDENT OTP REGISTRATION WORKFLOW */}
          {role === 'STUDENT' ? (
            step === 'DETAILS' ? (
              <form onSubmit={handleRequestStudentRegistrationOtp} className="space-y-4 text-xs">
                <div className="p-3 rounded-2xl bg-violet-950/60 border border-violet-500/30 text-violet-200">
                  <span className="font-bold text-white block text-sm">Two-Step Student OTP Verification</span>
                  <span className="text-[11px] text-violet-300">Enter your registration details and solve CAPTCHA to receive an email OTP.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Full Name *</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Aarav Sharma"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@university.edu"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Mobile Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">College / University Name *</label>
                    <input
                      type="text"
                      required
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="Delhi Technological University"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Branch / Specialization *</label>
                    <input
                      type="text"
                      required
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="Computer Science & Engineering"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                {/* CAPTCHA Challenge */}
                {captchaChallenge && (
                  <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300">Security Verification (CAPTCHA)</span>
                      <button type="button" onClick={fetchCaptcha} className="text-violet-400 hover:underline flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" /> Refresh
                      </button>
                    </div>
                    <div className="p-2.5 rounded-xl bg-violet-950/40 border border-violet-500/20 text-center font-mono font-bold text-violet-300 text-base">
                      {captchaChallenge.challengeText}
                    </div>
                    <input
                      type="text"
                      required
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      placeholder="Enter answer"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-white text-center placeholder-slate-600 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-violet-600/25 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Registration Email OTP</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyStudentRegistrationOtp} className="space-y-5 text-xs">
                <div className="text-center space-y-2">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>OTP Sent to {email}</span>
                  </span>
                  <p className="text-slate-400">Enter the 6-digit code delivered via Gmail SMTP</p>
                </div>

                <div className="space-y-2 max-w-xs mx-auto text-center">
                  <label className="font-semibold text-slate-300 uppercase tracking-wider block">Enter 6-Digit OTP Code</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-violet-400" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full bg-slate-950 border border-violet-500/50 rounded-xl py-3 pl-12 pr-4 text-center font-mono font-bold text-xl text-white tracking-[8px] placeholder-slate-700 focus:outline-none focus:border-violet-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-violet-600/25 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      <span>Verify OTP & Create Student Account</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={() => setStep('DETAILS')} className="text-slate-400 hover:text-white transition">
                    &larr; Back to Form
                  </button>
                  <span className="text-slate-500">Resend available in {resendCooldown}s</span>
                </div>
              </form>
            )
          ) : role === 'COMPANY' ? (
            /* COMPANY OTP REGISTRATION WORKFLOW */
            step === 'DETAILS' ? (
              <form onSubmit={handleRequestCompanyRegistrationOtp} className="space-y-4 text-xs">
                <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200">
                  <span className="font-bold text-white block text-sm">Two-Step Company Recruiter Verification</span>
                  <span className="text-[11px] text-emerald-300">Enter company details and solve CAPTCHA to receive an official email OTP code.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Company Name *</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Google / TechCorp"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">HR Contact Person Name *</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Sarah Jenkins"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Official Company Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="hr@company.com"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Account Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">HR Contact Phone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Company Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://company.com"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Industry Sector</label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="Software / FinTech / AI"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Company Headquarters Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Bangalore / Gurugram / Remote"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* CAPTCHA Challenge */}
                {captchaChallenge && (
                  <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300">Security Verification (CAPTCHA)</span>
                      <button type="button" onClick={fetchCaptcha} className="text-emerald-400 hover:underline flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" /> Refresh
                      </button>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-center font-mono font-bold text-emerald-300 text-base">
                      {captchaChallenge.challengeText}
                    </div>
                    <input
                      type="text"
                      required
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      placeholder="Enter answer"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-white text-center placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-600/25 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Company Registration OTP</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCompanyRegistrationOtp} className="space-y-5 text-xs">
                <div className="text-center space-y-2">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>OTP Sent to {email}</span>
                  </span>
                  <p className="text-slate-400">Enter the 6-digit code delivered via Gmail SMTP</p>
                </div>

                <div className="space-y-2 max-w-xs mx-auto text-center">
                  <label className="font-semibold text-slate-300 uppercase tracking-wider block">Enter 6-Digit OTP Code</label>
                  <div className="relative">
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
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-600/25 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      <span>Verify OTP & Create Company Account</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={() => setStep('DETAILS')} className="text-slate-400 hover:text-white transition">
                    &larr; Back to Form
                  </button>
                  <span className="text-slate-500">Resend available in {resendCooldown}s</span>
                </div>
              </form>
            )
          ) : (
            /* STANDARD REGISTRATION WORKFLOW FOR FACULTY / COLLEGE / ADMIN */
            <form onSubmit={handleStandardRegister} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Rajesh Kumar"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="faculty@institution.edu"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              {role === 'INSTITUTION' && (
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Institution / College Name *</label>
                  <input
                    type="text"
                    required
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="Delhi Technological University"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl glass-button text-white font-semibold text-xs flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span>Create {role} Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoleOption: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({
  active,
  onClick,
  icon,
  label,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 rounded-xl flex flex-col items-center justify-center space-y-1 transition duration-150 ${
      active
        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
    }`}
  >
    {icon}
    <span className="text-[10px] truncate w-full text-center">{label}</span>
  </button>
);

export default RegisterPage;

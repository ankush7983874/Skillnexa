import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  LogOut,
  UserCheck,
  GraduationCap,
  Building2,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  Award,
  Briefcase,
  FileText,
  CheckCircle2,
  Clock,
  FolderGit2,
  Calendar,
} from 'lucide-react';

import Navbar from './ai/components/Navbar';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Global Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-10">
        {/* Welcome Banner */}
        <section className="glass-panel rounded-3xl p-8 border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              <UserCheck className="h-4 w-4" />
              <span>Authenticated Session Active</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">Welcome back, {user.name}</h2>
            <p className="text-sm text-slate-400">{user.email} • Account Role: <span className="text-slate-200 font-medium">{user.role}</span></p>
          </div>

          {user.role === 'COMPANY' && (
            <div className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center space-x-3">
              <div className={`p-2 rounded-xl ${user.companyVerificationStatus === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                {user.companyVerificationStatus === 'VERIFIED' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase">Company Status</div>
                <div className="text-sm font-bold text-white">{user.companyVerificationStatus}</div>
              </div>
            </div>
          )}
        </section>

        {/* Role Modules Breakdown */}
        {user.role === 'STUDENT' && (
          <StudentDashboardOverview profile={profile} />
        )}

        {user.role === 'COMPANY' && (
          <CompanyDashboardOverview verificationStatus={user.companyVerificationStatus} />
        )}

        {user.role === 'FACULTY' && (
          <FacultyDashboardOverview />
        )}

        {user.role === 'INSTITUTION' && (
          <InstitutionDashboardOverview />
        )}

        {user.role === 'ADMIN' && (
          <AdminDashboardOverview />
        )}
      </main>
    </div>
  );
};

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const styles: Record<string, string> = {
    STUDENT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    COMPANY: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    FACULTY: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    INSTITUTION: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    ADMIN: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${styles[role] || styles.STUDENT}`}>
      {role}
    </span>
  );
};

const StudentDashboardOverview: React.FC<{ profile: any }> = ({ profile }) => (
  <div className="space-y-8">
    {/* Phase 9 Digital Portfolio Callout Banner */}
    <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl shadow-purple-950/20">
      <div className="flex items-center space-x-4">
        <div className="p-3.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/30">
          <FolderGit2 className="h-7 w-7 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-bold text-white">Digital Portfolio</h3>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-md">Phase 9</span>
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Manage your verified resume, certificates, projects, internship history, and public/company privacy controls.
          </p>
        </div>
      </div>
      <Link
        to="/portfolio"
        className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-600/30 flex items-center space-x-2 transition"
      >
        <span>Open Digital Portfolio</span>
        <span className="text-xs">&rarr;</span>
      </Link>
    </div>

    {/* Metric Cards */}
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Student Command Center</h3>
        <span className="text-xs text-slate-400">Click any card to open the feature</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link to="/profile" className="block hover:scale-[1.02] transition-transform">
          <StatCard title="Profile Completion" value={`${profile?.profileCompletionPercentage || 20}%`} subtitle="Click to edit profile" icon={<GraduationCap className="h-5 w-5 text-blue-400" />} />
        </Link>
        <Link to="/portfolio" className="block hover:scale-[1.02] transition-transform">
          <StatCard title="Portfolio & Projects" value={`${profile?.projects?.length || 0}`} subtitle="Verified projects & certs" icon={<Award className="h-5 w-5 text-purple-400" />} />
        </Link>
        <Link to="/student/applications" className="block hover:scale-[1.02] transition-transform">
          <StatCard title="Job Applications" value="View" subtitle="Track applied positions" icon={<Briefcase className="h-5 w-5 text-emerald-400" />} />
        </Link>
        <Link to="/assessments" className="block hover:scale-[1.02] transition-transform">
          <StatCard title="Assessments" value="Take" subtitle="Verify technical skills" icon={<FileText className="h-5 w-5 text-amber-400" />} />
        </Link>
      </div>
    </div>

    {/* Quick Links Matrix */}
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
      <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Quick Actions</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link to="/portfolio" className="p-3 bg-slate-900/80 hover:bg-purple-950/30 border border-slate-800 hover:border-purple-500/30 rounded-xl flex flex-col items-center text-center space-y-2 transition group">
          <FolderGit2 className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-slate-200 group-hover:text-white">Digital Portfolio</span>
        </Link>
        <Link to="/student/recommendations" className="p-3 bg-slate-900/80 hover:bg-blue-950/30 border border-slate-800 hover:border-blue-500/30 rounded-xl flex flex-col items-center text-center space-y-2 transition group">
          <Sparkles className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-slate-200 group-hover:text-white">AI Job Match</span>
        </Link>
        <Link to="/student/applications" className="p-3 bg-slate-900/80 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/30 rounded-xl flex flex-col items-center text-center space-y-2 transition group">
          <Briefcase className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-slate-200 group-hover:text-white">Applications</span>
        </Link>
        <Link to="/student/interviews" className="p-3 bg-slate-900/80 hover:bg-amber-950/30 border border-slate-800 hover:border-amber-500/30 rounded-xl flex flex-col items-center text-center space-y-2 transition group">
          <Calendar className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-slate-200 group-hover:text-white">Interviews</span>
        </Link>
        <Link to="/assessments" className="p-3 bg-slate-900/80 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-500/30 rounded-xl flex flex-col items-center text-center space-y-2 transition group">
          <Award className="h-5 w-5 text-rose-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-slate-200 group-hover:text-white">Assessments</span>
        </Link>
        <Link to="/profile" className="p-3 bg-slate-900/80 hover:bg-indigo-950/30 border border-slate-800 hover:border-indigo-500/30 rounded-xl flex flex-col items-center text-center space-y-2 transition group">
          <GraduationCap className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-slate-200 group-hover:text-white">Profile</span>
        </Link>
      </div>
    </div>
  </div>
);

const CompanyDashboardOverview: React.FC<{ verificationStatus: string }> = ({ verificationStatus }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-xl font-bold text-white">Company Talent Command Center</h3>
      <span className="text-xs text-slate-400">Click any card to open the feature</span>
    </div>

    {verificationStatus !== 'VERIFIED' && (
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-center justify-between">
        <span>Verification Pending: Admin verification required before publishing job posts.</span>
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Link to="/company/jobs" className="block hover:scale-[1.02] transition-transform">
        <StatCard title="Job Postings" value="Manage" subtitle="Create & view openings" icon={<Briefcase className="h-5 w-5 text-emerald-400" />} />
      </Link>
      <Link to="/company/applications" className="block hover:scale-[1.02] transition-transform">
        <StatCard title="Applications & Portfolios" value="Review" subtitle="Shortlist & view candidate portfolios" icon={<FileText className="h-5 w-5 text-purple-400" />} />
      </Link>
      <Link to="/company/interviews" className="block hover:scale-[1.02] transition-transform">
        <StatCard title="Interviews" value="Manage" subtitle="Schedule & complete candidate interviews" icon={<UserCheck className="h-5 w-5 text-amber-400" />} />
      </Link>
    </div>
  </div>
);

const FacultyDashboardOverview: React.FC = () => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-white">Faculty Collaboration Hub</h3>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard title="Mentorship Programs" value="0" subtitle="Active student mentees" icon={<BookOpen className="h-5 w-5 text-amber-400" />} />
      <StatCard title="Industry Internships" value="0" subtitle="Faculty immersion programs" icon={<Briefcase className="h-5 w-5 text-blue-400" />} />
      <StatCard title="Research Projects" value="0" subtitle="Industry sponsored research" icon={<Sparkles className="h-5 w-5 text-purple-400" />} />
      <StatCard title="Guest Lectures" value="0" subtitle="Workshops & talks scheduled" icon={<GraduationCap className="h-5 w-5 text-emerald-400" />} />
    </div>
  </div>
);

const InstitutionDashboardOverview: React.FC = () => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-white">Institutional Talent & Placement Intelligence</h3>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard title="Enrolled Students" value="0" subtitle="Total registered students" icon={<GraduationCap className="h-5 w-5 text-purple-400" />} />
      <StatCard title="Placement Rate" value="0%" subtitle="Current cohort placed" icon={<TrendingUp className="h-5 w-5 text-emerald-400" />} />
      <StatCard title="Partner Companies" value="0" subtitle="Verified recruiting partners" icon={<Building2 className="h-5 w-5 text-blue-400" />} />
      <StatCard title="Top Skill Gaps" value="None" subtitle="Institutional skill telemetry" icon={<Award className="h-5 w-5 text-rose-400" />} />
    </div>
  </div>
);

const AdminDashboardOverview: React.FC = () => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-white">Admin Governance Console</h3>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard title="Pending Companies" value="0" subtitle="Companies awaiting verification" icon={<Building2 className="h-5 w-5 text-amber-400" />} />
      <StatCard title="Total Platform Users" value="0" subtitle="Across all 5 user roles" icon={<UserCheck className="h-5 w-5 text-blue-400" />} />
      <StatCard title="System Audit Logs" value="Active" subtitle="RBAC & activity logging" icon={<ShieldCheck className="h-5 w-5 text-emerald-400" />} />
      <StatCard title="Skill Taxonomy" value="Active" subtitle="Master skill catalog" icon={<Award className="h-5 w-5 text-purple-400" />} />
    </div>
  </div>
);

const StatCard: React.FC<{ title: string; value: string; subtitle: string; icon: React.ReactNode }> = ({
  title,
  value,
  subtitle,
  icon,
}) => (
  <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-400 uppercase">{title}</span>
      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">{icon}</div>
    </div>
    <div className="text-2xl font-black text-white">{value}</div>
    <div className="text-[11px] text-slate-500">{subtitle}</div>
  </div>
);

export default DashboardPage;

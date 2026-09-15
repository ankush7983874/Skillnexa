import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Logo from './components/Logo';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { StudentPortfolioPage } from './pages/StudentPortfolioPage';
import { AssessmentListPage } from './pages/AssessmentListPage';
import { TakeAssessmentPage } from './pages/TakeAssessmentPage';
import { CompanyJobsPage } from './pages/CompanyJobsPage';
import { AICandidateRankingsPage } from './pages/AICandidateRankingsPage';
import { StudentJobRecommendationsPage } from './pages/StudentJobRecommendationsPage';
import StudentApplicationsPage from './pages/StudentApplicationsPage';
import CompanyApplicationsPage from './pages/CompanyApplicationsPage';
import StudentInterviewsPage from './pages/StudentInterviewsPage';
import CompanyInterviewsPage from './pages/CompanyInterviewsPage';
import CandidatePortfolioPage from './pages/CandidatePortfolioPage';
import { getHealthCheck } from './services/api';
import { HealthStatus } from './types/api';
// Phase 10 — AI Workspace
import AILayout from './pages/ai/components/ai/AILayout';
import AICommandCenter from './pages/ai/AICommandCenter';
import AIJobDescriptionPage from './pages/ai/company/AIJobDescriptionPage';
import AICandidateInsightsPage from './pages/ai/company/AICandidateInsightsPage';
// Phase 11 Pages
import StudentOtpLoginPage from './pages/StudentOtpLoginPage';
import CompanyOtpLoginPage from './pages/CompanyOtpLoginPage';
import FacultyPortalPage from './pages/FacultyPortalPage';

import InstitutionAdminPage from './pages/InstitutionAdminPage';
import AcademiaCollaborationPage from './pages/AcademiaCollaborationPage';
import AdminConsolePage from './pages/AdminConsolePage';
import PlacementManagementPage from './pages/PlacementManagementPage';

import {
  Sparkles,
  Activity,
  GraduationCap,
  Building2,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  Cpu,
  LogIn,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-slate-400">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying authentication session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const LandingPage: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    getHealthCheck()
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to connect to SkillNexa Backend API');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition">
            <Logo size="sm" />
          </Link>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
              <Activity className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
              <span className="text-slate-300 font-mono">
                {loading ? 'Checking API...' : health ? 'API Online' : 'API Offline'}
              </span>
              <span className={`h-2 w-2 rounded-full ${health?.success ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-rose-500'}`} />
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition flex items-center space-x-1.5"
              >
                <UserPlus className="h-3.5 w-3.5 text-blue-400" />
                <span>Registration</span>
              </Link>
              <Link
                to="/login"
                className="glass-button text-xs font-semibold py-1.5 px-3.5 rounded-xl flex items-center space-x-1.5"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Login</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 space-y-12">
        <section className="relative overflow-hidden rounded-3xl p-8 lg:p-12 glass-panel border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-blue-950/40">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <Cpu className="h-3.5 w-3.5" />
              <span>Phase 5 & 6 — Company Verification & Explainable AI Candidate Matching Engine Live</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Don't just find a job. <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Become ready for the right job.
              </span>
            </h2>
            <p className="text-slate-300 text-base lg:text-lg leading-relaxed">
              7-Tier Explainable Candidate Matching algorithm evaluating technical skills, academic performance, verified assessments, projects, and soft skills with real database candidate ranking.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="glass-button py-3 px-6 rounded-xl font-semibold text-sm flex items-center space-x-2 text-white shadow-lg shadow-blue-500/25"
              >
                <span>Get Started Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Roles Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <RoleCard icon={<GraduationCap className="h-6 w-6 text-blue-400" />} title="Student" description="Capability profiles, skill gaps, personalized learning roadmaps, assessment engine." />
          <RoleCard icon={<Building2 className="h-6 w-6 text-emerald-400" />} title="Company" description="Verification workflow, job/internship posts, explainable AI candidate ranking." />
          <RoleCard icon={<BookOpen className="h-6 w-6 text-amber-400" />} title="Faculty" description="Industry internships, FDP, research collaboration, student mentorship." />
          <RoleCard icon={<TrendingUp className="h-6 w-6 text-purple-400" />} title="Institution" description="Placement intelligence, institutional skill analytics, industry demand reports." />
          <RoleCard icon={<ShieldCheck className="h-6 w-6 text-rose-400" />} title="Admin" description="Company verifications, user moderation, system audit logs, global settings." />
        </section>
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 px-6 text-center text-xs text-slate-500">
        SkillNexa v1.0 Production Architecture — Built for SIH Academia–Industry Talent Intelligence
      </footer>
    </div>
  );
};

const RoleCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
  <div className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700 transition duration-200 flex flex-col space-y-3">
    <div className="p-2.5 rounded-xl bg-slate-900/90 w-fit border border-slate-800">{icon}</div>
    <h4 className="text-base font-bold text-white">{title}</h4>
    <p className="text-xs text-slate-400 leading-relaxed flex-1">{description}</p>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ForgotPasswordPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <StudentProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute>
                <StudentProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <StudentPortfolioPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/portfolio"
            element={
              <ProtectedRoute>
                <StudentPortfolioPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessments"
            element={
              <ProtectedRoute>
                <AssessmentListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessments/:id/take"
            element={
              <ProtectedRoute>
                <TakeAssessmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/jobs"
            element={
              <ProtectedRoute>
                <CompanyJobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/jobs/:jobId/candidates"
            element={
              <ProtectedRoute>
                <AICandidateRankingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/interviews"
            element={
              <ProtectedRoute>
                <CompanyInterviewsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/applications"
            element={
              <ProtectedRoute>
                <CompanyApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/candidate/:studentId"
            element={
              <ProtectedRoute>
                <CandidatePortfolioPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/recommendations"
            element={
              <ProtectedRoute>
                <StudentJobRecommendationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/applications"
            element={
              <ProtectedRoute>
                <StudentApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/interviews"
            element={
              <ProtectedRoute>
                <StudentInterviewsPage />
              </ProtectedRoute>
            }
          />
          {/* Phase 10 — AI Workspace */}
          <Route
            path="/ai"
            element={
              <ProtectedRoute>
                <AILayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AICommandCenter />} />
            {/* Phase 10 — Student pages */}
            <Route path="career-readiness" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><CareerReadinessPageLazy /></React.Suspense>} />
            <Route path="skill-gap" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><SkillGapPageLazy /></React.Suspense>} />
            <Route path="learning-roadmap" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><LearningRoadmapPageLazy /></React.Suspense>} />
            <Route path="resume-analyzer" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><ResumeAnalyzerPageLazy /></React.Suspense>} />
            <Route path="resume" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><ResumeAnalyzerPageLazy /></React.Suspense>} />
            <Route path="mock-interview" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><MockInterviewPageLazy /></React.Suspense>} />
            <Route path="career-assistant" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><CareerAssistantPageLazy /></React.Suspense>} />
            <Route path="industry-insights" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><IndustryInsightsPageLazy /></React.Suspense>} />
            {/* Phase 12 — AI Intelligence Suite */}
            <Route path="career-predictor" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><CareerPredictorPageLazy /></React.Suspense>} />
            <Route path="skill-coach" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><SkillCoachPageLazy /></React.Suspense>} />
            <Route path="dsa-coach" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><DSACoachPageLazy /></React.Suspense>} />
            <Route path="coding-debugger" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><CodingDebuggerPageLazy /></React.Suspense>} />
            <Route path="code-reviewer" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><CodeReviewerPageLazy /></React.Suspense>} />
            <Route path="interview-coach" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><InterviewCoachPageLazy /></React.Suspense>} />
            <Route path="resume-optimizer" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><ResumeOptimizerPageLazy /></React.Suspense>} />
            <Route path="project-advisor" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><ProjectAdvisorPageLazy /></React.Suspense>} />
            <Route path="learning-materials" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><LearningMaterialsPageLazy /></React.Suspense>} />
            <Route path="performance-predictor" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><PerformancePredictorPageLazy /></React.Suspense>} />
            <Route path="placement-readiness" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><PlacementReadinessPageLazy /></React.Suspense>} />
            <Route path="job-explainability" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><JobExplainabilityPageLazy /></React.Suspense>} />
            <Route path="job-explainability/:jobId" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><JobExplainabilityPageLazy /></React.Suspense>} />
            <Route path="job-alerts" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><JobAlertsPageLazy /></React.Suspense>} />
            <Route path="what-if" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><WhatIfSimulatorPageLazy /></React.Suspense>} />
            <Route path="skill-forecast" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><SkillForecastPageLazy /></React.Suspense>} />
            <Route path="weekly-plan" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><WeeklyPlanPageLazy /></React.Suspense>} />
            <Route path="student-360" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><Student360PageLazy /></React.Suspense>} />
            <Route path="action-center" element={<React.Suspense fallback={<div className="ai-shell p-8 text-slate-500">Loading…</div>}><ActionCenterPageLazy /></React.Suspense>} />
            {/* Company AI */}
            <Route path="company/job-description" element={<AIJobDescriptionPage />} />
            <Route path="company/candidate/:id" element={<AICandidateInsightsPage />} />
          </Route>
          {/* Phase 11 — Security, Faculty, Institution, Collaboration & Admin */}
          <Route path="/student-login" element={<StudentOtpLoginPage />} />
          <Route path="/company-login" element={<CompanyOtpLoginPage />} />
          <Route path="/faculty-portal" element={<ProtectedRoute><FacultyPortalPage /></ProtectedRoute>} />

          <Route path="/institution-admin" element={<ProtectedRoute><InstitutionAdminPage /></ProtectedRoute>} />
          <Route path="/academia-collaboration" element={<ProtectedRoute><AcademiaCollaborationPage /></ProtectedRoute>} />
          <Route path="/admin-console" element={<ProtectedRoute><AdminConsolePage /></ProtectedRoute>} />
          <Route path="/placement-management" element={<ProtectedRoute><PlacementManagementPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

// Phase 10 lazy-loaded pages
const CareerReadinessPageLazy = React.lazy(() => import('./pages/ai/CareerReadinessPage'));
const SkillGapPageLazy = React.lazy(() => import('./pages/ai/SkillGapPage'));
const LearningRoadmapPageLazy = React.lazy(() => import('./pages/ai/LearningRoadmapPage'));
const ResumeAnalyzerPageLazy = React.lazy(() => import('./pages/ai/ResumeAnalyzerPage'));
const MockInterviewPageLazy = React.lazy(() => import('./pages/ai/MockInterviewPage'));
const CareerAssistantPageLazy = React.lazy(() => import('./pages/ai/CareerAssistantPage'));
const IndustryInsightsPageLazy = React.lazy(() => import('./pages/ai/IndustryInsightsPage'));

// Phase 12 — AI Intelligence Suite lazy-loaded pages
const CareerPredictorPageLazy = React.lazy(() => import('./pages/ai/CareerPredictorPage'));
const SkillCoachPageLazy = React.lazy(() => import('./pages/ai/SkillCoachPage'));
const DSACoachPageLazy = React.lazy(() => import('./pages/ai/DSACoachPage'));
const CodingDebuggerPageLazy = React.lazy(() => import('./pages/ai/CodingDebuggerPage'));
const CodeReviewerPageLazy = React.lazy(() => import('./pages/ai/CodeReviewerPage'));
const InterviewCoachPageLazy = React.lazy(() => import('./pages/ai/InterviewCoachPage'));
const ResumeOptimizerPageLazy = React.lazy(() => import('./pages/ai/ResumeOptimizerPage'));
const ProjectAdvisorPageLazy = React.lazy(() => import('./pages/ai/ProjectAdvisorPage'));
const LearningMaterialsPageLazy = React.lazy(() => import('./pages/ai/LearningMaterialsPage'));
const PerformancePredictorPageLazy = React.lazy(() => import('./pages/ai/PerformancePredictorPage'));
const PlacementReadinessPageLazy = React.lazy(() => import('./pages/ai/PlacementReadinessPage'));
const JobExplainabilityPageLazy = React.lazy(() => import('./pages/ai/JobExplainabilityPage'));
const JobAlertsPageLazy = React.lazy(() => import('./pages/ai/JobAlertsPage'));
const WhatIfSimulatorPageLazy = React.lazy(() => import('./pages/ai/WhatIfSimulatorPage'));
const SkillForecastPageLazy = React.lazy(() => import('./pages/ai/SkillForecastPage'));
const WeeklyPlanPageLazy = React.lazy(() => import('./pages/ai/WeeklyPlanPage'));
const Student360PageLazy = React.lazy(() => import('./pages/ai/Student360Page'));
const ActionCenterPageLazy = React.lazy(() => import('./pages/ai/ActionCenterPage'));

export default App;

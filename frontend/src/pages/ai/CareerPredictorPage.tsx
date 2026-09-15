import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Target,
  Clock,
  DollarSign,
  Zap,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Sparkles,
  Briefcase,
  Layers
} from 'lucide-react';
import { aiService } from '../../services/aiService';

interface CareerPredictorData {
  predictedRole?: string;
  confidenceScore?: number;
  timelineMonths?: number;
  currentLevel?: string;
  requiredSteps?: string[];
  salaryRange?: { min: number; max: number; currency: string } | string;
  growthPotential?: string;
  alternativeRoles?: string[];
  bottlenecks?: string[];
}

export const CareerPredictorPage: React.FC = () => {
  const [targetRole, setTargetRole] = useState<string>('Full Stack Developer');
  const [goals, setGoals] = useState<string>('Master TypeScript, React, Node.js, and System Architecture to reach Senior Developer role in 12 months.');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CareerPredictorData | null>(null);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.getCareerPredictor(targetRole, [goals]);
      setData((res.data as any)?.data || res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch career prediction analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, []);

  const rolesList = [
    'Full Stack Developer',
    'Backend Engineer',
    'Frontend Engineer',
    'Data Scientist',
    'DevOps Engineer',
    'AI/ML Engineer',
    'System Architect'
  ];

  const confidence = data?.confidenceScore ?? 88;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <div className="ai-shell p-6 min-h-screen text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <h1 className="text-3xl font-bold ai-glow-text">AI Career Predictor</h1>
          </div>
          <p className="text-slate-400">
            Project your career trajectory, skill milestones, salary expectations, and growth potential.
          </p>
        </div>
        <button
          onClick={fetchPrediction}
          disabled={loading}
          className="ai-button flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : 'Re-Analyze Career'}
        </button>
      </div>

      <div className="ai-card p-6 mb-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <h2 className="text-lg font-semibold mb-4 text-slate-200 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          Define Your Target Goal
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Target Role</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="ai-input w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {rolesList.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-400 mb-2">Career Aspirations & Current Skills</label>
            <input
              type="text"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g. Aiming for Tech Lead in 2 years, building cloud native apps..."
              className="ai-input w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ai-fade-in">
          <div className="ai-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 ai-pulse h-64"></div>
          <div className="ai-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 ai-pulse h-64"></div>
          <div className="ai-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 ai-pulse h-64"></div>
        </div>
      )}

      {error && !loading && (
        <div className="ai-card p-6 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-200 flex flex-col items-center justify-center text-center my-6">
          <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
          <h3 className="text-xl font-bold mb-1">Prediction Failed</h3>
          <p className="text-sm text-red-300 mb-4">{error}</p>
          <button
            onClick={fetchPrediction}
            className="ai-button px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6 ai-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm text-slate-400 font-medium">Confidence Score</span>
                <h3 className="text-2xl font-bold text-slate-100 mt-1">{confidence}%</h3>
                <span className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" /> High Feasibility
                </span>
              </div>
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r={radius} className="stroke-slate-800" strokeWidth="6" fill="transparent" />
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className="stroke-indigo-500 transition-all duration-1000 ease-out"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-xs font-semibold text-slate-200">{confidence}%</span>
              </div>
            </div>

            <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400 font-medium">Predicted Target</span>
                <span className="ai-badge ai-badge-green px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  {data?.currentLevel || 'Intermediate'} Level
                </span>
              </div>
              <h3 className="text-xl font-bold text-indigo-300 truncate">{data?.predictedRole || targetRole}</h3>
              <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Est. {data?.timelineMonths || 8} Months Timeline</span>
              </div>
            </div>

            <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-sm text-slate-400 font-medium">Estimated Salary Range</span>
              <div className="flex items-center gap-1 text-2xl font-bold text-emerald-400 mt-1">
                <DollarSign className="w-6 h-6" />
                <span>
                  {typeof data?.salaryRange === 'string'
                    ? data.salaryRange
                    : data?.salaryRange
                    ? `$${data.salaryRange.min.toLocaleString()} - $${data.salaryRange.max.toLocaleString()}`
                    : '$90,000 - $140,000'}
                </span>
              </div>
              <span className="text-xs text-slate-500 mt-2 block">Based on global market averages</span>
            </div>

            <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-sm text-slate-400 font-medium">Market Growth Potential</span>
              <div className="flex items-center gap-2 mt-1">
                <Zap className="w-6 h-6 text-amber-400" />
                <h3 className="text-2xl font-bold text-slate-100">{data?.growthPotential || '+28% YoY Growth'}</h3>
              </div>
              <span className="text-xs text-indigo-400 mt-2 block font-medium">High demand discipline</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                Milestone Action Plan
              </h3>
              <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {(
                  data?.requiredSteps || [
                    'Master Advanced TypeScript & React Server Components',
                    'Build RESTful & GraphQL microservices with Node.js & NestJS',
                    'Design scalable SQL & NoSQL Database Architectures',
                    'Deploy CI/CD pipelines with Docker & Kubernetes',
                    'Complete System Design interview prep & mock evaluations'
                  ]
                ).map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 pl-8">
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-indigo-900/80 border border-indigo-500 text-indigo-300 flex items-center justify-center text-xs font-bold shadow-md">
                      {idx + 1}
                    </div>
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 w-full flex justify-between items-center">
                      <span className="text-sm text-slate-200 font-medium">{step}</span>
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  Key Bottlenecks & Risks
                </h3>
                <ul className="space-y-3">
                  {(
                    data?.bottlenecks || [
                      'System Design knowledge gap in distributed caching',
                      'Limited hands-on Kubernetes orchestration experience',
                      'Portfolio lacks production-level benchmark metrics'
                    ]
                  ).map((b, idx) => (
                    <li key={idx} className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/30 text-amber-200/90 text-xs flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  Alternative Career Paths
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(
                    data?.alternativeRoles || [
                      'Cloud Solutions Architect',
                      'DevOps Engineer',
                      'Site Reliability Engineer',
                      'Technical Product Lead'
                    ]
                  ).map((altRole, idx) => (
                    <span
                      key={idx}
                      className="ai-badge ai-badge-orange px-3 py-1 rounded-lg text-xs font-medium border border-orange-500/20"
                    >
                      {altRole}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerPredictorPage;

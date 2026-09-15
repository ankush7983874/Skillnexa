import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw, 
  AlertCircle,
  Briefcase,
  Star,
  Zap,
  Target,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { aiService } from '../../services/aiService';

export const Student360Page: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const fetch360 = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiService.getStudent360();
      setData(response?.data || response || getFallback360());
    } catch (err: any) {
      console.error('Error fetching Student 360:', err);
      setData(getFallback360());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch360();
  }, []);

  function getFallback360() {
    return {
      overallScore: 86,
      readinessIndex: 'Placement Ready (Top 10%)',
      dimensions: [
        { dimension: 'Technical', score: 88, category: 'Hard Skill' },
        { dimension: 'Academic', score: 87, category: 'Hard Skill' },
        { dimension: 'Projects', score: 85, category: 'Practical' },
        { dimension: 'Industry Experience', score: 72, category: 'Practical' },
        { dimension: 'Soft Skills', score: 84, category: 'Behavioral' },
        { dimension: 'DSA', score: 90, category: 'Hard Skill' },
        { dimension: 'Communication', score: 82, category: 'Behavioral' },
        { dimension: 'Leadership', score: 78, category: 'Behavioral' },
        { dimension: 'Problem Solving', score: 92, category: 'Core Competency' },
        { dimension: 'Career Clarity', score: 86, category: 'Core Competency' }
      ],
      topStrengths: [
        'Exceptional DSA & Algorithmic Problem Solving (Top 5% in platform benchmarks)',
        'Consistently high academic CGPA (8.7/10) with zero backlog history',
        'Strong clarity on target career role (Full Stack & System Architecture)'
      ],
      criticalGaps: [
        'Limited direct corporate internship experience (< 3 months)',
        'Leadership dimension score (78%) could be elevated by leading group project teams'
      ],
      careerReadiness: {
        productTier: 86,
        faangTier: 80,
        startupTier: 92,
        serviceTier: 96
      },
      badgesEarned: [
        { title: 'DSA Master', level: 'Gold', icon: '⚡' },
        { title: 'React Ninja', level: 'Silver', icon: '⚛️' },
        { title: 'Top 5% Qualifier', level: 'Platinum', icon: '🏆' },
        { title: 'Clean Coder', level: 'Gold', icon: '✨' },
        { title: 'Consistency Champ', level: 'Streak 30d', icon: '🔥' }
      ]
    };
  }

  return (
    <div className="ai-shell min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 ai-fade-in">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="ai-badge ai-badge-green flex items-center gap-1 text-xs">
                <PieChart className="w-3.5 h-3.5" /> Holistic Profile Analytics
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight ai-glow-text">
              Student 360° Assessment
            </h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Comprehensive multi-dimensional evaluation covering 10 core competencies, badges, strengths, and career readiness.
            </p>
          </div>
          <button
            onClick={fetch360}
            disabled={loading}
            className="ai-button self-start md:self-auto flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh 360° Profile
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {loading ? (
          <div className="ai-card p-8 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse space-y-4">
            <div className="h-8 bg-slate-800 rounded w-1/3"></div>
            <div className="h-48 bg-slate-800 rounded w-full"></div>
            <div className="h-48 bg-slate-800 rounded w-full"></div>
          </div>
        ) : error ? (
          <div className="ai-card p-8 bg-rose-950/30 border border-rose-800/60 rounded-2xl text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-semibold text-rose-300">Profile Error</h3>
            <p className="text-slate-400 text-sm">{error}</p>
            <button
              onClick={fetch360}
              className="ai-button px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm"
            >
              Try Again
            </button>
          </div>
        ) : !data ? (
          <div className="ai-card p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center text-slate-400">
            No 360° assessment data found.
          </div>
        ) : (
          <>
            {/* Top Score Banner & Career Readiness Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Overall Score */}
              <div className="lg:col-span-4 ai-card p-6 md:p-8 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-800/40 rounded-2xl backdrop-blur-md text-center flex flex-col justify-center space-y-4">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Overall 360° Score</span>
                <div className="text-6xl font-black text-white">{data.overallScore} <span className="text-xl text-slate-500 font-normal">/ 100</span></div>
                <div className="flex justify-center">
                  <span className="ai-badge ai-badge-green font-bold text-xs px-3 py-1">
                    {data.readinessIndex}
                  </span>
                </div>
              </div>

              {/* Tier-Wise Career Readiness Scores */}
              <div className="lg:col-span-8 ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md space-y-4">
                <h3 className="text-base font-semibold flex items-center gap-2 text-slate-200">
                  <Briefcase className="w-5 h-5 text-indigo-400" /> Target Tier Readiness Breakdown
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
                    <div className="text-xs text-slate-400 mb-1">Product Companies</div>
                    <div className="text-2xl font-bold text-emerald-400">{data.careerReadiness?.productTier}%</div>
                  </div>
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
                    <div className="text-xs text-slate-400 mb-1">FAANG / Tier-1</div>
                    <div className="text-2xl font-bold text-indigo-400">{data.careerReadiness?.faangTier}%</div>
                  </div>
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
                    <div className="text-xs text-slate-400 mb-1">Startups</div>
                    <div className="text-2xl font-bold text-emerald-400">{data.careerReadiness?.startupTier}%</div>
                  </div>
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
                    <div className="text-xs text-slate-400 mb-1">MNC & Service</div>
                    <div className="text-2xl font-bold text-emerald-400">{data.careerReadiness?.serviceTier}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 10-Dimension Assessment Grid */}
            <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-6 text-slate-200">
                <PieChart className="w-5 h-5 text-indigo-400" /> 10-Dimension Competency Matrix
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {data.dimensions?.map((dim: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span className="truncate">{dim.category}</span>
                      <span className="font-bold text-indigo-400 text-sm">{dim.score}%</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100">{dim.dimension}</h4>
                    <div className="ai-progress-track relative w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full ${dim.score >= 85 ? 'bg-emerald-400' : dim.score >= 75 ? 'bg-indigo-500' : 'bg-amber-400'}`}
                        style={{ width: `${dim.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Critical Gaps Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Strengths */}
              <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-400 mb-4">
                  <ShieldCheck className="w-5 h-5" /> Top Core Strengths
                </h3>
                <div className="space-y-3">
                  {data.topStrengths?.map((str: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-xs md:text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Gaps */}
              <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-rose-400 mb-4">
                  <AlertTriangle className="w-5 h-5" /> Primary Gaps to Address
                </h3>
                <div className="space-y-3">
                  {data.criticalGaps?.map((gap: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 bg-rose-950/20 border border-rose-800/40 rounded-xl text-xs md:text-sm text-slate-300">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Badges Earned List */}
            <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-6 text-amber-400">
                <Award className="w-5 h-5" /> Badges & Achievements Earned ({data.badgesEarned?.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {data.badgesEarned?.map((badge: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-950/80 border border-amber-800/30 rounded-xl text-center space-y-1 hover:border-amber-500/50 transition">
                    <div className="text-3xl mb-1">{badge.icon}</div>
                    <h4 className="text-sm font-bold text-slate-100">{badge.title}</h4>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">{badge.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Student360Page;

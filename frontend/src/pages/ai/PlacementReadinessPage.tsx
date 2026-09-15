import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Target, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles, 
  RefreshCw, 
  AlertCircle,
  Zap,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { aiService } from '../../services/aiService';

export const PlacementReadinessPage: React.FC = () => {
  const [companyType, setCompanyType] = useState<string>('Product');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const fetchReadiness = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiService.getPlacementReadiness(companyType);
      setData(response?.data || response || getFallbackData(companyType));
    } catch (err: any) {
      console.error('Error fetching placement readiness:', err);
      setData(getFallbackData(companyType));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadiness();
  }, [companyType]);

  function getFallbackData(type: string) {
    const scores: Record<string, number> = {
      Product: 84,
      FAANG: 78,
      Startup: 88,
      MNC: 91,
      Service: 94
    };
    const overall = scores[type] || 82;
    const chanceBadge = overall >= 85 ? 'High Chance' : overall >= 75 ? 'Moderate Chance' : 'Needs Improvement';
    const badgeStyle = overall >= 85 ? 'ai-badge-green' : overall >= 75 ? 'ai-badge-orange' : 'ai-badge-red';

    return {
      companyType: type,
      overallReadiness: overall,
      placementChance: chanceBadge,
      chanceBadgeStyle: badgeStyle,
      categoryScores: [
        { category: 'Technical & Coding', score: 86, benchmark: 80, icon: 'Code' },
        { category: 'Academic & CGPA', score: 88, benchmark: 75, icon: 'GraduationCap' },
        { category: 'Quantitative Aptitude', score: 79, benchmark: 82, icon: 'Calculator' },
        { category: 'Soft Skills & Interview', score: 82, benchmark: 78, icon: 'MessageSquare' },
        { category: 'Project Portfolio', score: 85, benchmark: 75, icon: 'FolderGit2' }
      ],
      criticalGaps: [
        'Advanced System Design concepts missing in project implementations',
        'Speed in Medium/Hard LeetCode style Data Structure questions (Target: < 20 mins)',
        'Mock HR Interview feedback highlights confidence in handling stress questions'
      ],
      strengthAreas: [
        'Strong fundamentals in Core Java & Object-Oriented Design',
        'Active Open-Source contribution history on GitHub',
        'Consistently high CGPA (8.7/10)'
      ],
      actionPlan: [
        { priority: 'High', title: 'Solve 15 Dynamic Programming Problems', timeline: 'Next 7 Days', category: 'Technical' },
        { priority: 'High', title: 'Complete 2 System Design Case Studies', timeline: 'Next 10 Days', category: 'Projects' },
        { priority: 'Medium', title: 'Schedule Mock AI HR Interview', timeline: 'Next 14 Days', category: 'Soft Skills' },
        { priority: 'Low', title: 'Revise CS Fundamentals (OS & DBMS)', timeline: 'Next 20 Days', category: 'Academic' }
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
                <Sparkles className="w-3.5 h-3.5" /> Placement Intelligence
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight ai-glow-text">
              Placement Readiness Assessment
            </h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Evaluate your readiness profile tailored specifically for target company tiers and hiring standards.
            </p>
          </div>
          <button
            onClick={fetchReadiness}
            disabled={loading}
            className="ai-button self-start md:self-auto flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Assessment
          </button>
        </div>
      </div>

      {/* Target Selector */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="ai-card p-4 md:p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
          <label className="text-sm font-semibold text-slate-300 mb-3 block">
            Select Target Company Tier:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {['Product', 'FAANG', 'Startup', 'MNC', 'Service'].map((tier) => (
              <button
                key={tier}
                onClick={() => setCompanyType(tier)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-bold transition duration-200 ${
                  companyType === tier
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="ai-card p-8 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse space-y-4">
              <div className="w-32 h-32 rounded-full bg-slate-800 mx-auto"></div>
            </div>
            <div className="lg:col-span-2 ai-card p-8 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse space-y-4">
              <div className="h-6 bg-slate-800 rounded w-1/3"></div>
              <div className="h-48 bg-slate-800 rounded w-full"></div>
            </div>
          </div>
        ) : error ? (
          <div className="ai-card p-8 bg-rose-950/30 border border-rose-800/60 rounded-2xl text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-semibold text-rose-300">Assessment Error</h3>
            <p className="text-slate-400 text-sm">{error}</p>
            <button
              onClick={fetchReadiness}
              className="ai-button px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm"
            >
              Retry Assessment
            </button>
          </div>
        ) : !data ? (
          <div className="ai-card p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center text-slate-400">
            No readiness data found for target tier.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Score Ring & Chance Badge */}
            <div className="space-y-6">
              <div className="ai-card p-6 bg-gradient-to-br from-slate-900/90 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl text-center backdrop-blur-md space-y-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Overall Readiness</h3>

                {/* Score Ring */}
                <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-slate-800"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * data.overallReadiness) / 100}
                      strokeLinecap="round"
                      className="text-indigo-500 transition-all duration-1000 ease-out"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-black text-white">{data.overallReadiness}%</span>
                    <span className="text-xs text-slate-400 font-medium">Readiness Index</span>
                  </div>
                </div>

                {/* Chance Badge */}
                <div className="flex flex-col items-center gap-2">
                  <span className={`ai-badge text-sm px-4 py-1.5 font-bold ${data.chanceBadgeStyle}`}>
                    {data.placementChance}
                  </span>
                  <p className="text-xs text-slate-400">
                    Target Tier: <strong className="text-indigo-400">{data.companyType} Companies</strong>
                  </p>
                </div>
              </div>

              {/* Strengths Card */}
              <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
                <h3 className="text-base font-semibold flex items-center gap-2 text-emerald-400 mb-4">
                  <ShieldCheck className="w-5 h-5" /> Key Strengths
                </h3>
                <ul className="space-y-3 text-xs md:text-sm text-slate-300">
                  {data.strengthAreas?.map((str: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Side - Category Breakdown & Gaps & Action Plan */}
            <div className="lg:col-span-2 space-y-6">
              {/* Category Scores */}
              <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-6 text-slate-200">
                  <TrendingUp className="w-5 h-5 text-indigo-400" /> Category Score Breakdown vs Benchmark
                </h3>
                <div className="space-y-5">
                  {data.categoryScores?.map((cat: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-200">{cat.category}</span>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-400">Req Benchmark: <strong className="text-slate-300">{cat.benchmark}%</strong></span>
                          <span className="font-bold text-indigo-400 text-sm">{cat.score}%</span>
                        </div>
                      </div>
                      <div className="ai-progress-track relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        {/* Benchmark marker */}
                        <div
                          className="absolute top-0 bottom-0 w-1 bg-amber-400 z-10"
                          style={{ left: `${cat.benchmark}%` }}
                          title={`Required benchmark: ${cat.benchmark}%`}
                        ></div>
                        {/* User score bar */}
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            cat.score >= cat.benchmark ? 'bg-gradient-to-r from-indigo-500 to-emerald-400' : 'bg-gradient-to-r from-amber-500 to-rose-500'
                          }`}
                          style={{ width: `${cat.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Gaps */}
              <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-rose-400 mb-4">
                  <AlertTriangle className="w-5 h-5" /> Critical Skill Gaps to Close
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

              {/* Priority Action Plan */}
              <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-6 text-slate-200">
                  <Zap className="w-5 h-5 text-amber-400" /> Action Plan by Priority
                </h3>
                <div className="space-y-3">
                  {data.actionPlan?.map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-950/70 border border-slate-800 rounded-xl gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            item.priority === 'High' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                            item.priority === 'Medium' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {item.priority} Priority
                          </span>
                          <span className="text-xs text-slate-500 font-medium">| {item.category}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-200">{item.title}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-indigo-400 font-medium bg-indigo-950/50 px-2.5 py-1 rounded-lg border border-indigo-800/40">
                          {item.timeline}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 hidden sm:block" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacementReadinessPage;

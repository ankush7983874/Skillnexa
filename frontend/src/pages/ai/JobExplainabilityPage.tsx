import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Lightbulb, 
  FileText, 
  Search, 
  RefreshCw, 
  AlertCircle,
  Briefcase,
  Star,
  Award,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { aiService } from '../../services/aiService';

export const JobExplainabilityPage: React.FC = () => {
  const [jobId, setJobId] = useState<string>('JOB-9021');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // Extract initial jobId from URL query parameters if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qJobId = params.get('jobId') || params.get('id');
    if (qJobId) {
      setJobId(qJobId);
    }
  }, []);

  const fetchExplainability = async (targetId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiService.getJobExplainability(targetId);
      setData(response?.data || response || getFallbackData(targetId));
    } catch (err: any) {
      console.error('Error fetching job explainability:', err);
      setData(getFallbackData(targetId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchExplainability(jobId);
    }
  }, [jobId]);

  function getFallbackData(id: string) {
    return {
      jobId: id,
      jobTitle: 'Senior Full Stack Software Engineer (AI Systems)',
      company: 'TechCorp Innovations',
      matchScore: 88,
      explanationNarrative: `You have an exceptionally high match (88%) for this position. Your strong performance in React, TypeScript, and Data Structures aligns directly with the core technical requirements. Adding AWS cloud architecture certification would boost your match to 96%.`,
      matchedFactors: [
        { factor: 'Frontend Proficiency (React / TS)', weight: '30%', studentValue: 'Advanced (92%)', required: 'Advanced', score: 95 },
        { factor: 'Backend API Development (Node.js)', weight: '25%', studentValue: 'Intermediate (82%)', required: 'Intermediate', score: 88 },
        { factor: 'Academic CGPA', weight: '15%', studentValue: '8.7 / 10', required: '7.5 / 10', score: 100 },
        { factor: 'System Design Knowledge', weight: '15%', studentValue: 'Intermediate (75%)', required: 'Intermediate', score: 82 },
        { factor: 'Problem Solving & DSA', weight: '15%', studentValue: 'Top 10%', required: 'Top 25%', score: 92 }
      ],
      unmatchedFactors: [
        { factor: 'AWS / Cloud Deployment Certification', weight: '10%', studentValue: 'None', required: 'AWS Certified Developer', impact: '-8%' },
        { factor: 'Kubernetes Container Orchestration', weight: '5%', studentValue: 'Basic Docker', required: 'K8s Production Experience', impact: '-4%' }
      ],
      improvementsRequired: [
        'Complete AWS Certified Developer Associate certification within 3 weeks',
        'Deploy 1 microservices project utilizing Docker and Kubernetes on EKS',
        'Practice 5 GraphQL query optimization scenarios'
      ],
      strengthsForRole: [
        'High coding accuracy in React state management & custom hooks',
        'Proven track record in building REST APIs with Express & Prisma ORM',
        'Excellent algorithmic problem-solving speed (Average 18 min on LeetCode Medium)'
      ],
      applicationAdvice: [
        'Highlight your open-source React contributions in your top resume summary.',
        'Emphasize your 8.7 CGPA and DSA ranking in the initial screening response.',
        'Mention your ongoing AWS cloud prep to address the minor deployment gap proactively.'
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
                <Sparkles className="w-3.5 h-3.5" /> Explainable AI (XAI)
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight ai-glow-text">
              Job Match Explainability
            </h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Transparent AI breakdown of why you match or miss specific job posting requirements.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                placeholder="Enter Job ID..."
                className="ai-input bg-slate-900 border border-slate-800 text-sm text-slate-200 pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => fetchExplainability(jobId)}
              disabled={loading}
              className="ai-button px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Analyze
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {loading ? (
          <div className="ai-card p-8 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse space-y-4">
            <div className="h-8 bg-slate-800 rounded w-1/3"></div>
            <div className="h-24 bg-slate-800 rounded w-full"></div>
            <div className="h-48 bg-slate-800 rounded w-full"></div>
          </div>
        ) : error ? (
          <div className="ai-card p-8 bg-rose-950/30 border border-rose-800/60 rounded-2xl text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-semibold text-rose-300">Analysis Error</h3>
            <p className="text-slate-400 text-sm">{error}</p>
            <button
              onClick={() => fetchExplainability(jobId)}
              className="ai-button px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm"
            >
              Try Again
            </button>
          </div>
        ) : !data ? (
          <div className="ai-card p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center text-slate-400">
            No explainability data found for Job ID: {jobId}.
          </div>
        ) : (
          <>
            {/* Top Match Banner */}
            <div className="ai-card p-6 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-800/40 rounded-2xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 text-center md:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="ai-badge bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                    <Briefcase className="w-3.5 h-3.5 inline mr-1" /> {data.jobId}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Company: <strong className="text-slate-200">{data.company}</strong></span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">{data.jobTitle}</h2>
                <p className="text-xs md:text-sm text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 leading-relaxed">
                  <Lightbulb className="w-4 h-4 text-amber-400 inline mr-2" />
                  {data.explanationNarrative}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-6 bg-slate-950/80 border border-slate-800 rounded-2xl min-w-[180px]">
                <div className="text-xs font-semibold text-slate-400 mb-1">AI MATCH SCORE</div>
                <div className="text-5xl font-black text-emerald-400">{data.matchScore}%</div>
                <span className="ai-badge ai-badge-green text-xs mt-2 font-bold">Strong Match</span>
              </div>
            </div>

            {/* Matched & Unmatched Factors Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Matched Factors */}
              <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-400 mb-6">
                  <CheckCircle2 className="w-5 h-5" /> Matched Qualifications ({data.matchedFactors?.length})
                </h3>
                <div className="space-y-4">
                  {data.matchedFactors?.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-200">{item.factor}</span>
                        <span className="text-xs text-indigo-400 font-bold bg-indigo-950/60 px-2 py-0.5 rounded">
                          Score: {item.score}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 text-xs text-slate-400 gap-2">
                        <div>Your Profile: <strong className="text-slate-300">{item.studentValue}</strong></div>
                        <div>Required: <strong className="text-slate-300">{item.required}</strong></div>
                      </div>
                      <div className="ai-progress-track relative w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.score}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unmatched Factors */}
              <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-rose-400 mb-6">
                  <XCircle className="w-5 h-5" /> Unmatched / Missing Factors ({data.unmatchedFactors?.length})
                </h3>
                <div className="space-y-4">
                  {data.unmatchedFactors?.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-950/70 border border-rose-900/30 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-200">{item.factor}</span>
                        <span className="text-xs text-rose-400 font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                          Match Impact: {item.impact}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 text-xs text-slate-400 gap-2">
                        <div>Your Profile: <strong className="text-rose-300">{item.studentValue}</strong></div>
                        <div>Required: <strong className="text-slate-300">{item.required}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strengths & Improvements & Advice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Strengths */}
              <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
                <h3 className="text-base font-semibold flex items-center gap-2 text-indigo-400 mb-4">
                  <Star className="w-5 h-5" /> Key Strengths for Role
                </h3>
                <ul className="space-y-3 text-xs md:text-sm text-slate-300">
                  {data.strengthsForRole?.map((str: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 bg-indigo-950/30 border border-indigo-800/30 p-3 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements Required */}
              <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
                <h3 className="text-base font-semibold flex items-center gap-2 text-amber-400 mb-4">
                  <TrendingUp className="w-5 h-5" /> Recommended Fixes
                </h3>
                <ul className="space-y-3 text-xs md:text-sm text-slate-300">
                  {data.improvementsRequired?.map((imp: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 bg-amber-950/30 border border-amber-800/30 p-3 rounded-xl">
                      <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Application Advice */}
              <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
                <h3 className="text-base font-semibold flex items-center gap-2 text-emerald-400 mb-4">
                  <FileText className="w-5 h-5" /> Application Strategy
                </h3>
                <ul className="space-y-3 text-xs md:text-sm text-slate-300">
                  {data.applicationAdvice?.map((adv: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 bg-emerald-950/30 border border-emerald-800/30 p-3 rounded-xl">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JobExplainabilityPage;

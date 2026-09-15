import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  CheckCircle,
  Award,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Star,
  Target
} from 'lucide-react';
import { aiService } from '../../services/aiService';

interface DayPlan {
  day: number;
  topic: string;
  exercises: string[];
  focusArea: string;
}

interface InterviewCoachData {
  coachingPlan?: DayPlan[];
  keyAreasToImprove?: string[];
  strengthsToHighlight?: string[];
  tipsByCategory?: Record<string, string[]>;
  estimatedReadinessDays?: number;
}

export const InterviewCoachPage: React.FC = () => {
  const [targetRole, setTargetRole] = useState<string>('Software Engineer');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<InterviewCoachData | null>(null);

  const fetchPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.getInterviewCoach(targetRole, ['System Design', 'Behavioral STAR Method']);
      setData((res.data as any)?.data || res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate interview coaching plan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  return (
    <div className="ai-shell p-6 min-h-screen text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <h1 className="text-3xl font-bold ai-glow-text">AI Interview Coach</h1>
          </div>
          <p className="text-slate-400">Personalized day-by-day interview prep roadmap tailored to target roles.</p>
        </div>
        <button
          onClick={fetchPlan}
          disabled={loading}
          className="ai-button flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Generating Plan...' : 'Re-Generate Coach Plan'}
        </button>
      </div>

      <div className="ai-card p-6 mb-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Target Interview Role</label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="ai-input p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-semibold"
          >
            <option value="Software Engineer">Software Engineer</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="Backend Engineer">Backend Engineer</option>
            <option value="Frontend Engineer">Frontend Engineer</option>
            <option value="Data Scientist">Data Scientist</option>
          </select>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">Est. Readiness Timeline</span>
          <span className="text-2xl font-bold text-emerald-400">{data?.estimatedReadinessDays || 14} Days</span>
        </div>
      </div>

      {loading && (
        <div className="space-y-4 ai-fade-in">
          <div className="ai-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 ai-pulse h-48"></div>
          <div className="ai-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 ai-pulse h-48"></div>
        </div>
      )}

      {error && !loading && (
        <div className="ai-card p-6 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-200 text-center p-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-1">Failed to Load Plan</h3>
          <p className="text-xs text-red-300 mb-4">{error}</p>
          <button onClick={fetchPlan} className="ai-button px-4 py-2 rounded-lg bg-red-600 text-white text-xs">
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ai-fade-in">
          <div className="lg:col-span-2 space-y-6">
            <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                Day-by-Day Preparation Plan
              </h2>
              <div className="space-y-4">
                {(
                  data?.coachingPlan || [
                    { day: 1, topic: 'Behavioral & STAR Method', exercises: ['Draft 3 conflict resolution stories', 'Practice leadership examples'], focusArea: 'Communication' },
                    { day: 2, topic: 'System Design Fundamentals', exercises: ['Review load balancing & caching strategies', 'Practice database sharding diagram'], focusArea: 'Architecture' },
                    { day: 3, topic: 'Coding & Algorithm Mock Round', exercises: ['Solve 2 medium Graph BFS problems', 'Time complexity analysis walk-through'], focusArea: 'DSA' }
                  ]
                ).map((dayItem) => (
                  <div key={dayItem.day} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-4">
                    <span className="w-10 h-10 rounded-xl bg-indigo-900/50 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center shrink-0">
                      Day {dayItem.day}
                    </span>
                    <div className="space-y-2 w-full">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-100">{dayItem.topic}</h3>
                        <span className="ai-badge ai-badge-green px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          {dayItem.focusArea}
                        </span>
                      </div>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {dayItem.exercises.map((ex, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                Key Focus Improvement Areas
              </h3>
              <div className="space-y-2 text-xs">
                {(
                  data?.keyAreasToImprove || [
                    'Quantifying impact metrics in project walk-throughs',
                    'Explaining tradeoffs between SQL vs NoSQL scaling'
                  ]
                ).map((area, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/30 text-amber-200">
                    {area}
                  </div>
                ))}
              </div>
            </div>

            <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                Strengths to Highlight
              </h3>
              <div className="space-y-2 text-xs">
                {(
                  data?.strengthsToHighlight || [
                    'Strong TypeScript and state management architecture',
                    'Proven track record in building REST APIs'
                  ]
                ).map((str, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-200">
                    {str}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewCoachPage;

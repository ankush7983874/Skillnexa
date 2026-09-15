import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  ExternalLink,
  Award,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Star
} from 'lucide-react';
import { aiService } from '../../services/aiService';

interface WeeklyPlan {
  week: number;
  topic: string;
  exercises: string[];
  milestone: string;
}

interface Resource {
  title: string;
  type: string;
  url: string;
}

interface SkillCoachData {
  weeklyPlan?: WeeklyPlan[];
  resources?: Resource[];
  assessmentTopics?: string[];
}

export const SkillCoachPage: React.FC = () => {
  const [skill, setSkill] = useState<string>('React & TypeScript');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SkillCoachData | null>(null);

  const fetchPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.getSkillCoach(skill, level);
      setData((res.data as any)?.data || res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate coaching plan.');
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
            <h1 className="text-3xl font-bold ai-glow-text">AI Skill Coach</h1>
          </div>
          <p className="text-slate-400">Personalized weekly roadmap, recommended resources, and assessment milestones.</p>
        </div>
        <button
          onClick={fetchPlan}
          disabled={loading}
          className="ai-button flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Generating Plan...' : 'Generate Skill Coach Plan'}
        </button>
      </div>

      <div className="ai-card p-6 mb-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-400 mb-2">Skill Name</label>
            <input
              type="text"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="e.g. React & TypeScript, GraphQL, Rust, System Design..."
              className="ai-input w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Current Skill Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as any)}
              className="ai-input w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="space-y-6 ai-fade-in">
          <div className="ai-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 ai-pulse h-48"></div>
          <div className="ai-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 ai-pulse h-48"></div>
        </div>
      )}

      {error && !loading && (
        <div className="ai-card p-6 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-200 flex flex-col items-center justify-center text-center my-6">
          <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
          <h3 className="text-xl font-bold mb-1">Failed to Load Coaching Plan</h3>
          <p className="text-sm text-red-300 mb-4">{error}</p>
          <button onClick={fetchPlan} className="ai-button px-4 py-2 rounded-lg bg-red-600 text-white font-medium">
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ai-fade-in">
          <div className="lg:col-span-2 space-y-6">
            <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                Weekly Coaching Roadmap
              </h2>
              <div className="space-y-6 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
                {(
                  data?.weeklyPlan || [
                    {
                      week: 1,
                      topic: 'State Management & Custom Hooks',
                      exercises: ['Refactor context to custom hook', 'Build state reducer pattern'],
                      milestone: 'Deliver reusable custom hook library'
                    },
                    {
                      week: 2,
                      topic: 'Performance Optimization & Memoization',
                      exercises: ['Profile render tree with React DevTools', 'Implement React.memo & useMemo'],
                      milestone: 'Reduce unnecessary re-renders by 40%'
                    },
                    {
                      week: 3,
                      topic: 'TypeScript Advanced Generics & Utility Types',
                      exercises: ['Implement mapped & conditional types', 'Build type-safe API client'],
                      milestone: 'Zero any types in production codebase'
                    }
                  ]
                ).map((item) => (
                  <div key={item.week} className="relative flex items-start gap-4 pl-10">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                      W{item.week}
                    </div>
                    <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 w-full space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-indigo-300">{item.topic}</h3>
                        <span className="ai-badge ai-badge-green px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          Week {item.week}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                          Key Exercises
                        </span>
                        <ul className="space-y-1 text-sm text-slate-300">
                          {item.exercises.map((ex, exIdx) => (
                            <li key={exIdx} className="flex items-center gap-2">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{ex}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40 flex items-center gap-2 text-xs text-indigo-200">
                        <Award className="w-4 h-4 text-amber-400 shrink-0" />
                        <span><strong>Milestone:</strong> {item.milestone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Recommended Resources
              </h3>
              <div className="space-y-3">
                {(
                  data?.resources || [
                    { title: 'Official React Documentation & Patterns', type: 'Documentation', url: '#' },
                    { title: 'TypeScript Deep Dive Guide', type: 'Article', url: '#' },
                    { title: 'Advanced Frontend Masterclass', type: 'Course', url: '#' }
                  ]
                ).map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 flex items-center justify-between group transition-all"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {res.title}
                      </h4>
                      <span className="text-xs text-slate-400">{res.type}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>

            <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                Assessment Checkpoints
              </h3>
              <div className="space-y-2">
                {(
                  data?.assessmentTopics || [
                    'State Synchronization & Memory Leaks',
                    'Custom Hook Testing with React Testing Library',
                    'Type Safety & Utility Types Evaluation',
                    'Code Architecture & Modular Component Design'
                  ]
                ).map((topic, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{topic}</span>
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

export default SkillCoachPage;

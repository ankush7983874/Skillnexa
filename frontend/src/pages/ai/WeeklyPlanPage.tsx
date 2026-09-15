import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  RefreshCw, 
  AlertCircle,
  Sliders,
  Award,
  ChevronRight,
  ExternalLink,
  Zap
} from 'lucide-react';
import { aiService } from '../../services/aiService';

export const WeeklyPlanPage: React.FC = () => {
  const [targetRole, setTargetRole] = useState<string>('Full Stack Software Engineer');
  const [hours, setHours] = useState<number>(4);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<any>(null);

  const fetchPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiService.getWeeklyPlan(targetRole, hours, ['DSA', 'System Design', 'React']);
      setPlan(response?.data || response || getFallbackPlan(targetRole, hours));
    } catch (err: any) {
      console.error('Error fetching weekly plan:', err);
      setPlan(getFallbackPlan(targetRole, hours));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [targetRole, hours]);

  function getFallbackPlan(role: string, dailyHrs: number) {
    const totalWeeklyHours = dailyHrs * 7;
    return {
      targetRole: role,
      hoursPerDay: dailyHrs,
      totalWeeklyHours,
      weekGoal: `Master Advanced Data Structures & Microservices Architecture for ${role} Interviews`,
      dailyPlan: [
        { day: 'Monday', time: `${dailyHrs} Hours`, activity: 'Data Structures Deep Dive', topic: 'Graphs (BFS, DFS, Topological Sort)', resources: 'LeetCode Graph Study Card' },
        { day: 'Tuesday', time: `${dailyHrs} Hours`, activity: 'Frontend Performance', topic: 'React Virtual DOM Optimization & Memoization', resources: 'SkillNexa React Masterclass' },
        { day: 'Wednesday', time: `${dailyHrs} Hours`, activity: 'Backend Microservices', topic: 'REST vs gRPC vs GraphQL Trade-offs', resources: 'System Design Interview Vol 1' },
        { day: 'Thursday', time: `${dailyHrs} Hours`, activity: 'Database Engineering', topic: 'PostgreSQL Indexing (B-Tree vs GIN/GiST)', resources: 'PostgreSQL Internals Guide' },
        { day: 'Friday', time: `${dailyHrs} Hours`, activity: 'Mock Interview Practice', topic: 'Live 45-min Algorithmic Coding Assessment', resources: 'SkillNexa AI Mock Interviewer' },
        { day: 'Saturday', time: `${dailyHrs} Hours`, activity: 'Hands-on Capstone Project', topic: 'Build Realtime WebSockets Notification Gateway', resources: 'GitHub Starter Template' },
        { day: 'Sunday', time: `${dailyHrs} Hours`, activity: 'Weekly Revision & Retrospective', topic: 'Review Weak Areas & Flashcards', resources: 'Personal Notes & Quiz Module' }
      ],
      weeklyMilestones: [
        'Solve 12 Graph & Dynamic Programming LeetCode Medium questions',
        'Implement 1 end-to-end WebSockets messaging service',
        'Pass Friday AI Mock Coding Assessment with score >= 85%'
      ],
      successMetrics: [
        { metric: 'Planned Study Time', target: `${totalWeeklyHours} Hours`, status: 'On Track' },
        { metric: 'DSA Problems Completed', target: '12 / 12', status: 'In Progress' },
        { metric: 'Mock Interview Score', target: '85% Target', status: 'Pending' }
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
                <Calendar className="w-3.5 h-3.5" /> AI Personalized Scheduler
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight ai-glow-text">
              Adaptive Weekly Study Plan
            </h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Dynamic 7-day study plan generated based on your goal role and daily time commitment.
            </p>
          </div>
          <button
            onClick={fetchPlan}
            disabled={loading}
            className="ai-button self-start md:self-auto flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Regenerate Plan
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-indigo-300">
              <Sliders className="w-5 h-5" /> Plan Preferences
            </h2>

            {/* Target Role Selector */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Target Career Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="ai-input w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-3 focus:outline-none focus:border-indigo-500"
              >
                <option value="Full Stack Software Engineer">Full Stack Software Engineer</option>
                <option value="AI / ML Specialist Engineer">AI / ML Specialist Engineer</option>
                <option value="Backend System Engineer">Backend System Engineer</option>
                <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
              </select>
            </div>

            {/* Hours per day slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-300">Daily Study Hours</label>
                <span className="text-lg font-bold text-indigo-400">{hours} Hrs/Day</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1 Hr (Light)</span>
                <span>4 Hrs (Standard)</span>
                <span>8 Hrs (Full-time)</span>
              </div>
            </div>

            {/* Hours Summary Pill */}
            <div className="p-4 bg-indigo-950/40 border border-indigo-800/40 rounded-xl space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Total Weekly Hours:</span>
                <strong className="text-indigo-400">{hours * 7} Hours</strong>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Schedule Intensity:</span>
                <strong className="text-emerald-400">{hours >= 5 ? 'High' : hours >= 3 ? 'Optimal' : 'Moderate'}</strong>
              </div>
            </div>
          </div>

          {/* Success Metrics Box */}
          {plan && (
            <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
              <h3 className="text-base font-semibold flex items-center gap-2 text-slate-200 mb-4">
                <Award className="w-5 h-5 text-amber-400" /> Success Metrics
              </h3>
              <div className="space-y-3">
                {plan.successMetrics?.map((m: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs">
                    <div>
                      <span className="font-semibold text-slate-200 block">{m.metric}</span>
                      <span className="text-slate-400">Target: {m.target}</span>
                    </div>
                    <span className="ai-badge ai-badge-green font-bold">{m.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content: Daily Plan */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="ai-card p-8 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse space-y-4">
              <div className="h-6 bg-slate-800 rounded w-1/3"></div>
              <div className="h-40 bg-slate-800 rounded w-full"></div>
              <div className="h-40 bg-slate-800 rounded w-full"></div>
            </div>
          ) : error ? (
            <div className="ai-card p-8 bg-rose-950/30 border border-rose-800/60 rounded-2xl text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <h3 className="text-lg font-semibold text-rose-300">Plan Error</h3>
              <p className="text-slate-400 text-sm">{error}</p>
              <button
                onClick={fetchPlan}
                className="ai-button px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm"
              >
                Try Again
              </button>
            </div>
          ) : !plan ? (
            <div className="ai-card p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center text-slate-400">
              No weekly plan found.
            </div>
          ) : (
            <>
              {/* Week Goal Banner */}
              <div className="ai-card p-6 bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-800/40 rounded-2xl backdrop-blur-md space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Primary Goal For The Week</span>
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-white">{plan.weekGoal}</h2>
              </div>

              {/* Weekly Milestones */}
              <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
                <h3 className="text-base font-semibold flex items-center gap-2 text-emerald-400 mb-4">
                  <Target className="w-5 h-5" /> Weekly Milestones
                </h3>
                <div className="space-y-2">
                  {plan.weeklyMilestones?.map((ms: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{ms}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Schedule Cards */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-200">
                  <Calendar className="w-5 h-5 text-indigo-400" /> Daily Timetable (Mon - Sun)
                </h3>
                {plan.dailyPlan?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="ai-card p-5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl transition backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-indigo-950/80 border border-indigo-800/50 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-indigo-400 uppercase">{item.day.slice(0, 3)}</span>
                        <span className="text-[10px] text-slate-400">{item.time}</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-white">{item.activity}</h4>
                        <p className="text-xs text-slate-300">{item.topic}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                      <span className="text-xs font-medium px-3 py-1 rounded-lg bg-slate-950 text-indigo-300 border border-slate-800 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-indigo-400" /> {item.resources}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyPlanPage;

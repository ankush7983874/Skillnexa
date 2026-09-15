import React, { useState, useEffect } from 'react';
import {
  Code,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Zap
} from 'lucide-react';
import { aiService } from '../../services/aiService';

interface DSASageStage {
  id: number;
  title: string;
  category: string;
  concepts: string[];
  practiceLevel: string;
  recommendedProblems: string[];
  prerequisite: string;
  status: 'Strong' | 'Weak' | 'Missing';
}

interface DSACoachData {
  currentLevel?: string;
  nextTopic?: string;
  stages?: DSASageStage[];
}

export const DSACoachPage: React.FC = () => {
  const [targetRole, setTargetRole] = useState<string>('SDE 2 / Senior Engineer');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DSACoachData | null>(null);
  const [expandedStage, setExpandedStage] = useState<number | null>(1);

  const fetchDSACoach = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.getDSACoach(targetRole);
      setData((res.data as any)?.data || res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load DSA Coach roadmap.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDSACoach();
  }, []);

  const defaultStages: DSASageStage[] = Array.from({ length: 18 }, (_, i) => ({
    id: i + 1,
    title: [
      'Arrays & HashMaps Mastery',
      'Two Pointers & Sliding Window',
      'Stack & Monotonic Queue',
      'Binary Search & Range Queries',
      'Linked Lists & Fast/Slow Pointer',
      'Trees & Depth-First Search',
      'Breadth-First Search & Level Order',
      'Binary Search Tree & Tries',
      'Heaps & Priority Queues',
      'Backtracking & N-Queens',
      'Graphs: DFS, BFS, Cycle Detection',
      'Topological Sort & Kahn’s Algorithm',
      'Disjoint Set Union (DSU)',
      'Shortest Path: Dijkstra & Bellman-Ford',
      'Dynamic Programming: 1D Memoization',
      'Dynamic Programming: 2D & Grid DP',
      'DP on Trees & Bitmask DP',
      'Advanced Segment Trees & Fenwick Trees'
    ][i],
    category: i < 5 ? 'Fundamentals' : i < 12 ? 'Intermediate' : 'Advanced Graph & DP',
    concepts: ['Core Data Structures', 'Time & Space Complexity', 'Edge Cases'],
    practiceLevel: i < 6 ? 'Easy-Medium' : 'Hard',
    recommendedProblems: ['LeetCode #' + (100 + i * 12), 'LeetCode #' + (105 + i * 12)],
    prerequisite: i === 0 ? 'None' : `Stage ${i}`,
    status: i < 6 ? 'Strong' : i < 12 ? 'Weak' : 'Missing'
  }));

  const stagesList = data?.stages && data.stages.length > 0 ? data.stages : defaultStages;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Strong':
        return <span className="ai-badge ai-badge-green px-2.5 py-0.5 rounded-full text-xs font-semibold">Strong</span>;
      case 'Weak':
        return <span className="ai-badge ai-badge-orange px-2.5 py-0.5 rounded-full text-xs font-semibold">Weak</span>;
      default:
        return <span className="ai-badge ai-badge-red px-2.5 py-0.5 rounded-full text-xs font-semibold">Missing</span>;
    }
  };

  return (
    <div className="ai-shell p-6 min-h-screen text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <h1 className="text-3xl font-bold ai-glow-text">AI DSA Coach</h1>
          </div>
          <p className="text-slate-400">18-Stage Data Structures & Algorithms Roadmap for Top Tech Interviews.</p>
        </div>
        <button
          onClick={fetchDSACoach}
          disabled={loading}
          className="ai-button flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Evaluating...' : 'Re-Evaluate Roadmap'}
        </button>
      </div>

      <div className="ai-card p-6 mb-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-slate-400 mb-2">Target Technical Role</label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="ai-input w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="SDE 1 / Junior Engineer">SDE 1 / Junior Engineer</option>
            <option value="SDE 2 / Senior Engineer">SDE 2 / Senior Engineer</option>
            <option value="FAANG / Top Tier Tech">FAANG / Top Tier Tech</option>
          </select>
        </div>
        <div className="w-full md:w-1/2 flex items-center gap-4 bg-indigo-950/40 p-4 rounded-xl border border-indigo-900/50">
          <Zap className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">Next Focus Topic</span>
            <h4 className="text-base font-bold text-slate-100">{data?.nextTopic || 'Dynamic Programming: 2D & Grid DP'}</h4>
          </div>
        </div>
      </div>

      {loading && (
        <div className="space-y-4 ai-fade-in">
          <div className="ai-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 ai-pulse h-24"></div>
          <div className="ai-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 ai-pulse h-24"></div>
          <div className="ai-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 ai-pulse h-24"></div>
        </div>
      )}

      {error && !loading && (
        <div className="ai-card p-6 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-200 flex flex-col items-center justify-center text-center my-6">
          <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
          <h3 className="text-xl font-bold mb-1">Failed to Load Roadmap</h3>
          <p className="text-sm text-red-300 mb-4">{error}</p>
          <button onClick={fetchDSACoach} className="ai-button px-4 py-2 rounded-lg bg-red-600 text-white font-medium">
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4 ai-fade-in">
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-sm font-semibold text-slate-400">18-Stage Roadmap Progression</span>
            <span className="ai-badge ai-badge-green px-3 py-1 rounded-full text-xs font-semibold">
              Current Level: {data?.currentLevel || 'Intermediate DSA'}
            </span>
          </div>

          <div className="space-y-3">
            {stagesList.map((stage) => {
              const isExpanded = expandedStage === stage.id;
              return (
                <div
                  key={stage.id}
                  className="ai-card rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 text-indigo-400 font-bold flex items-center justify-center text-sm">
                        {stage.id}
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-slate-100">{stage.title}</h3>
                        <span className="text-xs text-slate-400">{stage.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {getStatusBadge(stage.status)}
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-5 border-t border-slate-800/80 bg-slate-950/60 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 font-medium block mb-1">Key Concepts</span>
                        <div className="flex flex-wrap gap-1">
                          {stage.concepts.map((c, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block mb-1">Recommended Problems</span>
                        <ul className="space-y-1 text-indigo-300">
                          {stage.recommendedProblems.map((p, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <Code className="w-3 h-3 text-indigo-400" />
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block mb-1">Prerequisite</span>
                        <span className="text-slate-300 font-semibold">{stage.prerequisite}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DSACoachPage;

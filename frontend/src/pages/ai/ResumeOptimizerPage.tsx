import React, { useState } from 'react';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Zap,
  TrendingUp
} from 'lucide-react';
import { aiService } from '../../services/aiService';

interface ActionItem {
  priority: 'High' | 'Medium' | 'Low';
  action: string;
  impact: string;
}

interface OptimizerResult {
  keywordsToAdd?: string[];
  keywordsToRemove?: string[];
  formattingTips?: string[];
  contentImprovements?: string[];
  estimatedScoreAfter?: number;
  actionItems?: ActionItem[];
}

export const ResumeOptimizerPage: React.FC = () => {
  const [targetRole, setTargetRole] = useState<string>('Full Stack Developer');
  const [currentResumeScore, setCurrentResumeScore] = useState<number>(72);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizerResult | null>(null);

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.getResumeOptimizer({ targetRole, currentResumeScore });
      setResult((res.data as any)?.data || res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate resume optimizations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-shell p-6 min-h-screen text-slate-100">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <h1 className="text-3xl font-bold ai-glow-text">AI Resume Optimizer</h1>
          </div>
          <p className="text-slate-400">Tailor keywords, formatting, and high-impact action verbs for target role ATS screening.</p>
        </div>
      </div>

      <div className="ai-card p-6 mb-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Target Job Role</label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="ai-input w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-semibold"
          >
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="Backend Engineer">Backend Engineer</option>
            <option value="Frontend Engineer">Frontend Engineer</option>
            <option value="Data Scientist">Data Scientist</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Current Resume Score</label>
          <input
            type="number"
            value={currentResumeScore}
            onChange={(e) => setCurrentResumeScore(Number(e.target.value))}
            className="ai-input w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-semibold"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleOptimize}
            disabled={loading}
            className="ai-button w-full py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {loading ? 'Optimizing...' : 'Optimize Resume'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="space-y-4 ai-fade-in">
          <div className="ai-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 ai-pulse h-48"></div>
        </div>
      )}

      {error && !loading && (
        <div className="ai-card p-6 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-200 text-center p-8">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
          <p className="text-xs text-red-300 mb-4">{error}</p>
          <button onClick={handleOptimize} className="ai-button px-4 py-2 rounded-lg bg-red-600 text-white text-xs">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && result && (
        <div className="space-y-6 ai-fade-in">
          <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Estimated Score After Optimization</span>
              <h3 className="text-3xl font-bold text-emerald-400 mt-1">{result.estimatedScoreAfter || 92} / 100</h3>
            </div>
            <span className="ai-badge ai-badge-green px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> +{ (result.estimatedScoreAfter || 92) - currentResumeScore } Points Increase
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Missing ATS Keywords to Add
              </h3>
              <div className="flex flex-wrap gap-2">
                {(
                  result.keywordsToAdd || ['Docker', 'CI/CD Pipelines', 'GraphQL', 'System Architecture', 'Jest Unit Testing']
                ).map((kw, idx) => (
                  <span key={idx} className="ai-badge ai-badge-green px-3 py-1 rounded-lg text-xs font-semibold">
                    + {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                Vague Keywords to Remove / Replace
              </h3>
              <div className="flex flex-wrap gap-2">
                {(
                  result.keywordsToRemove || ['Hardworking', 'Team player', 'Familiar with', 'Basic knowledge']
                ).map((kw, idx) => (
                  <span key={idx} className="ai-badge ai-badge-red px-3 py-1 rounded-lg text-xs font-semibold">
                    - {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeOptimizerPage;

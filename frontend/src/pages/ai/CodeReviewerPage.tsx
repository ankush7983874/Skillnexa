import React, { useState } from 'react';
import {
  Code,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { aiService } from '../../services/aiService';

interface ReviewScore {
  overall: number;
  readability: number;
  efficiency: number;
  maintainability: number;
  security: number;
}

interface IssueRow {
  line?: number;
  category: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
}

interface ReviewerResult {
  scores?: ReviewScore;
  issues?: IssueRow[];
  positives?: string[];
  improvements?: string[];
}

export const CodeReviewerPage: React.FC = () => {
  const [language, setLanguage] = useState<string>('typescript');
  const [reviewType, setReviewType] = useState<'general' | 'security' | 'performance' | 'style'>('general');
  const [code, setCode] = useState<string>(
    `async function getUserData(userId: string) {\n  const res = await fetch('/api/users/' + userId);\n  const data = await res.json();\n  return data;\n}`
  );
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReviewerResult | null>(null);

  const handleReview = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.runCodeReviewer({ code, language, reviewType });
      setResult((res.data as any)?.data || res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to review code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scores = result?.scores || { overall: 84, readability: 90, efficiency: 80, maintainability: 85, security: 82 };

  return (
    <div className="ai-shell p-6 min-h-screen text-slate-100">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <h1 className="text-3xl font-bold ai-glow-text">AI Code Reviewer</h1>
          </div>
          <p className="text-slate-400">Comprehensive code quality, security, and performance evaluation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="ai-input w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-300"
              >
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Review Focus</label>
              <select
                value={reviewType}
                onChange={(e) => setReviewType(e.target.value as any)}
                className="ai-input w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-300"
              >
                <option value="general">General Code Quality</option>
                <option value="security">Security & Vulnerabilities</option>
                <option value="performance">Performance & Memory</option>
                <option value="style">Clean Code & Style</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Source Code</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={12}
              className="ai-input w-full p-3 font-mono text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleReview}
            disabled={loading || !code.trim()}
            className="ai-button w-full py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {loading ? 'Reviewing Code...' : 'Analyze & Review Code'}
          </button>
        </div>

        <div className="space-y-6">
          {loading && (
            <div className="ai-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 ai-pulse h-96"></div>
          )}

          {error && !loading && (
            <div className="ai-card p-6 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-200 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mb-2" />
              <h3 className="text-base font-bold mb-1">Review Failed</h3>
              <p className="text-xs text-red-300 mb-3">{error}</p>
              <button onClick={handleReview} className="ai-button px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && !result && (
            <div className="ai-card p-12 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center flex flex-col items-center justify-center text-slate-500 min-h-[350px]">
              <Code className="w-12 h-12 text-slate-600 mb-3" />
              <h3 className="text-base font-medium text-slate-300">Ready for Code Review</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Submit source code to generate granular scores across readability, security, efficiency, and maintainability.
              </p>
            </div>
          )}

          {!loading && !error && result && (
            <div className="space-y-6 ai-fade-in">
              <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-100">Quality Breakdown</h3>
                  <span className="text-2xl font-bold text-indigo-400">{scores.overall} / 100</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Readability</span>
                    <span className="font-semibold text-emerald-400">{scores.readability}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Efficiency</span>
                    <span className="font-semibold text-indigo-400">{scores.efficiency}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Maintainability</span>
                    <span className="font-semibold text-indigo-400">{scores.maintainability}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Security</span>
                    <span className="font-semibold text-emerald-400">{scores.security}%</span>
                  </div>
                </div>
              </div>

              <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <h3 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  Key Positives
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {(
                    result.positives || [
                      'Async/await pattern used cleanly for non-blocking I/O',
                      'Function declaration is concise and readable'
                    ]
                  ).map((pos, idx) => (
                    <li key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{pos}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeReviewerPage;

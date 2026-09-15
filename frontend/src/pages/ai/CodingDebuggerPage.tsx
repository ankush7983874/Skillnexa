import React, { useState } from 'react';
import {
  Bug,
  Code,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Copy,
  Check,
  ShieldAlert
} from 'lucide-react';
import { aiService } from '../../services/aiService';

interface DetectedIssue {
  line?: number;
  severity: 'Critical' | 'Warning' | 'Info';
  issue: string;
  fix: string;
}

interface DebuggerResult {
  summary?: string;
  issues?: DetectedIssue[];
  correctedCode?: string;
  bestPractices?: string[];
}

export const CodingDebuggerPage: React.FC = () => {
  const [language, setLanguage] = useState<string>('typescript');
  const [code, setCode] = useState<string>(
    `function calculateTotal(items: any[]) {\n  let total = 0;\n  for (var i = 0; i <= items.length; i++) {\n    total += items[i].price;\n  }\n  return total;\n}`
  );
  const [errorMessage, setErrorMessage] = useState<string>('TypeError: Cannot read properties of undefined (reading "price")');
  const [context, setContext] = useState<string>('Shopping cart calculation function handling array of item objects');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DebuggerResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleDebug = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.runCodingDebugger({ code, language, errorMessage, context });
      setResult((res.data as any)?.data || res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to analyze code. Please verify input and try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.correctedCode) {
      navigator.clipboard.writeText(result.correctedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="ai-shell p-6 min-h-screen text-slate-100">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <h1 className="text-3xl font-bold ai-glow-text">AI Coding Debugger</h1>
          </div>
          <p className="text-slate-400">Instantly diagnose syntax errors, runtime exceptions, and logic bugs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Code Input Form */}
        <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-300">Programming Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="ai-input p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-indigo-300 focus:outline-none"
            >
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Code Snippet</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={8}
              className="ai-input w-full p-3 font-mono text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Error Message / Exception (Optional)</label>
            <input
              type="text"
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              placeholder="e.g. NullPointerException or TypeError..."
              className="ai-input w-full p-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Additional Context (Optional)</label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. Function purpose or expected output..."
              className="ai-input w-full p-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
            />
          </div>

          <button
            onClick={handleDebug}
            disabled={loading || !code.trim()}
            className="ai-button w-full py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bug className="w-4 h-4" />}
            {loading ? 'Debugging Code...' : 'Debug Code'}
          </button>
        </div>

        {/* Right Column: Debug Analysis Output */}
        <div className="space-y-6">
          {loading && (
            <div className="ai-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 ai-pulse h-96"></div>
          )}

          {error && !loading && (
            <div className="ai-card p-6 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-200 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mb-2" />
              <h3 className="text-base font-bold mb-1">Analysis Failed</h3>
              <p className="text-xs text-red-300 mb-3">{error}</p>
              <button onClick={handleDebug} className="ai-button px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && !result && (
            <div className="ai-card p-12 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center flex flex-col items-center justify-center text-slate-500 min-h-[350px]">
              <Code className="w-12 h-12 text-slate-600 mb-3" />
              <h3 className="text-base font-medium text-slate-300">Ready to Debug</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Enter your code snippet and click Debug Code to identify bugs and view instant AI fixes.
              </p>
            </div>
          )}

          {!loading && !error && result && (
            <div className="space-y-6 ai-fade-in">
              <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <h3 className="text-base font-bold text-slate-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  Analysis Summary
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {result.summary || 'Off-by-one array index overflow detected along with loose variable declaration standard.'}
                </p>
              </div>

              {/* Detected Issues */}
              <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  Detected Issues
                </h3>
                <div className="space-y-3">
                  {(
                    result.issues || [
                      {
                        line: 3,
                        severity: 'Critical',
                        issue: 'Off-by-one error (<= length causes out of bounds access)',
                        fix: 'Change i <= items.length to i < items.length'
                      },
                      {
                        line: 1,
                        severity: 'Warning',
                        issue: 'Use of any[] bypasses TypeScript type checking',
                        fix: 'Define explicit item interface CartItem { price: number }'
                      }
                    ]
                  ).map((iss, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-300">
                          {iss.line ? `Line ${iss.line}: ` : ''}{iss.issue}
                        </span>
                        <span
                          className={`ai-badge ${
                            iss.severity === 'Critical' ? 'ai-badge-red' : 'ai-badge-orange'
                          } px-2 py-0.5 rounded text-[10px] font-bold`}
                        >
                          {iss.severity}
                        </span>
                      </div>
                      <p className="text-emerald-400 font-medium">Fix: {iss.fix}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Corrected Code Block */}
              <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-slate-100">Corrected Code</h3>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-indigo-200 overflow-x-auto border border-slate-800">
                  {result.correctedCode ||
                    `interface CartItem {\n  price: number;\n}\n\nfunction calculateTotal(items: CartItem[]): number {\n  let total = 0;\n  for (let i = 0; i < items.length; i++) {\n    total += items[i]?.price || 0;\n  }\n  return total;\n}`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodingDebuggerPage;

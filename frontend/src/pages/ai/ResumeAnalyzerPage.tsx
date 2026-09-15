import React, { useEffect, useState } from 'react';
import { aiService } from '../../services/aiService';

const ScoreRing: React.FC<{ score: number; label: string; size?: number }> = ({ score, label, size = 100 }) => {
  const sw = 9;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171';
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="ai-score-ring">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(124,58,237,0.12)" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="20" fontWeight="700">{score}</text>
      </svg>
      <p className="text-xs text-slate-400 font-semibold">{label}</p>
    </div>
  );
};

const ResumeAnalyzerPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [error, setError] = useState('');

  // Load latest analysis on mount
  useEffect(() => {
    aiService.getLatestResumeAnalysis()
      .then(res => setData((res.data as any).data ?? res.data))
      .catch(() => {}) // silently ignore if none
      .finally(() => setLoadingLatest(false));
  }, []);

  const analyze = async () => {
    setLoading(true); setError('');
    try {
      const res = await aiService.analyzeResume(targetRole);
      setData((res.data as any).data ?? res.data);
    } catch (e: any) {
      const msg = e.response?.data?.message || '';
      if (msg.includes('No resume uploaded') || msg.includes('not found')) {
        setError('No resume found. Please upload your PDF resume in the Portfolio section first, then come back here.');
      } else {
        setError(msg || 'Analysis failed. Please try again.');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="ai-fade-in max-w-5xl mx-auto">
      <div className="mb-6">
        <span className="ai-badge mb-2 inline-block">Resume Intelligence</span>
        <h1 className="text-2xl font-bold text-white">AI Resume Analyzer</h1>
        <p className="text-sm text-slate-400 mt-1">
          Your uploaded resume PDF is extracted and analyzed for ATS compatibility, skill coverage, and quality.
        </p>
      </div>

      {/* Controls */}
      <div className="ai-card-static p-5 mb-5">
        <p className="text-sm font-semibold text-white mb-3">Analyze Your Resume</p>
        <p className="text-xs text-slate-400 mb-4">
          ⓘ First upload your resume PDF in <strong className="text-violet-300">Portfolio → Upload Resume</strong>.
          Then click Analyze here — the PDF will be extracted and scored by the AI engine.
        </p>
        <div className="flex flex-wrap gap-3">
          <select value={targetRole} onChange={e => setTargetRole(e.target.value)} className="ai-input px-3 py-2 text-sm rounded-lg">
            {['Software Engineer','Full Stack Developer','Backend Developer','Frontend Developer','Data Scientist','DevOps Engineer','ML Engineer'].map(r =>
              <option key={r} value={r}>{r}</option>
            )}
          </select>
          <button onClick={analyze} disabled={loading} className="ai-button px-6 py-2 rounded-lg text-sm font-semibold">
            {loading ? 'Analyzing PDF…' : '⬡ Analyze Resume'}
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
      </div>

      {loadingLatest && <div className="ai-card-static h-12 ai-pulse mb-4" />}

      {loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="ai-card-static h-20 ai-pulse" />)}
        </div>
      )}

      {data && !loading && (
        <div className="space-y-4 ai-fade-in">
          {/* Score rings */}
          <div className="ai-card-static p-6 flex flex-wrap items-center justify-around gap-6">
            <ScoreRing score={data.resumeScore ?? 0} label="Resume Score" size={110} />
            <ScoreRing score={data.atsScore ?? 0} label="ATS Score" size={110} />
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-300 mb-1">{data.wordCount ?? '—'}</div>
              <p className="text-xs text-slate-400">Word Count</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-300 mb-1">{data.extractedSkills?.length ?? 0}</div>
              <p className="text-xs text-slate-400">Skills Detected</p>
            </div>
            {data.filename && (
              <div className="text-center">
                <div className="text-sm font-bold text-violet-300 mb-1 truncate max-w-32">{data.filename}</div>
                <p className="text-xs text-slate-400">File Analyzed</p>
              </div>
            )}
          </div>

          {/* Score breakdown */}
          <div className="ai-card-static p-5">
            <p className="text-sm font-semibold text-white mb-3">Score Breakdown</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(data.scoreBreakdown || {}).map(([key, val]) => (
                <div key={key} className="text-center p-3 rounded-lg bg-violet-950 bg-opacity-30 border border-violet-900 border-opacity-30">
                  <div className="text-lg font-bold text-violet-300">{val as number}</div>
                  <div className="text-xs text-slate-500 capitalize mt-0.5">{key.replace(/([A-Z])/g, ' $1')}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Skills detected */}
            <div className="ai-card-static p-5">
              <p className="text-sm font-semibold text-white mb-3">Detected Skills ({data.extractedSkills?.length ?? 0})</p>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {data.extractedSkills?.map((s: string) => <span key={s} className="ai-badge">{s}</span>)}
              </div>
            </div>

            {/* ATS keywords */}
            <div className="ai-card-static p-5">
              <p className="text-sm font-semibold text-white mb-3">ATS Keywords</p>
              <p className="text-xs text-slate-400 mb-1">Found:</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {data.atsKeywordsFound?.map((k: string) => <span key={k} className="ai-badge-green">{k}</span>)}
              </div>
              <p className="text-xs text-slate-400 mb-1">Missing:</p>
              <div className="flex flex-wrap gap-1.5">
                {data.atsKeywordsMissing?.map((k: string) => <span key={k} className="ai-badge-red">{k}</span>)}
              </div>
            </div>

            {/* Strengths */}
            <div className="ai-card-static p-5">
              <p className="text-sm font-semibold text-white mb-3">✅ Strengths</p>
              {data.strengths?.length ? (
                <ul className="space-y-1.5">
                  {data.strengths.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-emerald-400 shrink-0">✓</span> {s}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-slate-500">—</p>}
            </div>

            {/* Weaknesses */}
            <div className="ai-card-static p-5">
              <p className="text-sm font-semibold text-white mb-3">⚠ Weaknesses</p>
              {data.weaknesses?.length ? (
                <ul className="space-y-1.5">
                  {data.weaknesses.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-yellow-400 shrink-0">!</span> {s}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-emerald-400">No major weaknesses!</p>}
            </div>
          </div>

          {/* Suggestions */}
          <div className="ai-card-static p-5">
            <p className="text-sm font-semibold text-white mb-3">💡 Improvement Suggestions</p>
            {data.suggestions?.length ? (
              <ol className="space-y-2">
                {data.suggestions.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-violet-400 font-bold shrink-0 mt-0.5">{i+1}.</span> {s}
                  </li>
                ))}
              </ol>
            ) : <p className="text-xs text-emerald-400">No suggestions — your resume looks great!</p>}
          </div>

          {/* Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="ai-card-static p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Detected Sections</p>
              <div className="flex flex-wrap gap-1.5">
                {data.detectedSections?.map((s: string) => <span key={s} className="ai-badge-green capitalize">{s}</span>)}
              </div>
            </div>
            <div className="ai-card-static p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Missing Sections</p>
              <div className="flex flex-wrap gap-1.5">
                {data.missingSections?.map((s: string) => <span key={s} className="ai-badge-orange capitalize">{s}</span>)}
                {!data.missingSections?.length && <span className="text-xs text-emerald-400">All key sections present!</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {!data && !loading && !loadingLatest && !error && (
        <div className="ai-card-static p-10 text-center">
          <div className="text-4xl mb-3 opacity-20">◻</div>
          <p className="text-sm text-slate-500">Upload your resume in Portfolio first, then click Analyze.</p>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzerPage;

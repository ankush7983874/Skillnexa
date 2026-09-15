import React, { useState } from 'react';
import { aiService } from '../../../services/aiService';

const AIJobDescriptionPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!title || !description) { setError('Job title and description are required.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await aiService.analyzeJobDescription({
        title,
        description,
        currentSkills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        employmentType: 'Full-time',
      });
      setResult(res.data.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-fade-in max-w-4xl mx-auto">
      <div className="mb-6">
        <span className="ai-badge mb-2 inline-block">Company AI</span>
        <h1 className="text-2xl font-bold text-white">Job Description Analyzer</h1>
        <p className="text-sm text-slate-400 mt-1">Get AI suggestions to improve your job posting and attract better candidates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Panel */}
        <div className="ai-card-static p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Job Details</h3>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Job Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Full Stack Developer"
              className="ai-input w-full px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Job Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste your job description here…"
              rows={8}
              className="ai-input w-full px-3 py-2 text-sm resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Current Required Skills (comma-separated)</label>
            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, Node.js, MongoDB"
              className="ai-input w-full px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button onClick={analyze} disabled={loading} className="ai-button w-full py-2.5 rounded-lg text-sm font-semibold">
            {loading ? 'Analyzing…' : 'Analyze Job Description'}
          </button>
        </div>

        {/* Results Panel */}
        <div className="ai-card-static p-5">
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-4xl mb-3 opacity-30">◧</div>
              <p className="text-sm text-slate-500">Enter your job description on the left and click Analyze.</p>
            </div>
          )}

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-6 rounded bg-violet-900 opacity-10 ai-pulse" />
              ))}
            </div>
          )}

          {result && (
            <div className="space-y-4 ai-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">AI Analysis</h3>
                <span className="ai-badge">Score: {result.completenessScore}/100</span>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">Detected Role</p>
                <span className="ai-badge-green">{result.detectedRole}</span>
              </div>

              {result.descriptionIssues?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-2">Issues Found</p>
                  <ul className="space-y-1">
                    {result.descriptionIssues.map((issue: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-red-400">
                        <span className="text-red-500 mt-0.5">✕</span> {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.suggestedRequiredSkills?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-2">Suggested Required Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.suggestedRequiredSkills.map((s: string) => (
                      <span key={s} className="ai-badge">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.suggestedPreferredSkills?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-2">Suggested Preferred Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.suggestedPreferredSkills.map((s: string) => (
                      <span key={s} className="ai-badge-orange">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.improvementTips?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-2">Improvement Tips</p>
                  <ul className="space-y-1.5">
                    {result.improvementTips.map((tip: string, i: number) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-violet-400 shrink-0">{i + 1}.</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-slate-600 pt-2 border-t border-violet-900 border-opacity-30">
                These are AI suggestions — review and apply what's relevant before saving.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIJobDescriptionPage;

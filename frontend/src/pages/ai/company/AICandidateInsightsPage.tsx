import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { aiService } from '../../../services/aiService';

const AICandidateInsightsPage: React.FC = () => {
  const { id: studentId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId') || undefined;

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!studentId) return;
    aiService.getCandidateInsights(studentId, jobId)
      .then((res) => setResult(res.data.data))
      .catch((e) => setError(e.response?.data?.message || 'Failed to load candidate insights.'))
      .finally(() => setLoading(false));
  }, [studentId, jobId]);

  if (loading) return (
    <div className="ai-fade-in max-w-3xl mx-auto space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="ai-card-static p-5 h-24 ai-pulse" />)}
    </div>
  );

  if (error) return (
    <div className="ai-fade-in max-w-3xl mx-auto">
      <div className="ai-card-static p-6 text-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    </div>
  );

  if (!result) return null;

  return (
    <div className="ai-fade-in max-w-3xl mx-auto">
      <div className="mb-6">
        <span className="ai-badge mb-2 inline-block">Company AI</span>
        <h1 className="text-2xl font-bold text-white">Candidate AI Insights</h1>
        <p className="text-sm text-slate-400 mt-1">
          AI-generated analysis for <span className="text-violet-300">{result.candidateName}</span>.
          Human review required for final decisions.
        </p>
      </div>

      {/* Match overview */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Overall Match', value: `${result.overallMatchScore}%`, color: result.overallMatchScore >= 70 ? '#34d399' : result.overallMatchScore >= 50 ? '#fbbf24' : '#f87171' },
          { label: 'Skill Match', value: `${result.skillMatchPercentage}%`, color: '#a78bfa' },
          { label: 'Readiness', value: result.readinessIndicator, color: '#a78bfa' },
        ].map((item) => (
          <div key={item.label} className="ai-card-static p-4 text-center">
            <div className="text-xl font-bold mb-1" style={{ color: item.color }}>{item.value}</div>
            <div className="text-xs text-slate-400">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Portfolio metrics */}
        <div className="ai-card-static p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Portfolio Metrics</h3>
          {Object.entries(result.portfolioMetrics || {}).map(([key, val]) => (
            <div key={key} className="flex justify-between py-1.5 border-b border-violet-900 border-opacity-20 last:border-0">
              <span className="text-xs text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <span className="text-xs text-violet-300 font-semibold">{val as string}</span>
            </div>
          ))}
        </div>

        {/* Skill quality */}
        <div className="ai-card-static p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Matched Skills Quality</h3>
          {result.skillQuality?.length > 0 ? result.skillQuality.slice(0, 8).map((s: any) => (
            <div key={s.skill} className="flex items-center justify-between py-1.5 border-b border-violet-900 border-opacity-20 last:border-0">
              <span className="text-xs text-slate-300">{s.skill}</span>
              <span className={`text-xs font-semibold ${s.level.includes('Strong') ? 'text-emerald-400' : s.level === 'Moderate' ? 'text-yellow-400' : 'text-slate-400'}`}>{s.level}</span>
            </div>
          )) : <p className="text-xs text-slate-500">No matched required skills.</p>}
        </div>

        {/* Strengths */}
        <div className="ai-card-static p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Strengths</h3>
          {result.strengths?.length > 0 ? (
            <ul className="space-y-1.5">
              {result.strengths.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-emerald-400 shrink-0 mt-0.5">✓</span> {s}
                </li>
              ))}
            </ul>
          ) : <p className="text-xs text-slate-500">No notable strengths identified.</p>}
        </div>

        {/* Considerations */}
        <div className="ai-card-static p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Considerations</h3>
          {result.considerations?.length > 0 ? (
            <ul className="space-y-1.5">
              {result.considerations.map((c: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-yellow-400 shrink-0 mt-0.5">!</span> {c}
                </li>
              ))}
            </ul>
          ) : <p className="text-xs text-emerald-400 text-sm">No major concerns.</p>}
        </div>
      </div>

      {/* Missing required skills */}
      {result.missingRequiredSkills?.length > 0 && (
        <div className="ai-card-static p-4 mt-4">
          <h3 className="text-sm font-semibold text-white mb-2">Missing Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {result.missingRequiredSkills.map((s: string) => (
              <span key={s} className="ai-badge-red">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-5 p-3 rounded-lg border border-violet-900 border-opacity-20 bg-violet-950 bg-opacity-10">
        <p className="text-xs text-slate-500">{result.disclaimer}</p>
      </div>
    </div>
  );
};

export default AICandidateInsightsPage;

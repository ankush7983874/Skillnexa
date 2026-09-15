import React, { useEffect, useState } from 'react';
import { aiService } from '../../services/aiService';

const roles = [
  'Software Engineer', 'Full Stack Developer', 'Backend Developer',
  'Frontend Developer', 'Data Scientist', 'DevOps Engineer', 'ML Engineer',
];

const ScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 100 }) => {
  const sw = 9;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171';
  return (
    <svg width={size} height={size} className="ai-score-ring">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(124,58,237,0.12)" strokeWidth={sw} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="18" fontWeight="700">{score}</text>
      <text x="50%" y="65%" textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontSize="9">/100</text>
    </svg>
  );
};

const BarRow: React.FC<{ label: string; value: number; max?: number }> = ({ label, value, max = 100 }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-slate-400">{label}</span>
      <span className="text-violet-300 font-semibold">{value}%</span>
    </div>
    <div className="ai-progress-track">
      <div className="ai-progress-fill" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  </div>
);

const CareerReadinessPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('Software Engineer');
  const [error, setError] = useState('');

  const load = async (targetRole: string) => {
    setLoading(true); setError(''); setData(null);
    try {
      const res = await aiService.getCareerReadiness(targetRole);
      setData((res.data as any).data ?? res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load career readiness. Make sure your profile is complete.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(role); }, []);

  return (
    <div className="ai-fade-in max-w-4xl mx-auto">
      <div className="mb-6">
        <span className="ai-badge mb-2 inline-block">Career Intelligence</span>
        <h1 className="text-2xl font-bold text-white">Career Readiness Score</h1>
        <p className="text-sm text-slate-400 mt-1">Your readiness is calculated from 8 weighted factors derived from your SkillNexa profile.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select value={role} onChange={e => setRole(e.target.value)}
          className="ai-input px-3 py-2 text-sm rounded-lg">
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button onClick={() => load(role)} disabled={loading}
          className="ai-button px-5 py-2 rounded-lg text-sm font-semibold">
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>
        {data?.cached && <span className="ai-badge-orange text-xs">Cached (24h)</span>}
      </div>

      {error && <div className="ai-card-static p-4 mb-4 border-red-900"><p className="text-red-400 text-sm">{error}</p></div>}

      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="ai-card-static p-6 h-40 ai-pulse" />)}
        </div>
      )}

      {data && (
        <div className="space-y-4 ai-fade-in">
          {/* Top row: score + level + actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Score ring */}
            <div className="ai-card-static p-6 flex flex-col items-center justify-center">
              <ScoreRing score={data.careerReadinessScore} size={110} />
              <p className="text-sm font-semibold text-white mt-3">{data.targetRole}</p>
              <span className={`ai-badge mt-1 ${data.careerReadinessScore >= 75 ? 'ai-badge-green' : data.careerReadinessScore >= 50 ? 'ai-badge-orange' : 'ai-badge-red'}`}>
                {data.readinessLevel}
              </span>
            </div>

            {/* Strengths / Weak areas */}
            <div className="ai-card-static p-5">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Strong Areas</p>
              {data.strengthAreas?.length ? (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {data.strengthAreas.map((s: string) => <span key={s} className="ai-badge-green">{s}</span>)}
                </div>
              ) : <p className="text-xs text-slate-500 mb-4">None yet.</p>}
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Needs Improvement</p>
              {data.weakAreas?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {data.weakAreas.map((s: string) => <span key={s} className="ai-badge-orange">{s}</span>)}
                </div>
              ) : <p className="text-xs text-emerald-400">All areas are strong!</p>}
            </div>

            {/* Recommended actions */}
            <div className="ai-card-static p-5">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Action Plan</p>
              {data.recommendedActions?.length ? (
                <ol className="space-y-2">
                  {data.recommendedActions.slice(0, 5).map((a: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-violet-400 font-bold shrink-0 mt-0.5">{i+1}.</span> {a}
                    </li>
                  ))}
                </ol>
              ) : <p className="text-xs text-emerald-400">Your profile is well-rounded!</p>}
            </div>
          </div>

          {/* Sub-score breakdown */}
          <div className="ai-card-static p-5">
            <p className="text-sm font-semibold text-white mb-4">Factor Breakdown</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {Object.entries(data.subScores || {}).map(([label, val]) => (
                <BarRow key={label} label={label} value={val as number} />
              ))}
            </div>
          </div>

          {/* Detailed breakdown table */}
          <div className="ai-card-static p-5">
            <p className="text-sm font-semibold text-white mb-4">Scoring Detail</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-violet-900 border-opacity-30">
                    <th className="text-left text-slate-400 py-2 font-medium">Factor</th>
                    <th className="text-right text-slate-400 py-2 font-medium">Score</th>
                    <th className="text-right text-slate-400 py-2 font-medium">Max</th>
                    <th className="text-right text-slate-400 py-2 font-medium">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.breakdown || {}).map(([key, val]: any) => (
                    <tr key={key} className="border-b border-violet-900 border-opacity-10">
                      <td className="text-slate-300 py-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
                      <td className="text-violet-300 py-2 text-right font-semibold">{val.score}</td>
                      <td className="text-slate-500 py-2 text-right">{val.maxScore}</td>
                      <td className="text-slate-500 py-2 text-right">{val.count ?? val.cgpa ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Calculated deterministically from your actual SkillNexa profile. Refresh anytime to recompute.
          </p>
        </div>
      )}
    </div>
  );
};

export default CareerReadinessPage;

import React, { useEffect, useState } from 'react';
import { aiService } from '../../services/aiService';

const roles = [
  'Software Engineer', 'Full Stack Developer', 'Backend Developer',
  'Frontend Developer', 'Data Scientist', 'DevOps Engineer', 'ML Engineer',
];

const PriorityBadge: React.FC<{ p: string }> = ({ p }) => {
  if (p === 'HIGH') return <span className="ai-badge-red">HIGH</span>;
  if (p === 'MEDIUM') return <span className="ai-badge-orange">MEDIUM</span>;
  return <span className="ai-badge">LOW</span>;
};

const SkillGapPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('Software Engineer');
  const [error, setError] = useState('');

  const load = async (targetRole: string) => {
    setLoading(true); setError(''); setData(null);
    try {
      const res = await aiService.getSkillGap(targetRole);
      setData((res.data as any).data ?? res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Analysis failed. Please complete your profile first.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(role); }, []);

  return (
    <div className="ai-fade-in max-w-5xl mx-auto">
      <div className="mb-6">
        <span className="ai-badge mb-2 inline-block">Career Intelligence</span>
        <h1 className="text-2xl font-bold text-white">Skill Gap Analysis</h1>
        <p className="text-sm text-slate-400 mt-1">Compare your current skills against role requirements. Priority is based on real job market demand on the platform.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={role} onChange={e => setRole(e.target.value)} className="ai-input px-3 py-2 text-sm rounded-lg">
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button onClick={() => load(role)} disabled={loading} className="ai-button px-5 py-2 rounded-lg text-sm font-semibold">
          {loading ? 'Analyzing…' : 'Analyze Gap'}
        </button>
      </div>

      {error && <div className="ai-card-static p-4 mb-4"><p className="text-red-400 text-sm">{error}</p></div>}

      {loading && (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="ai-card-static h-12 ai-pulse" />)}
        </div>
      )}

      {data && (
        <div className="space-y-4 ai-fade-in">
          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Match %', value: `${data.summary?.matchPercentage ?? 0}%`, color: data.summary?.matchPercentage >= 70 ? '#34d399' : '#fbbf24' },
              { label: 'Matched', value: data.summary?.matched ?? 0, color: '#34d399' },
              { label: 'Missing', value: data.summary?.missing ?? 0, color: '#f87171' },
              { label: 'Weak', value: data.summary?.weak ?? 0, color: '#fbbf24' },
            ].map(s => (
              <div key={s.label} className="ai-card-static p-4 text-center">
                <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Top priority skills */}
          {data.topPrioritySkills?.length > 0 && (
            <div className="ai-card-static p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">🔥 Top Priority Skills to Acquire</p>
              <div className="flex flex-wrap gap-2">
                {data.topPrioritySkills.map((s: string) => (
                  <span key={s} className="ai-badge-red px-3 py-1 rounded-full text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Matched skills */}
            <div className="ai-card-static p-5">
              <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Matched Skills
                <span className="text-xs text-slate-500 font-normal">({data.matchedSkills?.length ?? 0})</span>
              </p>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {data.matchedSkills?.length ? data.matchedSkills.map((s: any) => (
                  <div key={s.skill} className="flex items-center justify-between py-1.5 border-b border-violet-900 border-opacity-20 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-200">{s.skill}</span>
                      {s.verified && <span className="ai-badge-green text-xs">✓ Verified</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 ai-progress-track">
                        <div className="ai-progress-fill" style={{ width: `${s.score}%`, background: s.level === 'Strong' ? '#34d399' : s.level === 'Medium' ? '#fbbf24' : '#f87171' }} />
                      </div>
                      <span className="text-xs text-slate-400 w-12 text-right">{s.level}</span>
                    </div>
                  </div>
                )) : <p className="text-xs text-slate-500">No matched skills yet.</p>}
              </div>
            </div>

            {/* Missing skills */}
            <div className="ai-card-static p-5">
              <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-red-400">✕</span> Missing Skills
                <span className="text-xs text-slate-500 font-normal">({data.missingSkills?.length ?? 0})</span>
              </p>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {data.missingSkills?.length ? data.missingSkills.map((s: any) => (
                  <div key={s.skill} className="flex items-center justify-between py-1.5 border-b border-violet-900 border-opacity-20 last:border-0">
                    <span className="text-sm text-slate-300">{s.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">×{s.demandCount} jobs</span>
                      <PriorityBadge p={s.priority} />
                    </div>
                  </div>
                )) : <p className="text-xs text-emerald-400">No missing required skills! 🎉</p>}
              </div>
            </div>
          </div>

          {/* Weak skills */}
          {data.weakSkills?.length > 0 && (
            <div className="ai-card-static p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">⚠ Weak Skills (score &lt; 50%)</p>
              <div className="flex flex-wrap gap-2">
                {data.weakSkills.map((s: string) => <span key={s} className="ai-badge-orange">{s}</span>)}
              </div>
              <p className="text-xs text-slate-500 mt-2">Improve these through SkillNexa assessments.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillGapPage;

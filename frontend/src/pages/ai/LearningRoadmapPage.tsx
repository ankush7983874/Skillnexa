import React, { useEffect, useState } from 'react';
import { aiService } from '../../services/aiService';

const roles = [
  'Software Engineer', 'Full Stack Developer', 'Backend Developer',
  'Frontend Developer', 'Data Scientist', 'DevOps Engineer', 'ML Engineer',
];

const difficultyColor = (d: string) =>
  d === 'Beginner' ? '#34d399' : d === 'Intermediate' ? '#fbbf24' : '#f87171';

const LearningRoadmapPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('Software Engineer');
  const [error, setError] = useState('');

  const load = async (targetRole: string) => {
    setLoading(true); setError(''); setData(null);
    try {
      const res = await aiService.getLearningRoadmap(targetRole);
      setData((res.data as any).data ?? res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to generate roadmap. Please complete your profile first.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(role); }, []);

  return (
    <div className="ai-fade-in max-w-3xl mx-auto">
      <div className="mb-6">
        <span className="ai-badge mb-2 inline-block">Career Intelligence</span>
        <h1 className="text-2xl font-bold text-white">Personalized Learning Roadmap</h1>
        <p className="text-sm text-slate-400 mt-1">Week-by-week skill acquisition plan generated from your profile and target role requirements.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={role} onChange={e => setRole(e.target.value)} className="ai-input px-3 py-2 text-sm rounded-lg">
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button onClick={() => load(role)} disabled={loading} className="ai-button px-5 py-2 rounded-lg text-sm font-semibold">
          {loading ? 'Generating…' : 'Generate Roadmap'}
        </button>
      </div>

      {error && <div className="ai-card-static p-4 mb-4"><p className="text-red-400 text-sm">{error}</p></div>}

      {loading && (
        <div className="space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="ai-card-static h-24 ai-pulse" />)}
        </div>
      )}

      {data && (
        <div className="ai-fade-in">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Target Role', value: data.targetRole },
              { label: 'Milestones', value: data.totalMilestones },
              { label: 'Est. Completion', value: `${data.estimatedCompletionWeeks}w` },
            ].map(s => (
              <div key={s.label} className="ai-card-static p-3 text-center">
                <div className="text-lg font-bold text-violet-300 mb-0.5 truncate">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Already strong */}
          {data.alreadyStrong?.length > 0 && (
            <div className="ai-card-static p-4 mb-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">✅ Already Strong</p>
              <div className="flex flex-wrap gap-1.5">
                {data.alreadyStrong.map((s: string) => <span key={s} className="ai-badge-green">{s}</span>)}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-7 top-4 bottom-4 w-px bg-violet-800 bg-opacity-40" />

            <div className="space-y-3">
              {data.roadmap?.map((m: any, idx: number) => (
                <div key={idx} className="flex gap-4 relative">
                  {/* Week badge */}
                  <div className="shrink-0 w-14 flex flex-col items-center pt-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10"
                      style={{ background: 'rgba(124,58,237,0.2)', border: '2px solid rgba(124,58,237,0.4)', color: '#a78bfa' }}>
                      W{m.week}
                    </div>
                  </div>

                  {/* Milestone card */}
                  <div className="ai-card-static p-4 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-white">{m.skill}</h3>
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: `${difficultyColor(m.difficulty)}20`, color: difficultyColor(m.difficulty), border: `1px solid ${difficultyColor(m.difficulty)}40` }}>
                          {m.difficulty}
                        </span>
                        {m.priority === 'HIGH' && <span className="ai-badge-red">HIGH</span>}
                        {m.priority === 'MEDIUM' && <span className="ai-badge-orange">MEDIUM</span>}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mb-2">{m.reason}</p>
                    <p className="text-xs text-violet-300 mb-2">⏱ {m.estimatedTime}</p>

                    {m.relatedRoles?.length > 0 && (
                      <p className="text-xs text-slate-500">Used in: {m.relatedRoles.join(', ')}</p>
                    )}

                    {m.resources?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {m.resources.map((r: string, i: number) => (
                          <span key={i} className="text-xs text-slate-500 bg-violet-950 bg-opacity-40 px-2 py-0.5 rounded">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!data.roadmap?.length && (
            <div className="ai-card-static p-6 text-center">
              <p className="text-emerald-400 text-sm">🎉 No skill gaps found for this role! Your profile is strong.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LearningRoadmapPage;

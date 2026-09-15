import React, { useEffect, useState } from 'react';
import { aiService } from '../../services/aiService';

const BAR_MAX_WIDTH = 200; // px for CSS bar charts

const HBar: React.FC<{ label: string; value: number; maxVal: number; color?: string }> = ({
  label, value, maxVal, color = '#a78bfa'
}) => {
  const pct = maxVal > 0 ? Math.round((value / maxVal) * 100) : 0;
  const w = Math.max(4, (value / maxVal) * BAR_MAX_WIDTH);
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-violet-900 border-opacity-15 last:border-0">
      <span className="text-xs text-slate-300 w-36 shrink-0 truncate" title={label}>{label}</span>
      <div className="flex items-center gap-2 flex-1">
        <div className="rounded-full h-2.5 shrink-0" style={{ width: w, background: color, maxWidth: BAR_MAX_WIDTH, minWidth: 4, transition: 'width 0.5s ease' }} />
        <span className="text-xs text-slate-400 shrink-0">{value}</span>
      </div>
    </div>
  );
};

const IndustryInsightsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'skills' | 'roles' | 'categories' | 'funnel'>('skills');

  useEffect(() => {
    aiService.getIndustryInsights()
      .then(res => setData((res.data as any).data ?? res.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load insights.'))
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { key: 'skills', label: 'Top Skills' },
    { key: 'roles', label: 'Job Roles' },
    { key: 'categories', label: 'Skill Categories' },
    { key: 'funnel', label: 'Platform Stats' },
  ] as const;

  const maxSkill = data?.topDemandedSkills?.[0]?.demandCount || 1;
  const maxRole = data?.topJobRoles?.[0]?.count || 1;

  return (
    <div className="ai-fade-in max-w-5xl mx-auto">
      <div className="mb-6">
        <span className="ai-badge mb-2 inline-block">Platform Analytics</span>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Industry Insights</h1>
          <span className="ai-badge-green">Live Data</span>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          {data?.dataLabel || 'Based on SkillNexa platform data'} — Aggregated from real jobs and applications.
        </p>
      </div>

      {error && <div className="ai-card-static p-4 mb-4"><p className="text-red-400 text-sm">{error}</p></div>}

      {loading && (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="ai-card-static h-16 ai-pulse" />)}
        </div>
      )}

      {data && (
        <div className="space-y-4 ai-fade-in">
          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: 'Jobs Analyzed', value: data.summary?.totalJobsAnalyzed ?? 0 },
              { label: 'Applications', value: data.summary?.totalApplications ?? 0 },
              { label: 'Placements', value: data.summary?.totalPlacements ?? 0 },
              { label: 'Unique Skills', value: data.summary?.uniqueSkillsFound ?? 0 },
              { label: 'Avg Skills/Job', value: data.summary?.averageSkillsPerJob ?? 0 },
            ].map(s => (
              <div key={s.label} className="ai-card-static p-4 text-center">
                <div className="text-2xl font-bold text-violet-300 mb-0.5">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Top companies */}
          {data.topCompanies?.length > 0 && (
            <div className="ai-card-static p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Top Hiring Companies</p>
              <div className="flex flex-wrap gap-2">
                {data.topCompanies.map((c: any) => (
                  <span key={c.company} className="ai-badge">{c.company} ({c.jobCount})</span>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.15)' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === t.key ? 'ai-button' : 'text-slate-400 hover:text-slate-200'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab: Top Skills */}
          {activeTab === 'skills' && (
            <div className="ai-card-static p-5 ai-fade-in">
              <p className="text-sm font-semibold text-white mb-4">Top Required Skills by Demand</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
                <div>
                  {data.topDemandedSkills?.slice(0, 8).map((s: any) => (
                    <HBar key={s.skill} label={s.skill} value={s.demandCount} maxVal={maxSkill} />
                  ))}
                </div>
                <div>
                  {data.topDemandedSkills?.slice(8, 15).map((s: any) => (
                    <HBar key={s.skill} label={s.skill} value={s.demandCount} maxVal={maxSkill} />
                  ))}
                </div>
              </div>
              {data.topPreferredSkills?.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-5 mb-3">Preferred Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.topPreferredSkills.map((s: any) => (
                      <span key={s.skill} className="ai-badge">{s.skill} ({s.demandCount})</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab: Job Roles */}
          {activeTab === 'roles' && (
            <div className="ai-card-static p-5 ai-fade-in">
              <p className="text-sm font-semibold text-white mb-4">Most Posted Job Roles</p>
              {data.topJobRoles?.length ? (
                data.topJobRoles.map((r: any) => (
                  <HBar key={r.role} label={r.role} value={r.count} maxVal={maxRole} color="#818cf8" />
                ))
              ) : <p className="text-xs text-slate-500">No job data yet.</p>}

              {/* Employment type */}
              {data.employmentTypeDistribution && Object.keys(data.employmentTypeDistribution).length > 0 && (
                <>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-5 mb-3">Employment Type Distribution</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(data.employmentTypeDistribution).map(([type, count]: any) => (
                      <div key={type} className="ai-card-static px-4 py-2 text-center">
                        <div className="text-lg font-bold text-violet-300">{count}</div>
                        <div className="text-xs text-slate-500">{type}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Top locations */}
              {data.topLocations?.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-5 mb-3">Top Job Locations</p>
                  <div className="flex flex-wrap gap-2">
                    {data.topLocations.map((l: any) => (
                      <span key={l.location} className="ai-badge">{l.location} ({l.count})</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab: Skill Categories */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ai-fade-in">
              {Object.entries(data.skillsByCategory || {}).map(([cat, skills]: any) => (
                <div key={cat} className="ai-card-static p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{cat}</p>
                  {skills?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s: any) => (
                        <span key={s.skill} className="ai-badge">{s.skill} ({s.count})</span>
                      ))}
                    </div>
                  ) : <p className="text-xs text-slate-500">No data.</p>}
                </div>
              ))}
            </div>
          )}

          {/* Tab: Platform Stats (funnel) */}
          {activeTab === 'funnel' && (
            <div className="ai-card-static p-5 ai-fade-in">
              <p className="text-sm font-semibold text-white mb-4">Application Funnel</p>
              {data.applicationFunnel && Object.keys(data.applicationFunnel).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(data.applicationFunnel).map(([status, count]: any) => {
                    const total = Object.values(data.applicationFunnel).reduce((a: any, b: any) => a + b, 0) as number;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300 capitalize">{status.toLowerCase()}</span>
                          <span className="text-violet-300 font-semibold">{count} ({pct}%)</span>
                        </div>
                        <div className="ai-progress-track">
                          <div className="ai-progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No application data available yet.</p>
              )}
            </div>
          )}

          <p className="text-xs text-slate-600">
            ⓘ All figures are aggregated from real SkillNexa platform data. Not representative of the broader industry.
          </p>
        </div>
      )}
    </div>
  );
};

export default IndustryInsightsPage;

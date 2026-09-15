import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  aiService,
  CareerReadinessResult,
  CareerRolesResult,
  SkillGapResult,
  LearningRoadmapResult,
  PerformanceAnalyticsResult,
} from '../../services/aiService';
import {
  TrendingUp,
  BarChart2,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const ScoreRing: React.FC<{ score: number; size?: number; strokeWidth?: number }> = ({
  score,
  size = 90,
  strokeWidth = 8,
}) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#a78bfa' : score >= 50 ? '#fbbf24' : '#f87171';

  return (
    <svg width={size} height={size} className="ai-score-ring">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(124,58,237,0.1)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="16" fontWeight="700">
        {score}%
      </text>
    </svg>
  );
};

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  href: string;
  color?: string;
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon, href, color = '#a78bfa', loading }) => (
  <Link to={href} className="ai-card block p-4 no-underline group cursor-pointer">
    <div className="flex items-start justify-between mb-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
        style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}
      >
        {icon}
      </div>
      <span className="text-xs text-slate-500 group-hover:text-violet-400 transition-colors">→</span>
    </div>
    {loading ? (
      <div className="h-8 w-20 rounded bg-violet-900 opacity-20 ai-pulse mb-1" />
    ) : (
      <div className="text-2xl font-bold mb-0.5" style={{ color }}>
        {value}
      </div>
    )}
    <div className="text-xs font-semibold text-slate-300 mb-0.5">{title}</div>
    <div className="text-xs text-slate-500">{subtitle}</div>
  </Link>
);

const BarChart: React.FC<{ items: Array<{ label: string; value: number; max?: number }> }> = ({ items }) => (
  <div className="space-y-2.5">
    {items.map((item) => (
      <div key={item.label}>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-300 font-medium truncate">{item.label}</span>
          <span className="text-violet-400 font-bold ml-2 shrink-0">{item.value}%</span>
        </div>
        <div className="ai-progress-track">
          <div className="ai-progress-fill" style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }} />
        </div>
      </div>
    ))}
  </div>
);

// SVG Line Chart for Performance Trend over Time
const LineTrendChart: React.FC<{ data: Array<{ date: string; score: number; title: string }> }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
        <TrendingUp className="h-8 w-8 text-slate-600 mx-auto" />
        <p className="font-semibold text-slate-300">Not enough performance data to generate a trend.</p>
        <p className="text-slate-500">Complete 2 or more skill assessments to build your performance timeline.</p>
      </div>
    );
  }

  const height = 180;
  const width = 500;
  const padding = 30;

  const points = data.map((d, idx) => {
    const x = padding + (idx / Math.max(1, data.length - 1)) * (width - 2 * padding);
    const y = height - padding - (d.score / 100) * (height - 2 * padding);
    return { x, y, score: d.score, title: d.title, date: d.date };
  });

  const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

  return (
    <div className="space-y-3">
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Grid lines */}
          {[25, 50, 75, 100].map((gridVal) => {
            const y = height - padding - (gridVal / 100) * (height - 2 * padding);
            return (
              <g key={gridVal}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <text x={padding - 5} y={y + 3} textAnchor="end" fill="#64748b" fontSize="9">
                  {gridVal}
                </text>
              </g>
            );
          })}

          {/* Line Path */}
          <path d={pathD} fill="none" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="5" fill="#4f46e5" stroke="#a78bfa" strokeWidth="2" />
              <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#c7d2fe" fontSize="10" fontWeight="bold">
                {p.score}%
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>First Attempt ({data[0].date})</span>
        <span>Latest ({data[data.length - 1].date})</span>
      </div>
    </div>
  );
};

const AICommandCenter: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role;

  const [readiness, setReadiness] = useState<CareerReadinessResult | null>(null);
  const [roles, setRoles] = useState<CareerRolesResult | null>(null);
  const [gap, setGap] = useState<SkillGapResult | null>(null);
  const [roadmap, setRoadmap] = useState<LearningRoadmapResult | null>(null);
  const [performance, setPerformance] = useState<PerformanceAnalyticsResult | null>(null);

  const [loadingReadiness, setLoadingReadiness] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingPerformance, setLoadingPerformance] = useState(true);

  useEffect(() => {
    if (role !== 'STUDENT') return;

    aiService.getCareerReadiness().then((res) => {
      const data = (res.data as any).data ?? res.data;
      setReadiness(data);
      setLoadingReadiness(false);
    }).catch(() => setLoadingReadiness(false));

    aiService.getCareerRoles().then((res) => {
      const data = (res.data as any).data ?? res.data;
      setRoles(data);
      setLoadingRoles(false);
    }).catch(() => setLoadingRoles(false));

    aiService.getSkillGap().then((res) => {
      const data = (res.data as any).data ?? res.data;
      setGap(data);
    }).catch(() => {});

    aiService.getLearningRoadmap().then((res) => {
      const data = (res.data as any).data ?? res.data;
      setRoadmap(data);
    }).catch(() => {});

    aiService.getPerformanceAnalytics().then((res) => {
      const data = (res.data as any).data ?? res.data;
      setPerformance(data);
      setLoadingPerformance(false);
    }).catch(() => setLoadingPerformance(false));
  }, [role]);

  const studentModules = [
    {
      title: 'Career Readiness',
      value: readiness?.careerReadinessScore !== undefined ? `${readiness.careerReadinessScore}%` : '—',
      subtitle: readiness?.readinessLevel || 'Analyzing…',
      icon: '◎',
      href: '/ai/career-readiness',
      loading: loadingReadiness,
    },
    {
      title: 'Skill Gap',
      value: gap?.summary?.missing !== undefined
        ? `${gap.summary.missing} missing`
        : readiness?.weakAreas
        ? `${readiness.weakAreas.length} gaps`
        : '—',
      subtitle: gap?.targetRole ? `for ${gap.targetRole}` : 'Skills to acquire',
      icon: '◈',
      href: '/ai/skill-gap',
      loading: loadingReadiness,
    },
    {
      title: 'Career Roles',
      value: roles?.topRoles ? `${roles.topRoles.length} matches` : '—',
      subtitle: roles?.primaryRecommendation?.role || 'Analyzing…',
      icon: '◆',
      href: '/ai/career-readiness',
      loading: loadingRoles,
    },
    {
      title: 'Learning Roadmap',
      value: roadmap?.timelineWeeks ? `${roadmap.timelineWeeks} weeks` : '12 weeks',
      subtitle: roadmap?.targetRole ? `${roadmap.totalMilestones} milestones` : 'Personalized plan',
      icon: '◷',
      href: '/ai/learning-roadmap',
    },
    { title: 'Resume Analyzer', value: 'Analyze', subtitle: 'ATS & keyword score', icon: '◻', href: '/ai/resume-analyzer' },
    { title: 'Mock Interview', value: 'Practice', subtitle: 'AI-evaluated answers', icon: '◈', href: '/ai/mock-interview' },
    { title: 'Career Assistant', value: 'Chat', subtitle: 'Ask anything', icon: '◉', href: '/ai/career-assistant' },
    { title: 'Industry Insights', value: 'Explore', subtitle: 'Platform skill demand', icon: '◫', href: '/ai/industry-insights' },
  ];

  const companyModules = [
    { title: 'JD Analyzer', value: 'Analyze', subtitle: 'AI job description review', icon: '◧', href: '/ai/company/job-description' },
    { title: 'Industry Insights', value: 'Explore', subtitle: 'Platform skill demand', icon: '◫', href: '/ai/industry-insights' },
  ];

  const modules = role === 'STUDENT' ? studentModules : companyModules;

  return (
    <div className="ai-fade-in max-w-5xl mx-auto space-y-8">
      {/* Hero header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="ai-badge">AI Workspace</span>
          <span className="ai-badge-green">Live Database Metrics</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">
          AI Command Center
        </h1>
        <p className="text-sm text-slate-400">
          Welcome, <span className="text-violet-300 font-semibold">{user?.name}</span>. Real-time performance analytics calculated directly from your authenticated profile data.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {modules.map((m) => (
          <KPICard key={m.title} {...m} />
        ))}
      </div>

      {/* STUDENT PERFORMANCE ANALYTICS SECTION */}
      {role === 'STUDENT' && (
        <div className="space-y-6 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-purple-400" />
                <span>Student Performance Analytics</span>
              </h2>
              <p className="text-xs text-slate-400">
                Data-driven evaluation based on assessments, projects, CGPA, and AI readiness metrics
              </p>
            </div>
            <span className="text-xs text-purple-400 font-mono px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              Verified Real Data
            </span>
          </div>

          {/* Performance Overview KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="ai-card-static p-4 text-center">
              <div className="text-xs text-slate-400 mb-1">Overall</div>
              <div className="text-2xl font-bold text-purple-300">{performance?.overview?.overall ?? '—'}%</div>
            </div>
            <div className="ai-card-static p-4 text-center">
              <div className="text-xs text-slate-400 mb-1">Academic</div>
              <div className="text-2xl font-bold text-indigo-300">{performance?.overview?.academic ?? '—'}%</div>
            </div>
            <div className="ai-card-static p-4 text-center">
              <div className="text-xs text-slate-400 mb-1">Technical</div>
              <div className="text-2xl font-bold text-blue-300">{performance?.overview?.technical ?? '—'}%</div>
            </div>
            <div className="ai-card-static p-4 text-center">
              <div className="text-xs text-slate-400 mb-1">DSA Score</div>
              <div className="text-2xl font-bold text-violet-400">{performance?.overview?.dsa ?? '—'}%</div>
            </div>
            <div className="ai-card-static p-4 text-center">
              <div className="text-xs text-slate-400 mb-1">Attendance</div>
              <div className="text-2xl font-bold text-emerald-400">{performance?.overview?.attendance ?? '—'}%</div>
            </div>
            <div className="ai-card-static p-4 text-center">
              <div className="text-xs text-slate-400 mb-1">Placement</div>
              <div className="text-2xl font-bold text-purple-400">{performance?.placementReadinessScore ?? '—'}%</div>
            </div>
          </div>

          {/* Analytics Grid Row 1: Performance Trend & Subject Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Performance Trend */}
            <div className="ai-card-static p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  <span>Performance Trend Over Time</span>
                </h3>
                <span className="text-xs text-slate-500">Assessment Score %</span>
              </div>
              {loadingPerformance ? (
                <div className="h-44 rounded bg-violet-900 opacity-10 ai-pulse" />
              ) : (
                <LineTrendChart data={performance?.performanceTrend || []} />
              )}
            </div>

            {/* Subject-Wise Performance */}
            <div className="ai-card-static p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-400" />
                  <span>Subject-Wise Performance</span>
                </h3>
                <span className="text-xs text-slate-500">Average %</span>
              </div>
              {loadingPerformance ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-6 rounded bg-violet-900 opacity-10 ai-pulse" />
                  ))}
                </div>
              ) : performance?.subjectPerformance && performance.subjectPerformance.length > 0 ? (
                <BarChart
                  items={performance.subjectPerformance.map((sp) => ({
                    label: `${sp.subject} (${sp.assessmentsCount} records)`,
                    value: sp.score,
                  }))}
                />
              ) : (
                <p className="text-xs text-slate-500">No subject-wise assessment records available yet.</p>
              )}
            </div>
          </div>

          {/* Analytics Grid Row 2: Skill Proficiency & DSA Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Skill Proficiency Graph */}
            <div className="ai-card-static p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-400" />
                  <span>Skill Proficiency & Verification</span>
                </h3>
                <span className="text-xs text-slate-500">Converted Numeric Scale</span>
              </div>
              {loadingPerformance ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-6 rounded bg-violet-900 opacity-10 ai-pulse" />
                  ))}
                </div>
              ) : performance?.skillPerformance && performance.skillPerformance.length > 0 ? (
                <div className="space-y-3">
                  {performance.skillPerformance.map((sk) => (
                    <div key={sk.skill} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 font-medium">{sk.skill}</span>
                          {sk.verified && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3" /> Verified
                            </span>
                          )}
                        </div>
                        <span className="text-purple-300 font-bold">{sk.score}% ({sk.level})</span>
                      </div>
                      <div className="ai-progress-track">
                        <div
                          className="ai-progress-fill"
                          style={{
                            width: `${sk.score}%`,
                            background: sk.level === 'Advanced' ? 'linear-gradient(90deg, #4f46e5, #a78bfa)' : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No skill records in profile. Add skills in Student Profile to populate graph.</p>
              )}
            </div>

            {/* DSA Performance */}
            <div className="ai-card-static p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-violet-400" />
                  <span>DSA & Algorithmic Performance</span>
                </h3>
                <span className="text-xs text-purple-400 font-bold">
                  Score: {performance?.dsaPerformance?.overallScore ?? 0}%
                </span>
              </div>
              {loadingPerformance ? (
                <div className="h-32 rounded bg-violet-900 opacity-10 ai-pulse" />
              ) : performance?.dsaPerformance ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 mb-0.5">Problems Solved</div>
                      <div className="text-lg font-bold text-white">{performance.dsaPerformance.problemsSolved}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 mb-0.5">Accuracy</div>
                      <div className="text-lg font-bold text-purple-300">{performance.dsaPerformance.accuracy}%</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 mb-0.5">Attempts</div>
                      <div className="text-lg font-bold text-slate-300">{performance.dsaPerformance.totalAttempts}</div>
                    </div>
                  </div>

                  {performance.dsaPerformance.topicPerformance && performance.dsaPerformance.topicPerformance.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-400">DSA Topic Breakdown</div>
                      <BarChart
                        items={performance.dsaPerformance.topicPerformance.map((tp) => ({
                          label: tp.topic,
                          value: tp.score,
                        }))}
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-2">
                      No DSA topic assessment records found yet. Complete a DSA quiz to unlock topic metrics.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* Job Readiness & AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Job Readiness Breakdown */}
            <div className="ai-card-static p-5 lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Placement Readiness Breakdown</h3>
                <div className="text-xs font-bold text-purple-300">{performance?.placementReadinessScore ?? '—'}%</div>
              </div>

              {performance?.jobReadinessBreakdown && (
                <BarChart
                  items={[
                    { label: 'Technical Skills Match', value: performance.jobReadinessBreakdown.skillMatch },
                    { label: 'Assessment Performance', value: performance.jobReadinessBreakdown.technicalAssessment },
                    { label: 'DSA & Algorithms', value: performance.jobReadinessBreakdown.dsa },
                    { label: 'Projects Quality', value: performance.jobReadinessBreakdown.projects },
                    { label: 'Internships', value: performance.jobReadinessBreakdown.internships },
                    { label: 'Resume & Profile Completeness', value: performance.jobReadinessBreakdown.profileCompleteness },
                  ]}
                />
              )}
            </div>

            {/* AI Performance Insights Card */}
            <div className="ai-card-static p-5 lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span>AI Performance Insights & Recommendations</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">{performance?.insights?.trend}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Strengths */}
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Verified Strengths</span>
                  </div>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside">
                    {performance?.insights?.strengths?.map((str, idx) => (
                      <li key={idx} className="leading-relaxed">{str}</li>
                    ))}
                  </ul>
                </div>

                {/* Weak Areas */}
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/20 space-y-2">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Weak Areas & Gaps</span>
                  </div>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside">
                    {performance?.insights?.weaknesses?.map((wk, idx) => (
                      <li key={idx} className="leading-relaxed">{wk}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs space-y-2">
                <div className="font-bold text-purple-300 flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4 text-purple-400" />
                  <span>Actionable Recommendations</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {performance?.insights?.recommendations?.map((rec, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 leading-relaxed">
                      • {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panels for Student Career Readiness & Roles */}
      {role === 'STUDENT' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Readiness breakdown */}
          <div className="ai-card-static p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Career Readiness Breakdown</h3>
              <Link to="/ai/career-readiness" className="text-xs text-violet-400 hover:text-violet-300">View full →</Link>
            </div>
            {loadingReadiness ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-6 rounded bg-violet-900 opacity-10 ai-pulse" />
                ))}
              </div>
            ) : readiness?.subScores ? (
              <BarChart
                items={Object.entries(readiness.subScores).map(([label, value]) => ({
                  label,
                  value,
                  max: 100,
                }))}
              />
            ) : (
              <p className="text-xs text-slate-500">No readiness data calculated yet. Click Career Readiness to analyze.</p>
            )}
          </div>

          {/* Top role matches */}
          <div className="ai-card-static p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Top Career Role Matches</h3>
              <Link to="/ai/career-readiness" className="text-xs text-violet-400 hover:text-violet-300">View all →</Link>
            </div>
            {loadingRoles ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 rounded bg-violet-900 opacity-10 ai-pulse" />
                ))}
              </div>
            ) : roles?.topRoles ? (
              <div className="space-y-2">
                {roles.topRoles.slice(0, 5).map((r) => (
                  <div key={r.role} className="flex items-center justify-between py-1.5 border-b border-violet-900 border-opacity-30 last:border-0">
                    <span className="text-sm text-slate-300 truncate">{r.role}</span>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <div className="w-16 ai-progress-track">
                        <div className="ai-progress-fill" style={{ width: `${r.matchScore}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-violet-400 w-8 text-right">{r.matchScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No role recommendations available yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AICommandCenter;

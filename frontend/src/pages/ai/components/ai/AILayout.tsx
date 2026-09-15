import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import Logo from '../../../../components/Logo';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles: string[];
  end?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  roles: string[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    roles: ['STUDENT', 'COMPANY', 'ADMIN'],
    items: [
      { label: 'AI Command Center', path: '/ai', icon: '⬡', roles: ['STUDENT', 'COMPANY', 'ADMIN'], end: true },
    ],
  },
  {
    label: 'Career',
    roles: ['STUDENT'],
    items: [
      { label: 'Career Predictor', path: '/ai/career-predictor', icon: '◉', roles: ['STUDENT'] },
      { label: 'Career Readiness', path: '/ai/career-readiness', icon: '◎', roles: ['STUDENT'] },
      { label: 'Career Assistant', path: '/ai/career-assistant', icon: '◈', roles: ['STUDENT'] },
    ],
  },
  {
    label: 'Skills',
    roles: ['STUDENT'],
    items: [
      { label: 'Skill Coach', path: '/ai/skill-coach', icon: '◆', roles: ['STUDENT'] },
      { label: 'Skill Gap', path: '/ai/skill-gap', icon: '◈', roles: ['STUDENT'] },
      { label: 'Skill Forecast', path: '/ai/skill-forecast', icon: '◫', roles: ['STUDENT'] },
    ],
  },
  {
    label: 'Learning',
    roles: ['STUDENT'],
    items: [
      { label: 'DSA Coach', path: '/ai/dsa-coach', icon: '◷', roles: ['STUDENT'] },
      { label: 'Learning Roadmap', path: '/ai/learning-roadmap', icon: '◻', roles: ['STUDENT'] },
      { label: 'Weekly Plan', path: '/ai/weekly-plan', icon: '◰', roles: ['STUDENT'] },
      { label: 'Learning Materials', path: '/ai/learning-materials', icon: '◱', roles: ['STUDENT'] },
    ],
  },
  {
    label: 'Coding',
    roles: ['STUDENT'],
    items: [
      { label: 'Coding Debugger', path: '/ai/coding-debugger', icon: '◧', roles: ['STUDENT'] },
      { label: 'Code Reviewer', path: '/ai/code-reviewer', icon: '◨', roles: ['STUDENT'] },
    ],
  },
  {
    label: 'Career Prep',
    roles: ['STUDENT'],
    items: [
      { label: 'Interview Coach', path: '/ai/interview-coach', icon: '◍', roles: ['STUDENT'] },
      { label: 'Resume Analyzer', path: '/ai/resume-analyzer', icon: '◻', roles: ['STUDENT'] },
      { label: 'Resume Optimizer', path: '/ai/resume-optimizer', icon: '◼', roles: ['STUDENT'] },
      { label: 'Project Advisor', path: '/ai/project-advisor', icon: '◬', roles: ['STUDENT'] },
      { label: 'Mock Interview', path: '/ai/mock-interview', icon: '◆', roles: ['STUDENT'] },
    ],
  },
  {
    label: 'Placement',
    roles: ['STUDENT'],
    items: [
      { label: 'Placement Readiness', path: '/ai/placement-readiness', icon: '◎', roles: ['STUDENT'] },
      { label: 'Job Explainability', path: '/ai/job-explainability', icon: '◉', roles: ['STUDENT'] },
      { label: 'Job Alerts', path: '/ai/job-alerts', icon: '◈', roles: ['STUDENT'] },
    ],
  },
  {
    label: 'Intelligence',
    roles: ['STUDENT'],
    items: [
      { label: 'Performance Predictor', path: '/ai/performance-predictor', icon: '◌', roles: ['STUDENT'] },
      { label: 'What-If Simulator', path: '/ai/what-if', icon: '◭', roles: ['STUDENT'] },
      { label: 'Student 360°', path: '/ai/student-360', icon: '◯', roles: ['STUDENT'] },
      { label: 'Action Center', path: '/ai/action-center', icon: '◆', roles: ['STUDENT'] },
    ],
  },
  {
    label: 'Analytics',
    roles: ['STUDENT', 'COMPANY', 'ADMIN'],
    items: [
      { label: 'Industry Insights', path: '/ai/industry-insights', icon: '◫', roles: ['STUDENT', 'COMPANY', 'ADMIN'] },
    ],
  },
  {
    label: 'Company Tools',
    roles: ['COMPANY', 'ADMIN'],
    items: [
      { label: 'JD Analyzer', path: '/ai/company/job-description', icon: '◧', roles: ['COMPANY', 'ADMIN'] },
    ],
  },
];

const AILayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'STUDENT';
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleGroup = (label: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const visibleGroups = navGroups.filter((g) => g.roles.includes(role));

  return (
    <div className="ai-shell flex flex-col min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* AI Top Bar */}
      <header
        className="ai-panel sticky top-0 z-50 flex items-center justify-between px-6 py-3"
        style={{ borderRight: 'none', borderBottom: '1px solid var(--ai-border)', minHeight: 56 }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(role === 'STUDENT' ? '/student/dashboard' : '/company/dashboard')}
            className="ai-button-secondary px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
          >
            ← Back
          </button>
          <div className="h-4 w-px bg-violet-900 opacity-50" />
          <div className="flex items-center gap-2">
            <Logo variant="icon" size="xs" />
            <span className="text-sm font-semibold ai-glow-text">SkillNexa AI</span>
            <span className="ai-badge text-xs ml-1">Phase 12</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {user?.name} — {role}
          </span>
          <div
            className="w-2 h-2 rounded-full bg-emerald-500"
            style={{ boxShadow: '0 0 6px #10b981' }}
            title="AI Service Active"
          />
        </div>
      </header>

      <div className="flex flex-1">
        {/* AI Sidebar */}
        <aside
          className="ai-panel hidden lg:flex flex-col w-60 shrink-0 py-4"
          style={{ minHeight: 'calc(100vh - 56px)', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' }}
        >
          <nav className="flex flex-col gap-0 px-2 flex-1">
            {visibleGroups.map((group) => {
              const visibleItems = group.items.filter((item) => item.roles.includes(role));
              if (visibleItems.length === 0) return null;
              const isCollapsed = collapsed.has(group.label);
              return (
                <div key={group.label} className="mb-1">
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    <span>{group.label}</span>
                    <span className="text-slate-700">{isCollapsed ? '›' : '∨'}</span>
                  </button>
                  {!isCollapsed && (
                    <div className="flex flex-col gap-0.5">
                      {visibleItems.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          end={item.end}
                          className={({ isActive }) =>
                            `ai-nav-link flex items-center gap-2.5 px-3 py-2 text-sm ${isActive ? 'active' : ''}`
                          }
                        >
                          <span className="text-base leading-none opacity-60">{item.icon}</span>
                          <span className="truncate text-xs">{item.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* AI Service status */}
          <div className="mt-auto px-3 pb-2">
            <div className="ai-card-static p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ai-pulse" />
                <span className="text-xs text-slate-400">AI Engine v2.0</span>
              </div>
              <p className="text-xs text-slate-600">Phase 12 — Intelligence Suite</p>
              <p className="text-xs text-slate-600">Deterministic · Real MongoDB data</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AILayout;

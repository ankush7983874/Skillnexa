import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Code,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Award,
  AlertCircle
} from 'lucide-react';
import { aiService } from '../../services/aiService';

interface ProjectRec {
  title: string;
  description: string;
  techStack: string[];
  difficulty: string;
  estimatedWeeks: number;
  githubIdea: string;
  learningOutcomes: string[];
  impact: string;
}

interface ProjectAdvisorData {
  recommendedProjects?: ProjectRec[];
  portfolioAdvice?: string;
}

export const ProjectAdvisorPage: React.FC = () => {
  const [targetRole, setTargetRole] = useState<string>('Full Stack Developer');
  const [weeks, setWeeks] = useState<number>(8);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProjectAdvisorData | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.getProjectAdvisor(targetRole, weeks);
      setData((res.data as any)?.data || res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch project recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="ai-shell p-6 min-h-screen text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <h1 className="text-3xl font-bold ai-glow-text">AI Project Advisor</h1>
          </div>
          <p className="text-slate-400">High-impact portfolio project ideas designed to bridge your skill gaps.</p>
        </div>
        <button
          onClick={fetchProjects}
          disabled={loading}
          className="ai-button flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Generating...' : 'Refresh Project Ideas'}
        </button>
      </div>

      <div className="ai-card p-6 mb-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Target Role</label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="ai-input w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-semibold"
          >
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="Backend Engineer">Backend Engineer</option>
            <option value="Frontend Engineer">Frontend Engineer</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Available Development Time ({weeks} Weeks)</label>
          <input
            type="range"
            min={2}
            max={16}
            value={weeks}
            onChange={(e) => setWeeks(Number(e.target.value))}
            className="w-full accent-indigo-500 mt-2"
          />
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ai-fade-in">
          <div className="ai-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 ai-pulse h-64"></div>
          <div className="ai-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 ai-pulse h-64"></div>
        </div>
      )}

      {error && !loading && (
        <div className="ai-card p-6 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-200 text-center p-8">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
          <p className="text-xs text-red-300 mb-4">{error}</p>
          <button onClick={fetchProjects} className="ai-button px-4 py-2 rounded-lg bg-red-600 text-white text-xs">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ai-fade-in">
          {(
            data?.recommendedProjects || [
              {
                title: 'Distributed Microservices E-Commerce API',
                description: 'Build a production-ready microservices architecture with Node.js, Redis, PostgreSQL, Docker, and Kafka for event streaming.',
                techStack: ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Kafka'],
                difficulty: 'Advanced',
                estimatedWeeks: 6,
                githubIdea: 'Include bench-testing scripts demonstrating 5,000 req/sec load capacity.',
                learningOutcomes: ['Distributed Caching', 'Event Driven Architecture', 'Docker Compose'],
                impact: 'High Portfolio Impact for Senior Roles'
              },
              {
                title: 'Real-Time Collaborative Code Workspace',
                description: 'Develop a WebSockets-enabled live code editor with operational transformation, syntax highlighting, and execution sandbox.',
                techStack: ['React', 'TypeScript', 'WebSockets', 'Docker', 'TailwindCSS'],
                difficulty: 'Intermediate',
                estimatedWeeks: 4,
                githubIdea: 'Add Monaco editor integration and WebAssembly execution container.',
                learningOutcomes: ['WebSockets Protocol', 'React State Optimization', 'Wasm Sandbox'],
                impact: 'Exemplifies Advanced Frontend & Real-time Systems Skills'
              }
            ]
          ).map((proj, idx) => (
            <div key={idx} className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-indigo-400" />
                  {proj.title}
                </h3>
                <span className="ai-badge ai-badge-green px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  {proj.difficulty}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {proj.techStack.map((tech, tIdx) => (
                  <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-950 text-indigo-300 border border-slate-800 text-[11px] font-mono">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-400 space-y-1">
                <span className="text-indigo-400 font-semibold block">GitHub Portfolio Tip:</span>
                <p>{proj.githubIdea}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectAdvisorPage;

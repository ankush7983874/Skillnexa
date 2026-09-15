import React, { useState } from 'react';
import {
  BookOpen,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { aiService } from '../../services/aiService';

interface Material {
  type: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  url: string;
  platform: string;
  isFree: boolean;
}

interface LearningMaterialsData {
  materials?: Material[];
  learningPath?: string[];
  estimatedHours?: number;
}

export const LearningMaterialsPage: React.FC = () => {
  const [skill, setSkill] = useState<string>('Docker & Kubernetes');
  const [level, setLevel] = useState<string>('Beginner');
  const [format, setFormat] = useState<string>('all');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LearningMaterialsData | null>(null);

  const fetchMaterials = async () => {
    if (!skill.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.getLearningMaterials({ skill, level, format });
      setData((res.data as any)?.data || res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to curate learning materials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-shell p-6 min-h-screen text-slate-100">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <h1 className="text-3xl font-bold ai-glow-text">AI Learning Materials Generator</h1>
          </div>
          <p className="text-slate-400">Curated high-quality tutorials, docs, articles, and courses per skill.</p>
        </div>
      </div>

      <div className="ai-card p-6 mb-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-400 mb-1">Skill or Subject</label>
          <input
            type="text"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="e.g. Docker, System Design, GraphQL..."
            className="ai-input w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-semibold"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Difficulty</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="ai-input w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-300 font-semibold"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={fetchMaterials}
            disabled={loading || !skill.trim()}
            className="ai-button w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 text-xs"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            {loading ? 'Curating...' : 'Search Materials'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ai-fade-in">
          <div className="ai-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 ai-pulse h-48"></div>
          <div className="ai-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 ai-pulse h-48"></div>
        </div>
      )}

      {error && !loading && (
        <div className="ai-card p-6 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-200 text-center p-8">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
          <p className="text-xs text-red-300 mb-4">{error}</p>
          <button onClick={fetchMaterials} className="ai-button px-4 py-2 rounded-lg bg-red-600 text-white text-xs">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ai-fade-in">
          {(
            data?.materials || [
              {
                title: 'Docker Official Getting Started Guide & Architecture',
                type: 'Documentation',
                description: 'Complete breakdown of containers, images, volumes, and networking concepts.',
                duration: '2 Hours',
                difficulty: 'Beginner',
                url: 'https://docs.docker.com/get-started/',
                platform: 'Docker Docs',
                isFree: true
              },
              {
                title: 'Kubernetes in 100 Seconds & Full Workshop',
                type: 'Video Course',
                description: 'Hands-on tutorial covering Pods, Deployments, Services, and Ingress routing.',
                duration: '4 Hours',
                difficulty: 'Intermediate',
                url: 'https://youtube.com',
                platform: 'YouTube / freeCodeCamp',
                isFree: true
              }
            ]
          ).map((mat, idx) => (
            <div key={idx} className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="ai-badge ai-badge-green px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                    {mat.platform}
                  </span>
                  {mat.isFree && (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/40">
                      FREE
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-100 mb-1">{mat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{mat.description}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                <span className="text-xs text-slate-500 font-mono">Est. {mat.duration}</span>
                <a
                  href={mat.url}
                  target="_blank"
                  rel="noreferrer"
                  className="ai-button flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  <span>Open Material</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LearningMaterialsPage;

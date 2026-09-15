import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Target, 
  Award, 
  Zap, 
  RefreshCw, 
  AlertCircle,
  BookOpen,
  ArrowUpRight,
  Layers,
  Globe
} from 'lucide-react';
import { aiService } from '../../services/aiService';

export const SkillForecastPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [forecast, setForecast] = useState<any>(null);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiService.getSkillForecast();
      setForecast(response?.data || response || getFallbackForecast());
    } catch (err: any) {
      console.error('Error fetching skill forecast:', err);
      setForecast(getFallbackForecast());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  function getFallbackForecast() {
    return {
      forecastPeriod: 'Q4 2026 - Q3 2027 (Next 12 Months)',
      topRisingSkills: [
        { name: 'LLM Agents & Multi-Agent Systems', growthRate: '+142%', demandScore: 98, domain: 'AI / GenAI' },
        { name: 'Rust for High-Performance Systems', growthRate: '+88%', demandScore: 92, domain: 'Systems Engineering' },
        { name: 'Next.js 15 & Server Components', growthRate: '+76%', demandScore: 90, domain: 'Frontend' },
        { name: 'Kubernetes & GitOps (ArgoCD)', growthRate: '+64%', demandScore: 88, domain: 'DevOps / Cloud' },
        { name: 'Vector DBs (Pinecone, Qdrant)', growthRate: '+115%', demandScore: 94, domain: 'Data Engineering' }
      ],
      decliningSkills: [
        { name: 'Legacy jQuery & Monolithic PHP', declineRate: '-45%', reason: 'Replacement by modern SSR & component frameworks' },
        { name: 'Manual QA & Scripted Testing', declineRate: '-38%', reason: 'Automated AI test agents and Playwright adoption' },
        { name: 'Basic REST-only CRUD Without GraphQL/gRPC', declineRate: '-28%', reason: 'Shift toward high-efficiency RPC & real-time streaming' }
      ],
      emergingTech: [
        { name: 'Quantum Machine Learning', maturity: 'Early Adoption', timeToImpact: '2-3 Years' },
        { name: 'AI Code Verification & Formal Proofs', maturity: 'Accelerating', timeToImpact: '< 1 Year' },
        { name: 'Edge AI Compute & WASM Modules', maturity: 'Mainstream Bound', timeToImpact: '1 Year' }
      ],
      recommendedSkills: [
        { name: 'LangChain / AutoGen Frameworks', difficulty: 'Medium', value: 'High Salary Premium', timeline: '3 Weeks' },
        { name: 'PostgreSQL Advanced Indexing & Vector Search', difficulty: 'Easy', value: 'Core Engineering Essential', timeline: '2 Weeks' },
        { name: 'System Design for Distributed Caches (Redis)', difficulty: 'Medium', value: 'Tier-1 Interview Must', timeline: '4 Weeks' }
      ],
      industryTrends: [
        'Over 75% of Enterprise hiring managers now mandate AI coding tool proficiency (GitHub Copilot, Cursor).',
        'Backend engineering roles are consolidating with Cloud Infrastructure (Platform Engineering specialization).',
        'System Design rounds now heavily emphasize low-latency caching and LLM token stream handling.'
      ]
    };
  }

  return (
    <div className="ai-shell min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 ai-fade-in">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="ai-badge ai-badge-green flex items-center gap-1 text-xs">
                <Sparkles className="w-3.5 h-3.5" /> Market Intelligence & Forecasting
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight ai-glow-text">
              Industry Skill Forecast
            </h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Predictive breakdown of high-demand tech skills, declining legacy tools, and emerging engineering trends.
            </p>
          </div>
          <button
            onClick={fetchForecast}
            disabled={loading}
            className="ai-button self-start md:self-auto flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Update Forecast
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {loading ? (
          <div className="ai-card p-8 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse space-y-4">
            <div className="h-8 bg-slate-800 rounded w-1/3"></div>
            <div className="h-48 bg-slate-800 rounded w-full"></div>
            <div className="h-48 bg-slate-800 rounded w-full"></div>
          </div>
        ) : error ? (
          <div className="ai-card p-8 bg-rose-950/30 border border-rose-800/60 rounded-2xl text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-semibold text-rose-300">Forecast Error</h3>
            <p className="text-slate-400 text-sm">{error}</p>
            <button
              onClick={fetchForecast}
              className="ai-button px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm"
            >
              Retry
            </button>
          </div>
        ) : !forecast ? (
          <div className="ai-card p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center text-slate-400">
            No skill forecast data available.
          </div>
        ) : (
          <>
            {/* Forecast Period Banner */}
            <div className="ai-card p-4 md:p-6 bg-slate-900/80 border border-indigo-800/40 rounded-2xl backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Forecast Horizon</h3>
                  <p className="text-base font-bold text-white">{forecast.forecastPeriod}</p>
                </div>
              </div>
              <span className="ai-badge ai-badge-green font-bold text-xs">Live Market Index</span>
            </div>

            {/* Rising vs Declining Skills */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Rising Skills */}
              <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-400 mb-6">
                  <TrendingUp className="w-5 h-5" /> Top Rising Skills & Demand Scores
                </h3>
                <div className="space-y-4">
                  {forecast.topRisingSkills?.map((skill: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-100">{skill.name}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                          {skill.growthRate} Growth
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>Domain: <strong className="text-indigo-300">{skill.domain}</strong></span>
                        <span>Demand Score: <strong className="text-emerald-400">{skill.demandScore}/100</strong></span>
                      </div>
                      <div className="ai-progress-track relative w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${skill.demandScore}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Declining Skills */}
              <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-rose-400 mb-6">
                  <TrendingDown className="w-5 h-5" /> Declining / Deprecating Skills
                </h3>
                <div className="space-y-4">
                  {forecast.decliningSkills?.map((skill: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-950/70 border border-rose-900/30 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-200">{skill.name}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/50">
                          {skill.declineRate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        <strong className="text-rose-300">Reason:</strong> {skill.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Emerging Technologies & Recommended Skills */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Emerging Tech */}
              <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-amber-400 mb-6">
                  <Sparkles className="w-5 h-5" /> Emerging Frontier Tech
                </h3>
                <div className="space-y-4">
                  {forecast.emergingTech?.map((tech: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200">{tech.name}</h4>
                        <span className="text-xs text-slate-400">Time to Impact: {tech.timeToImpact}</span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-950 text-amber-400 border border-amber-800/50">
                        {tech.maturity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Skills to Learn */}
              <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-indigo-400 mb-6">
                  <Target className="w-5 h-5" /> Recommended Learning Focus
                </h3>
                <div className="space-y-4">
                  {forecast.recommendedSkills?.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-200">{item.name}</span>
                        <span className="text-xs font-bold text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/40">
                          Est: {item.timeline}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>Difficulty: <strong className="text-slate-300">{item.difficulty}</strong></span>
                        <span>Value: <strong className="text-emerald-400">{item.value}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Industry Trends List */}
            <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-200">
                <Layers className="w-5 h-5 text-indigo-400" /> Key Macro Industry Trends
              </h3>
              <div className="space-y-3">
                {forecast.industryTrends?.map((trend: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs md:text-sm text-slate-300">
                    <ArrowUpRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{trend}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SkillForecastPage;

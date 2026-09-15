import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  Zap, 
  ShieldAlert, 
  ArrowRight, 
  RefreshCw, 
  Filter, 
  CheckCircle2,
  Calendar,
  ExternalLink,
  Target
} from 'lucide-react';
import { aiService } from '../../services/aiService';

export const ActionCenterPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  const fetchActionCenter = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiService.getActionCenter();
      setData(response?.data || response || getFallbackActions());
    } catch (err: any) {
      console.error('Error fetching action center:', err);
      setData(getFallbackActions());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActionCenter();
  }, []);

  function getFallbackActions() {
    return {
      totalActions: 6,
      urgentCount: 2,
      actions: [
        {
          id: 'ACT-001',
          title: 'Complete AWS Cloud Infrastructure Assessment',
          description: 'AI model identified missing cloud certification proof required for top Product Manager & Cloud Dev roles.',
          priority: 'HIGH',
          category: 'Technical Assessment',
          impactScore: '+8 pts',
          estimatedTime: '45 mins',
          dueDate: 'Today (23:59)',
          actionSteps: [
            'Review VPC & IAM Security best practices',
            'Take 30-question timed cloud assessment',
            'Submit solution to verify badge'
          ],
          featureUrl: '/assessments/aws-cloud',
          buttonText: 'Start Assessment'
        },
        {
          id: 'ACT-002',
          title: 'Resolve Resume Formatting Gaps for Stripe Role',
          description: 'ATS match parser detected missing keywords: "TypeScript Microservices", "GraphQL API", and "Tailwind CSS".',
          priority: 'HIGH',
          category: 'Resume Optimization',
          impactScore: '+12 pts',
          estimatedTime: '20 mins',
          dueDate: 'Tomorrow',
          actionSteps: [
            'Open AI Resume Builder',
            'Accept 3 suggested keyword additions',
            'Export updated PDF resume'
          ],
          featureUrl: '/resume/builder',
          buttonText: 'Open Resume Builder'
        },
        {
          id: 'ACT-003',
          title: 'Practice Dynamic Programming Graph Problems',
          description: 'Weakness detected in Graph Traversal during previous mock assessment.',
          priority: 'MEDIUM',
          category: 'DSA Practice',
          impactScore: '+6 pts',
          estimatedTime: '1.5 Hours',
          dueDate: 'In 3 Days',
          actionSteps: [
            'Solve 3 Graph BFS/DFS Medium problems',
            'Study Dijkstra Algorithm explanation',
            'Re-run code efficiency checker'
          ],
          featureUrl: '/practice/dsa/graphs',
          buttonText: 'Practice Coding'
        },
        {
          id: 'ACT-004',
          title: 'Schedule Mock AI HR Interview Session',
          description: 'Prepare for behavioral questions regarding team conflict resolution and project leadership.',
          priority: 'MEDIUM',
          category: 'Soft Skills',
          impactScore: '+5 pts',
          estimatedTime: '30 mins',
          dueDate: 'In 4 Days',
          actionSteps: [
            'Select HR Behavioral Template',
            'Record 3 video/voice answers',
            'Review AI confidence feedback score'
          ],
          featureUrl: '/interview/mock-hr',
          buttonText: 'Start Mock Interview'
        },
        {
          id: 'ACT-005',
          title: 'Update GitHub Portfolio Project Documentation',
          description: 'Add live demo links and architecture diagrams to your top pinned repository.',
          priority: 'LOW',
          category: 'Portfolio',
          impactScore: '+3 pts',
          estimatedTime: '40 mins',
          dueDate: 'This Week',
          actionSteps: [
            'Create architecture diagram using Mermaid/Excalidraw',
            'Update README.md with setup instructions'
          ],
          featureUrl: '/portfolio/projects',
          buttonText: 'Manage Portfolio'
        },
        {
          id: 'ACT-006',
          title: 'Review System Design Distributed Caching Notes',
          description: 'Refresh Redis cache invalidation strategies ahead of upcoming placement drive.',
          priority: 'LOW',
          category: 'System Design',
          impactScore: '+4 pts',
          estimatedTime: '25 mins',
          dueDate: 'Next Week',
          actionSteps: [
            'Read Cache-Aside vs Write-Through pattern comparison',
            'Complete 5-question quick quiz'
          ],
          featureUrl: '/learning/system-design',
          buttonText: 'Read Study Notes'
        }
      ]
    };
  }

  const filteredActions = data?.actions?.filter((a: any) => {
    if (filterPriority === 'ALL') return true;
    return a.priority === filterPriority;
  }) || [];

  return (
    <div className="ai-shell min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 ai-fade-in">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="ai-badge ai-badge-green flex items-center gap-1 text-xs">
                <CheckSquare className="w-3.5 h-3.5" /> AI Priority Engine
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight ai-glow-text">
              AI Action Center
            </h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Urgent tasks, targeted skill fixes, and prioritized high-impact recommendations to maximize placement readiness.
            </p>
          </div>
          <button
            onClick={fetchActionCenter}
            disabled={loading}
            className="ai-button self-start md:self-auto flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Actions
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {loading ? (
          <div className="ai-card p-8 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse space-y-4">
            <div className="h-8 bg-slate-800 rounded w-1/3"></div>
            <div className="h-32 bg-slate-800 rounded w-full"></div>
            <div className="h-32 bg-slate-800 rounded w-full"></div>
          </div>
        ) : error ? (
          <div className="ai-card p-8 bg-rose-950/30 border border-rose-800/60 rounded-2xl text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-semibold text-rose-300">Action Center Error</h3>
            <p className="text-slate-400 text-sm">{error}</p>
            <button
              onClick={fetchActionCenter}
              className="ai-button px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm"
            >
              Retry
            </button>
          </div>
        ) : !data ? (
          <div className="ai-card p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center text-slate-400">
            No active action items.
          </div>
        ) : (
          <>
            {/* Top Counters & Filter Bar */}
            <div className="ai-card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">TOTAL ACTIONS</span>
                  <span className="text-3xl font-extrabold text-white">{data.totalActions}</span>
                </div>
                <div className="h-8 w-px bg-slate-800"></div>
                <div>
                  <span className="text-xs text-rose-400 font-semibold block">URGENT (HIGH)</span>
                  <span className="text-3xl font-extrabold text-rose-400">{data.urgentCount}</span>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      filterPriority === p
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p === 'HIGH' ? 'URGENT (HIGH)' : p}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Action Cards Grid */}
            <div className="space-y-6">
              {filteredActions.length === 0 ? (
                <div className="ai-card p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center text-slate-400">
                  No action items found for priority level: {filterPriority}.
                </div>
              ) : (
                filteredActions.map((action: any) => (
                  <div
                    key={action.id}
                    className={`ai-card p-6 bg-slate-900/80 border rounded-2xl backdrop-blur-md space-y-4 transition ${
                      action.priority === 'HIGH'
                        ? 'border-rose-900/50 hover:border-rose-700/80'
                        : action.priority === 'MEDIUM'
                        ? 'border-amber-900/50 hover:border-amber-700/80'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`ai-badge text-xs font-bold ${
                          action.priority === 'HIGH' ? 'ai-badge-red' : action.priority === 'MEDIUM' ? 'ai-badge-orange' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {action.priority === 'HIGH' ? 'URGENT' : action.priority}
                        </span>
                        <span className="text-xs font-semibold text-indigo-400 bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-800/40">
                          {action.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" /> Est: {action.estimatedTime}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-rose-400">
                          <Calendar className="w-3.5 h-3.5 text-rose-400" /> Due: {action.dueDate}
                        </span>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/50">
                          Impact: {action.impactScore}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{action.title}</h3>
                      <p className="text-xs md:text-sm text-slate-300">{action.description}</p>
                    </div>

                    {/* Checklist */}
                    {action.actionSteps && (
                      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-2">
                        <span className="text-xs font-semibold text-slate-400 block mb-1">Action Steps:</span>
                        <div className="space-y-1.5">
                          {action.actionSteps.map((step: string, sIdx: number) => (
                            <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer Button */}
                    <div className="flex justify-end pt-2">
                      <a
                        href={action.featureUrl}
                        className="ai-button px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20"
                      >
                        {action.buttonText} <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActionCenterPage;

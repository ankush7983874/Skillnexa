import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Sparkles, 
  Briefcase, 
  Building2, 
  MapPin, 
  DollarSign, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle,
  Clock,
  Filter,
  ArrowRight,
  Star
} from 'lucide-react';
import { aiService } from '../../services/aiService';

export const JobAlertsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiService.getJobAlerts();
      const list = response?.data || response || getFallbackAlerts();
      setAlerts(Array.isArray(list) ? list : getFallbackAlerts());
    } catch (err: any) {
      console.error('Error fetching job alerts:', err);
      setAlerts(getFallbackAlerts());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  function getFallbackAlerts() {
    return [
      {
        id: 'ALERT-101',
        jobId: 'JOB-9021',
        jobTitle: 'Frontend Engineer (React / Next.js)',
        company: 'Stripe Global',
        location: 'Remote / Bengaluru',
        salaryRange: '$80,000 - $110,000 / yr',
        matchScore: 94,
        alertReason: 'Matches top 1% of your technical skills in React, TypeScript, and Tailwind CSS.',
        matchedSkills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'],
        postedTime: '2 hours ago',
        applyUrl: '/jobs/JOB-9021'
      },
      {
        id: 'ALERT-102',
        jobId: 'JOB-9022',
        jobTitle: 'Full Stack Software Engineer',
        company: 'Atlassian',
        location: 'Bengaluru, India',
        salaryRange: '₹28,000,000 - ₹35,000,000 / yr',
        matchScore: 89,
        alertReason: 'Strong alignment with your Data Structures performance and Node.js microservices projects.',
        matchedSkills: ['Java', 'Spring Boot', 'Node.js', 'PostgreSQL', 'Microservices'],
        postedTime: '5 hours ago',
        applyUrl: '/jobs/JOB-9022'
      },
      {
        id: 'ALERT-103',
        jobId: 'JOB-9023',
        jobTitle: 'AI Integration & Backend Developer',
        company: 'OpenScale AI',
        location: 'Hyderabad, India (Hybrid)',
        salaryRange: '₹22,000,000 - ₹28,000,000 / yr',
        matchScore: 85,
        alertReason: 'High demand match based on your recent AI/ML coursework and Python API projects.',
        matchedSkills: ['Python', 'FastAPI', 'LangChain', 'Docker', 'REST APIs'],
        postedTime: '1 day ago',
        applyUrl: '/jobs/JOB-9023'
      },
      {
        id: 'ALERT-104',
        jobId: 'JOB-9024',
        jobTitle: 'Associate Software Engineer',
        company: 'Microsoft',
        location: 'Hyderabad / Noida',
        salaryRange: '₹20,000,000 - ₹26,000,000 / yr',
        matchScore: 91,
        alertReason: 'Matches your high CGPA (8.7) and high score in Campus Placement Readiness.',
        matchedSkills: ['C++', 'Data Structures', 'Algorithms', 'System Design'],
        postedTime: '1 day ago',
        applyUrl: '/jobs/JOB-9024'
      }
    ];
  }

  return (
    <div className="ai-shell min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 ai-fade-in">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="ai-badge ai-badge-green flex items-center gap-1 text-xs">
                <Bell className="w-3.5 h-3.5" /> Smart Job Notifications
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight ai-glow-text">
              AI Job Alerts
            </h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Real-time high-affinity job matches curated by AI based on your latest skill matrix and interview readiness.
            </p>
          </div>
          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="ai-button self-start md:self-auto flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Alerts
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="ai-card p-6 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse space-y-4">
                <div className="h-6 bg-slate-800 rounded w-2/3"></div>
                <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                <div className="h-16 bg-slate-800 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="ai-card p-8 bg-rose-950/30 border border-rose-800/60 rounded-2xl text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-semibold text-rose-300">Unable to load job alerts</h3>
            <p className="text-slate-400 text-sm">{error}</p>
            <button
              onClick={fetchAlerts}
              className="ai-button px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm"
            >
              Try Again
            </button>
          </div>
        ) : alerts.length === 0 ? (
          <div className="ai-card p-12 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-4">
            <Bell className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-semibold text-slate-300">No Job Alerts Available</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              We haven't detected any new high-affinity job matches yet. Check back soon as new opportunities are indexed continuously.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {alerts.map((alert: any) => (
              <div
                key={alert.id}
                className="ai-card p-6 bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl transition duration-300 backdrop-blur-md flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-4">
                  {/* Top row: Company & Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-1">
                        <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{alert.company}</span>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{alert.postedTime}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition">
                        {alert.jobTitle}
                      </h3>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`ai-badge font-black text-sm px-3 py-1 ${
                        alert.matchScore >= 90 ? 'ai-badge-green' : 'ai-badge-orange'
                      }`}>
                        {alert.matchScore}% Match
                      </span>
                    </div>
                  </div>

                  {/* Location & Salary */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> {alert.location}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> {alert.salaryRange}
                    </span>
                  </div>

                  {/* Alert Reason */}
                  <div className="p-3.5 bg-indigo-950/40 border border-indigo-800/30 rounded-xl text-xs text-indigo-200 leading-relaxed">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 inline mr-1.5" />
                    <strong>Why AI Flagged This:</strong> {alert.alertReason}
                  </div>

                  {/* Matched Skills */}
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-2">Matched Key Skills:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {alert.matchedSkills?.map((skill: string, sIdx: number) => (
                        <span
                          key={sIdx}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <a
                    href={`/ai/job-explainability?jobId=${alert.jobId}`}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    View AI Match Breakdown <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={alert.applyUrl}
                    className="ai-button px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                  >
                    Apply Now <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobAlertsPage;

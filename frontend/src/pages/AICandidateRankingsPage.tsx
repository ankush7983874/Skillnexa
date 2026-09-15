import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { Sparkles, CheckCircle2, XCircle, ArrowLeft, Award, GraduationCap, FolderGit2, User, ChevronRight } from 'lucide-react';

export const AICandidateRankingsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await apiClient.get(`/ai/jobs/${jobId}/candidates`);
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to calculate candidate rankings');
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-slate-400">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Running 7-tier Explainable AI Candidate Matching Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-6 max-w-6xl mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/company/jobs')} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              <span>AI Candidate Compatibility Rankings</span>
            </h2>
            <p className="text-xs text-slate-400">Job: {data?.jobTitle} • Evaluated Candidates: {data?.totalCandidatesEvaluated}</p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          Explainable Matching Weights Active
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Candidate Ranking List */}
      <div className="space-y-6">
        {data?.candidates?.map((candidate: any, index: number) => (
          <div
            key={candidate.studentId}
            className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-6 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950/80"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-lg shadow-md shadow-blue-500/20">
                  #{index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <span>{candidate.candidateName}</span>
                    <span className="text-xs font-normal text-slate-400">({candidate.email})</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {candidate.college} • {candidate.degree} in {candidate.branch} (CGPA: {candidate.cgpa})
                  </p>
                </div>
              </div>

              {/* Match Score Badge */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                    {candidate.matchScore}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Compatibility</div>
                </div>
              </div>
            </div>

            {/* Summary Text */}
            <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <strong className="text-blue-400">AI Match Explanation: </strong>
              {candidate.summary}
            </p>

            {/* Granular Breakdown Meters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <BreakdownMeter label="Tech Skills (40%)" value={candidate.breakdown.technicalSkills.score} max={40} />
              <BreakdownMeter label="Academic CGPA (20%)" value={candidate.breakdown.academicPerformance.score} max={20} />
              <BreakdownMeter label="Assessments (15%)" value={candidate.breakdown.assessmentScore.score} max={15} />
              <BreakdownMeter label="Projects (10%)" value={candidate.breakdown.projects.score} max={10} />
            </div>

            {/* Matched vs Missing Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-2">
                <div className="font-semibold text-emerald-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Matched Skills ({candidate.breakdown.technicalSkills.matchedSkills.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.breakdown.technicalSkills.matchedSkills.map((sk: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-mono">
                      ✓ {sk}
                    </span>
                  ))}
                  {candidate.breakdown.technicalSkills.matchedSkills.length === 0 && (
                    <span className="text-slate-500 text-xs">No direct skill matches</span>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/15 space-y-2">
                <div className="font-semibold text-rose-400 flex items-center space-x-1.5">
                  <XCircle className="h-4 w-4" />
                  <span>Missing Requirements ({candidate.breakdown.technicalSkills.missingSkills.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.breakdown.technicalSkills.missingSkills.map((sk: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[11px] font-mono">
                      ✗ {sk}
                    </span>
                  ))}
                  {candidate.breakdown.technicalSkills.missingSkills.length === 0 && (
                    <span className="text-emerald-400 text-xs">All required skills matched!</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BreakdownMeter: React.FC<{ label: string; value: number; max: number }> = ({ label, value, max }) => {
  const percentage = Math.round((value / max) * 100);
  return (
    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
      <div className="flex justify-between text-[11px] text-slate-400">
        <span>{label}</span>
        <span className="font-bold text-slate-200">{value}/{max}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

export default AICandidateRankingsPage;

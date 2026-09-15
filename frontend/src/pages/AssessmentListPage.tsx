import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { Award, Clock, FileCheck, CheckCircle2, Play, Sparkles } from 'lucide-react';

export const AssessmentListPage: React.FC = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      // Auto seed comprehensive 11-skill technical question bank if empty/outdated
      await apiClient.post('/assessments/seed');

      const [assRes, resRes] = await Promise.all([
        apiClient.get('/assessments'),
        apiClient.get('/assessments/my-results'),
      ]);

      if (assRes.data?.success) setAssessments(assRes.data.data);
      if (resRes.data?.success) setResults(resRes.data.data);
    } catch (err) {
      console.error('Failed to load assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const categories = ['ALL', 'Programming', 'Database', 'Engineering', 'Infrastructure', 'Data Science'];

  const filteredAssessments = selectedCategory === 'ALL'
    ? assessments
    : assessments.filter((a) => a.category?.toLowerCase() === selectedCategory.toLowerCase());

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-slate-400">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading skill evaluation assessments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-6 max-w-6xl mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center space-x-3">
            <Award className="h-7 w-7 text-emerald-400" />
            <span>AI Skill Evaluation Engine (11 Technical Categories)</span>
          </h2>
          <p className="text-sm text-slate-400">
            Take verified role-based evaluations to automatically generate your verified capability profile.
          </p>
        </div>
      </div>

      {/* Historical Attempts Table */}
      {results.length > 0 && (
        <section className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Your Assessment Evaluation History</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Assessment Title</th>
                  <th className="py-2.5 px-4">Skill</th>
                  <th className="py-2.5 px-4">Score</th>
                  <th className="py-2.5 px-4">Percentage</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Attempt Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {results.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-900/50">
                    <td className="py-3 px-4 font-sans font-semibold text-white">{r.assessmentTitle}</td>
                    <td className="py-3 px-4 text-blue-300">{r.skillName}</td>
                    <td className="py-3 px-4">{r.score} / {r.totalMarks}</td>
                    <td className="py-3 px-4 font-bold text-slate-200">{r.percentage}%</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {r.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{new Date(r.attemptDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Category Filter Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Available Assessments Grid */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white">
          Available Skill Assessments ({filteredAssessments.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAssessments.map((item) => (
            <div
              key={item._id}
              className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
                    {item.category} • {item.difficulty}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-slate-400 font-mono">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{item.durationMinutes} mins</span>
                  </div>
                </div>

                <h4 className="text-lg font-bold text-white">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>

                <div className="flex items-center space-x-4 text-xs text-slate-400 pt-1 font-mono">
                  <span>Skill Tag: <strong className="text-slate-200">{item.skillName}</strong></span>
                  <span>Passing: <strong className="text-emerald-400">{item.passingScore}%</strong></span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/assessments/${item._id}/take`)}
                className="w-full glass-button py-2.5 px-4 rounded-xl text-xs font-semibold text-white flex items-center justify-center space-x-2"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Start Evaluation</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AssessmentListPage;

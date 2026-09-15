import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { Building2, Users, AlertTriangle, CheckCircle2, XCircle, FileText, Download, TrendingUp } from 'lucide-react';

export const InstitutionAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'DOCUMENTS'>('ANALYTICS');
  const [department, setDepartment] = useState('Computer Science');
  const [analytics, setAnalytics] = useState<any>(null);
  const [pendingDocs, setPendingDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentData();
  }, [department]);

  useEffect(() => {
    fetchPendingDocs();
  }, []);

  const fetchDepartmentData = async () => {
    try {
      const res = await apiClient.get('/admin/hod/department-analytics', { params: { department } });
      if (res.data?.success) {
        setAnalytics(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load department analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingDocs = async () => {
    try {
      const res = await apiClient.get('/documents/pending');
      if (res.data?.success) {
        setPendingDocs(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load pending verification documents:', e);
    }
  };

  const handleVerifyDoc = async (documentId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await apiClient.put(`/documents/${documentId}/verify`, { status });
      if (res.data?.success) {
        setPendingDocs((prev) => prev.filter((d) => d._id !== documentId));
      }
    } catch (e) {
      alert('Action failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070710] text-slate-100 p-4 lg:p-8 font-sans max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-violet-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Institution & HOD Admin Console</h1>
            <p className="text-xs text-slate-400">Department Metrics, At-Risk Student Tracking & Document Verification</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-4 py-2 rounded-xl transition ${activeTab === 'ANALYTICS' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Department Analytics
          </button>
          <button
            onClick={() => setActiveTab('DOCUMENTS')}
            className={`px-4 py-2 rounded-xl transition ${activeTab === 'DOCUMENTS' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Pending Verifications ({pendingDocs.length})
          </button>
        </div>
      </div>

      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6">
          {/* Department Select */}
          <div className="flex items-center space-x-3 text-xs">
            <label className="text-slate-400 font-semibold">Select Department:</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-violet-500"
            >
              <option value="Computer Science">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics & Communication</option>
              <option value="Mechanical">Mechanical Engineering</option>
            </select>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-slate-800 text-xs">
              <span className="text-slate-400">Total Enrolled Students</span>
              <p className="text-2xl font-bold text-white mt-1">{analytics?.totalStudents || 0}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-800 text-xs">
              <span className="text-slate-400">Department Faculty</span>
              <p className="text-2xl font-bold text-white mt-1">{analytics?.facultyCount || 0}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-800 text-xs">
              <span className="text-slate-400">Placements Rate</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{analytics?.placementRate || '0%'}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-800 text-xs">
              <span className="text-slate-400">At-Risk Students</span>
              <p className="text-2xl font-bold text-rose-400 mt-1">{analytics?.atRiskCount || 0}</p>
            </div>
          </div>

          {/* At-Risk Students Table */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-bold text-white text-sm">At-Risk Students Identification</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">CGPA</th>
                    <th className="p-3">Verified Skills</th>
                    <th className="p-3">Risk Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {analytics?.atRiskStudents?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500">
                        No at-risk students flagged in this department.
                      </td>
                    </tr>
                  ) : (
                    analytics?.atRiskStudents?.map((st: any) => (
                      <tr key={st._id} className="hover:bg-slate-900/50">
                        <td className="p-3 font-semibold text-white">{st.name}</td>
                        <td className="p-3 text-slate-400">{st.email}</td>
                        <td className="p-3 font-mono font-bold text-amber-400">{st.cgpa || 'N/A'}</td>
                        <td className="p-3">{st.verifiedSkillsCount} / {st.skillsCount}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {st.riskReason}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENDING DOCUMENTS */}
      {activeTab === 'DOCUMENTS' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm">Document Verification Queue</h3>

          {pendingDocs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No pending documents requiring verification.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingDocs.map((doc) => (
                <div key={doc._id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{doc.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-violet-500/20 text-violet-300 font-mono">
                        {doc.documentType}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-0.5">Submitted by: {doc.user?.name || 'User'} ({doc.user?.email})</p>
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-violet-400 hover:underline text-[11px] mt-1 inline-block">
                      View Uploaded Document &rarr;
                    </a>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleVerifyDoc(doc._id, 'VERIFIED')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white flex items-center space-x-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleVerifyDoc(doc._id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-white flex items-center space-x-1"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstitutionAdminPage;

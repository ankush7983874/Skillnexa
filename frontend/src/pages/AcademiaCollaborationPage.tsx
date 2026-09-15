import { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Handshake, Plus, CheckCircle2, XCircle, Clock, Building, GraduationCap } from 'lucide-react';

export const AcademiaCollaborationPage: React.FC = () => {
  const { user } = useAuth();
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'JOINT_RESEARCH',
    institutionName: '',
    department: 'Computer Science',
    description: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const fetchCollaborations = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/collaborations');
      if (res.data?.success) {
        setCollaborations(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/collaborations/propose', formData);
      if (res.data?.success) {
        setShowModal(false);
        setFormData({ title: '', type: 'JOINT_RESEARCH', institutionName: '', department: 'Computer Science', description: '' });
        fetchCollaborations();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit proposal.');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await apiClient.put(`/collaborations/${id}/status`, { status });
      if (res.data?.success) {
        fetchCollaborations();
      }
    } catch (e) {
      alert('Failed to update status.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070710] text-slate-100 p-4 lg:p-8 font-sans max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-violet-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
            <Handshake className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Academia – Industry Collaboration Engine</h1>
            <p className="text-xs text-slate-400">Joint Research, Live Projects, Workshops, Hackathons & Guest Lectures</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white flex items-center space-x-2 shadow-lg shadow-violet-600/30 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Propose New Collaboration</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collaborations.length === 0 ? (
          <div className="col-span-full glass-panel p-8 text-center text-slate-500 text-xs">
            No collaboration proposals submitted yet.
          </div>
        ) : (
          collaborations.map((collab) => (
            <div key={collab._id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {collab.type.replace(/_/g, ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${collab.status === 'ACCEPTED' || collab.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : collab.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    {collab.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{collab.title}</h3>
                <p className="text-xs text-slate-400 font-semibold">{collab.companyName} ↔ {collab.institutionName}</p>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{collab.description}</p>
              </div>

              {(user?.role === 'ADMIN' || user?.role === 'INSTITUTION' || user?.role === 'COMPANY') && collab.status === 'PROPOSED' && (
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleUpdateStatus(collab._id, 'ACCEPTED')}
                    className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[11px] font-bold text-white transition"
                  >
                    Accept Proposal
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(collab._id, 'REJECTED')}
                    className="flex-1 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-[11px] font-bold text-white transition"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 max-w-md w-full space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Propose Academia–Industry Partnership</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateProposal} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Collaboration Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Joint AI & Cloud Computing Lab"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Partnership Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="JOINT_RESEARCH">Joint Research</option>
                  <option value="WORKSHOP">Workshop / FDP</option>
                  <option value="HACKATHON">Hackathon</option>
                  <option value="LIVE_PROJECT">Live Industry Project</option>
                  <option value="GUEST_LECTURE">Guest Lecture Series</option>
                  <option value="INDUSTRIAL_VISIT">Industrial Visit</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Partner Institution Name</label>
                <input
                  type="text"
                  required
                  value={formData.institutionName}
                  onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                  placeholder="IIT Bombay / National Institute of Technology"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Detailed Description & Objectives</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline the scope, resource sharing, student participation, and expected outcomes..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-white shadow-lg shadow-violet-600/30"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademiaCollaborationPage;

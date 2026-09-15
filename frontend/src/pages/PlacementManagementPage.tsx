import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Award, FileText, Download, CheckCircle2, XCircle, Clock, Building, DollarSign } from 'lucide-react';

export const PlacementManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [placements, setPlacements] = useState<any[]>([]);
  const [selectedPlacement, setSelectedPlacement] = useState<any>(null);
  const [joiningStatus, setJoiningStatus] = useState<string>('JOINED');
  const [joiningDate, setJoiningDate] = useState<string>('');
  const [offerLetterUrl, setOfferLetterUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/placements');
      if (res.data?.success) {
        setPlacements(res.data.data.placements);
      }
    } catch (e) {
      console.error('Failed to load placements:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlacement) return;

    try {
      const res = await apiClient.put(`/placements/${selectedPlacement._id}/joining`, {
        joiningStatus,
        joiningDate: joiningDate || undefined,
        offerLetterUrl: offerLetterUrl || undefined,
      });

      if (res.data?.success) {
        setSelectedPlacement(null);
        fetchPlacements();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update placement status.');
    }
  };

  const handleExportCsv = () => {
    window.open('/api/reports/placements?format=csv', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#070710] text-slate-100 p-4 lg:p-8 font-sans max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-violet-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
            <Award className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Complete Placement & Offer Management</h1>
            <p className="text-xs text-slate-400">Offer Letters, Joining Status, Verification & Placement Statistics</p>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-bold text-emerald-400 flex items-center space-x-2 transition"
        >
          <Download className="h-4 w-4" />
          <span>Export Placements CSV</span>
        </button>
      </div>

      {/* Placements List */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-sm">Student Placement Records</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Student Name</th>
                <th className="p-3">Company</th>
                <th className="p-3">Role</th>
                <th className="p-3">CTC</th>
                <th className="p-3">Joining Status</th>
                <th className="p-3">Offer Letter</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {placements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-500">
                    No placement records found.
                  </td>
                </tr>
              ) : (
                placements.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-white">{p.student?.user?.name || 'Student'}</td>
                    <td className="p-3 text-slate-300 font-semibold">{p.company?.companyName || 'Company'}</td>
                    <td className="p-3">{p.role}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{p.ctcLpa ? `${p.ctcLpa} LPA` : p.salary || 'N/A'}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${p.joiningStatus === 'JOINED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : p.joiningStatus === 'DECLINED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                        {p.joiningStatus || 'PENDING'}
                      </span>
                    </td>
                    <td className="p-3">
                      {p.offerLetterUrl ? (
                        <a href={p.offerLetterUrl} target="_blank" rel="noreferrer" className="text-violet-400 hover:underline flex items-center space-x-1">
                          <FileText className="h-3.5 w-3.5" />
                          <span>Offer PDF</span>
                        </a>
                      ) : (
                        <span className="text-slate-500">Pending Upload</span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelectedPlacement(p);
                          setJoiningStatus(p.joiningStatus || 'JOINED');
                          setOfferLetterUrl(p.offerLetterUrl || '');
                        }}
                        className="px-3 py-1 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-white transition text-[11px]"
                      >
                        Update Record
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedPlacement && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 max-w-md w-full space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Update Placement & Joining</h3>
              <button onClick={() => setSelectedPlacement(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdatePlacement} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Joining Status</label>
                <select
                  value={joiningStatus}
                  onChange={(e) => setJoiningStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="JOINED">JOINED (Confirmed)</option>
                  <option value="DECLINED">DECLINED</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Offer Letter URL / Path</label>
                <input
                  type="text"
                  value={offerLetterUrl}
                  onChange={(e) => setOfferLetterUrl(e.target.value)}
                  placeholder="https://... or /uploads/offer.pdf"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Confirmed Joining Date</label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlacement(null)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-600/30"
                >
                  Save Placement Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementManagementPage;

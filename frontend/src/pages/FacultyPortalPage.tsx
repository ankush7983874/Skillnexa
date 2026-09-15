import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, BookOpen, Award, User, Send, CheckCircle2, Clock, Plus, Search, Filter } from 'lucide-react';

export const FacultyPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'OPPORTUNITIES' | 'APPLICATIONS' | 'PROFILE'>('OPPORTUNITIES');

  // Profile State
  const [profile, setProfile] = useState<any>({
    institution: '',
    department: '',
    designation: '',
    specialization: [],
    researchAreas: [],
    bio: '',
    skills: [],
  });

  // Opportunities & Applications State
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  const [proposal, setProposal] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const fetchFacultyData = async () => {
    setLoading(true);
    try {
      const [oppRes, appRes, profRes] = await Promise.allSettled([
        apiClient.get('/faculty/opportunities'),
        apiClient.get('/faculty/applications/my'),
        apiClient.get('/faculty/profile'),
      ]);

      if (oppRes.status === 'fulfilled' && oppRes.value.data?.success) {
        setOpportunities(oppRes.value.data.data);
      }
      if (appRes.status === 'fulfilled' && appRes.value.data?.success) {
        setMyApplications(appRes.value.data.data);
      }
      if (profRes.status === 'fulfilled' && profRes.value.data?.success) {
        setProfile(profRes.value.data.data);
      }
    } catch (e) {
      console.error('Failed to load faculty portal data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiClient.put('/faculty/profile', profile);
      if (res.data?.success) {
        setMsg('Profile updated successfully!');
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;
    setSubmitting(true);
    try {
      const res = await apiClient.post('/faculty/opportunities/apply', {
        opportunityId: selectedOpp._id,
        proposal,
      });

      if (res.data?.success) {
        setMsg('Application submitted successfully!');
        setSelectedOpp(null);
        setProposal('');
        fetchFacultyData();
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070710] text-slate-100 p-4 lg:p-8 font-sans max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-violet-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Faculty & Academician Portal</h1>
              <p className="text-xs text-slate-400">FDPs, Research Collaborations, Guest Lectures & Mentorship</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('OPPORTUNITIES')}
            className={`px-4 py-2 rounded-xl transition ${activeTab === 'OPPORTUNITIES' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Industry Opportunities ({opportunities.length})
          </button>
          <button
            onClick={() => setActiveTab('APPLICATIONS')}
            className={`px-4 py-2 rounded-xl transition ${activeTab === 'APPLICATIONS' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            My Applications ({myApplications.length})
          </button>
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`px-4 py-2 rounded-xl transition ${activeTab === 'PROFILE' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Faculty Profile
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* TAB 1: OPPORTUNITIES */}
      {activeTab === 'OPPORTUNITIES' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunities.length === 0 ? (
              <div className="col-span-full glass-panel p-8 text-center text-slate-500 text-xs">
                No active industry opportunities posted yet.
              </div>
            ) : (
              opportunities.map((opp) => (
                <div key={opp._id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {opp.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">{opp.duration}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{opp.title}</h3>
                    <p className="text-xs text-slate-400 font-semibold">{opp.companyName}</p>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{opp.description}</p>
                  </div>

                  <button
                    onClick={() => setSelectedOpp(opp)}
                    className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition mt-2 shadow-lg shadow-violet-600/20"
                  >
                    Apply / Express Interest &rarr;
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY APPLICATIONS */}
      {activeTab === 'APPLICATIONS' && (
        <div className="space-y-3">
          {myApplications.length === 0 ? (
            <div className="glass-panel p-8 text-center text-slate-500 text-xs">
              No faculty applications submitted yet.
            </div>
          ) : (
            myApplications.map((app) => (
              <div key={app._id} className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm">{app.opportunity?.title || 'Faculty Opportunity'}</h4>
                  <p className="text-slate-400">{app.opportunity?.companyName} • Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${app.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : app.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                  {app.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: FACULTY PROFILE */}
      {activeTab === 'PROFILE' && (
        <form onSubmit={handleUpdateProfile} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 max-w-2xl text-xs">
          <h3 className="text-sm font-bold text-white">Update Faculty Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Institution Name</label>
              <input
                type="text"
                value={profile.institution}
                onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                placeholder="IIT Bombay"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Department</label>
              <input
                type="text"
                value={profile.department}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                placeholder="Computer Science & Engineering"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Designation</label>
              <input
                type="text"
                value={profile.designation}
                onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                placeholder="Associate Professor"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Years of Experience</label>
              <input
                type="number"
                value={profile.experienceYears}
                onChange={(e) => setProfile({ ...profile, experienceYears: parseInt(e.target.value) || 0 })}
                placeholder="8"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Academic Bio & Research Summary</label>
            <textarea
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Specializing in Distributed Systems, Machine Learning, and Cloud Computing..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="py-2.5 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-white transition shadow-lg shadow-violet-600/30"
          >
            Save Faculty Profile
          </button>
        </form>
      )}

      {/* Application Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 max-w-lg w-full space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Apply: {selectedOpp.title}</h3>
              <button onClick={() => setSelectedOpp(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-slate-400">{selectedOpp.companyName} • {selectedOpp.type.replace(/_/g, ' ')}</p>

            <form onSubmit={handleApplyOpportunity} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Proposal / Expression of Interest</label>
                <textarea
                  rows={4}
                  required
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  placeholder="Outline your background, availability, and collaborative goals..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOpp(null)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-white shadow-lg shadow-violet-600/30"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyPortalPage;

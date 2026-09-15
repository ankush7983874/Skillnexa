import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Plus, Briefcase, MapPin, DollarSign, Calendar, Sparkles, AlertCircle, CheckCircle2, UserCheck, X } from 'lucide-react';
import Navbar from './ai/components/Navbar';

export const CompanyJobsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [preferredSkills, setPreferredSkills] = useState('');
  const [employmentType, setEmploymentType] = useState<'Full-time' | 'Part-time' | 'Contract'>('Full-time');
  const [experience, setExperience] = useState('Fresher / 0-2 years');
  const [minCgpa, setMinCgpa] = useState(7.0);
  const [location, setLocation] = useState('Remote / Hybrid');
  const [salary, setSalary] = useState('₹10 - ₹15 LPA');
  const [deadline, setDeadline] = useState(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await apiClient.get('/jobs');
      if (res.data?.success) {
        setJobs(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleOpenModal = () => {
    setModalError(null);
    setShowModal(true);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setError(null);
    setSuccessMsg(null);

    if (user?.role === 'COMPANY' && user?.companyVerificationStatus !== 'VERIFIED') {
      setModalError(`Only VERIFIED companies can publish jobs. Current verification status is '${user?.companyVerificationStatus || 'PENDING'}'.`);
      return;
    }

    if (!title.trim() || title.trim().length < 2) {
      setModalError('Job title must be at least 2 characters.');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setModalError('Detailed job description must be at least 10 characters.');
      return;
    }

    const skillsArray = requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
    if (skillsArray.length === 0) {
      setModalError('At least one required skill must be specified.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        requiredSkills: skillsArray,
        preferredSkills: preferredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        employmentType,
        experience: experience.trim(),
        minCgpa: Number(minCgpa),
        location: location.trim(),
        salary: salary.trim(),
        deadline: deadline || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };

      const res = await apiClient.post('/jobs', payload);

      if (res.data?.success) {
        setSuccessMsg('Job posting created and published successfully!');
        setShowModal(false);

        // Reset Form Fields
        setTitle('');
        setDescription('');
        setRequiredSkills('');
        setPreferredSkills('');
        setMinCgpa(7.0);
        setLocation('Remote / Hybrid');
        setSalary('₹10 - ₹15 LPA');

        await fetchJobs();
      } else {
        setModalError(res.data?.message || 'Failed to create job.');
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to create job. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-slate-400">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading job management engine...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans">
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {user?.role === 'COMPANY' && user?.companyVerificationStatus !== 'VERIFIED' && user?.companyVerificationStatus !== 'APPROVED' && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Company Verification Pending</span>
                <span>Your company account is currently PENDING Admin approval. Job creation and recruitment workflows will be unlocked after verification.</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              PENDING
            </span>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center space-x-3">
              <Building2 className="h-7 w-7 text-emerald-400" />
              <span>Company Job Management Console</span>
            </h2>
            <p className="text-sm text-slate-400">
              Publish openings & evaluate explainable AI candidate rankings.
            </p>
          </div>

          <button
            onClick={handleOpenModal}
            className="glass-button py-2.5 px-4 rounded-xl text-xs font-semibold text-white flex items-center space-x-2 shadow-lg shadow-blue-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Post New Job Opening</span>
          </button>
        </div>

        {user?.companyVerificationStatus !== 'VERIFIED' && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Company Verification Pending</div>
              <div className="text-xs text-amber-400/80 mt-1">
                Your company verification status is currently <strong>{user?.companyVerificationStatus || 'PENDING'}</strong>. Only VERIFIED companies can publish jobs.
              </div>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center space-x-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((j) => (
            <div key={j._id} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">{j.companyName}</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    {j.employmentType || 'Full-time'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">{j.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{j.description}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {j.requiredSkills?.map((sk: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-blue-300 text-[10px] rounded font-mono">
                      {sk}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800/80">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3 text-slate-500" />
                    <span>{j.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3 text-slate-500" />
                    <span>{j.salary}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/company/jobs/${j._id}/candidates`)}
                className="w-full glass-button py-2.5 px-4 rounded-xl text-xs font-semibold text-white flex items-center justify-center space-x-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>View AI Candidate Rankings ⭐</span>
              </button>
            </div>
          ))}
        </div>

        {/* Create Job Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
            <div className="glass-panel w-full max-w-xl rounded-3xl p-8 border border-slate-800 space-y-6 my-8">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">Post New Job Opening</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2.5">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 uppercase block mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer (Java)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 uppercase block mb-1">Detailed Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Responsibilities, technical expectations, team structure..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-300 uppercase block mb-1">Required Skills (Comma-separated) *</label>
                    <input
                      type="text"
                      required
                      value={requiredSkills}
                      onChange={(e) => setRequiredSkills(e.target.value)}
                      placeholder="Java, Spring Boot, PostgreSQL"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 uppercase block mb-1">Preferred Skills</label>
                    <input
                      type="text"
                      value={preferredSkills}
                      onChange={(e) => setPreferredSkills(e.target.value)}
                      placeholder="Docker, Kubernetes, Kafka"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-slate-300 uppercase block mb-1">Employment Type</label>
                    <select
                      value={employmentType}
                      onChange={(e: any) => setEmploymentType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 uppercase block mb-1">Experience Level</label>
                    <input
                      type="text"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="Fresher / 0-2 years"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 uppercase block mb-1">Minimum CGPA</label>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      max={10}
                      value={minCgpa}
                      onChange={(e) => setMinCgpa(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-slate-300 uppercase block mb-1">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Remote / Bangalore"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 uppercase block mb-1">Salary Package</label>
                    <input
                      type="text"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="₹12 - ₹18 LPA"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 uppercase block mb-1">Application Deadline</label>
                    <input
                      type="date"
                      required
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 hover:text-white transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="glass-button px-5 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center space-x-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Publishing Job...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Publish Job Opening</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyJobsPage;

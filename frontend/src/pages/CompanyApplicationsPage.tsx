import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { CheckCircle, XCircle, Calendar, Eye, X, FileText, User, Sparkles } from 'lucide-react';
import Navbar from './ai/components/Navbar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Application {
  _id: string;
  status: string;
  matchScore: number;
  matchBreakdown?: any;
  coverLetter?: string;
  answers?: { questionId: string; questionText: string; answer: string }[];
  applicantDetails?: {
    fullName: string;
    email: string;
    mobileNumber?: string;
    college?: string;
    branch?: string;
    degree?: string;
    cgpa?: number;
    technicalSkills?: string[];
  };
  appliedAt: string;
  student: {
    _id: string;
    user: {
      name: string;
      email: string;
    };
    college?: string;
    cgpa?: number;
    profileCompletionPercentage?: number;
  };
}

interface Job {
  _id: string;
  title: string;
  status: string;
}

const CompanyApplicationsPage: React.FC = () => {
  const { user, token } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // Detail Modal State
  const [viewAppModal, setViewAppModal] = useState<Application | null>(null);
  
  // Interview Modal State
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewData, setInterviewData] = useState({
    type: 'ONLINE',
    date: '',
    time: '',
    locationLink: '',
    instructions: ''
  });

  // Offer Letter Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerData, setOfferData] = useState({
    ctcLpa: '10',
    joiningDate: '',
    salary: '10 LPA',
    offerLetterUrl: '',
    notes: ''
  });
  const [submittingOffer, setSubmittingOffer] = useState(false);

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const getAuthToken = () => token || localStorage.getItem('skillnexa_token') || localStorage.getItem('token');

  useEffect(() => {
    // Fetch company jobs
    const fetchJobs = async () => {
      try {
        const authToken = getAuthToken();
        const response = await axios.get(`${API_URL}/jobs`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
          withCredentials: true
        });
        if (response.data.success) {
          setJobs(response.data.data);
          if (response.data.data.length > 0) {
            setSelectedJob(response.data.data[0]._id);
          }
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [token]);

  const fetchApplications = async () => {
    if (!selectedJob) return;
    try {
      const authToken = getAuthToken();
      const response = await axios.get(`${API_URL}/applications/job/${selectedJob}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        withCredentials: true
      });
      if (response.data.success) {
        setApplications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [selectedJob, token]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      const authToken = getAuthToken();
      const response = await axios.patch(`${API_URL}/applications/${appId}/status`, 
      { status: newStatus },
      { 
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        withCredentials: true 
      }
      );
      
      if (response.data.success) {
        setApplications(apps => apps.map(app => app._id === appId ? { ...app, status: newStatus } : app));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication) return;
    try {
      await axios.post(`${API_URL}/interviews/schedule`, {
        applicationId: selectedApplication._id,
        ...interviewData
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setIsInterviewModalOpen(false);
      setInterviewData({ type: 'ONLINE', date: '', time: '', locationLink: '', instructions: '' });
      fetchApplications();
    } catch (error) {
      console.error('Failed to schedule interview', error);
      alert('Failed to schedule interview');
    }
  };

  const handleSendOfferLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication) return;
    try {
      setSubmittingOffer(true);
      const authToken = getAuthToken();
      const response = await axios.post(`${API_URL}/placements/offer`, {
        applicationId: selectedApplication._id,
        ctcLpa: parseFloat(offerData.ctcLpa) || 10,
        joiningDate: offerData.joiningDate,
        salary: offerData.salary,
        offerLetterUrl: offerData.offerLetterUrl,
        notes: offerData.notes
      }, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        withCredentials: true
      });
      if (response.data.success) {
        alert('Offer letter issued successfully! Candidate notified via in-app notification & email.');
        setIsOfferModalOpen(false);
        fetchApplications();
      }
    } catch (error: any) {
      console.error('Failed to issue offer letter', error);
      alert(error.response?.data?.message || 'Failed to issue offer letter');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'APPLIED': return 'bg-blue-100 text-blue-800';
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'SHORTLISTED': return 'bg-purple-100 text-purple-800';
      case 'INTERVIEW': return 'bg-indigo-100 text-indigo-800';
      case 'INTERVIEW_COMPLETED': return 'bg-orange-100 text-orange-800';
      case 'SELECTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Manage Applications & Candidate Portfolios</h1>
        
        {jobs.length > 0 && (
          <div className="mt-4 md:mt-0 flex items-center">
            <label htmlFor="job-select" className="mr-3 text-sm font-medium text-slate-300">Select Job:</label>
            <select
              id="job-select"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-slate-900 border-slate-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedJob || ''}
              onChange={(e) => setSelectedJob(e.target.value)}
            >
              {jobs.map(job => (
                <option key={job._id} value={job._id}>{job.title} ({job.status})</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {jobs.length === 0 ? (
        <div className="bg-slate-900 rounded-xl shadow-sm p-8 text-center border border-slate-800">
          <p className="text-slate-400 mb-4">You haven't posted any jobs yet.</p>
          <a href="/company/jobs" className="text-indigo-400 hover:text-indigo-300 font-medium">Post a job &rarr;</a>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-slate-900 rounded-xl shadow-sm p-8 text-center border border-slate-800">
          <p className="text-slate-400">No applications received for this job yet.</p>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-950">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Candidate</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">AI Match Score</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Applied Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900 divide-y divide-slate-800">
              {applications.map((app) => (
                <tr key={app._id} className="hover:bg-slate-800/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-semibold text-white">
                          <button
                            onClick={() => setViewAppModal(app)}
                            className="hover:text-indigo-400 hover:underline text-left flex items-center space-x-1.5"
                          >
                            <span>{app.applicantDetails?.fullName || app.student?.user?.name}</span>
                            <Eye className="w-3.5 h-3.5 text-indigo-400" />
                          </button>
                        </div>
                        <div className="text-xs text-slate-400">{app.applicantDetails?.email || app.student?.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-lg font-bold text-indigo-400">{Math.round(app.matchScore)}%</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center gap-2">
                    <button
                      onClick={() => setViewAppModal(app)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                    {(app.status === 'APPLIED' || app.status === 'UNDER_REVIEW') && (
                      <>
                        <button onClick={() => handleStatusChange(app._id, 'SHORTLISTED')} className="text-indigo-400 hover:text-indigo-300 text-xs">Shortlist</button>
                        <button onClick={() => handleStatusChange(app._id, 'REJECTED')} className="text-rose-400 hover:text-rose-300 text-xs">Reject</button>
                      </>
                    )}
                    {app.status === 'SHORTLISTED' && (
                      <>
                        <button onClick={() => { setSelectedApplication(app); setIsInterviewModalOpen(true); }} className="text-purple-400 flex items-center text-xs"><Calendar className="w-3.5 h-3.5 mr-1" /> Schedule</button>
                        <button onClick={() => { setSelectedApplication(app); setIsOfferModalOpen(true); }} className="text-emerald-400 font-bold flex items-center text-xs ml-1"><FileText className="w-3.5 h-3.5 mr-1" /> Offer</button>
                      </>
                    )}
                    {(app.status === 'INTERVIEW_COMPLETED' || app.status === 'SELECTED') && (
                      <>
                        <button onClick={() => { setSelectedApplication(app); setIsOfferModalOpen(true); }} className="text-emerald-400 font-bold flex items-center text-xs"><FileText className="w-3.5 h-3.5 mr-1" /> Issue Offer</button>
                        {app.status !== 'SELECTED' && (
                          <button onClick={() => handleStatusChange(app._id, 'REJECTED')} className="text-rose-400 flex items-center text-xs ml-1"><XCircle className="w-3.5 h-3.5 mr-1" /> Reject</button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Application Details Modal */}
      {viewAppModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 text-slate-100 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">Candidate Application</span>
                <h3 className="text-xl font-extrabold text-white flex items-center space-x-2">
                  <User className="w-5 h-5 text-indigo-400" />
                  <span>{viewAppModal.applicantDetails?.fullName || viewAppModal.student?.user?.name}</span>
                </h3>
              </div>
              <button onClick={() => setViewAppModal(null)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 text-xs">
              {/* Match Score & Sub-scores */}
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-indigo-300 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Match Compatibility Score</span>
                  </span>
                  <span className="text-2xl font-black text-indigo-400">{Math.round(viewAppModal.matchScore)}%</span>
                </div>
              </div>

              {/* Personal & Academic Information */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Academic Details</div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>Email: <strong className="text-white">{viewAppModal.applicantDetails?.email || viewAppModal.student?.user?.email}</strong></div>
                  <div>College: <strong className="text-white">{viewAppModal.applicantDetails?.college || viewAppModal.student?.college || 'N/A'}</strong></div>
                  <div>Branch: <strong className="text-white">{viewAppModal.applicantDetails?.branch || 'N/A'}</strong></div>
                  <div>CGPA: <strong className="text-white">{viewAppModal.applicantDetails?.cgpa || viewAppModal.student?.cgpa || 0}/10</strong></div>
                </div>
              </div>

              {/* Cover Letter */}
              {viewAppModal.coverLetter && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Cover Letter</span>
                  </div>
                  <p className="text-slate-300 italic leading-relaxed">"{viewAppModal.coverLetter}"</p>
                </div>
              )}

              {/* Job Answers */}
              {viewAppModal.answers && viewAppModal.answers.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">Job-Specific Question Responses</div>
                  {viewAppModal.answers.map((ans, idx) => (
                    <div key={idx} className="space-y-1 border-b border-slate-800/80 pb-2 last:border-0">
                      <div className="font-semibold text-slate-300">Q: {ans.questionText}</div>
                      <div className="text-slate-400 italic">Ans: "{ans.answer}"</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-800 pt-4">
              <button onClick={() => setViewAppModal(null)} className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {isInterviewModalOpen && selectedApplication && (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsInterviewModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-slate-900 border border-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full text-slate-100">
              <form onSubmit={handleScheduleInterview}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-white" id="modal-title">
                    Schedule Interview for {selectedApplication.applicantDetails?.fullName || selectedApplication.student.user.name}
                  </h3>
                  <div className="mt-4 space-y-4 text-xs">
                    <div>
                      <label className="block font-medium text-slate-300 mb-1">Type</label>
                      <select value={interviewData.type} onChange={(e) => setInterviewData({...interviewData, type: e.target.value})} className="mt-1 block w-full py-2 px-3 border-slate-700 bg-slate-950 rounded-md border text-white">
                        <option value="ONLINE">Online (Video Call)</option>
                        <option value="OFFLINE">Offline (In-Person)</option>
                        <option value="PHONE">Phone</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="date" required value={interviewData.date} onChange={(e) => setInterviewData({...interviewData, date: e.target.value})} className="block w-full border-slate-700 bg-slate-950 rounded-md py-2 px-3 text-white" />
                      <input type="time" required value={interviewData.time} onChange={(e) => setInterviewData({...interviewData, time: e.target.value})} className="block w-full border-slate-700 bg-slate-950 rounded-md py-2 px-3 text-white" />
                    </div>
                    <input type="text" placeholder="Link / Location" value={interviewData.locationLink} onChange={(e) => setInterviewData({...interviewData, locationLink: e.target.value})} className="block w-full border-slate-700 bg-slate-950 rounded-md py-2 px-3 text-white" />
                    <textarea rows={3} placeholder="Special Instructions" value={interviewData.instructions} onChange={(e) => setInterviewData({...interviewData, instructions: e.target.value})} className="block w-full border-slate-700 bg-slate-950 rounded-md py-2 px-3 text-white" />
                  </div>
                </div>
                <div className="bg-slate-950 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs">Schedule & Notify</button>
                  <button type="button" onClick={() => setIsInterviewModalOpen(false)} className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-slate-700 px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-xs">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Issue Offer Letter Modal */}
      {isOfferModalOpen && selectedApplication && (
        <div className="fixed z-50 inset-0 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 text-slate-100 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">Placement & Hiring</span>
                <h3 className="text-xl font-extrabold text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span>Issue Offer Letter</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Candidate: <strong>{selectedApplication.applicantDetails?.fullName || selectedApplication.student?.user?.name}</strong>
                </p>
              </div>
              <button onClick={() => setIsOfferModalOpen(false)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendOfferLetter} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">CTC (in LPA)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={offerData.ctcLpa}
                  onChange={(e) => setOfferData({ ...offerData, ctcLpa: e.target.value })}
                  placeholder="e.g. 12.5"
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Joining Date</label>
                <input
                  type="date"
                  required
                  value={offerData.joiningDate}
                  onChange={(e) => setOfferData({ ...offerData, joiningDate: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Salary Details / Structure</label>
                <input
                  type="text"
                  required
                  value={offerData.salary}
                  onChange={(e) => setOfferData({ ...offerData, salary: e.target.value })}
                  placeholder="e.g. ₹12.5 LPA (₹85,000/month fixed + perf bonus)"
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Offer Letter Document Link (PDF / Cloud URL)</label>
                <input
                  type="text"
                  value={offerData.offerLetterUrl}
                  onChange={(e) => setOfferData({ ...offerData, offerLetterUrl: e.target.value })}
                  placeholder="https://docs.company.com/offers/letter-123.pdf"
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Special Notes / Welcome Message</label>
                <textarea
                  rows={3}
                  value={offerData.notes}
                  onChange={(e) => setOfferData({ ...offerData, notes: e.target.value })}
                  placeholder="We are thrilled to welcome you to the engineering team..."
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOffer}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30"
                >
                  <FileText className="w-4 h-4" />
                  <span>{submittingOffer ? 'Issuing Offer...' : 'Send Official Offer Letter'}</span>
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

export default CompanyApplicationsPage;


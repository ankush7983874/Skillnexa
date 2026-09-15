import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, MapPin, Video, Phone, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import Navbar from './ai/components/Navbar';

interface Interview {
  _id: string;
  type: string;
  date: string;
  time: string;
  locationLink?: string;
  instructions?: string;
  status: string;
  student: {
    _id: string;
    user: {
      name: string;
      email: string;
    };
  };
  job: {
    title: string;
  };
  feedbackScore?: number;
  feedbackRemarks?: string;
}

const CompanyInterviewsPage = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackScore, setFeedbackScore] = useState<number | ''>('');
  const [feedbackRemarks, setFeedbackRemarks] = useState('');

  const getAuthToken = () => token || localStorage.getItem('skillnexa_token') || localStorage.getItem('token');

  const fetchInterviews = async () => {
    try {
      const authToken = getAuthToken();
      const res = await axios.get('/api/interviews/company', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      });
      setInterviews(res.data.data);
    } catch (error) {
      console.error('Failed to fetch interviews', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [token]);

  const handleAction = async (id: string, action: string, data?: any) => {
    try {
      const authToken = getAuthToken();
      await axios.patch(`/api/interviews/${id}`, { action, data }, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      });
      fetchInterviews();
      setIsFeedbackModalOpen(false);
    } catch (error) {
      console.error(`Failed to ${action} interview`, error);
    }
  };

  const getIcon = (type: string) => {
    if (type === 'ONLINE') return <Video className="w-4 h-4 text-blue-500" />;
    if (type === 'OFFLINE') return <MapPin className="w-4 h-4 text-green-500" />;
    return <Phone className="w-4 h-4 text-purple-500" />;
  };

  if (loading) return <div className="p-8">Loading interviews...</div>;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Interview Schedule</h1>
      
      {interviews.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center text-gray-500">
          No interviews scheduled yet.
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {interviews.map(interview => (
              <li key={interview._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(interview.type)}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {interview.student.user.name} <span className="text-sm font-normal text-gray-500">for {interview.job.title}</span>
                      </h3>
                      <div className="mt-1 flex flex-col sm:flex-row sm:space-x-4 text-sm text-gray-500">
                        <div className="flex items-center mt-1 sm:mt-0">
                          <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {new Date(interview.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center mt-1 sm:mt-0">
                          <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {interview.time}
                        </div>
                      </div>
                      {interview.locationLink && (
                        <div className="mt-1 text-sm text-indigo-600 truncate max-w-md">
                          <a href={interview.locationLink} target="_blank" rel="noreferrer" className="hover:underline">
                            {interview.locationLink}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${interview.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' : 
                        interview.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {interview.status}
                    </span>
                    
                    {interview.status === 'SCHEDULED' && (
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedInterview(interview);
                            setIsFeedbackModalOpen(true);
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </button>
                        <button
                          onClick={() => handleAction(interview._id, 'CANCEL')}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {interview.status === 'COMPLETED' && interview.feedbackScore && (
                  <div className="mt-3 bg-gray-50 rounded p-3 text-sm border">
                    <span className="font-semibold text-gray-700">Feedback Score:</span> {interview.feedbackScore}/100<br/>
                    <span className="font-semibold text-gray-700">Remarks:</span> {interview.feedbackRemarks || 'N/A'}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isFeedbackModalOpen && selectedInterview && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setIsFeedbackModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 text-center mb-4">Complete Interview</h3>
                <div className="mt-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Feedback Score (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={feedbackScore}
                      onChange={e => setFeedbackScore(Number(e.target.value))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Feedback Remarks</label>
                    <textarea
                      value={feedbackRemarks}
                      onChange={e => setFeedbackRemarks(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleAction(selectedInterview._id, 'COMPLETE', { feedbackScore, feedbackRemarks })}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save & Complete
                </button>
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default CompanyInterviewsPage;

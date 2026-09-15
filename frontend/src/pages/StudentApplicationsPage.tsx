import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Navbar from './ai/components/Navbar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Application {
  _id: string;
  status: string;
  matchScore: number;
  appliedAt: string;
  job: {
    _id: string;
    title: string;
    companyName: string;
    location: string;
    employmentType: string;
    salary: string;
  };
}

const StudentApplicationsPage: React.FC = () => {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const authToken = token || localStorage.getItem('skillnexa_token') || localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/applications/my-applications`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
          withCredentials: true
        });
        if (response.data.success) {
          setApplications(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [token]);

  if (loading) {
    return <div className="p-8 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div></div>;
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'APPLIED': return 'bg-blue-100 text-blue-800';
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'SHORTLISTED': return 'bg-purple-100 text-purple-800';
      case 'INTERVIEW': return 'bg-indigo-100 text-indigo-800';
      case 'SELECTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">My Applications</h1>
      
      {applications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
          <p className="text-gray-500 mb-4">You haven't applied to any jobs yet.</p>
          <a href="/student/recommendations" className="text-indigo-600 hover:text-indigo-800 font-medium">Find jobs to apply for &rarr;</a>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app._id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-indigo-100 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{app.job?.title}</h3>
                  <p className="text-gray-600">{app.job?.companyName} • {app.job?.location}</p>
                  
                  <div className="mt-4 flex space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <svg className="h-5 w-5 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {app.job?.employmentType}
                    </span>
                    <span className="flex items-center">
                      <svg className="h-5 w-5 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                    {app.status.replace('_', ' ')}
                  </span>
                  {app.matchScore > 0 && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Match:</span>
                      <span className="ml-1 font-semibold text-indigo-600">{Math.round(app.matchScore)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default StudentApplicationsPage;

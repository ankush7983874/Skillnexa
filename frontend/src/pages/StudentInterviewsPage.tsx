import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, MapPin, Video, Phone, Building } from 'lucide-react';
import Navbar from './ai/components/Navbar';

interface Interview {
  _id: string;
  type: string;
  date: string;
  time: string;
  locationLink?: string;
  instructions?: string;
  status: string;
  company: {
    companyName: string;
  };
  job: {
    title: string;
  };
}

const StudentInterviewsPage = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  
  const fetchInterviews = async () => {
    try {
      const authToken = token || localStorage.getItem('skillnexa_token') || localStorage.getItem('token');
      const res = await axios.get('/api/interviews/student', {
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

  const getIcon = (type: string) => {
    if (type === 'ONLINE') return <Video className="w-5 h-5 text-blue-500" />;
    if (type === 'OFFLINE') return <MapPin className="w-5 h-5 text-green-500" />;
    return <Phone className="w-5 h-5 text-purple-500" />;
  };

  if (loading) return <div className="p-8">Loading interviews...</div>;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-white mb-6">My Interviews</h1>
      
      {interviews.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center text-gray-500">
          You don't have any interviews scheduled right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.map(interview => (
            <div key={interview._id} className="bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    {getIcon(interview.type)}
                    <span className="text-sm font-medium text-gray-500 uppercase">{interview.type}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    interview.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                    interview.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {interview.status}
                  </span>
                </div>
                
                <h3 className="mt-4 text-lg font-bold text-gray-900">{interview.job.title}</h3>
                <div className="flex items-center mt-1 text-gray-600">
                  <Building className="w-4 h-4 mr-1" />
                  <span>{interview.company.companyName}</span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                    {new Date(interview.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                    {interview.time}
                  </div>
                </div>

                {interview.instructions && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-700 border">
                    <p className="font-semibold mb-1 text-xs text-gray-500 uppercase tracking-wider">Instructions</p>
                    <p>{interview.instructions}</p>
                  </div>
                )}
              </div>
              
              {interview.locationLink && (
                <div className="bg-indigo-50 px-5 py-3 border-t">
                  <a 
                    href={interview.locationLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-indigo-600 text-sm font-medium hover:text-indigo-800 flex items-center justify-center w-full"
                  >
                    Join / View Location &rarr;
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default StudentInterviewsPage;

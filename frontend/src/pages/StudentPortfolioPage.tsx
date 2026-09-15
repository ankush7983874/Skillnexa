import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getMyPortfolio, 
  addProject, deleteProject, 
  addCertificate, deleteCertificate, 
  uploadResume, deleteResume, 
  updatePrivacySettings,
  addAchievement, deleteAchievement,
  addInternship, deleteInternship
} from '../services/portfolioService';
import { 
  FolderGit2, Award, Briefcase, FileText, Lock, 
  Trash2, Plus, Upload, CheckCircle2, Globe, Shield, AlertCircle
} from 'lucide-react';
import Navbar from './ai/components/Navbar';

export const StudentPortfolioPage: React.FC = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals / forms state
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [showInternshipForm, setShowInternshipForm] = useState(false);
  
  const [projectData, setProjectData] = useState({ title: '', description: '', techStack: '', demoUrl: '', githubUrl: '' });
  const [internshipData, setInternshipData] = useState({ company: '', role: '', description: '', completionStatus: 'COMPLETED' });
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const data = await getMyPortfolio();
      setPortfolio(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyToggle = async (key: string) => {
    try {
      const updatedSettings = { ...portfolio.privacySettings, [key]: !portfolio.privacySettings[key] };
      await updatePrivacySettings(updatedSettings);
      setPortfolio({ ...portfolio, privacySettings: updatedSettings });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addProject({
        ...projectData,
        techStack: projectData.techStack.split(',').map(s => s.trim())
      });
      setShowProjectForm(false);
      setProjectData({ title: '', description: '', techStack: '', demoUrl: '', githubUrl: '' });
      fetchPortfolio();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
      fetchPortfolio();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certFile) return;
    try {
      const formData = new FormData();
      formData.append('certificateName', certName);
      formData.append('issuingOrganization', certIssuer);
      formData.append('certificate', certFile);
      await addCertificate(formData);
      setShowCertForm(false);
      setCertFile(null);
      setCertName('');
      setCertIssuer('');
      fetchPortfolio();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCertificate = async (id: string) => {
    try {
      await deleteCertificate(id);
      fetchPortfolio();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addInternship(internshipData);
      setShowInternshipForm(false);
      setInternshipData({ company: '', role: '', description: '', completionStatus: 'COMPLETED' });
      fetchPortfolio();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInternship = async (id: string) => {
    try {
      await deleteInternship(id);
      fetchPortfolio();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const formData = new FormData();
        formData.append('resume', e.target.files[0]);
        await uploadResume(formData);
        fetchPortfolio();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteResume = async () => {
    try {
      await deleteResume();
      fetchPortfolio();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-slate-400">Loading portfolio...</div>;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200">
      <Navbar />
      <div className="max-w-5xl mx-auto space-y-8 p-6 lg:p-8">
        
        {/* HEADER */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Digital Portfolio</h1>
            <p className="text-slate-400">Manage your verified credentials, projects, and resume.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-400">{portfolio?.profileCompletionPercentage}%</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Profile Completion</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MAIN COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* PROJECTS */}
            <section className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <FolderGit2 className="text-purple-400" />
                  <h2 className="text-xl font-bold text-white">Projects</h2>
                </div>
                <button onClick={() => setShowProjectForm(!showProjectForm)} className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg flex items-center space-x-1 transition">
                  <Plus size={16} /> <span>Add Project</span>
                </button>
              </div>

              {showProjectForm && (
                <form onSubmit={handleAddProject} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-6 space-y-4">
                  <input type="text" placeholder="Project Title" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white" required
                    value={projectData.title} onChange={e => setProjectData({...projectData, title: e.target.value})} />
                  <textarea placeholder="Description" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white"
                    value={projectData.description} onChange={e => setProjectData({...projectData, description: e.target.value})} />
                  <input type="text" placeholder="Tech Stack (comma separated)" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white" required
                    value={projectData.techStack} onChange={e => setProjectData({...projectData, techStack: e.target.value})} />
                  <input type="url" placeholder="Demo URL" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white"
                    value={projectData.demoUrl} onChange={e => setProjectData({...projectData, demoUrl: e.target.value})} />
                  <div className="flex justify-end space-x-2">
                    <button type="button" onClick={() => setShowProjectForm(false)} className="px-3 py-1.5 text-sm text-slate-400 hover:text-white">Cancel</button>
                    <button type="submit" className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg">Save</button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {portfolio?.projects?.map((proj: any) => (
                  <div key={proj._id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-200">{proj.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">{proj.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {proj.techStack?.map((t: string) => (
                          <span key={t} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md">{t}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteProject(proj._id)} className="text-rose-400 hover:text-rose-300"><Trash2 size={16}/></button>
                  </div>
                ))}
                {portfolio?.projects?.length === 0 && <p className="text-sm text-slate-500 italic">No projects added yet.</p>}
              </div>
            </section>

            {/* CERTIFICATES */}
            <section className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <Award className="text-amber-400" />
                  <h2 className="text-xl font-bold text-white">Verified Certificates</h2>
                </div>
                <button onClick={() => setShowCertForm(!showCertForm)} className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg flex items-center space-x-1 transition">
                  <Plus size={16} /> <span>Upload Cert</span>
                </button>
              </div>

              {showCertForm && (
                <form onSubmit={handleAddCertificate} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-6 space-y-4">
                  <input type="text" placeholder="Certificate Name" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white" required
                    value={certName} onChange={e => setCertName(e.target.value)} />
                  <input type="text" placeholder="Issuing Organization" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white" required
                    value={certIssuer} onChange={e => setCertIssuer(e.target.value)} />
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-blue-400 hover:file:bg-slate-700" required
                    onChange={e => setCertFile(e.target.files?.[0] || null)} />
                  <div className="flex justify-end space-x-2">
                    <button type="button" onClick={() => setShowCertForm(false)} className="px-3 py-1.5 text-sm text-slate-400 hover:text-white">Cancel</button>
                    <button type="submit" className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg">Upload</button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {portfolio?.certificates?.map((cert: any) => (
                  <div key={cert._id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${cert.verificationStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {cert.verificationStatus === 'VERIFIED' ? <Shield size={18} /> : <AlertCircle size={18} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-200">{cert.certificateName}</h3>
                        <p className="text-xs text-slate-400">{cert.issuingOrganization}</p>
                        <p className={`text-[10px] font-bold mt-1 ${cert.verificationStatus === 'VERIFIED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {cert.verificationStatus}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {cert.certificateFile && (
                        <a href={`http://localhost:5000${cert.certificateFile}`} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline">View</a>
                      )}
                      <button onClick={() => handleDeleteCertificate(cert._id)} className="text-rose-400 hover:text-rose-300"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
                {portfolio?.certificates?.length === 0 && <p className="text-sm text-slate-500 italic">No certificates uploaded yet.</p>}
              </div>
            </section>

            {/* INTERNSHIPS */}
            <section className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <Briefcase className="text-rose-400" />
                  <h2 className="text-xl font-bold text-white">Internships & Experience</h2>
                </div>
                <button onClick={() => setShowInternshipForm(!showInternshipForm)} className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg flex items-center space-x-1 transition">
                  <Plus size={16} /> <span>Add Experience</span>
                </button>
              </div>

              {showInternshipForm && (
                <form onSubmit={handleAddInternship} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-6 space-y-4">
                  <input type="text" placeholder="Company Name" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white" required
                    value={internshipData.company} onChange={e => setInternshipData({...internshipData, company: e.target.value})} />
                  <input type="text" placeholder="Role / Position" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white" required
                    value={internshipData.role} onChange={e => setInternshipData({...internshipData, role: e.target.value})} />
                  <textarea placeholder="Description" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white" required
                    value={internshipData.description} onChange={e => setInternshipData({...internshipData, description: e.target.value})} />
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white"
                    value={internshipData.completionStatus} onChange={e => setInternshipData({...internshipData, completionStatus: e.target.value})}>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="DROPPED">Dropped</option>
                  </select>
                  <div className="flex justify-end space-x-2">
                    <button type="button" onClick={() => setShowInternshipForm(false)} className="px-3 py-1.5 text-sm text-slate-400 hover:text-white">Cancel</button>
                    <button type="submit" className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg">Save</button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {portfolio?.internships?.map((int: any) => (
                  <div key={int._id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-200">{int.role}</h3>
                      <p className="text-sm font-semibold text-blue-400 mt-1">{int.company}</p>
                      <p className="text-sm text-slate-400 mt-1">{int.description}</p>
                      <div className="mt-2 text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md inline-block">
                        {int.completionStatus}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteInternship(int._id)} className="text-rose-400 hover:text-rose-300"><Trash2 size={16}/></button>
                  </div>
                ))}
                {portfolio?.internships?.length === 0 && <p className="text-sm text-slate-500 italic">No internships added yet.</p>}
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-8">
            
            {/* RESUME */}
            <section className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2 mb-6">
                <FileText className="text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Resume</h2>
              </div>

              {portfolio?.resumeUrl ? (
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
                  <CheckCircle2 className="mx-auto text-emerald-400 mb-2" size={32} />
                  <p className="text-sm text-slate-300 font-medium mb-4">Resume Uploaded</p>
                  <div className="flex justify-center space-x-3">
                    <a href={`http://localhost:5000${portfolio.resumeUrl}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition">View</a>
                    <button onClick={handleDeleteResume} className="px-3 py-1.5 text-xs border border-rose-500/50 text-rose-400 hover:bg-rose-500/10 rounded-lg transition">Remove</button>
                  </div>
                </div>
              ) : (
                <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl text-center">
                  <Upload className="mx-auto text-slate-500 mb-2" size={24} />
                  <p className="text-xs text-slate-400 mb-4">PDF, DOC, DOCX up to 5MB</p>
                  <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition inline-block">
                    Select File
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleUploadResume} />
                  </label>
                </div>
              )}
            </section>

            {/* PRIVACY SETTINGS */}
            <section className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2 mb-6">
                <Lock className="text-blue-400" />
                <h2 className="text-xl font-bold text-white">Privacy Controls</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-200">Public Portfolio</p>
                    <p className="text-xs text-slate-500">Anyone with link can view</p>
                  </div>
                  <button onClick={() => handlePrivacyToggle('publicPortfolio')} className={`w-11 h-6 rounded-full transition-colors relative ${portfolio?.privacySettings?.publicPortfolio ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${portfolio?.privacySettings?.publicPortfolio ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-200">Company Visibility</p>
                    <p className="text-xs text-slate-500">Verified companies can view</p>
                  </div>
                  <button onClick={() => handlePrivacyToggle('companyVisiblePortfolio')} className={`w-11 h-6 rounded-full transition-colors relative ${portfolio?.privacySettings?.companyVisiblePortfolio ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${portfolio?.privacySettings?.companyVisiblePortfolio ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                <hr className="border-slate-800" />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-300">Show Resume</p>
                  <button onClick={() => handlePrivacyToggle('resumeVisibility')} className={`w-9 h-5 rounded-full transition-colors relative ${portfolio?.privacySettings?.resumeVisibility ? 'bg-blue-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${portfolio?.privacySettings?.resumeVisibility ? 'left-4.5' : 'left-0.5'}`} style={{ transform: portfolio?.privacySettings?.resumeVisibility ? 'translateX(16px)' : 'translateX(0)' }} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-300">Show Certificates</p>
                  <button onClick={() => handlePrivacyToggle('certificateVisibility')} className={`w-9 h-5 rounded-full transition-colors relative ${portfolio?.privacySettings?.certificateVisibility ? 'bg-blue-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform`} style={{ transform: portfolio?.privacySettings?.certificateVisibility ? 'translateX(16px)' : 'translateX(0)' }} />
                  </button>
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
};

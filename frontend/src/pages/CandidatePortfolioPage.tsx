import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicPortfolio } from '../services/portfolioService';
import { GraduationCap, FolderGit2, Award, Briefcase, FileText, ExternalLink, ArrowLeft } from 'lucide-react';

export const CandidatePortfolioPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        if (!studentId) return;
        const data = await getPublicPortfolio(studentId);
        setPortfolio(data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [studentId]);

  if (loading) return <div className="p-8 text-slate-400 text-center">Loading candidate portfolio...</div>;
  
  if (error) return (
    <div className="p-8 text-center max-w-2xl mx-auto">
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white inline-flex items-center text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Applications
        </button>

        {/* HEADER */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {portfolio?.user?.avatarUrl ? (
              <img src={`http://localhost:5000${portfolio.user.avatarUrl}`} alt={portfolio.user.name} className="w-24 h-24 rounded-full object-cover border-4 border-slate-800" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-slate-400 border-4 border-slate-700">
                {portfolio?.user?.name?.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{portfolio?.user?.name}</h1>
              <p className="text-slate-400">{portfolio?.user?.email}</p>
              
              <div className="flex gap-4 mt-4">
                {portfolio?.githubUrl && <a href={portfolio.githubUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center text-sm"><ExternalLink className="w-4 h-4 mr-1" /> GitHub</a>}
                {portfolio?.linkedinUrl && <a href={portfolio.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center text-sm"><ExternalLink className="w-4 h-4 mr-1" /> LinkedIn</a>}
                {portfolio?.portfolioUrl && <a href={portfolio.portfolioUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center text-sm"><ExternalLink className="w-4 h-4 mr-1" /> Portfolio</a>}
              </div>
            </div>
          </div>
          <div className="text-right bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <div className="text-3xl font-bold text-blue-400">{portfolio?.profileCompletionPercentage}%</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Profile Strength</div>
          </div>
        </div>

        {/* ACADEMICS */}
        <section className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center mb-6">
            <GraduationCap className="w-5 h-5 mr-2 text-blue-400" /> Education
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-slate-500 uppercase">Institution</p>
              <p className="font-semibold mt-1 text-slate-200">{portfolio?.college || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Degree</p>
              <p className="font-semibold mt-1 text-slate-200">{portfolio?.degree} in {portfolio?.branch}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Graduation Year</p>
              <p className="font-semibold mt-1 text-slate-200">{portfolio?.graduationYear}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">CGPA</p>
              <p className="font-semibold mt-1 text-emerald-400">{portfolio?.cgpa} / 10</p>
            </div>
          </div>
        </section>

        {/* SKILLS */}
        {portfolio?.skills && portfolio.skills.length > 0 && (
          <section className="glass-panel p-6 rounded-2xl border border-slate-800">
             <h2 className="text-xl font-bold text-white flex items-center mb-6">
               <Award className="w-5 h-5 mr-2 text-emerald-400" /> Skills & Competencies
             </h2>
             <div className="flex flex-wrap gap-3">
               {portfolio.skills.map((skill: any, idx: number) => (
                 <div key={idx} className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl flex items-center">
                   <span className="font-medium text-slate-200 text-sm">{skill.name}</span>
                   {skill.verified && <span className="ml-2 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Verified</span>}
                 </div>
               ))}
             </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* PROJECTS */}
          {portfolio?.projects && (
            <section className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center mb-6">
                <FolderGit2 className="w-5 h-5 mr-2 text-purple-400" /> Projects
              </h2>
              <div className="space-y-4">
                {portfolio.projects.map((proj: any) => (
                  <div key={proj._id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-800">
                    <h3 className="font-bold text-slate-200">{proj.title}</h3>
                    <p className="text-sm text-slate-400 mt-2">{proj.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {proj.techStack?.map((t: string) => (
                        <span key={t} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
                {portfolio.projects.length === 0 && <p className="text-slate-500 text-sm italic">No projects visible.</p>}
              </div>
            </section>
          )}

          {/* CERTIFICATES */}
          {portfolio?.certificates && (
             <section className="glass-panel p-6 rounded-2xl border border-slate-800">
               <h2 className="text-xl font-bold text-white flex items-center mb-6">
                 <Award className="w-5 h-5 mr-2 text-amber-400" /> Certificates
               </h2>
               <div className="space-y-4">
                 {portfolio.certificates.map((cert: any) => (
                   <div key={cert._id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-800">
                     <h3 className="font-bold text-slate-200">{cert.certificateName}</h3>
                     <p className="text-xs text-slate-400 mt-1">{cert.issuingOrganization}</p>
                     <div className="mt-2 flex justify-between items-center">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cert.verificationStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                         {cert.verificationStatus}
                       </span>
                       {cert.certificateFile && (
                         <a href={`http://localhost:5000${cert.certificateFile}`} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">View Credential</a>
                       )}
                     </div>
                   </div>
                 ))}
                 {portfolio.certificates.length === 0 && <p className="text-slate-500 text-sm italic">No certificates visible.</p>}
               </div>
             </section>
          )}

        </div>

        {/* INTERNSHIPS */}
        {portfolio?.internships && portfolio.internships.length > 0 && (
           <section className="glass-panel p-6 rounded-2xl border border-slate-800">
             <h2 className="text-xl font-bold text-white flex items-center mb-6">
               <Briefcase className="w-5 h-5 mr-2 text-rose-400" /> Internships & Experience
             </h2>
             <div className="space-y-4">
               {portfolio.internships.map((int: any) => (
                 <div key={int._id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 flex justify-between">
                   <div>
                     <h3 className="font-bold text-slate-200">{int.role}</h3>
                     <p className="text-sm font-semibold text-blue-400">{int.company}</p>
                     <p className="text-sm text-slate-400 mt-2">{int.description}</p>
                   </div>
                   <div className="text-right min-w-[120px]">
                     <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-md">{int.completionStatus}</span>
                   </div>
                 </div>
               ))}
             </div>
           </section>
        )}

        {/* RESUME */}
        {portfolio?.resumeUrl && (
          <section className="glass-panel p-6 rounded-2xl border border-slate-800 text-center">
            <h2 className="text-xl font-bold text-white flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 mr-2 text-emerald-400" /> Resume
            </h2>
            <a href={`http://localhost:5000${portfolio.resumeUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition">
              <ExternalLink className="w-4 h-4 mr-2" /> View Full Resume
            </a>
          </section>
        )}

      </div>
    </div>
  );
};

export default CandidatePortfolioPage;

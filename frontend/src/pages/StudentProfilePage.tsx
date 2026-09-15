import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  GraduationCap,
  Award,
  Code,
  FolderGit2,
  FileCheck,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import Navbar from './ai/components/Navbar';
import { Link } from 'react-router-dom';

export const StudentProfilePage: React.FC = () => {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState(1);
  const [cgpa, setCgpa] = useState(0);
  const [graduationYear, setGraduationYear] = useState(2026);
  const [resumeUrl, setResumeUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [completionPercentage, setCompletionPercentage] = useState(20);

  // Skill Input state
  const [skills, setSkills] = useState<{ name: string; category: string; score: number; verified: boolean }[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Programming');

  // Project Input state
  const [projects, setProjects] = useState<any[]>([]);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectTech, setNewProjectTech] = useState('');

  const fetchStudentProfile = async () => {
    try {
      const res = await apiClient.get('/students/profile');
      if (res.data?.success) {
        const p = res.data.data;
        setCollege(p.college || '');
        setDegree(p.degree || '');
        setBranch(p.branch || '');
        setSemester(p.semester || 1);
        setCgpa(p.cgpa || 0);
        setGraduationYear(p.graduationYear || 2026);
        setResumeUrl(p.resumeUrl || '');
        setGithubUrl(p.githubUrl || '');
        setLinkedinUrl(p.linkedinUrl || '');
        setPortfolioUrl(p.portfolioUrl || '');
        setSkills(p.skills || []);
        setProjects(p.projects || []);
        setCompletionPercentage(p.profileCompletionPercentage || 20);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load student profile' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        college,
        degree,
        branch,
        semester: Number(semester),
        cgpa: Number(cgpa),
        graduationYear: Number(graduationYear),
        resumeUrl,
        githubUrl,
        linkedinUrl,
        portfolioUrl,
        skills,
      };

      const res = await apiClient.put('/students/profile', payload);
      if (res.data?.success) {
        setCompletionPercentage(res.data.data.profileCompletionPercentage);
        setMessage({ type: 'success', text: 'Profile & dynamic completion score updated successfully!' });
        await refreshUser();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    if (skills.some((s) => s.name.toLowerCase() === newSkillName.toLowerCase())) return;

    setSkills([...skills, { name: newSkillName.trim(), category: newSkillCategory, score: 70, verified: false }]);
    setNewSkillName('');
  };

  const handleAddProject = async () => {
    if (!newProjectTitle.trim()) return;
    try {
      const payload = {
        title: newProjectTitle,
        description: newProjectDesc,
        techStack: newProjectTech.split(',').map((t) => t.trim()).filter(Boolean),
      };
      const res = await apiClient.post('/students/projects', payload);
      if (res.data?.success) {
        setProjects(res.data.data.projects);
        setCompletionPercentage(res.data.data.profileCompletionPercentage);
        setNewProjectTitle('');
        setNewProjectDesc('');
        setNewProjectTech('');
        setMessage({ type: 'success', text: 'Project added successfully!' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add project' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-slate-400">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading student profile telemetry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans">
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        {/* Phase 9 Digital Portfolio Link Banner */}
        <div className="glass-panel p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FolderGit2 className="h-5 w-5 text-purple-400" />
            <div>
              <span className="text-sm font-bold text-white">Digital Portfolio Active (Phase 9)</span>
              <p className="text-xs text-slate-400">Manage your verified resume, certificates, and projects.</p>
            </div>
          </div>
          <Link to="/portfolio" className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition">
            <span>Open Portfolio</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Profile Completion Meter */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 text-blue-400" />
              <span>Student Profile Telemetry</span>
            </h2>
            <p className="text-xs text-slate-400">Dynamic completion score calculated from database telemetry</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              {completionPercentage}%
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Profile Strength</div>
          </div>
        </div>

        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500 shadow-sm shadow-blue-500/50"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center space-x-3 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Academic Info */}
        <section className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
          <h3 className="text-base font-bold text-white border-b border-slate-800/80 pb-3 flex items-center space-x-2">
            <GraduationCap className="h-5 w-5 text-blue-400" />
            <span>Academic Information</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">College / Institution</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="Indian Institute of Technology"
                className="mt-1 w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Degree Program</label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="B.Tech"
                className="mt-1 w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Branch / Specialization</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="Computer Science & Engineering"
                className="mt-1 w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Semester</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="mt-1 w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={10}
                  value={cgpa}
                  onChange={(e) => setCgpa(Number(e.target.value))}
                  className="mt-1 w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Grad Year</label>
                <input
                  type="number"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(Number(e.target.value))}
                  className="mt-1 w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Skills Management */}
        <section className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
          <h3 className="text-base font-bold text-white border-b border-slate-800/80 pb-3 flex items-center space-x-2">
            <Award className="h-5 w-5 text-emerald-400" />
            <span>Technical Capabilities & Skill Taxonomy</span>
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. Java, React, Docker"
              className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
            <select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-slate-300 focus:outline-none"
            >
              <option value="Programming">Programming</option>
              <option value="Web Development">Web Development</option>
              <option value="Database">Database</option>
              <option value="DevOps">DevOps</option>
              <option value="Cloud">Cloud</option>
              <option value="AI/ML">AI/ML</option>
            </select>
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add Skill</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((s, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-2 text-xs"
              >
                <span className="font-semibold text-slate-200">{s.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">({s.score}%)</span>
                {s.verified && (
                  <span title="Verified by Assessment">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Resumes & Social Links */}
        <section className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
          <h3 className="text-base font-bold text-white border-b border-slate-800/80 pb-3 flex items-center space-x-2">
            <ExternalLink className="h-5 w-5 text-purple-400" />
            <span>Digital Resume & Social Links</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Resume Link (PDF URL)</label>
              <input
                type="text"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="mt-1 w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">GitHub Profile</label>
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="mt-1 w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">LinkedIn Profile</label>
              <input
                type="text"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="mt-1 w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Personal Portfolio</label>
              <input
                type="text"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://myportfolio.dev"
                className="mt-1 w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="w-full glass-button text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 text-sm shadow-lg shadow-blue-500/25"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save & Compute Dynamic Profile Score</span>
            </>
          )}
        </button>
      </form>
      </div>
    </div>
  );
};

export default StudentProfilePage;

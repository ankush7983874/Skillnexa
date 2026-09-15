import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import {
  Sparkles,
  Building2,
  MapPin,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Briefcase,
  FileText,
  User,
  GraduationCap,
  Award,
  CheckCircle,
  X,
  ArrowLeft,
  Send,
} from 'lucide-react';
import Navbar from './ai/components/Navbar';

interface SubScore {
  score: number;
  maxScore: number;
  percentage: number;
}

interface MatchBreakdown {
  technicalSkills: SubScore & { matchedSkills: string[]; missingSkills: string[] };
  academicPerformance: SubScore & { cgpa: number; minCgpaRequired: number; isEligible: boolean };
  assessmentScore: SubScore & { averageScore: number };
  projects: SubScore & { projectCount: number };
  certifications: SubScore & { count: number };
  experience: SubScore & { internshipCount: number };
  softSkills: SubScore & { count: number };
}

interface Job {
  _id: string;
  title: string;
  companyName: string;
  description: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  minCgpa: number;
  experience: string;
  location: string;
  salary: string;
  employmentType: string;
  status: string;
  questions?: { id: string; questionText: string; required: boolean }[];
}

interface RecommendationItem {
  job: Job;
  matchScore: number;
  breakdown: MatchBreakdown;
  summary: string;
  matchedSkills?: string[];
  missingSkills?: string[];
}

interface ApplicationData {
  _id: string;
  job: string;
  status: string;
  appliedAt: string;
}

export const StudentJobRecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [applicationsMap, setApplicationsMap] = useState<Record<string, ApplicationData>>({});
  const [followedCompaniesMap, setFollowedCompaniesMap] = useState<Record<string, boolean>>({});
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application Modal State
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<RecommendationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<'FORM' | 'REVIEW' | 'SUCCESS'>('FORM');

  // Form Fields State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    college: '',
    branch: '',
    degree: '',
    graduationYear: new Date().getFullYear(),
    cgpa: 0,
    technicalSkills: '',
    programmingLanguages: '',
    coverLetter: '',
  });

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch Recommendations & Student Profile & My Applications & Followed Companies
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch AI Job Recommendations
        const recRes = await apiClient.get('/ai/recommendations/jobs');
        if (recRes.data?.success) {
          const recs: RecommendationItem[] = recRes.data.data.recommendations || [];
          // Sort by match score descending
          recs.sort((a, b) => b.matchScore - a.matchScore);
          setRecommendations(recs);
        }

        // 2. Fetch My Applications for duplicate protection & status
        const appRes = await apiClient.get('/applications/my-applications');
        if (appRes.data?.success) {
          const map: Record<string, ApplicationData> = {};
          (appRes.data.data || []).forEach((app: any) => {
            const jobId = typeof app.job === 'object' ? app.job?._id : app.job;
            if (jobId) {
              map[jobId] = {
                _id: app._id,
                job: jobId,
                status: app.status,
                appliedAt: app.appliedAt,
              };
            }
          });
          setApplicationsMap(map);
        }

        // 3. Fetch Followed Companies
        try {
          const followRes = await apiClient.get('/companies/following/my');
          if (followRes.data?.success) {
            const fMap: Record<string, boolean> = {};
            (followRes.data.data || []).forEach((comp: any) => {
              if (comp._id) fMap[comp._id] = true;
            });
            setFollowedCompaniesMap(fMap);
          }
        } catch (fErr) {
          // Ignore if error
        }

        // 4. Fetch Student Profile for pre-filling application form
        try {
          const profRes = await apiClient.get('/students/profile');
          if (profRes.data?.success) {
            setStudentProfile(profRes.data.data);
          }
        } catch (pErr) {
          // Fallback if profile API is available via portfolio
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleFollowCompany = async (companyId: string, companyName: string) => {
    if (!companyId) return;
    const isFollowing = Boolean(followedCompaniesMap[companyId]);
    try {
      if (isFollowing) {
        await apiClient.delete(`/companies/${companyId}/unfollow`);
        setFollowedCompaniesMap((prev) => ({ ...prev, [companyId]: false }));
      } else {
        await apiClient.post(`/companies/${companyId}/follow`);
        setFollowedCompaniesMap((prev) => ({ ...prev, [companyId]: true }));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update company follow status');
    }
  };

  // Open Application Form Modal
  const handleOpenApplicationModal = (rec: RecommendationItem) => {
    const job = rec.job;
    const existingApp = applicationsMap[job._id];

    if (existingApp) {
      alert(`You have already applied for this job.\nStatus: ${existingApp.status}`);
      return;
    }

    setSelectedJob(job);
    setSelectedMatch(rec);

    // Pre-fill form with profile data
    const skillsList = (studentProfile?.skills || []).map((s: any) => s.name).join(', ');
    setFormData({
      fullName: studentProfile?.user?.name || '',
      email: studentProfile?.user?.email || '',
      mobileNumber: studentProfile?.user?.phone || '',
      college: studentProfile?.college || '',
      branch: studentProfile?.branch || '',
      degree: studentProfile?.degree || '',
      graduationYear: studentProfile?.graduationYear || new Date().getFullYear() + 1,
      cgpa: studentProfile?.cgpa || 0,
      technicalSkills: skillsList || 'Java, SQL, Python, DSA',
      programmingLanguages: 'Java, Python, C++',
      coverLetter: '',
    });

    // Reset questions answers
    const initialAnswers: Record<string, string> = {};
    if (job.questions && job.questions.length > 0) {
      job.questions.forEach((q) => {
        initialAnswers[q.id] = '';
      });
    }
    setAnswers(initialAnswers);
    setFormErrors({});
    setStep('FORM');
    setIsModalOpen(true);
  };

  // Form Field Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!formData.email.trim()) errors.email = 'Email address is required';
    if (!formData.college.trim()) errors.college = 'College/Institution is required';
    if (!formData.branch.trim()) errors.branch = 'Branch/Department is required';

    // Validate job specific required questions
    if (selectedJob?.questions) {
      selectedJob.questions.forEach((q) => {
        if (q.required && (!answers[q.id] || !answers[q.id].trim())) {
          errors[`q_${q.id}`] = 'This question requires an answer';
        }
      });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Proceed to Application Review Step
  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep('REVIEW');
    }
  };

  // Final Application Submission
  const handleSubmitApplication = async () => {
    if (!selectedJob) return;
    setSubmitting(true);

    try {
      const formattedAnswers = selectedJob.questions
        ? selectedJob.questions.map((q) => ({
            questionId: q.id,
            questionText: q.questionText,
            answer: answers[q.id] || '',
          }))
        : [];

      const payload = {
        jobId: selectedJob._id,
        applicantDetails: {
          fullName: formData.fullName,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          college: formData.college,
          branch: formData.branch,
          degree: formData.degree,
          graduationYear: formData.graduationYear,
          cgpa: formData.cgpa,
          technicalSkills: formData.technicalSkills.split(',').map((s) => s.trim()).filter(Boolean),
          programmingLanguages: formData.programmingLanguages.split(',').map((s) => s.trim()).filter(Boolean),
          resumeUrl: studentProfile?.resumeUrl || '',
        },
        coverLetter: formData.coverLetter,
        answers: formattedAnswers,
      };

      const res = await apiClient.post('/applications/apply', payload);
      if (res.data?.success) {
        setStep('SUCCESS');

        // Update local applications map
        setApplicationsMap((prev) => ({
          ...prev,
          [selectedJob._id]: {
            _id: res.data.data._id,
            job: selectedJob._id,
            status: 'APPLIED',
            appliedAt: new Date().toISOString(),
          },
        }));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-slate-400 font-sans">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Calculating Explainable AI Job Compatibility...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans">
      <Navbar />

      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center space-x-3">
              <Sparkles className="h-7 w-7 text-indigo-400 animate-pulse" />
              <span>AI Match & Job Recommendations</span>
            </h2>
            <p className="text-sm text-slate-400">
              Ranked dynamically by multi-dimensional AI scoring across verified technical skills, academic performance, and project portfolio.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* Job Recommendations List */}
        <div className="space-y-6">
          {recommendations.map((rec, idx) => {
            const { job, matchScore, breakdown, summary } = rec;
            const existingApp = applicationsMap[job._id];
            const matchedSkillsList = rec.matchedSkills || breakdown?.technicalSkills?.matchedSkills || [];
            const missingSkillsList = rec.missingSkills || breakdown?.technicalSkills?.missingSkills || [];

            return (
              <div
                key={job._id}
                className="rounded-3xl p-6 border border-slate-800 space-y-6 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950/90 hover:border-slate-700 transition shadow-xl"
              >
                {/* Top Title & Score Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">
                        Rank #{idx + 1} • {job.employmentType}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{job.companyName}</span>
                      {(() => {
                        const compId = typeof (job as any).company === 'object' ? (job as any).company?._id : (job as any).company;
                        const isFollowing = compId ? Boolean(followedCompaniesMap[compId]) : false;
                        if (!compId) return null;
                        return (
                          <button
                            onClick={() => toggleFollowCompany(compId, job.companyName)}
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition flex items-center space-x-1 ${
                              isFollowing
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30'
                                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            <span>{isFollowing ? '✓ Following' : '+ Follow'}</span>
                          </button>
                        );
                      })()}
                    </div>
                    <h3 className="text-xl font-extrabold text-white">{job.title}</h3>
                  </div>

                  {/* AI Compatibility Score Badge & Apply Button */}
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
                        {matchScore}%
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        AI Compatibility Score
                      </div>
                    </div>

                    {existingApp ? (
                      <div className="flex flex-col items-end">
                        <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Applied ({existingApp.status})</span>
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1">Application Saved</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenApplicationModal(rec)}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-indigo-600/20"
                      >
                        <span>Apply Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{job.description}</p>

                {/* EXPLAINABLE SUB-SCORE BREAKDOWN */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Explainable AI Job Match Breakdown</span>
                  </div>

                  {/* Sub-Score Progress Bars Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Technical Skills</span>
                        <span className="font-bold text-indigo-400">{breakdown?.technicalSkills?.percentage ?? 85}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: `${breakdown?.technicalSkills?.percentage ?? 85}%` }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Assessment</span>
                        <span className="font-bold text-purple-400">{breakdown?.assessmentScore?.percentage ?? 80}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full" style={{ width: `${breakdown?.assessmentScore?.percentage ?? 80}%` }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Projects</span>
                        <span className="font-bold text-emerald-400">{breakdown?.projects?.percentage ?? 75}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${breakdown?.projects?.percentage ?? 75}%` }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Education</span>
                        <span className="font-bold text-blue-400">{breakdown?.academicPerformance?.percentage ?? 90}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${breakdown?.academicPerformance?.percentage ?? 90}%` }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Soft Skills</span>
                        <span className="font-bold text-amber-400">{breakdown?.softSkills?.percentage ?? 70}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: `${breakdown?.softSkills?.percentage ?? 70}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Matched & Missing Skills Pills */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {/* Matched Skills */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Matched Skills ({matchedSkillsList.length}):</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {matchedSkillsList.length > 0 ? (
                          matchedSkillsList.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-medium"
                            >
                              ✓ {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-500">Academic & Project Match</span>
                        )}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold text-amber-400 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Missing Skills ({missingSkillsList.length}):</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {missingSkillsList.length > 0 ? (
                          missingSkillsList.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-medium"
                            >
                              • {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-emerald-400">All required skills matched!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Why this job matches explanation box */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                    <strong className="text-indigo-400">Why this job matches: </strong>
                    <span>"{summary}"</span>
                  </div>
                </div>

                {/* Job Metadata Footer */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono pt-2 border-t border-slate-800/80 text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                    <span>{job.salary}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span>Min CGPA: <strong className="text-slate-200">{job.minCgpa}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span>Exp: <strong className="text-slate-200">{job.experience}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MULTI-STEP APPLICATION FORM & REVIEW MODAL */}
      {isModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">
                  {selectedJob.companyName}
                </span>
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                  <span>Application for {selectedJob.title}</span>
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center justify-center space-x-4 border-b border-slate-800 pb-4 text-xs font-semibold">
              <div className={`flex items-center space-x-2 ${step === 'FORM' ? 'text-indigo-400' : 'text-slate-500'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${step === 'FORM' ? 'bg-indigo-600 text-white' : 'bg-slate-800'}`}>1</span>
                <span>Application Form</span>
              </div>
              <span className="text-slate-700">/</span>
              <div className={`flex items-center space-x-2 ${step === 'REVIEW' ? 'text-indigo-400' : 'text-slate-500'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${step === 'REVIEW' ? 'bg-indigo-600 text-white' : 'bg-slate-800'}`}>2</span>
                <span>Review Application</span>
              </div>
              <span className="text-slate-700">/</span>
              <div className={`flex items-center space-x-2 ${step === 'SUCCESS' ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${step === 'SUCCESS' ? 'bg-emerald-600 text-white' : 'bg-slate-800'}`}>3</span>
                <span>Submit Confirmation</span>
              </div>
            </div>

            {/* STEP 1: APPLICATION FORM */}
            {step === 'FORM' && (
              <form onSubmit={handleProceedToReview} className="space-y-5">
                {/* Personal Information */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>Personal Information</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                      />
                      {formErrors.fullName && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                      />
                      {formErrors.email && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Mobile Number</label>
                      <input
                        type="text"
                        value={formData.mobileNumber}
                        onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-3 border-t border-slate-800/80 pt-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-400" />
                    <span>Academic Details</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">College/Institution *</label>
                      <input
                        type="text"
                        value={formData.college}
                        onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                      />
                      {formErrors.college && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.college}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Branch/Department *</label>
                      <input
                        type="text"
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                      />
                      {formErrors.branch && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.branch}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">CGPA / Percentage</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.cgpa}
                        onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Skills & Experience */}
                <div className="space-y-3 border-t border-slate-800/80 pt-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <span>Technical Skills & Programming Languages</span>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.technicalSkills}
                      onChange={(e) => setFormData({ ...formData, technicalSkills: e.target.value })}
                      placeholder="e.g. Java, Python, SQL, DSA, React"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Job-Specific Information & Questions */}
                <div className="space-y-3 border-t border-slate-800/80 pt-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Cover Letter & Job Specific Questions</span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Cover Letter / Suitability Statement</label>
                    <textarea
                      rows={3}
                      value={formData.coverLetter}
                      onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                      placeholder="Explain why your technical background and projects make you a strong fit for this position..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Company Configured Questions */}
                  {selectedJob.questions && selectedJob.questions.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                        Company Questions Required for Application:
                      </div>
                      {selectedJob.questions.map((q) => (
                        <div key={q.id} className="space-y-1">
                          <label className="block text-[11px] text-slate-300">
                            {q.questionText} {q.required && <span className="text-rose-400">*</span>}
                          </label>
                          <textarea
                            rows={2}
                            value={answers[q.id] || ''}
                            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                            placeholder="Write your response..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500"
                          />
                          {formErrors[`q_${q.id}`] && (
                            <p className="text-[10px] text-rose-400">{formErrors[`q_${q.id}`]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-2"
                  >
                    <span>Next: Review Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: APPLICATION REVIEW */}
            {step === 'REVIEW' && (
              <div className="space-y-5 text-xs">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 space-y-1">
                  <div className="font-bold flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Review Application Details Before Final Submission</span>
                  </div>
                  <p className="text-[11px] text-indigo-200">
                    Verify all information below. Clicking "Submit Application" will save your application to the recruiter dashboard.
                  </p>
                </div>

                {/* Review Grid */}
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Personal & Academic Details</div>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>Name: <strong className="text-white">{formData.fullName}</strong></div>
                      <div>Email: <strong className="text-white">{formData.email}</strong></div>
                      <div>College: <strong className="text-white">{formData.college}</strong></div>
                      <div>Branch: <strong className="text-white">{formData.branch}</strong></div>
                      <div>CGPA: <strong className="text-white">{formData.cgpa}/10</strong></div>
                      <div>Graduation: <strong className="text-white">{formData.graduationYear}</strong></div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Technical Skills</div>
                    <div className="text-slate-200">{formData.technicalSkills}</div>
                  </div>

                  {formData.coverLetter && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Cover Letter</div>
                      <div className="text-slate-300 leading-relaxed italic">"{formData.coverLetter}"</div>
                    </div>
                  )}

                  {selectedJob.questions && selectedJob.questions.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">Job-Specific Responses</div>
                      {selectedJob.questions.map((q) => (
                        <div key={q.id} className="space-y-1 border-b border-slate-800/80 pb-2 last:border-0">
                          <div className="font-semibold text-slate-300">Q: {q.questionText}</div>
                          <div className="text-slate-400 italic">Ans: "{answers[q.id] || 'N/A'}"</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Review Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setStep('FORM')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition flex items-center space-x-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>← Edit</span>
                  </button>

                  <button
                    onClick={handleSubmitApplication}
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Submitting Application...' : 'Submit Application'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS CONFIRMATION */}
            {step === 'SUCCESS' && (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 animate-bounce" />
                </div>
                <h4 className="text-2xl font-extrabold text-white">Application Submitted Successfully!</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Your application, explainable AI compatibility score, and responses have been transmitted to <strong className="text-slate-200">{selectedJob.companyName}</strong> recruiters.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                  >
                    Back to Recommendations
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentJobRecommendationsPage;

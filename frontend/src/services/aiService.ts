import { apiClient } from './api';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CareerReadinessResult {
  careerReadinessScore: number;
  targetRole: string;
  subScores: Record<string, number>;
  breakdown: Record<string, { score: number; maxScore: number; count?: number; cgpa?: number }>;
  strengthAreas: string[];
  weakAreas: string[];
  recommendedActions: string[];
  readinessLevel: string;
  cached?: boolean;
  analysisId?: string;
}

export interface SkillGapResult {
  targetRole: string;
  summary: {
    totalRequired: number;
    matched: number;
    missing: number;
    weak: number;
    matchPercentage: number;
  };
  matchedSkills: Array<{ skill: string; level: string; score: number; verified: boolean }>;
  missingSkills: Array<{ skill: string; priority: string; demandCount: number }>;
  weakSkills: string[];
  topPrioritySkills: string[];
  cached?: boolean;
}

export interface LearningRoadmapResult {
  targetRole: string;
  timelineWeeks: number;
  totalMilestones: number;
  roadmap: Array<{
    week: number;
    skill: string;
    difficulty: string;
    estimatedTime: string;
    priority: string;
    relatedRoles: string[];
    reason: string;
    resources: string[];
  }>;
  alreadyStrong: string[];
  estimatedCompletionWeeks: number;
  cached?: boolean;
}

export interface CareerRolesResult {
  topRoles: Array<{
    role: string;
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    why: string;
  }>;
  primaryRecommendation: {
    role: string;
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    why: string;
  } | null;
  cached?: boolean;
}

export interface ResumeAnalysisResult {
  resumeScore: number;
  atsScore: number;
  wordCount: number;
  extractedSkills: string[];
  detectedSections: string[];
  missingSections: string[];
  atsKeywordsFound: string[];
  atsKeywordsMissing: string[];
  actionVerbCount: number;
  hasQuantifiedResults: boolean;
  contactInfo: { emailFound: boolean; phoneFound: boolean };
  domain: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  scoreBreakdown: Record<string, number>;
  filename?: string;
  analysisId?: string;
}

export interface IndustryInsightsResult {
  dataLabel: string;
  summary: {
    totalJobsAnalyzed: number;
    totalApplications: number;
    totalPlacements: number;
    uniqueSkillsFound: number;
    averageSkillsPerJob: number;
  };
  topDemandedSkills: Array<{ skill: string; demandCount: number; type: string }>;
  topPreferredSkills: Array<{ skill: string; demandCount: number }>;
  skillsByCategory: Record<string, Array<{ skill: string; count: number }>>;
  topJobRoles: Array<{ role: string; count: number }>;
  topLocations: Array<{ location: string; count: number }>;
  employmentTypeDistribution: Record<string, number>;
  applicationFunnel: Record<string, number>;
  topCompanies: Array<{ company: string; jobCount: number }>;
}

export interface InterviewPrepResult {
  jobTitle: string;
  targetRole: string;
  experienceLevel: string;
  totalQuestions: number;
  technical: Array<{ id: number; q: string; difficulty: string; expectedKeywords: string[] }>;
  hr: Array<{ id: number; q: string; difficulty: string }>;
  behavioral: Array<{ id: number; q: string; difficulty: string }>;
  interviewTips: string[];
  focusSkills: string[];
}

export interface MockAnswerResult {
  score: number;
  completeness: string;
  feedback: string;
  keywordsMatched: string[];
  keywordsMissed: string[];
  hasExample: boolean;
  wordCount: number;
  breakdown: Record<string, number>;
}

export interface PerformanceAnalyticsResult {
  overview: {
    overall: number;
    academic: number;
    technical: number;
    dsa: number;
    assignment: number;
    attendance: number;
    careerReadiness: number;
    interviewReadiness: number;
    placementReadiness: number;
  };
  performanceTrend: Array<{ date: string; score: number; title: string; category: string }>;
  subjectPerformance: Array<{ subject: string; score: number; assessmentsCount: number }>;
  skillPerformance: Array<{ skill: string; score: number; level: string; category: string; verified: boolean }>;
  dsaPerformance: {
    overallScore: number;
    problemsSolved: number;
    accuracy: number;
    totalAttempts: number;
    topicPerformance: Array<{ topic: string; score: number; solved: number }>;
  };
  attendance: {
    attendancePercentage: number;
    totalClasses: number;
    attendedClasses: number;
    relationship: Array<{ period: string; attendance: number; avgPerformance: number }>;
  };
  assignments: {
    submitted: number;
    total: number;
    completionRate: number;
    averageScore: number;
    trend: Array<{ title: string; score: number; date: Date }>;
  };
  careerReadinessTrend: Array<{ date: string; score: number }>;
  skillGapProgress: Array<{ date: string; missingCount: number; matchedCount: number }>;
  placementReadinessScore: number;
  jobReadinessBreakdown: {
    skillMatch: number;
    technicalAssessment: number;
    dsa: number;
    projects: number;
    internships: number;
    resume: number;
    profileCompleteness: number;
  };
  insights: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    trend: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Service API calls
// ─────────────────────────────────────────────────────────────────────────────

export const aiService = {
  // Career Intelligence
  getCareerReadiness: (targetRole?: string) =>
    apiClient.get<{ data: CareerReadinessResult }>('/ai/career-readiness', { params: { targetRole } }),

  getSkillGap: (targetRole?: string, jobId?: string) =>
    apiClient.get<{ data: SkillGapResult }>('/ai/skill-gap', { params: { targetRole, jobId } }),

  getLearningRoadmap: (targetRole?: string) =>
    apiClient.get<{ data: LearningRoadmapResult }>('/ai/learning-roadmap', { params: { targetRole } }),

  getCareerRoles: () =>
    apiClient.get<{ data: CareerRolesResult }>('/ai/career-roles'),

  getDevelopmentPlan: (targetRole?: string) =>
    apiClient.get<{ data: any }>('/ai/development-plan', { params: { targetRole } }),

  getPerformanceAnalytics: () =>
    apiClient.get<{ data: PerformanceAnalyticsResult }>('/ai/performance'),

  // Resume
  analyzeResume: (targetRole?: string) =>
    apiClient.post<{ data: ResumeAnalysisResult }>('/ai/resume-analyze', { targetRole }),

  getLatestResumeAnalysis: () =>
    apiClient.get<{ data: ResumeAnalysisResult }>('/ai/resume-analysis'),

  getProfileImprovement: (targetRole?: string) =>
    apiClient.get<{ data: any }>('/ai/profile-improve', { params: { targetRole } }),

  // Interview V2 (Phase 13 Real-Time Practice Engine)
  startMockInterviewV2: (payload: { role: string; skill: string; difficulty?: string; questionCount?: number; interviewType?: string }) =>
    apiClient.post<{ data: any }>('/ai/mock-interview/start', payload),

  getMockInterviewQuestionV2: (sessionId: string, index?: number) =>
    apiClient.post<{ data: any }>('/ai/mock-interview/question', { sessionId, index }),

  evaluateMockAnswerV2: (payload: { sessionId: string; questionId: number; answer: string; timeSpentSeconds?: number; answerMethod?: 'speech' | 'text' }) =>
    apiClient.post<{ data: any }>('/ai/mock-interview/answer', payload),

  logMockInterviewEventV2: (payload: { sessionId: string; eventType: string; durationSeconds?: number; questionNumber?: number; warningLevel?: string; description?: string }) =>
    apiClient.post<{ data: any }>('/ai/mock-interview/event', payload),

  finishMockInterviewV2: (sessionId: string) =>
    apiClient.post<{ data: any }>('/ai/mock-interview/finish', { sessionId }),

  getMockInterviewHistoryV2: () =>
    apiClient.get<{ data: any }>('/ai/mock-interview/history'),

  getMockInterviewReportByIdV2: (id: string) =>
    apiClient.get<{ data: any }>(`/ai/mock-interview/${id}`),

  getInterviewPrep: (payload: { jobId?: string; targetRole?: string; experienceLevel?: string }) =>
    apiClient.post<{ data: InterviewPrepResult }>('/ai/interview-prep', payload),

  evaluateMockAnswer: (payload: {
    question: string;
    answer: string;
    expectedKeywords: string[];
    questionDifficulty: string;
  }) => apiClient.post<{ data: MockAnswerResult }>('/ai/mock-interview/answer', payload),

  getMockInterviewReport: (payload: { sessionId: string; answers: any[] }) =>
    apiClient.post<{ data: any }>('/ai/mock-interview/report', payload),

  // Career Assistant
  chatWithAssistant: (message: string, conversationHistory: any[] = []) =>
    apiClient.post<{ data: { response: string; intent: string } }>('/ai/career-assistant', {
      message,
      conversationHistory,
    }),

  // Industry Insights
  getIndustryInsights: () =>
    apiClient.get<{ data: IndustryInsightsResult }>('/ai/industry-insights'),

  // Company
  analyzeJobDescription: (payload: {
    title: string;
    description: string;
    currentSkills?: string[];
    employmentType?: string;
  }) => apiClient.post<{ data: any }>('/ai/company/job-description', payload),

  getCandidateInsights: (studentId: string, jobId?: string) =>
    apiClient.get<{ data: any }>(`/ai/company/candidate/${studentId}`, { params: { jobId } }),

  getShortlistingRank: (jobId: string) =>
    apiClient.get<{ data: any }>(`/ai/company/${jobId}/shortlist`),

  // ─────────────────────────────────────────────────────────────────────────────
  // Phase 12 — AI Intelligence Suite
  // ─────────────────────────────────────────────────────────────────────────────

  // Career Predictor
  getCareerPredictor: (targetRole?: string, goals?: string[]) =>
    apiClient.get<{ data: any }>('/ai/career-predictor', {
      params: { targetRole, goals: goals ? JSON.stringify(goals) : undefined },
    }),

  // Skill Coach
  getSkillCoach: (skill: string, level?: string) =>
    apiClient.get<{ data: any }>('/ai/skill-coach', { params: { skill, level } }),

  // DSA Coach
  getDSACoach: (targetRole?: string) =>
    apiClient.get<{ data: any }>('/ai/dsa-coach', { params: { targetRole } }),

  // Coding Debugger
  runCodingDebugger: (payload: { code: string; language: string; errorMessage?: string; context?: string }) =>
    apiClient.post<{ data: any }>('/ai/coding-debugger', payload),

  // Code Reviewer
  runCodeReviewer: (payload: { code: string; language: string; reviewType?: string }) =>
    apiClient.post<{ data: any }>('/ai/code-reviewer', payload),

  // Interview Coach
  getInterviewCoach: (targetRole?: string, weakAreas?: string[]) =>
    apiClient.get<{ data: any }>('/ai/interview-coach', {
      params: { targetRole, weakAreas: weakAreas ? JSON.stringify(weakAreas) : undefined },
    }),

  // Resume Optimizer
  getResumeOptimizer: (payload: { targetRole?: string; currentResumeScore?: number }) =>
    apiClient.post<{ data: any }>('/ai/resume-optimizer', payload),

  // Project Advisor
  getProjectAdvisor: (targetRole?: string, weeks?: number) =>
    apiClient.get<{ data: any }>('/ai/project-advisor', { params: { targetRole, weeks } }),

  // Learning Materials
  getLearningMaterials: (payload: { skill: string; level?: string; format?: string }) =>
    apiClient.post<{ data: any }>('/ai/learning-materials', payload),

  // Performance Predictor
  getPerformancePredictor: (targetScore?: number, weeks?: number) =>
    apiClient.get<{ data: any }>('/ai/performance-predictor', { params: { targetScore, weeks } }),

  // Placement Readiness
  getPlacementReadiness: (companyType?: string) =>
    apiClient.get<{ data: any }>('/ai/placement-readiness', { params: { companyType } }),

  // Job Explainability
  getJobExplainability: (jobId: string) =>
    apiClient.get<{ data: any }>(`/ai/job-explainability/${jobId}`),

  // Job Alerts
  getJobAlerts: () =>
    apiClient.get<{ data: any }>('/ai/job-alerts'),

  // What-If Simulator
  getWhatIf: (payload: { scenario: string; changes: any[] }) =>
    apiClient.post<{ data: any }>('/ai/what-if', payload),

  // Skill Forecast
  getSkillForecast: () =>
    apiClient.get<{ data: any }>('/ai/skill-forecast'),

  // Weekly Plan
  getWeeklyPlan: (targetRole?: string, hours?: number, focusAreas?: string[]) =>
    apiClient.get<{ data: any }>('/ai/weekly-plan', {
      params: { targetRole, hours, focusAreas: focusAreas ? JSON.stringify(focusAreas) : undefined },
    }),

  // Student 360
  getStudent360: () =>
    apiClient.get<{ data: any }>('/ai/student-360'),

  // Action Center
  getActionCenter: () =>
    apiClient.get<{ data: any }>('/ai/action-center'),
};

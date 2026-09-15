import { Router } from 'express';
import {
  // Phase 1–9 (preserved)
  getCandidatesForJob,
  getJobRecommendationsForStudent,
  // Phase 10 — Student Career Intelligence
  getCareerReadiness,
  getSkillGap,
  getLearningRoadmap,
  getCareerRoles,
  getDevelopmentPlan,
  // Phase 10 — Resume
  analyzeResume,
  getResumeAnalysis,
  getProfileImprovement,
  // Phase 10 — Interview
  getInterviewPrep,
  evaluateMockAnswer,
  getMockInterviewReport,
  // Phase 10 — Assistant
  chatWithCareerAssistant,
  // Phase 10 — Analytics & Performance
  getIndustryInsights,
  getStudentPerformanceAnalytics,
  // Phase 10 — Company
  analyzeJobDescription,
  getCandidateInsights,
  getShortlistingRank,
  // Phase 12 — AI Intelligence Suite
  getCareerPredictor,
  getSkillCoach,
  getDSACoach,
  runCodingDebugger,
  runCodeReviewer,
  getInterviewCoach,
  getResumeOptimizer,
  getProjectAdvisor,
  getLearningMaterials,
  getPerformancePredictor,
  getPlacementReadiness,
  getJobExplainability,
  getJobAlerts,
  getWhatIf,
  getSkillForecast,
  getWeeklyPlan,
  getStudent360,
  getActionCenter,
} from '../controllers/aiMatchingController';
import {
  startMockInterviewSession,
  getMockInterviewQuestion,
  evaluateMockInterviewAnswer,
  logMockInterviewIntegrityEvent,
  finishMockInterviewSession,
  getMockInterviewHistory,
  getMockInterviewReportById,
} from '../controllers/aiInterviewController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// Phase 1–9 routes (PRESERVED)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/jobs/:jobId/candidates', protect, authorize('COMPANY', 'ADMIN'), asyncHandler(getCandidatesForJob));
router.get('/recommendations/jobs', protect, authorize('STUDENT'), asyncHandler(getJobRecommendationsForStudent));

// ─────────────────────────────────────────────────────────────────────────────
// Phase 10 — Student Career Intelligence
// ─────────────────────────────────────────────────────────────────────────────
router.get('/career-readiness', protect, authorize('STUDENT'), asyncHandler(getCareerReadiness));
router.get('/skill-gap', protect, authorize('STUDENT'), asyncHandler(getSkillGap));
router.get('/learning-roadmap', protect, authorize('STUDENT'), asyncHandler(getLearningRoadmap));
router.get('/career-roles', protect, authorize('STUDENT'), asyncHandler(getCareerRoles));
router.get('/development-plan', protect, authorize('STUDENT'), asyncHandler(getDevelopmentPlan));
router.get('/performance', protect, authorize('STUDENT'), asyncHandler(getStudentPerformanceAnalytics));

// ─────────────────────────────────────────────────────────────────────────────
// Phase 10 — Resume Analysis
// ─────────────────────────────────────────────────────────────────────────────
router.post('/resume-analyze', protect, authorize('STUDENT'), asyncHandler(analyzeResume));
router.get('/resume-analysis', protect, authorize('STUDENT'), asyncHandler(getResumeAnalysis));
router.get('/profile-improve', protect, authorize('STUDENT'), asyncHandler(getProfileImprovement));

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// Phase 13 — AI Mock Interview 2.0 System
// ─────────────────────────────────────────────────────────────────────────────
router.post('/interview-prep', protect, authorize('STUDENT'), asyncHandler(getInterviewPrep));
router.post('/mock-interview/start', protect, authorize('STUDENT'), asyncHandler(startMockInterviewSession));
router.post('/mock-interview/question', protect, authorize('STUDENT'), asyncHandler(getMockInterviewQuestion));
router.post('/mock-interview/answer', protect, authorize('STUDENT'), asyncHandler(evaluateMockInterviewAnswer));
router.post('/mock-interview/event', protect, authorize('STUDENT'), asyncHandler(logMockInterviewIntegrityEvent));
router.post('/mock-interview/finish', protect, authorize('STUDENT'), asyncHandler(finishMockInterviewSession));
router.get('/mock-interview/history', protect, authorize('STUDENT'), asyncHandler(getMockInterviewHistory));
router.get('/mock-interview/:id', protect, authorize('STUDENT'), asyncHandler(getMockInterviewReportById));

// ─────────────────────────────────────────────────────────────────────────────
// Phase 10 — Career Assistant
// ─────────────────────────────────────────────────────────────────────────────
router.post('/career-assistant', protect, authorize('STUDENT'), asyncHandler(chatWithCareerAssistant));

// ─────────────────────────────────────────────────────────────────────────────
// Phase 10 — Industry Insights (all authenticated roles)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/industry-insights', protect, asyncHandler(getIndustryInsights));

// ─────────────────────────────────────────────────────────────────────────────
// Phase 10 — Company AI
// ─────────────────────────────────────────────────────────────────────────────
router.post('/company/job-description', protect, authorize('COMPANY', 'ADMIN'), asyncHandler(analyzeJobDescription));
router.get('/company/candidate/:studentId', protect, authorize('COMPANY', 'ADMIN'), asyncHandler(getCandidateInsights));
router.get('/company/:jobId/shortlist', protect, authorize('COMPANY', 'ADMIN'), asyncHandler(getShortlistingRank));

// ─────────────────────────────────────────────────────────────────────────────
// Phase 12 — AI Intelligence Suite
// ─────────────────────────────────────────────────────────────────────────────
router.get('/career-predictor', protect, authorize('STUDENT'), asyncHandler(getCareerPredictor));
router.get('/skill-coach', protect, authorize('STUDENT'), asyncHandler(getSkillCoach));
router.get('/dsa-coach', protect, authorize('STUDENT'), asyncHandler(getDSACoach));
router.post('/coding-debugger', protect, asyncHandler(runCodingDebugger));
router.post('/code-reviewer', protect, asyncHandler(runCodeReviewer));
router.get('/interview-coach', protect, authorize('STUDENT'), asyncHandler(getInterviewCoach));
router.post('/resume-optimizer', protect, authorize('STUDENT'), asyncHandler(getResumeOptimizer));
router.get('/project-advisor', protect, authorize('STUDENT'), asyncHandler(getProjectAdvisor));
router.post('/learning-materials', protect, asyncHandler(getLearningMaterials));
router.get('/performance-predictor', protect, authorize('STUDENT'), asyncHandler(getPerformancePredictor));
router.get('/placement-readiness', protect, authorize('STUDENT'), asyncHandler(getPlacementReadiness));
router.get('/job-explainability/:jobId', protect, authorize('STUDENT'), asyncHandler(getJobExplainability));
router.get('/job-alerts', protect, authorize('STUDENT'), asyncHandler(getJobAlerts));
router.post('/what-if', protect, authorize('STUDENT'), asyncHandler(getWhatIf));
router.get('/skill-forecast', protect, asyncHandler(getSkillForecast));
router.get('/weekly-plan', protect, authorize('STUDENT'), asyncHandler(getWeeklyPlan));
router.get('/student-360', protect, authorize('STUDENT'), asyncHandler(getStudent360));
router.get('/action-center', protect, authorize('STUDENT'), asyncHandler(getActionCenter));

export default router;

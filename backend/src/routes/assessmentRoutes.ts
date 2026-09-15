import { Router } from 'express';
import {
  listAssessments,
  getAssessmentQuestions,
  submitAssessment,
  getStudentResults,
  seedAssessments,
} from '../controllers/assessmentController';
import {
  startProctoredAttempt,
  recordProctoringEvent,
  saveProctoredAnswer,
  submitProctoredAttempt,
  getProctoredAttempt,
  getProctoredReport,
} from '../controllers/proctoredAssessmentController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// Phase 10 — AI-Proctored Assessment Endpoints
router.post('/proctored/start', protect, authorize('STUDENT'), asyncHandler(startProctoredAttempt));
router.post('/proctored/event', protect, authorize('STUDENT'), asyncHandler(recordProctoringEvent));
router.post('/proctored/answer', protect, authorize('STUDENT'), asyncHandler(saveProctoredAnswer));
router.post('/proctored/submit', protect, authorize('STUDENT'), asyncHandler(submitProctoredAttempt));
router.get('/proctored/:attemptId/report', protect, authorize('STUDENT', 'ADMIN', 'COMPANY'), asyncHandler(getProctoredReport));
router.get('/proctored/:attemptId', protect, authorize('STUDENT', 'ADMIN', 'COMPANY'), asyncHandler(getProctoredAttempt));

// Phase 1–9 Existing Assessment Endpoints (Preserved)
router.get('/', asyncHandler(listAssessments));
router.get('/my-results', protect, authorize('STUDENT'), asyncHandler(getStudentResults));
router.get('/:id/take', protect, asyncHandler(getAssessmentQuestions));
router.post('/:id/submit', protect, authorize('STUDENT'), asyncHandler(submitAssessment));
router.post('/seed', protect, asyncHandler(seedAssessments));

export default router;

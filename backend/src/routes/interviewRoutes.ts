import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';
import {
  scheduleInterview,
  updateInterview,
  getCompanyInterviews,
  getStudentInterviews
} from '../controllers/interviewController';

const router = express.Router();

// Company Routes
router.post('/schedule', protect, authorize('COMPANY'), scheduleInterview);
router.get('/company', protect, authorize('COMPANY'), getCompanyInterviews);

// Convenience complete route: PATCH /:id/complete → calls updateInterview with action=COMPLETE
router.patch('/:id/complete', protect, authorize('COMPANY'), (req, res, next) => {
  req.body = {
    action: 'COMPLETE',
    data: {
      feedbackScore: req.body.rating || req.body.feedbackScore,
      feedbackRemarks: req.body.feedback || req.body.feedbackRemarks,
    }
  };
  return updateInterview(req as any, res);
});

// General update (reschedule/cancel)
router.patch('/:id', protect, authorize('COMPANY'), updateInterview);

// Student Routes
router.get('/student', protect, authorize('STUDENT'), getStudentInterviews);
// Alias: my-interviews → student (for frontend compatibility)
router.get('/my-interviews', protect, authorize('STUDENT'), getStudentInterviews);

export default router;

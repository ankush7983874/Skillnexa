import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';
import {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  checkJobApplication,
} from '../controllers/applicationController';

const router = express.Router();

// Student Routes
router.post('/apply', protect, authorize('STUDENT'), applyForJob);
router.get('/my-applications', protect, authorize('STUDENT'), getMyApplications);
router.get('/check/:jobId', protect, authorize('STUDENT'), checkJobApplication);

// Company Routes
router.get('/job/:jobId', protect, authorize('COMPANY'), getJobApplications);
router.patch('/:id/status', protect, authorize('COMPANY'), updateApplicationStatus);

export default router;


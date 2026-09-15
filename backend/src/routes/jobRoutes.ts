import { Router } from 'express';
import {
  createJob,
  getJobs,
  getJobById,
  createInternship,
  getInternships,
} from '../controllers/jobController';
import { protect } from '../middleware/authMiddleware';
import { authorize, requireVerifiedCompany } from '../middleware/rbacMiddleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/jobs', asyncHandler(getJobs));
router.get('/jobs/:id', asyncHandler(getJobById));
router.post('/jobs', protect, authorize('COMPANY', 'ADMIN'), requireVerifiedCompany, asyncHandler(createJob));

router.get('/internships', asyncHandler(getInternships));
router.post('/internships', protect, authorize('COMPANY', 'ADMIN'), requireVerifiedCompany, asyncHandler(createInternship));

export default router;

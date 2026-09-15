import { Router } from 'express';
import {
  getFacultyProfile,
  updateFacultyProfile,
  createFacultyOpportunity,
  listFacultyOpportunities,
  applyFacultyOpportunity,
  getMyFacultyApplications,
  updateFacultyApplicationStatus,
} from '../controllers/facultyController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/profile', protect, authorize('FACULTY'), asyncHandler(getFacultyProfile));
router.put('/profile', protect, authorize('FACULTY'), asyncHandler(updateFacultyProfile));

router.post('/opportunities', protect, authorize('COMPANY'), asyncHandler(createFacultyOpportunity));
router.get('/opportunities', protect, asyncHandler(listFacultyOpportunities));
router.post('/opportunities/apply', protect, authorize('FACULTY'), asyncHandler(applyFacultyOpportunity));
router.get('/applications/my', protect, authorize('FACULTY'), asyncHandler(getMyFacultyApplications));
router.put('/applications/:applicationId/status', protect, authorize('COMPANY'), asyncHandler(updateFacultyApplicationStatus));

export default router;

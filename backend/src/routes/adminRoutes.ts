import { Router } from 'express';
import {
  listAllUsers,
  updateUserStatus,
  moderateJob,
  queryAuditLogs,
  assignHod,
  getPendingFaculty,
  verifyFaculty,
  createAdminUser,
} from '../controllers/adminController';
import { getDepartmentAnalytics } from '../controllers/hodController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// Admin Only
router.get('/users', protect, authorize('ADMIN'), asyncHandler(listAllUsers));
router.put('/users/:userId', protect, authorize('ADMIN'), asyncHandler(updateUserStatus));
router.put('/jobs/:jobId/moderate', protect, authorize('ADMIN'), asyncHandler(moderateJob));
router.get('/audit-logs', protect, authorize('ADMIN'), asyncHandler(queryAuditLogs));

// HOD & Faculty Administration
router.post('/assign-hod', protect, authorize('ADMIN', 'INSTITUTION'), asyncHandler(assignHod));
router.get('/faculty/pending', protect, authorize('ADMIN', 'INSTITUTION'), asyncHandler(getPendingFaculty));
router.patch('/faculty/:facultyId/verify', protect, authorize('ADMIN', 'INSTITUTION'), asyncHandler(verifyFaculty));
router.post('/create-admin', protect, authorize('ADMIN'), asyncHandler(createAdminUser));

// HOD & Institution Analytics
router.get('/hod/department-analytics', protect, authorize('ADMIN', 'INSTITUTION', 'FACULTY', 'HOD'), asyncHandler(getDepartmentAnalytics));

export default router;

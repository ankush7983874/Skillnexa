import { Router } from 'express';
import {
  exportPlacementsReport,
  exportProctoringLogsReport,
} from '../controllers/reportController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/placements', protect, authorize('ADMIN', 'COMPANY', 'INSTITUTION'), asyncHandler(exportPlacementsReport));
router.get('/proctoring', protect, authorize('ADMIN', 'INSTITUTION'), asyncHandler(exportProctoringLogsReport));

export default router;

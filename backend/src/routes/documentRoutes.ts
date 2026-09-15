import { Router } from 'express';
import {
  uploadVerificationDocument,
  getMyDocuments,
  listPendingDocuments,
  verifyOrRejectDocument,
} from '../controllers/documentController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.post('/upload', protect, authorize('STUDENT', 'FACULTY'), asyncHandler(uploadVerificationDocument));
router.get('/my', protect, authorize('STUDENT', 'FACULTY'), asyncHandler(getMyDocuments));
router.get('/pending', protect, authorize('ADMIN', 'INSTITUTION'), asyncHandler(listPendingDocuments));
router.put('/:documentId/verify', protect, authorize('ADMIN', 'INSTITUTION'), asyncHandler(verifyOrRejectDocument));

export default router;

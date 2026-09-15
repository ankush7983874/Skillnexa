import { Router } from 'express';
import {
  createCollaborationProposal,
  listCollaborations,
  updateCollaborationStatus,
} from '../controllers/collaborationController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.post('/propose', protect, authorize('COMPANY', 'INSTITUTION', 'FACULTY'), asyncHandler(createCollaborationProposal));
router.get('/', protect, asyncHandler(listCollaborations));
router.put('/:collaborationId/status', protect, authorize('COMPANY', 'INSTITUTION', 'ADMIN'), asyncHandler(updateCollaborationStatus));

export default router;

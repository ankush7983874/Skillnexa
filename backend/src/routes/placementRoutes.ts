import { Router } from 'express';
import {
  listPlacements,
  updatePlacementJoiningStatus,
  createOfferLetter,
} from '../controllers/placementController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/', protect, asyncHandler(listPlacements));
router.put('/:placementId/joining', protect, authorize('STUDENT', 'COMPANY', 'ADMIN'), asyncHandler(updatePlacementJoiningStatus));
router.post('/offer', protect, authorize('COMPANY', 'ADMIN'), asyncHandler(createOfferLetter));

export default router;


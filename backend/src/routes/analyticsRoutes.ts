import { Router } from 'express';
import { getSystemAnalytics } from '../controllers/analyticsController';
import { protect } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/', protect, asyncHandler(getSystemAnalytics));

export default router;

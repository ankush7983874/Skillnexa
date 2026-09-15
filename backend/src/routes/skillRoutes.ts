import { Router } from 'express';
import { getSkills, seedSkills } from '../controllers/skillController';
import { protect } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/', asyncHandler(getSkills));
router.post('/seed', protect, asyncHandler(seedSkills));

export default router;

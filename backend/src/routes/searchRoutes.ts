import { Router } from 'express';
import { globalSearch } from '../controllers/searchController';
import { protect } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/', protect, asyncHandler(globalSearch));

export default router;

import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  addProject,
  addCertification,
  addInternship,
  getPublicPortfolio,
} from '../controllers/studentController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { Notification } from '../models/Notification';
import { ApiResponse } from '../utils/ApiResponse';

const router = Router();

router.get('/profile', protect, authorize('STUDENT'), asyncHandler(getProfile));
router.put('/profile', protect, authorize('STUDENT'), asyncHandler(updateProfile));
router.post('/projects', protect, authorize('STUDENT'), asyncHandler(addProject));
router.post('/certifications', protect, authorize('STUDENT'), asyncHandler(addCertification));
router.post('/internships', protect, authorize('STUDENT'), asyncHandler(addInternship));
router.get('/:studentId/portfolio', protect, asyncHandler(getPublicPortfolio));

// Notifications for student
router.get('/notifications', protect, authorize('STUDENT'), asyncHandler(async (req: any, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.status(200).json(ApiResponse.success('Notifications retrieved', notifications));
}));

// Mark notification as read
router.patch('/notifications/:id/read', protect, authorize('STUDENT'), asyncHandler(async (req: any, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.status(200).json(ApiResponse.success('Notification marked as read', null));
}));

export default router;

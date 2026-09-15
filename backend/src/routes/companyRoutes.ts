import { Router } from 'express';
import {
  getCompanyProfile,
  updateCompanyProfile,
  getPendingCompanies,
  updateVerificationStatus,
  followCompany,
  unfollowCompany,
  checkFollowingStatus,
  getFollowedCompanies,
} from '../controllers/companyController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { Notification } from '../models/Notification';
import { EmailLog } from '../models/EmailLog';
import { ApiResponse } from '../utils/ApiResponse';

const router = Router();

router.get('/profile', protect, authorize('COMPANY'), asyncHandler(getCompanyProfile));
router.put('/profile', protect, authorize('COMPANY'), asyncHandler(updateCompanyProfile));
router.get('/pending', protect, authorize('ADMIN'), asyncHandler(getPendingCompanies));
router.patch('/:companyId/verification-status', protect, authorize('ADMIN'), asyncHandler(updateVerificationStatus));

// Student Follow Company Routes
router.post('/:companyId/follow', protect, authorize('STUDENT'), asyncHandler(followCompany));
router.delete('/:companyId/unfollow', protect, authorize('STUDENT'), asyncHandler(unfollowCompany));
router.get('/:companyId/is-following', protect, asyncHandler(checkFollowingStatus));
router.get('/following/my', protect, authorize('STUDENT'), asyncHandler(getFollowedCompanies));

// Notifications for company
router.get('/notifications', protect, authorize('COMPANY'), asyncHandler(async (req: any, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.status(200).json(ApiResponse.success('Notifications retrieved', notifications));
}));

// Email logs for company
router.get('/email-logs', protect, authorize('COMPANY'), asyncHandler(async (req: any, res) => {
  try {
    const logs = await EmailLog.find({ userId: req.user._id }).sort({ sentAt: -1 }).limit(50);
    res.status(200).json(ApiResponse.success('Email logs retrieved', logs));
  } catch (e) {
    res.status(200).json(ApiResponse.success('Email logs retrieved', []));
  }
}));

export default router;


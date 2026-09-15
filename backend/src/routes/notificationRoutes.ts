import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notificationController';

const router = express.Router();

router.get('/my', protect, getMyNotifications);
router.patch('/:id/read', protect, markNotificationRead);
router.patch('/read-all', protect, markAllNotificationsRead);

export default router;

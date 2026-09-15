import { Response } from 'express';
import { Notification } from '../models/Notification';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// GET /api/notifications/my
export const getMyNotifications = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ user: userId, read: false });

  return res.status(200).json(
    ApiResponse.success('Notifications retrieved', {
      unreadCount,
      notifications,
    })
  );
};

// PATCH /api/notifications/:id/read
export const markNotificationRead = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const { id } = req.params;
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  const notification = await Notification.findOne({ _id: id, user: userId });
  if (!notification) throw ApiError.notFound('Notification not found');

  notification.read = true;
  await notification.save();

  return res.status(200).json(ApiResponse.success('Notification marked as read', notification));
};

// PATCH /api/notifications/read-all
export const markAllNotificationsRead = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  await Notification.updateMany({ user: userId, read: false }, { read: true });

  return res.status(200).json(ApiResponse.success('All notifications marked as read', { read: true }));
};

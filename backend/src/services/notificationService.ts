import { Notification, NotificationType } from '../models/Notification';

export interface CreateNotificationOptions {
  userId: any;
  title: string;
  message: string;
  type: NotificationType | string;
  jobId?: any;
  companyId?: any;
  applicationId?: any;
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  relatedEntityId?: any;
  relatedEntityType?: string;
}

export const notificationService = {
  createNotification: async (options: CreateNotificationOptions | any, title?: string, message?: string, type?: string, relatedEntityId?: any, relatedEntityType?: string) => {
    try {
      if (typeof options === 'object' && options.userId && options.title) {
        return await Notification.create({
          user: options.userId,
          title: options.title,
          message: options.message,
          type: options.type || 'GENERAL',
          jobId: options.jobId,
          companyId: options.companyId,
          applicationId: options.applicationId,
          matchScore: options.matchScore,
          matchedSkills: options.matchedSkills || [],
          missingSkills: options.missingSkills || [],
          relatedEntityId: options.relatedEntityId,
          relatedEntityType: options.relatedEntityType,
        });
      } else {
        // Fallback for positional parameters signature
        return await Notification.create({
          user: options,
          title: title || '',
          message: message || '',
          type: type || 'GENERAL',
          relatedEntityId,
          relatedEntityType,
        });
      }
    } catch (error) {
      console.error('Failed to create notification:', error);
      return null;
    }
  },

  /**
   * Checks if a notification of a specific type has already been sent to a user for a job.
   * Prevents spamming the same notification repeatedly.
   */
  hasNotificationBeenSent: async (userId: any, jobId: any, type: string): Promise<boolean> => {
    try {
      const existing = await Notification.findOne({ user: userId, jobId, type });
      return Boolean(existing);
    } catch (err) {
      return false;
    }
  },
};


import { apiClient } from './api';

export interface NotificationItem {
  _id: string;
  user: string;
  type: 'JOB_POSTED' | 'AI_JOB_MATCH' | 'SHORTLISTED' | 'INTERVIEW' | 'SELECTED' | 'OFFER_LETTER' | string;
  title: string;
  message: string;
  jobId?: string;
  companyId?: string;
  applicationId?: string;
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  getMyNotifications: async () => {
    const response = await apiClient.get<{ success: boolean; data: { unreadCount: number; notifications: NotificationItem[] } }>('/notifications/my');
    return response.data;
  },

  markRead: async (id: string) => {
    const response = await apiClient.patch<{ success: boolean; data: NotificationItem }>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await apiClient.patch<{ success: boolean; data: { read: boolean } }>('/notifications/read-all');
    return response.data;
  },
};

export default notificationService;

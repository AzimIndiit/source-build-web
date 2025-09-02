import axiosInstance from '@/lib/axios';

export interface NotificationResponse {
  success: boolean;
  message: string;
  data: Notification[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  meta?: Record<string, any>;
  actionUrl?: string;
  isRead: boolean;
  status: 'sent' | 'failed' | 'pending';
  createdAt: string;
  updatedAt: string;
  id?: string;
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

export interface MarkReadResponse {
  success: boolean;
  message: string;
  data: Notification;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: string;
  isRead?: boolean;
  status?: string;
  startDate?: string;
  endDate?: string;
}

class NotificationService {
  async getNotifications(filters?: NotificationFilters): Promise<NotificationResponse> {
    const response = await axiosInstance.get<NotificationResponse>('/notifications', {
      params: filters,
    });
    return response.data;
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await axiosInstance.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data;
  }

  async markAsRead(notificationId: string): Promise<MarkReadResponse> {
    const response = await axiosInstance.patch<MarkReadResponse>(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  }

  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.patch<{ success: boolean; message: string }>(
      '/notifications/mark-all-read'
    );
    return response.data;
  }

  async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete<{ success: boolean; message: string }>(
      `/notifications/${notificationId}`
    );
    return response.data;
  }
}

export const notificationService = new NotificationService();

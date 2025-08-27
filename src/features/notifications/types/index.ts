export type NotificationType =
  | 'NEW_ORDER'
  | 'ORDER_CANCELLED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_DELIVERED'
  | 'PRODUCT_APPROVED'
  | 'PRODUCT_PRICE_UPDATE'
  | 'PRODUCT_OUT_OF_STOCK';

export type NotificationStatus = 'sent' | 'failed' | 'pending';

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  meta?: Record<string, any>;
  actionUrl?: string;
  isRead: boolean;
  status: NotificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationIconConfig {
  icon: string;
  bgColor: string;
  iconColor: string;
}

export interface NotificationFilters {
  type?: NotificationType;
  isRead?: boolean;
  status?: NotificationStatus;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byStatus: Record<NotificationStatus, number>;
}

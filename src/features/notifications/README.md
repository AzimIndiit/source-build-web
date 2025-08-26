# Notifications Feature

A comprehensive notifications system for the Source Build application.

## Features

- **Notification Types**: Order, Payment, System, Promotion, Security
- **Priority Levels**: Low, Medium, High, Urgent
- **Read/Unread Status**: Track notification status
- **Filtering**: Filter by type, priority, and read status
- **Search**: Search through notification titles and messages
- **Bulk Actions**: Mark all as read/unread, delete, archive
- **Real-time Updates**: Mark individual notifications as read/unread
- **Action Buttons**: Navigate to relevant pages from notifications

## Components

### NotificationCard
Displays individual notification with:
- Type icon and color coding
- Priority indicator (border color)
- Read/unread status
- Timestamp
- Action buttons
- Metadata display

### NotificationList
Renders a list of notifications with:
- Loading states
- Empty states
- Individual notification cards

### NotificationFilters
Provides filtering options:
- Type filter (Order, Payment, System, etc.)
- Priority filter (Low, Medium, High, Urgent)
- Read status filter (All, Read, Unread)

### NotificationActions
Bulk action controls:
- Mark all as read/unread
- Delete selected notifications
- Archive selected notifications

### EmptyState
Shows appropriate empty states for:
- No notifications
- No unread notifications
- No filtered results

## Usage

```tsx
import { NotificationsPage } from '@/features/notifications';

// Use the complete page
<NotificationsPage />

// Or use individual components
import { 
  NotificationCard, 
  NotificationList, 
  NotificationFilters 
} from '@/features/notifications';
```

## Types

```tsx
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'system' | 'promotion' | 'security';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    orderId?: string;
    amount?: number;
    productName?: string;
    driverName?: string;
    sellerName?: string;
  };
}
```

## Hooks

### useNotifications
Custom hook for managing notification state:

```tsx
const {
  notifications,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} = useNotifications(initialNotifications);
```

## Mock Data

The feature includes comprehensive mock data for development and testing:
- 10 sample notifications
- Various types and priorities
- Mix of read/unread status
- Realistic timestamps and metadata

## Styling

- Uses Tailwind CSS for styling
- Dark mode support
- Responsive design
- Consistent with project design system
- Color-coded by notification type and priority

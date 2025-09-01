import React from 'react';
import { Bell } from 'lucide-react';
import { useUnreadCountQuery } from '../hooks/useNotificationMutations';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  className?: string;
  onClick?: () => void;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ className, onClick }) => {
  const { data, isLoading } = useUnreadCountQuery();
  const unreadCount = data?.data?.count || 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative p-2 rounded-lg hover:bg-gray-100 transition-colors',
        className
      )}
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5 text-gray-600" />
      
      {!isLoading && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};
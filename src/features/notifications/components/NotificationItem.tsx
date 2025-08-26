import React from 'react';
import { cn } from '@/lib/helpers';
import { formatDate } from '@/lib/date-utils';
import { getNotificationIcon } from './notificationIcons';
import { getNotificationIconComponent } from './notificationIcons';
import { Notification } from '../types';  

interface NotificationItemProps {
  notification: Notification;
  onClick?: (id: string) => void;
  className?: string;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  className
}) => {
  const handleClick = () => {
    onClick?.(notification._id);
  };

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just Now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'min' : 'mins'} ago`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ago`;
    } else if (diffInMinutes < 2880) { // Less than 2 days
      return 'Yesterday';
    } else {
      return formatDate(dateString);
    }
  };

  const iconConfig = getNotificationIcon(notification.type);
  const IconComponent = getNotificationIconComponent(notification.type);
  
  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-3 bg-white rounded-sm shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer",
        !notification.isRead && "bg-blue-50/30",
        className
      )}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          iconConfig.bgColor
        )}>
          <IconComponent className={cn('w-5 h-5', iconConfig.iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className={cn(
                "text-base font-semibold text-gray-900 mb-1",
                !notification.isRead && "font-bold"
              )}>
                {notification.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {notification.message}
              </p>
            </div>
            <div className="flex-shrink-0 text-xs text-gray-500">
              {formatNotificationDate(notification.createdAt || '')}
            </div>    
            {!notification.isRead && (
              <div className="flex items-center gap-1 ">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-xs text-primary font-medium">New</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
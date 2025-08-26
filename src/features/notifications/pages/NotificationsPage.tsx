import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { mockNotifications } from '../data/mockNotifications';
import { NotificationItem } from '../components/NotificationItem';
import { Notification } from '../types';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const handleNotificationClick = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification._id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  return (
    <div className="py-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
            <button
              onClick={handleMarkAllAsRead}
              className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
            >
              Mark All as Read
            </button>
          </div>
        </div>

                 {/* Notifications List */}
         <div className="divide-y divide-gray-100 space-y-2" >
           {notifications.map((notification) => (
             <NotificationItem
               key={notification._id}
               notification={notification}
               onClick={handleNotificationClick}
             />
           ))}
         </div>

        {/* Load More */}
        {notifications.length >= 7 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-center">
            <Button
              variant="outline"
              className="!text-sm rounded-sm text-primary hover:text-primary border-primary  h-[40px] w-[120px]"
              onClick={() => console.log('Load more')}
            >
              Load More
            </Button>
          </div>
        )}
    </div>
  );
};

export default NotificationsPage;
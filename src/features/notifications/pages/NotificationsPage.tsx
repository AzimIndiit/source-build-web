import React, { useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { NotificationItem } from '../components/NotificationItem';
import { useNavigate } from 'react-router-dom';
import {
  useInfiniteNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useUnreadCountQuery,
} from '../hooks/useNotificationMutations';
import { Loader2 } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteNotificationsQuery();

  const markAsReadMutation = useMarkAsReadMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();
  const { data: unreadNotifications } = useUnreadCountQuery();
  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
  };

  const handleNotificationClick = useCallback(async (id: string) => {
    const notification = data?.pages
      .flatMap(page => page.data)
      .find(n => n._id === id || n.id === id);
    
    if (notification && !notification.isRead) {
      await markAsReadMutation.mutateAsync(id);
    }
    
    // Navigate to action URL if available
    if (notification?.actionUrl) {
      navigate(notification.actionUrl);
    }
  }, [data, markAsReadMutation, navigate]);

  return (
    <div className="py-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Notifications</h1>

          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadNotifications?.data?.count === 0 || markAllAsReadMutation.isPending}
            className="cursor-pointer text-primary hover:text-primary/80 font-medium text-sm transition-colors disabled:opacity-50"
          >
            {markAllAsReadMutation.isPending ? 'Marking...' : 'Mark All as Read'}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Failed to load notifications</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && data?.pages[0]?.data?.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="text-gray-600">No notifications yet</p>
        </div>
      )}

      {/* Notifications List */}
      {!isLoading && !error && data && (
        <div className="divide-y divide-gray-100 space-y-2">
          {data.pages.flatMap((page) => 
            page.data.map((notification) => (
              <NotificationItem
                key={notification._id || notification.id}
                notification={notification}
                onClick={handleNotificationClick}
              />
            ))
          )}
        </div>
      )}

      {/* Load More */}
      {hasNextPage && (
        <div className="px-6 py-4 border-t border-gray-200 flex justify-center">
          <Button
            variant="outline"
            className="!text-sm rounded-sm text-primary hover:text-primary border-primary h-[40px] w-[120px]"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

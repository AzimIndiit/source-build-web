import React, { useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { NotificationItem } from '../components/NotificationItem';
import { NotificationsPageSkeleton } from '../components/NotificationsPageSkeleton';
import { useNavigate } from 'react-router-dom';
import {
  useInfiniteNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useUnreadCountQuery,
} from '../hooks/useNotificationMutations';
import { Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import NotificationEmptyIcon from '@/assets/svg/notificationEmptyState.svg';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteNotificationsQuery();

  const markAsReadMutation = useMarkAsReadMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();
  const { data: unreadNotifications } = useUnreadCountQuery();
  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
  };

  const handleNotificationClick = useCallback(
    async (id: string) => {
      const notification = data?.pages
        .flatMap((page) => page.data)
        .find((n) => n._id === id || n.id === id);

      if (notification && !notification.isRead) {
        await markAsReadMutation.mutateAsync(id);
      }

      // Navigate to action URL if available
      if (notification?.actionUrl) {
        try {
          // If it's a full URL, extract just the pathname
          const url = new URL(notification.actionUrl);
          navigate(url.pathname);
        } catch {
          // If it's already a relative path, use it directly
          navigate(notification.actionUrl);
        }
      }
    },
    [data, markAsReadMutation, navigate]
  );

  // Loading state
  if (isLoading) {
    return <NotificationsPageSkeleton />;
  }

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
      {!error && data?.pages[0]?.data?.length === 0 && (
        <EmptyState
          title="No notifications yet"
          description="You'll see your notifications here when you receive them"
          icon={<img src={NotificationEmptyIcon} alt="Notification empty" className="h-64 w-auto" />}
         
          
          className="py-12"
        />
      )}

      {/* Notifications List */}
      {!error && data && (
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
            {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

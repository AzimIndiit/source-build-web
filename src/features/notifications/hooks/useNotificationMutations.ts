import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { notificationService, NotificationFilters } from '../services/notificationService';
import { queryClient } from '@/lib/queryClient';
import toast from 'react-hot-toast';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'];
export const UNREAD_COUNT_QUERY_KEY = ['notifications', 'unread-count'];

export function useNotificationsQuery(filters?: NotificationFilters) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, filters],
    queryFn: () => notificationService.getNotifications(filters),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useInfiniteNotificationsQuery(filters?: Omit<NotificationFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, 'infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      notificationService.getNotifications({ ...filters, page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage.pagination) return undefined;
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useMarkAsReadMutation() {
  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate notifications list and unread count
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to mark notification as read';
      toast.error(message);
    },
  });
}

export function useMarkAllAsReadMutation() {
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      // Invalidate notifications list and unread count
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
      toast.success('All notifications marked as read');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to mark all notifications as read';
      toast.error(message);
    },
  });
}

export function useDeleteNotificationMutation() {
  return useMutation({
    mutationFn: (notificationId: string) => notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      // Invalidate notifications list
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
      toast.success('Notification deleted');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete notification';
      toast.error(message);
    },
  });
}

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { queryClient } from '@/lib/queryClient';
import { NOTIFICATIONS_QUERY_KEY, UNREAD_COUNT_QUERY_KEY } from './useNotificationMutations';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

export function useNotificationListener() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      return;
    }

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    // Listen for new notifications
    socket.on('new-notification', (notification: any) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });

      // Show toast notification
      toast((t) => (
        <div
          className="flex items-start gap-3 cursor-pointer"
          onClick={() => {
            toast.dismiss(t.id);
            // Navigate to notifications or action URL
            if (notification.actionUrl) {
              window.location.href = notification.actionUrl;
            } else {
              window.location.href = '/notifications';
            }
          }}
        >
          <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{notification.title}</p>
            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
          </div>
        </div>
      ), {
        duration: 5000,
        position: 'top-right',
      });
    });

    // Listen for notification updates
    socket.on('notification-updated', () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    });

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to notification service');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from notification service');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return socketRef.current;
}

// Alternative: Polling approach if WebSocket is not available
export function useNotificationPolling(intervalMs: number = 30000) {
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      return;
    }

    // Poll for new notifications
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);
}
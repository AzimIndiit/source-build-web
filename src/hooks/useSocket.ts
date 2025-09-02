import socketService from '@/lib/socketService';
import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

// Define types for socket events and data
type SocketEventCallback = (...args: any[]) => void;
type SocketEventData = any; // You can make this more specific based on your socket events

interface UseSocketReturn {
  connect: (userId: string) => void;
  disconnect: () => void;
  emit: (event: string, data: SocketEventData) => void;
  on: (event: string, callback: SocketEventCallback) => () => void;
  off: (event: string, callback: SocketEventCallback) => void;
  isConnected: () => boolean;
}

export const useSocket = (): UseSocketReturn => {
  const { user } = useAuth();
  const userId: string = user?.id || '';

  const connect = useCallback((userId: string): void => {
    if (userId && !socketService.getIsConnected()) {
      socketService.connect(userId);
    }
  }, []);

  const disconnect = useCallback((): void => {
    socketService.disconnect();
  }, []);

  const emit = useCallback((event: string, data: SocketEventData): void => {
    socketService.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: SocketEventCallback): (() => void) => {
    socketService.on(event, callback);
    // Return the cleanup function
    return () => socketService.off(event, callback);
  }, []);

  const off = useCallback((event: string, callback: SocketEventCallback): void => {
    socketService.off(event, callback);
  }, []);

  const isConnected = useCallback((): boolean => {
    return socketService.getIsConnected();
  }, []);

  useEffect(() => {
    if (userId && !socketService.getIsConnected()) {
      connect(userId);
    } else if (!userId && socketService.getIsConnected()) {
      disconnect();
    }
  }, [userId, connect, disconnect]);

  return {
    connect,
    disconnect,
    emit,
    on,
    off,
    isConnected,
  };
};

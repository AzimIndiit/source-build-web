import { useMemo } from 'react';
import { useChatsQuery } from './useChatQueries';
import { useAuth } from '@/hooks/useAuth';

export function useUnreadMessageCount() {
  const { user } = useAuth();
  const { data: chatsResponse, isLoading, error } = useChatsQuery({ limit: 100 });

  const totalUnreadCount = useMemo(() => {
    if (!chatsResponse?.data || !user?.id) return 0;
    
    return chatsResponse.data.reduce((total, chat) => {
      const unreadCount = chat.unreadCounts?.[user.id] || 0;
      return total + unreadCount;
    }, 0);
  }, [chatsResponse?.data, user?.id]);

  return {
    unreadCount: totalUnreadCount,
    isLoading,
    error
  };
}
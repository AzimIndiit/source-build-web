import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  chatService,
  SendMessagePayload,
  CreateChatPayload,
  GetOrCreateChatPayload,
} from '../services/chatService';
import { queryClient } from '@/lib/queryClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const CHATS_QUERY_KEY = ['chats'];
export const CHAT_QUERY_KEY = (id: string) => ['chat', id];
export const CHAT_MESSAGES_QUERY_KEY = (chatId: string) => ['chat', chatId, 'messages'];

export function useChatsQuery(
  params?: { page?: number; limit?: number; search?: string },
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [...CHATS_QUERY_KEY, params],
    queryFn: () => chatService.getChats(params),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled, // Only run query if enabled is true
  });
}

export function useChatQuery(id: string) {
  return useQuery({
    queryKey: CHAT_QUERY_KEY(id),
    queryFn: () => chatService.getChatById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useChatMessagesQuery(params?: { chatId?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...CHAT_MESSAGES_QUERY_KEY(params?.chatId || ''), params],
    queryFn: () =>
      chatService.getChatMessages(params as { chatId: string; page?: number; limit?: number }),
    enabled: !!params?.chatId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useChatMessagesInfiniteQuery(chatId: string, limit: number = 20) {
  return useInfiniteQuery({
    queryKey: [...CHAT_MESSAGES_QUERY_KEY(chatId), 'infinite'],
    queryFn: ({ pageParam = 1 }) => chatService.getChatMessages({ chatId, page: pageParam, limit }),
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage.pagination) return undefined;
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      if (!firstPage.pagination) return undefined;
      const { page } = firstPage.pagination;
      return page > 1 ? page - 1 : undefined;
    },
    enabled: !!chatId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    initialPageParam: 1,
  });
}

export function useSendMessageMutation() {
  return useMutation({
    mutationFn: (payload: SendMessagePayload) => chatService.sendMessage(payload),
    onSuccess: (data, variables) => {
      // Invalidate messages list to refetch
      queryClient.invalidateQueries({ queryKey: CHAT_MESSAGES_QUERY_KEY(variables.chatId) });
      // Invalidate chats list to update last message
      queryClient.invalidateQueries({ queryKey: CHATS_QUERY_KEY });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send message';
      toast.error(message);
      console.error('Send message error:', error);
    },
  });
}

export function useCreateChatMutation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (payload: CreateChatPayload) => chatService.createChat(payload),
    onSuccess: (response) => {
      // Invalidate chats list to refetch

      queryClient.invalidateQueries({ queryKey: CHATS_QUERY_KEY });

      toast.success(response.message || 'Chat created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create chat';
      toast.error(message);
      console.error('Create chat error:', error);
    },
  });
}

export function useMarkAsReadMutation() {
  return useMutation({
    mutationFn: (chatId: string) => chatService.markAsRead(chatId),
    onSuccess: (response, chatId) => {
      // Invalidate chat to update unread counts
      queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEY(chatId) });
      // Invalidate chats list to update unread counts
      queryClient.invalidateQueries({ queryKey: CHATS_QUERY_KEY });
    },
    onError: (error: any) => {
      console.error('Mark as read error:', error);
    },
  });
}

export function useDeleteChatMutation() {
  return useMutation({
    mutationFn: (id: string) => chatService.deleteChat(id),
    onSuccess: (response) => {
      // Invalidate chats list to refetch
      queryClient.invalidateQueries({ queryKey: CHATS_QUERY_KEY });
      toast.success(response.message || 'Chat deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete chat';
      toast.error(message);
      console.error('Delete chat error:', error);
    },
  });
}

export function useDeleteMessageMutation() {
  return useMutation({
    mutationFn: ({ chatId, messageId }: { chatId: string; messageId: string }) =>
      chatService.deleteMessage(chatId, messageId),
    onSuccess: (response, variables) => {
      // Invalidate messages list to refetch
      queryClient.invalidateQueries({
        queryKey: CHAT_MESSAGES_QUERY_KEY(variables.chatId),
      });
      toast.success(response.message || 'Message deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete message';
      toast.error(message);
      console.error('Delete message error:', error);
    },
  });
}

export function useGetOrCreateChatMutation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (payload: GetOrCreateChatPayload) => chatService.getOrCreateChat(payload),
    onSuccess: (response) => {
      // Navigate to the chat interface
      if (user) {
        navigate(
          user.role === 'buyer'
            ? `/messages/${response.data.id}`
            : `/${user.role}/messages/${response.data.id}`
        );
      }

      // Invalidate chats list to refetch
      queryClient.invalidateQueries({ queryKey: CHATS_QUERY_KEY });

      // Set the new chat data in cache
      queryClient.setQueryData(CHAT_QUERY_KEY(response.data.id), response);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create/get chat';
      toast.error(message);
      console.error('Get or create chat error:', error);
    },
  });
}

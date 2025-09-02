import axiosInstance from '@/lib/axios';

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  SENDING = 'sending',
}
export interface ChatUser {
  id: string;
  displayName: string;
  avatar?: string;
  email?: string;
  role?: string;
  isOnline?: boolean;
}

export interface ChatMessage {
  _id: string;
  messageType: 'text' | 'file' | 'mix';
  content: string;
  sentAt: string;
  senderId: string;
  sender?: ChatUser;
  status: MessageStatus;
  attachments?: Array<{
    _id?: string;
    id?: string;
    url: string;
    name?: string;
    originalName?: string;
    size?: number;
    mimeType?: string;
    mimetype?: string;
    bestImageUrl?: string;
    bestMediaUrl?: string;
    thumbnailUrl?: string;
    streamingUrl?: string;
    uploading?: boolean;
  }>;
}

export interface Chat {
  id?: string;
  _id?: string;
  participants: ChatUser[];
  lastMessage?: ChatMessage;
  unreadCounts: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  data: Chat;
}

export interface ChatsListResponse {
  success: boolean;
  message: string;
  data: Chat[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MessagesListResponse {
  success: boolean;
  message: string;
  data: ChatMessage[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SendMessagePayload {
  chatId: string;
  content: string;
  messageType: 'text' | 'file' | 'mix';
  files?: File[];
}

export interface CreateChatPayload {
  participantId: string;
  initialMessage?: string;
}

export interface GetOrCreateChatPayload {
  participantId: string;
}

class ChatService {
  async getChats(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ChatsListResponse> {
    const queryParams = {
      page: params?.page?.toString() || '1',
      limit: params?.limit?.toString() || '20',
      ...(params?.search && { search: params.search }),
    };
    const response = await axiosInstance.get<ChatsListResponse>('/chats', { params: queryParams });
    return response.data;
  }

  async getChatById(id: string): Promise<ChatResponse> {
    const response = await axiosInstance.get<ChatResponse>(`/chats/single?chatId=${id}`);
    return response.data;
  }

  async getChatMessages(params?: {
    chatId: string;
    page?: number;
    limit?: number;
  }): Promise<MessagesListResponse> {
    const response = await axiosInstance.get<MessagesListResponse>(`/messages`, { params });
    return response.data;
  }

  async sendMessage(payload: SendMessagePayload): Promise<ChatMessage> {
    const formData = new FormData();
    formData.append('chatId', payload.chatId);
    formData.append('content', payload.content);
    formData.append('messageType', payload.messageType);

    if (payload.files && payload.files.length > 0) {
      payload.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await axiosInstance.post<{ success: boolean; data: ChatMessage }>(
      '/chats/messages',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  }

  async createChat(payload: CreateChatPayload): Promise<ChatResponse> {
    const response = await axiosInstance.post<ChatResponse>('/chats', payload);
    return response.data;
  }

  async getOrCreateChat(payload: GetOrCreateChatPayload): Promise<ChatResponse> {
    const response = await axiosInstance.post<ChatResponse>('/chats/get-or-create', payload);
    return response.data;
  }

  async getChatByParticipant(participantId: string): Promise<ChatResponse | null> {
    try {
      const response = await axiosInstance.get<ChatResponse>(`/chats/participant/${participantId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async markAsRead(chatId: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.post<{ success: boolean; message: string }>(
      `/messages/mark-all-read`,
      { chatId }
    );
    return response.data;
  }

  async deleteChat(id: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete<{ success: boolean; message: string }>(
      `/chats/${id}`
    );
    return response.data;
  }

  async deleteMessage(
    chatId: string,
    messageId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete<{ success: boolean; message: string }>(
      `/chats/${chatId}/messages/${messageId}`
    );
    return response.data;
  }
}

export const chatService = new ChatService();

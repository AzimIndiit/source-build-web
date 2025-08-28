export interface ChatUser {
  id: string;
  displayName: string;
  avatar: string;
}

export interface ChatMessage {
  messageType: 'text' | 'file' | 'mix';
  content: string;
  sentAt: string;
}

export interface ChatItem {
  id: string;
  participants: ChatUser[];
  lastMessage: ChatMessage;
  unreadCounts: Record<string, number>;
}

export const mockUser: ChatUser = {
  id: 'current-user',
  displayName: 'Current User',
  avatar: '/avatars/current-user.jpg',
};

export const mockChatList: ChatItem[] = [
  {
    id: 'chat-1',
    participants: [
      mockUser,
      {
        id: 'user-1',
        displayName: 'John Smith',
        avatar: '/avatars/john.jpg',
      },
    ],
    lastMessage: {
      messageType: 'text',
      content: 'Hey, are the products still available?',
      sentAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    unreadCounts: {
      'current-user': 2,
    },
  },
  {
    id: 'chat-2',
    participants: [
      mockUser,
      {
        id: 'user-2',
        displayName: 'Sarah Johnson',
        avatar: '/avatars/sarah.jpg',
      },
    ],
    lastMessage: {
      messageType: 'text',
      content: 'Thank you for the quick delivery!',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    unreadCounts: {
      'current-user': 0,
    },
  },
  {
    id: 'chat-3',
    participants: [
      mockUser,
      {
        id: 'user-3',
        displayName: 'Michael Brown',
        avatar: '/avatars/michael.jpg',
      },
    ],
    lastMessage: {
      messageType: 'file',
      content: 'invoice.pdf',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    unreadCounts: {
      'current-user': 1,
    },
  },
  {
    id: 'chat-4',
    participants: [
      mockUser,
      {
        id: 'user-4',
        displayName: 'Emily Davis',
        avatar: '/avatars/emily.jpg',
      },
    ],
    lastMessage: {
      messageType: 'text',
      content: 'Can you provide bulk pricing for 100+ units?',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
    unreadCounts: {
      'current-user': 0,
    },
  },
  {
    id: 'chat-5',
    participants: [
      mockUser,
      {
        id: 'user-5',
        displayName: 'Robert Wilson',
        avatar: '/avatars/robert.jpg',
      },
    ],
    lastMessage: {
      messageType: 'text',
      content: 'Order confirmed. Will pick up tomorrow.',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    },
    unreadCounts: {
      'current-user': 0,
    },
  },
];

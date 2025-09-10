import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ChatCard } from './ChatCard';
import { ChatListSkeleton } from './ChatListSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { useEffect, useState } from 'react';
import { useChatsQuery } from '../hooks/useChatQueries';
import { Chat } from '../services/chatService';

const ChatList = () => {
  const { user } = useAuth();
  const { emit, on, isConnected, off } = useSocket();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: chatsResponse, isLoading, error, refetch } = useChatsQuery({ page, limit });
  const [chatList, setChatList] = useState<Chat[]>([]);

  // Refetch chats when component mounts (when navigating back to this route)
  useEffect(() => {
    refetch();
  }, []); // Empty dependency array means this runs only on mount

  useEffect(() => {
    if (chatsResponse?.data) {
      setChatList(chatsResponse.data);
    }
  }, [chatsResponse]);

  useEffect(() => {
    const handleUpdateChats = (data: any) => {
      console.log('data', data);
      setChatList((prev) => {
        const index = prev.findIndex((chat) => chat.id === data.id);

        if (index !== -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            ...data, // merge updated fields
          };
          return updated;
        }

        return prev;
      });
    };

    const removeMessageListener = on('update_unread_count', handleUpdateChats);

    return () => {
      removeMessageListener();
    };
  }, [on]);

  return (
    <div className="py-4 md:p-6 space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">Messages</h1>
      <div className="space-y-3">
        {chatList?.length > 0 ? (
          chatList?.map((item) => {
            const message = item?.lastMessage;
            const content =
              message?.messageType === 'text'
                ? message.content
                : message?.messageType === 'file' || message?.messageType === 'mix'
                  ? 'Sent a file'
                  : '';
            const otherUser = item?.participants?.find((p) => p?.id !== user?.id);
            const time = message?.sentAt
              ? formatDistanceToNow(new Date(message.sentAt), {
                  addSuffix: true,
                })
              : '';
            const unreadCount = user?.id && item.unreadCounts ? item.unreadCounts[user.id] || 0 : 0;

            return (
              <ChatCard
                key={item.id}
                id={item.id || ''}
                displayName={otherUser?.displayName || 'Unknown User'}
                avatar={otherUser?.avatar}
                lastMessage={content}
                timestamp={time}
                unreadCount={unreadCount}
                onClick={() => {
                  // Clear unread count for this chat before navigating
                  setChatList((prev) =>
                    prev.map((chat) => {
                      if (chat.id === item.id) {
                        const unreadCounts = {
                          ...chat.unreadCounts,
                          [user?.id || '']: 0,
                        };
                        console.log('unreadCounts', unreadCounts);
                        return {
                          ...chat,
                          unreadCounts,
                        };
                      }
                      return chat;
                    })
                  );
                  navigate(`/${user?.role}/messages/${item._id}`, { state: item });
                }}
              />
            );
          })
        ) : isLoading ? (
          <ChatListSkeleton />
        ) : error ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-red-500">Failed to load messages. Please try again.</p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-500">No Messages Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;

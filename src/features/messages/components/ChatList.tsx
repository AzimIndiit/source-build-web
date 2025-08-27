import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { mockChatList, mockUser } from '../data/mockChats';
import { ChatCard } from './ChatCard';
import { useAuth } from '@/hooks/useAuth';

const ChatList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const chatList = mockChatList;
  

  return (
    <div className="py-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
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
            const unreadCount = item.unreadCounts[mockUser?.id];

            return (
              <ChatCard
                key={item.id}
                id={item.id}
                displayName={otherUser?.displayName || 'Unknown User'}
                avatar={otherUser?.avatar}
                lastMessage={content}
                timestamp={time}
                unreadCount={unreadCount}
                onClick={() => navigate(`/${user?.role}/messages/${item.id}`, { state: item })}
              />
            );
          })
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
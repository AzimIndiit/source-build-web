import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/Card';
import { getInitials } from '@/lib/helpers';

interface ChatCardProps {
  id: string;
  displayName: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  onClick?: () => void;
}

export const ChatCard: React.FC<ChatCardProps> = ({
  id,
  displayName,
  avatar,
  lastMessage,
  timestamp,
  unreadCount = 0,
  onClick,
}) => {
  return (
    <Card
      key={id}
      onClick={onClick}
      className="relative p-2 bg-white border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors  justify-center"
    >
      {unreadCount > 0 && (
        <div className="absolute bottom-1 right-1">
          <Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center bg-red-500 hover:bg-red-500 text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        </div>
      )}

      <div className="flex  gap-3 items-stretch">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatar || ''} alt={displayName} />
          <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold text-xl">
            <div className="mt-1">{getInitials(displayName || 'U')}</div>
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 py-2 flex flex-col justify-center my-auto">
          <div className="flex justify-between items-start mb-1">
            <h6 className="font-semibold text-gray-900 capitalize truncate">{displayName}</h6>
            <span className="text-sm text-gray-500 ml-2 whitespace-nowrap">{timestamp}</span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2">{lastMessage}</p>
        </div>
      </div>
    </Card>
  );
};

export default ChatCard;

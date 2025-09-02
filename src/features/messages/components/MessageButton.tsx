import { MessageSquareMore } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetOrCreateChatMutation } from '../hooks/useChatQueries';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface MessageButtonProps {
  participantId: string;
  className?: string;
}

export const MessageButton = ({ participantId, className = '' }: MessageButtonProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mutate: getOrCreateChat, isPending } = useGetOrCreateChatMutation();

  const handleClick = () => {
    if (!user?.id) {
      toast.error('Please login to send messages');
      return;
    }

    if (!participantId) {
      toast.error('Invalid recipient');
      return;
    }

    getOrCreateChat(
      { participantId },
      {
        onSuccess: (response) => {
          navigate(`/${user.role}/messages/${response.data.id}`);
        },
        onError: () => {
          toast.error('Failed to start conversation');
        },
      }
    );
  };

  return (
    <button
      className={`p-3 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors cursor-pointer ${className}`}
      onClick={handleClick}
      disabled={isPending}
    >
      <MessageSquareMore className="w-5 h-5 text-primary" />
    </button>
  );
};

export default MessageButton;

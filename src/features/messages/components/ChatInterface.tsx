import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import toast from 'react-hot-toast';
import { Send, Paperclip, MoreVertical, Trash2, Check, CheckCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BreadcrumbWrapper, ReadMore } from '@/components/ui';
import { DeleteConfirmationModal } from '@/components/ui';
import ImagePreviewModal from '@/components/common/ImagePreviewModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/helpers';
import { cn } from '@/lib/utils';

// Mock data matching the image
const mockOtherUser = {
  id: '2',
  displayName: 'Zendaya Kimathi',
  isOnline: true,
  avatar: '',
};

const mockMessages = [
  {
    id: '1',
    chatId: '123',
    senderId: '2',
    content: 'Hi Zendaya, I just received a notification that a $500 refund has been issued for my order (#34567). Can you clarify why?',
    messageType: 'text' as const,
    attachments: [],
    status: 'read' as const,
    sentAt: '2022-07-16T06:15:00Z',
  },
  {
    id: '2', 
    chatId: '123',
    senderId: '1',
    content: 'Thanks for reaching out! Yes, a partial refund of $500 was processed due to [reason, e.g., an item being out of stock, a price adjustment, or a cancellation request]. I apologize for any inconvenience this may have caused.',
    messageType: 'text' as const,
    attachments: [],
    status: 'read' as const,
    sentAt: '2022-07-16T06:20:00Z',
  },
  {
    id: '3',
    chatId: '123',
    senderId: '2',
    content: 'Oh, I see.',
    messageType: 'text' as const,
    attachments: [],
    status: 'read' as const,
    sentAt: '2022-07-16T12:16:00Z',
  },
  {
    id: '4',
    chatId: '123',
    senderId: '2',
    content: 'My order included multiple items—does this refund affect the delivery of the rest of my order?',
    messageType: 'text' as const,
    attachments: [],
    status: 'read' as const,
    sentAt: '2022-07-16T15:22:00Z',
  },
  {
    id: '5',
    chatId: '123',
    senderId: '1',
    content: 'No worries! Your remaining items in Order #34567 are still scheduled for delivery as planned.',
    messageType: 'text' as const,
    attachments: [],
    status: 'read' as const,
    sentAt: '2022-07-16T17:35:00Z',
  },
  {
    id: '6',
    chatId: '123',
    senderId: '2',
    content: 'Thanks for the clarification! How long will it take for the refund to reflect in my account?',
    messageType: 'text' as const,
    attachments: [],
    status: 'read' as const,
    sentAt: '2022-07-16T15:22:00Z',
  },
  {
    id: '7',
    chatId: '123',
    senderId: '1',
    content: 'Refunds typically take 4 business days to process, depending on your payment method.',
    messageType: 'text' as const,
    attachments: [],
    status: 'delivered' as const,
    sentAt: '2022-07-16T17:35:00Z',
  },
];

type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
type MessageType = 'text' | 'file' | 'image';

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  attachments: Array<{
    originalName: string;
    mimetype: string;
    url: string;
  }>;
  status: MessageStatus;
  sentAt: string;
}

const ChatInterface = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [otherUser] = useState(mockOtherUser);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = { id: '1', displayName: 'You' };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !attachmentFile) return;
    
    const tempId = Date.now().toString();
    const newMsg: Message = {
      id: tempId,
      chatId: params.id || '123',
      senderId: currentUser.id,
      content: newMessage.trim(),
      messageType: attachmentFile ? 'file' : 'text',
      attachments: attachmentFile
        ? [
            {
              originalName: attachmentFile.name,
              mimetype: attachmentFile.type,
              url: URL.createObjectURL(attachmentFile),
            },
          ]
        : [],
      status: 'sending',
      sentAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessage('');
    setAttachmentFile(null);

    // Simulate message being sent
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: 'sent' as MessageStatus } : msg
        )
      );
    }, 500);

    // Simulate message being delivered
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: 'delivered' as MessageStatus } : msg
        )
      );
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setAttachmentFile(file);
    toast.success(`File "${file.name}" selected`);
  };

  const handleDeleteChat = () => {
    toast.success('Chat deleted successfully');
    navigate(-1);
  };

  const openImagePreview = (imageUrl: string) => {
    setPreviewImages([imageUrl]);
    setCurrentImageIndex(0);
  };

  const groupMessagesByDate = (messages: Message[]) => {
    return messages.reduce((acc: Record<string, Message[]>, msg) => {
      const dateKey = format(parseISO(msg.sentAt), 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(msg);
      return acc;
    }, {});
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy, h:mm a');
  };

  const renderMessageStatus = (status: MessageStatus) => {
    switch (status) {
      case 'sending':
        return <span className="text-gray-400">...</span>;
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="py-4 md:p-6 space-y-6">
      {/* Breadcrumb */}
        <BreadcrumbWrapper
          items={[
            { label: 'Messages', href: '/seller/messages' },
            { label: 'Chat Details' },
          ]}
        />

      <Card className="flex-1  flex flex-col overflow-hidden border-gray-200">
        {/* Chat Header */}
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.avatar} alt={otherUser.displayName} />
              <AvatarFallback className="bg-gray-200">
                {getInitials(otherUser.displayName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{otherUser.displayName}</h3>
              <p className="text-sm text-green-500">
                {otherUser.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-red-600 cursor-pointer"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        {/* Chat Messages */}
        <CardContent
          ref={chatBodyRef}
          className="flex-1 overflow-y-auto space-y-2 bg-white"
        >
          {/* Date Header */}
          <div className="flex items-center justify-center ">
            <div className="text-gray-500 text-md">
              Jul 16, 2022, 06:15 am
            </div>
          </div>

          {/* Messages */}
          {messages.map((msg) => {
            const isSentByUser = msg.senderId === currentUser.id;
            
            return (
              <div key={msg.id} className="space-y-2">
                {/* Avatar and message bubble */}
                <div
                  className={cn(
                    'flex items-start gap-2',
                    isSentByUser ? 'justify-end' : 'justify-start'
                  )}
                >
                  {!isSentByUser && (
                    <Avatar className="h-10 w-10 mt-1">
                      <AvatarImage src={otherUser.avatar} alt={otherUser.displayName} />
                      <AvatarFallback className="bg-gray-200 text-sm">
                        {getInitials(otherUser.displayName)}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={cn(
                      'flex flex-col max-w-[70%]',
                      isSentByUser ? 'items-end' : 'items-start'
                    )}
                  >
                    {!isSentByUser && (
                      <span className="text-xs text-gray-500 mb-1 px-1">
                        {otherUser.displayName}
                      </span>
                    )}
                    
                    <div
                      className={cn(
                        'px-4 py-2 rounded-2xl break-words',
                        isSentByUser
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 border border-gray-200'
                      )}
                    >
                      {/* Attachments */}
                      {msg.attachments.length > 0 &&
                        msg.attachments.map((att, index) => {
                          const isImage = att.mimetype?.startsWith('image/');
                          
                          return (
                            <div key={index} className="mb-2">
                              {isImage ? (
                                <img
                                  src={att.url}
                                  alt={att.originalName}
                                  className="rounded-lg max-w-full cursor-pointer"
                                  style={{ maxHeight: '200px' }}
                                  onClick={() => openImagePreview(att.url)}
                                />
                              ) : (
                                <a
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    'flex items-center gap-2 p-2 rounded',
                                    isSentByUser
                                      ? 'bg-blue-700 hover:bg-blue-800'
                                      : 'bg-gray-100 hover:bg-gray-200'
                                  )}
                                >
                                  <Paperclip className="w-4 h-4" />
                                  <span className="text-sm">{att.originalName}</span>
                                </a>
                              )}
                            </div>
                          );
                        })}

                      {/* Message Text */}
                      {msg.content && <ReadMore text={msg.content} maxLength={1000} className={` ${isSentByUser ? 'text-white hover:text-white' : 'text-gray-700'}  `} buttonClassName={`${isSentByUser ? 'text-white hover:text-white' : 'text-gray-700'} !text-sm`}/>}
                    </div>

                    {/* Time and Status */}
                    <div
                      className={cn(
                        'flex items-center gap-1 mt-1 px-1',
                        isSentByUser ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <span className="text-xs text-gray-500">
                        {format(parseISO(msg.sentAt), 'h:mm a')}
                      </span>
                      {isSentByUser && renderMessageStatus(msg.status)}
                    </div>
                  </div>
                </div>

                {/* "Hi!" button on the right (as shown in the image) */}
                {msg.id === '2' && (
                  <div className="flex justify-end">
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-primary hover:bg-blue-700 text-white"
                    >
                      Hi!
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>

        {/* Message Input */}
        <div className="border-t bg-white p-4 border-gray-200">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-gray-50"
            />
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx"
              onChange={handleFileSelect}
            />
            
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-5 w-5 text-gray-600" />
            </Button>

            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!newMessage.trim() && !attachmentFile}
              className="h-10 w-10 bg-primary hover:bg-blue-700"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>

          {attachmentFile && (
            <div className="mt-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
              <span className="text-sm text-gray-700">{attachmentFile.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAttachmentFile(null)}
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Modals */}
      <ImagePreviewModal
        images={previewImages}
        open={previewImages.length > 0}
        onClose={() => setPreviewImages([])}
        currentIndex={currentImageIndex}
        setCurrentIndex={setCurrentImageIndex}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteChat}
        title="Delete Chat"
        description="Are you sure you want to delete this chat? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ChatInterface;
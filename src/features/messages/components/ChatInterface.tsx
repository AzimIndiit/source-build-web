import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Send,
  Paperclip,
  MoreVertical,
  Trash2,
  CheckCheck,
  X,
  FileText,
  Loader2,
  Check,
} from 'lucide-react';
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
import { cn, truncateFilename } from '@/lib/utils';
import {
  useChatMessagesQuery,
  useChatQuery,
  useMarkAsReadMutation,
  useDeleteChatMutation,
} from '../hooks/useChatQueries';
import { useSocket } from '@/hooks/useSocket';
import { ChatMessage, ChatUser, MessageStatus } from '../services/chatService';
import { useAuth } from '@/hooks/useAuth';
import { fileService } from '@/features/profile/services/fileService';
import { Skeleton } from '@/components/ui/skeleton';
import ChatInterfaceSkeleton from './ChatInterfaceSkeleton';

const ChatInterface = () => {
  const navigate = useNavigate();
  const params = useParams();
  const chatId = params.id as string;
  const { user } = useAuth();
  const { emit, on, isConnected, off } = useSocket();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // API Hooks
  const { data: chatData, isLoading: isLoadingChat } = useChatQuery(chatId);
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    error: errorMessages,
  } = useChatMessagesQuery({ chatId, page, limit });
  const { mutate: markAsRead } = useMarkAsReadMutation();
  const { mutate: deleteChat } = useDeleteChatMutation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const chatBodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null);
  const previousScrollHeightRef = useRef<number>(0);
  const shouldScrollToBottomRef = useRef<boolean>(false);

  // Update otherUser when chatData is fetched
  useEffect(() => {
    if (chatData?.data?.participants && user?.id) {
      const other = chatData.data.participants.find(
        (p: any) => {
          // Check if this participant is NOT the current user
          // Compare both id and _id fields as the backend might use either
          const participantId = p?.id || p?._id;
          return participantId !== user.id;
        }
      );
      console.log('Current user ID:', user?.id);
      console.log('Participants:', chatData.data.participants);
      console.log('Other user found:', other);
      setOtherUser(other ? { ...other, isOnline: false } : null);
    }
  }, [chatData, user?.id]);

  // Scroll to bottom only for new messages or initial load
  useEffect(() => {
    // Only scroll to bottom if it's the initial load (page 1) or a new message is added
    if (page === 1 && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, page]);

  // Update messages when fetched from API
  useEffect(() => {
    if (messagesData?.data) {
      if (page === 1) {
        // Initial load or refresh
        setMessages(messagesData.data);
      } else {
        // Loading more messages (prepend to existing)
        setMessages((prev) => [...messagesData.data, ...prev]);

        // Maintain scroll position after prepending messages
        if (chatBodyRef.current) {
          const newScrollHeight = chatBodyRef.current.scrollHeight;
          const scrollDiff = newScrollHeight - previousScrollHeightRef.current;
          chatBodyRef.current.scrollTop = scrollDiff;
        }
      }

      // Check if there are more messages to load
      setHasMore(messagesData.data.length === limit);
      setIsLoadingMore(false);
    }
  }, [messagesData, page, limit]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (chatId && user?.id) {
      markAsRead(chatId);
    }
  }, [chatId, user?.id, markAsRead]);

  // Reset pagination when chatId changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setIsLoadingMore(false);
    setMessages([]);
  }, [chatId]);

  // Auto-scroll when shouldScrollToBottomRef is set
  useEffect(() => {
    if (shouldScrollToBottomRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
        shouldScrollToBottomRef.current = false;
      }, 50);
    }
  }, [messages]);

  useEffect(() => {
    if (!chatId) return;

    const handleNewMessage = (data: any) => {
      console.log('Frontend: Received new_message event:', data);

      // Filter messages for this chat only
      if (data.chat && data.chat.toString() !== chatId) {
        console.log('Frontend: Message is for different chat, ignoring');
        return;
      }

      setMessages((prev) => {
        // First check if it's replacing a temp message
        if (data.tempId) {
          const tempIndex = prev.findIndex((msg) => msg._id === data.tempId);
          if (tempIndex !== -1) {
            console.log('Frontend: Replacing temp message with real message');
            // Replace the temp message with the real one
            const updated = [...prev];
            updated[tempIndex] = {
              ...data,
              senderId: data.sender || data.senderId,
              status: MessageStatus.DELIVERED,
            };
            emit('mark_as_delivered', { messageId: data._id });

            // If this was sent by current user, scroll to bottom
            if (data.sender === user?.id || data.senderId === user?.id) {
              shouldScrollToBottomRef.current = true;
            }

            return updated;
          }
        }

        // Check if message already exists (by _id)
        const existingIndex = prev.findIndex((msg) => msg._id === data._id);
        if (existingIndex !== -1) {
          console.log('Frontend: Updating existing message');
          // Update existing message instead of adding duplicate
          const updated = [...prev];
          updated[existingIndex] = { ...data, senderId: data.sender || data.senderId };
          return updated;
        }

        console.log('Frontend: Adding new message to chat');
        // Always scroll to bottom for any new message
        shouldScrollToBottomRef.current = true;
        return [...prev, { ...data, senderId: data.sender || data.senderId }];
      });
    };
    const handleReadMessage = (data: any) => {
      setMessages((prev) => {
        const index = prev.findIndex((msg) => msg._id === data._id);

        if (index !== -1) {
          // Update message status to read
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            ...data,
            status: MessageStatus.READ,
            senderId: data.sender || updated[index].senderId,
          };
          return updated;
        }

        return prev;
      });
    };

    // Join the chat room when connected
    const joinRoom = () => {
      console.log('Frontend: Joining chat room with ID:', chatId);
      emit('join_chat', { roomId: chatId });
    };

    // Join immediately if already connected
    if (isConnected()) {
      joinRoom();
    }

    // Listen for reconnections
    const removeConnectListener = on('connect', joinRoom);

    console.log('Frontend: Setting up new_message listener for chat:', chatId);
    const removeMessageListener = on('new_message', handleNewMessage);

    const handleDeliveredMessage = (data: any) => {
      setMessages((prev) => {
        const index = prev.findIndex((msg) => msg._id === data._id);

        if (index !== -1) {
          // Update message status to delivered
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            ...data,
            status: MessageStatus.DELIVERED,
            senderId: data.sender || updated[index].senderId,
          };
          return updated;
        }

        return prev;
      });
    };
    const removeDeliveredMessageListener = on('message_delivered', handleDeliveredMessage);
    const handleUserOnline = (data: any) => {
      setOtherUser((prev: any) => {
        if (prev?.id === data.userId) {
          return { ...prev, isOnline: data.is_online };
        }
        return prev;
      });
    };

    const removeReadMessageListener = on('message_read', handleReadMessage);
    const removeUserOnlineListener = on('is_online', handleUserOnline);

    return () => {
      // Leave the room when component unmounts
      if (isConnected()) {
        emit('leave_chat', { roomId: chatId });
      }

      removeConnectListener(); // This is the cleanup returned by `on`
      removeMessageListener(); // Likewise
      removeDeliveredMessageListener();
      removeReadMessageListener();
      removeUserOnlineListener();
    };
  }, [chatId, emit, on, off, isConnected, user?.id]);

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  };

  // Handle scroll event for pagination
  const handleScroll = () => {
    if (!chatBodyRef.current || isLoadingMore || !hasMore) return;

    // Check if scrolled to top
    if (chatBodyRef.current.scrollTop === 0) {
      loadMoreMessages();
    }
  };

  // Load more messages
  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // Store current scroll height before loading new messages
    if (chatBodyRef.current) {
      previousScrollHeightRef.current = chatBodyRef.current.scrollHeight;
    }

    // Load next page
    setPage((prev) => prev + 1);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !attachmentFile) return;
    if (!user?.id || !chatId) return;

    const tempId = Date.now().toString();
    const messageContent = newMessage.trim();
    const fileToUpload = attachmentFile;

    // Clear input immediately for better UX
    setNewMessage('');
    setAttachmentFile(null);

    // Set flag to scroll to bottom after message is added
    shouldScrollToBottomRef.current = true;

    // Handle file upload asynchronously
    if (fileToUpload) {
      // Create optimistic message with loading state for file
      const tempMsg: ChatMessage = {
        _id: tempId,
        messageType: 'file',
        content: messageContent,
        sentAt: new Date().toISOString(),
        senderId: user.id,
        status: MessageStatus.SENDING,
        attachments: [
          {
            _id: tempId + '_file',
            id: tempId + '_file',
            originalName: fileToUpload.name,
            mimeType: fileToUpload.type,
            mimetype: fileToUpload.type, // Add both for compatibility
            url: URL.createObjectURL(fileToUpload), // Temporary local URL for preview
            size: fileToUpload.size,
            uploading: true, // Flag to show "Sending..." overlay
          },
        ],
      };

      // Add optimistic message immediately
      setMessages((prev) => [...prev, tempMsg]);

      // Upload file in background
      fileService
        .uploadFile(fileToUpload)
        .then((uploadResponse: any) => {
          if (uploadResponse.status === 'success') {
            const uploadedFile = {
              _id: uploadResponse.data.id,
              id: uploadResponse.data.id,
              originalName: uploadResponse.data.originalName,
              mimeType: uploadResponse.data.mimeType,
              url: uploadResponse.data.url,
              size: uploadResponse.data.size,
              bestImageUrl: uploadResponse.data.bestImageUrl || '',
              bestMediaUrl: uploadResponse.data.bestMediaUrl || '',
              thumbnailUrl: uploadResponse.data.thumbnailUrl || '',
              streamingUrl: uploadResponse.data.streamingUrl || null,
              isImage: uploadResponse.data.isImage || false,
              isVideo: uploadResponse.data.isVideo || false,
            };

            // Update message with real file data
            const messageData = {
              _id: tempId,
              messageType: 'file',
              content: messageContent,
              sentAt: tempMsg.sentAt,
              senderId: user.id,
              status: MessageStatus.SENT,
              chatId,
              attachments: [{ _id: uploadedFile.id }],
            };

            // Emit the message with uploaded file
            emit('send_message', messageData);

            // Update local message to show upload complete
            setMessages((prev) =>
              prev.map((msg) =>
                msg._id === tempId ? { ...msg, attachments: [uploadedFile] } : msg
              )
            );
          } else {
            toast.error('Failed to upload file');
            // Remove failed message
            setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
          }
        })
        .catch((error) => {
          console.error('File upload error:', error);
          toast.error('Failed to upload file');
          // Remove failed message
          setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
        });
    } else {
      // Text message only - send immediately
      const newMsg: ChatMessage = {
        _id: tempId,
        messageType: 'text',
        content: messageContent,
        sentAt: new Date().toISOString(),
        senderId: user.id,
        status: MessageStatus.SENDING,
        attachments: undefined,
      };

      // Add optimistic update
      setMessages((prev) => [...prev, newMsg]);

      // Emit message
      const messageData = {
        ...newMsg,
        chatId,
        attachments: [],
      };

      emit('send_message', messageData);
    }
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

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setAttachmentFile(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteChat = () => {
    if (!chatId) return;

    deleteChat(chatId, {
      onSuccess: () => {
        toast.success('Chat deleted successfully');
        navigate(`/${user?.role}/messages`);
      },
    });
  };

  const openImagePreview = (imageUrl: string) => {
    setPreviewImages([imageUrl]);
    setCurrentImageIndex(0);
  };

  // Group messages by date
  const groupMessagesByDate = (messages: ChatMessage[]) => {
    return messages.reduce((acc: Record<string, ChatMessage[]>, msg) => {
      const dateKey = format(parseISO(msg.sentAt), 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(msg);
      return acc;
    }, {});
  };

  // Get readable date label
  const getReadableDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM dd, yyyy');
  };

  const renderMessageStatus = (status: MessageStatus) => {
    if (status === MessageStatus.SENDING) {
      return <p className="text-[10px] text-gray-500">sending...</p>;
    }
    if (status === MessageStatus.DELIVERED) {
      return <CheckCheck className="w-4 h-4 text-gray-400" />;
    } else if (status === MessageStatus.READ) {
      return <CheckCheck className="w-4 h-4 text-primary" />;
    }
    // For now, show as delivered for all sent messages
    return <Check className="w-4 h-4 text-gray-400" />;
  };
  const breadcrumbItems = [
    { label: 'Messages', href: user?.role === 'buyer' ? '/messages' : `/${user?.role}/messages` },
    { label: `Chat Details`, isCurrentPage: true },
  ];
  // Show loading state while chat is being fetched
  if (isLoadingChat) {
    return <ChatInterfaceSkeleton />;
  }

  return (
    <div className="py-4 md:p-6 space-y-6">
      {/* Breadcrumb */}
      {user?.role != 'admin' && <BreadcrumbWrapper items={breadcrumbItems} />}

      <Card className="h-[calc(100vh-200px)] flex flex-col overflow-hidden border-gray-200">
        {/* Chat Header */}
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser?.avatar} alt={otherUser?.displayName} />
              <AvatarFallback className="bg-gray-200">
                {otherUser ? getInitials(otherUser.displayName) : '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900 capitalize">
                {otherUser?.displayName || 'Loading...'}
              </h3>
              <p
                className={`xtext-sm mt-1 ${otherUser?.isOnline ? 'text-green-500' : 'text-red-500'}`}
              >
                {otherUser?.isOnline ? 'Online' : 'Offline'}
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
          className="flex-1 overflow-y-auto p-4 space-y-2 bg-white"
          onScroll={handleScroll}
        >
          {/* Loading State */}
          {isLoadingMessages && page === 1 && (
            <>
              {/* Date separator skeleton */}
              <div className="flex items-center justify-center my-4">
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>

              {/* Message skeletons */}
              {[...Array(5)].map((_, index) => (
                <div key={index} className="space-y-4">
                  {index % 2 === 0 ? (
                    /* Other user message skeleton */
                    <div className="flex items-start gap-2 justify-start">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex flex-col max-w-[70%] items-start space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-16 w-56 rounded-2xl" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ) : (
                    /* Current user message skeleton */
                    <div className="flex items-start gap-2 justify-end">
                      <div className="flex flex-col max-w-[70%] items-end space-y-2">
                        <Skeleton className="h-12 w-48 rounded-2xl" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Error State */}
          {errorMessages && (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-500">Failed to load messages</p>
            </div>
          )}

          {/* Messages */}
          {(!isLoadingMessages || page > 1) && !errorMessages && (
            <>
              {/* Loading more indicator */}
              {isLoadingMore && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">Loading previous messages...</span>
                </div>
              )}

              {Object.entries(groupMessagesByDate(messages)).map(
                ([date, dayMessages], dateIndex) => (
                  <div key={dateIndex}>
                    {/* Date Separator */}
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-gray-100 px-3 py-1 rounded-full">
                        <span className="text-xs text-gray-600 font-medium">
                          {getReadableDateLabel(date)}
                        </span>
                      </div>
                    </div>

                    {/* Messages for this date */}
                    {dayMessages.map((msg) => {
                      const isSentByUser =
                        msg.senderId === user?.id || msg?.sender?.id === user?.id;

                      return (
                        <div key={msg._id} className="space-y-2">
                          {/* Avatar and message bubble */}
                          <div
                            className={cn(
                              'flex items-start gap-2',
                              isSentByUser ? 'justify-end' : 'justify-start'
                            )}
                          >
                            {!isSentByUser && (
                              <Avatar className="h-10 w-10 mt-1">
                                <AvatarImage src={otherUser?.avatar} alt={otherUser?.displayName} />
                                <AvatarFallback className="bg-gray-200 text-sm">
                                  {otherUser ? getInitials(otherUser.displayName) : '?'}
                                </AvatarFallback>
                              </Avatar>
                            )}

                            <div
                              className={cn(
                                'flex flex-col max-w-[70%]',
                                isSentByUser ? 'items-end' : 'items-start'
                              )}
                            >
                              {!isSentByUser && otherUser && (
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
                                {/* Files/Attachments */}
                                {msg.attachments &&
                                  msg.attachments.length > 0 &&
                                  msg.attachments.map((file, index) => {
                                    // Check various ways the mime type might be stored
                                    const isImage =
                                      file.mimeType?.startsWith('image/') ||
                                      file.mimetype?.startsWith('image/') ||
                                      file.url?.includes('image/upload') || // Cloudinary URLs often have this
                                      file.url?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);

                                    return (
                                      <div key={index} className="mb-2 relative">
                                        {file.uploading && (
                                          <div className="absolute inset-0 bg-black/50 rounded-lg flex flex-col items-center justify-center z-10">
                                            <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
                                            <span className="text-white text-sm font-medium">
                                              Uploading...
                                            </span>
                                          </div>
                                        )}
                                        {isImage ? (
                                          <img
                                            src={file.url || file.bestImageUrl || file.thumbnailUrl}
                                            alt={file.originalName || 'attachment'}
                                            className="rounded-lg max-w-full cursor-pointer object-cover"
                                            style={{ height: '200px', width: '200px' }}
                                            onClick={() =>
                                              !file.uploading &&
                                              openImagePreview(file.url || file.bestImageUrl || '')
                                            }
                                          />
                                        ) : (
                                          <div
                                            className="flex items-center gap-2 flex-col justify-center h-full w-full bg-gray-100 rounded-sm cursor-pointer"
                                            style={{ height: '200px', width: '200px' }}
                                          >
                                            <a
                                              href={file.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center gap-2 flex-col"
                                            >
                                              <FileText className="h-5 w-5 text-gray-500" />
                                              <div className="">
                                                <p
                                                  className="text-xs font-medium text-gray-700 truncate"
                                                  title={file.originalName || 'attachment'}
                                                >
                                                  {truncateFilename(
                                                    file.originalName || 'attachment',
                                                    10
                                                  )}
                                                </p>
                                              </div>
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}

                                {/* Message Text */}
                                {msg.content && (
                                  <ReadMore
                                    text={msg.content}
                                    maxLength={1000}
                                    className={` ${isSentByUser ? 'text-white hover:text-white' : 'text-gray-700'}  `}
                                    buttonClassName={`${isSentByUser ? 'text-white hover:text-white' : 'text-gray-700'} !text-sm`}
                                  />
                                )}
                              </div>

                              {/* Time and Status */}
                              <div
                                className={cn(
                                  'flex items-center gap-1 mt-1 px-1',
                                  isSentByUser ? 'justify-end' : 'justify-start'
                                )}
                              >
                                <span className="text-xs text-gray-500">
                                  {msg.status !== MessageStatus.SENDING &&
                                    format(parseISO(msg.sentAt), 'h:mm a')}
                                </span>
                                {isSentByUser && renderMessageStatus(msg.status)}
                              </div>
                            </div>
                          </div>

                          {/* "Hi!" button on the right (as shown in the image) */}
                          {msg._id === '2' && (
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
                  </div>
                )
              )}
            </>
          )}
        </CardContent>

        {/* Message Input */}
        <div className="border-t bg-white p-4 border-gray-200 flex-shrink-0">
          <div className="relative">
            <Input
              type="text"
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full pr-32 bg-gray-50"
            />

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx"
              onChange={handleFileSelect}
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-16 bg-gray-100 hover:bg-gray-200"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4 text-gray-500" />
              </Button>

              <Button
                size="icon"
                onClick={sendMessage}
                disabled={!newMessage.trim() && !attachmentFile}
                className="h-12 w-16 bg-primary hover:bg-primary/80"
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>

          {attachmentFile && (
            <div className="mt-2 inline-block">
              <div className="relative group bg-gray-100 rounded-lg inline-block">
                {attachmentFile.type.startsWith('image/') ? (
                  <div className="relative w-20 h-20">
                    <img
                      src={URL.createObjectURL(attachmentFile)}
                      alt={attachmentFile.name}
                      className="w-full h-full object-cover rounded-sm"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-[-5px] right-[-5px] h-6 w-6 bg-red-500 hover:bg-red-600 transition-opacity rounded-full"
                      onClick={removeAttachment}
                    >
                      <X className="h-3 w-3 text-white" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex relative flex-col items-center gap-2 p-2 h-20 w-20">
                    <div className="flex items-center gap-2 flex-col justify-center">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div className="">
                        <p
                          className="text-xs font-medium text-gray-700 truncate"
                          title={attachmentFile.name}
                        >
                          {truncateFilename(attachmentFile.name, 10)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {attachmentFile.size < 1024
                            ? `${attachmentFile.size} B`
                            : attachmentFile.size < 1024 * 1024
                              ? `${(attachmentFile.size / 1024).toFixed(1)} KB`
                              : `${(attachmentFile.size / (1024 * 1024)).toFixed(1)} MB`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-[-5px] right-[-5px] h-6 w-6 bg-red-500 hover:bg-red-600 transition-opacity rounded-full"
                      onClick={removeAttachment}
                    >
                      <X className="h-3 w-3 text-white" />
                    </Button>
                  </div>
                )}
              </div>
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

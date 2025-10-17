import React, { useEffect, useState, useRef } from 'react';
import { Chat, Message, chatApi } from '../../api/chat.api';
import { useSocket } from '../../context/SocketContext';
import { MessageBubble } from './MessageBubble';
import { auth } from '../../firebase';
import { Send, Users, Circle } from 'lucide-react';
import chatunknown from '../../assets/chatunknown.avif';

interface ChatWindowProps {
  chat: Chat;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chat }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentUser = auth.currentUser;

  const {
    sendMessage,
    sendTyping,
    markAsRead,
    joinChat,
    leaveChat,
    onNewMessage,
    onTyping,
    onMessagesRead,
    isUserOnline,
  } = useSocket();

  // Fetch current user's database ID
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://onlinetutoringplatform.onrender.com';
        
        const response = await fetch(`${API_BASE_URL}/api/getUserByUid`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setCurrentUserId(data.id);
        }
      } catch (error) {
        console.error('Failed to fetch current user ID:', error);
      }
    };

    if (currentUser) {
      fetchCurrentUserId();
    }
  }, [currentUser]);

  // Fetch messages when chat changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const chatMessages = await chatApi.getChatMessages(chat.chat_id);
        setMessages(chatMessages);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    joinChat(chat.chat_id);
    markAsRead(chat.chat_id);

    return () => {
      leaveChat(chat.chat_id);
    };
  }, [chat.chat_id, joinChat, leaveChat, markAsRead]);

  // Listen for new messages
  useEffect(() => {
    const unsubscribe = onNewMessage((message) => {
      if (message.chat_id === chat.chat_id) {
        setMessages((prev) => [...prev, message]);
        
        // Mark as read if not own message
        if (message.sender_id !== currentUserId) {
          markAsRead(chat.chat_id);
        }
      }
    });

    return unsubscribe;
  }, [chat.chat_id, onNewMessage, currentUserId, markAsRead]);

  // Listen for typing indicators
  useEffect(() => {
    const unsubscribe = onTyping((data) => {
      if (data.chatId === chat.chat_id && data.userId !== currentUserId) {
        if (data.isTyping) {
          setTypingUsers((prev) => new Set(prev).add(data.userId));
        } else {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }
      }
    });

    return unsubscribe;
  }, [chat.chat_id, onTyping, currentUserId]);

  // Listen for messages read
  useEffect(() => {
    const unsubscribe = onMessagesRead((data) => {
      if (data.chatId === chat.chat_id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender_id === currentUserId ? { ...msg, is_read: true } : msg
          )
        );
      }
    });

    return unsubscribe;
  }, [chat.chat_id, onMessagesRead, currentUserId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      sendMessage(chat.chat_id, newMessage.trim());
      setNewMessage('');
      
      // Stop typing indicator
      sendTyping(chat.chat_id, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  // Handle typing
  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);

    // Send typing indicator
    sendTyping(chat.chat_id, true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(chat.chat_id, false);
    }, 3000);
  };

  // Handle message deletion
  const handleDeleteMessage = async (messageId: string) => {
    try {
      await chatApi.deleteMessage(messageId);
      setMessages((prev) => prev.filter((msg) => msg.message_id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message');
    }
  };

  // Handle message editing
  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      const updatedMessage = await chatApi.editMessage(messageId, content);
      setMessages((prev) =>
        prev.map((msg) => (msg.message_id === messageId ? updatedMessage : msg))
      );
    } catch (error) {
      console.error('Failed to edit message:', error);
      alert('Failed to edit message');
    }
  };

  // Get chat name
  const getChatName = (): string => {
    if (chat.type === 'group') {
      return chat.name || chat.Class?.class_name || 'Group Chat';
    }
    const otherParticipant = chat.participants.find(
      (p) => p.user_id !== currentUserId
    );
    if (otherParticipant) {
      return otherParticipant.User.name;
    }
    return 'Chat';
  };

  // Get online status for direct chats
  const getOnlineStatus = (): boolean => {
    if (chat.type === 'group') return false;
    const otherParticipant = chat.participants.find(
      (p) => p.user_id !== currentUserId
    );
    return otherParticipant ? isUserOnline(otherParticipant.user_id) : false;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{getChatName()}</h2>
              {chat.type === 'direct' && (
                <div className="flex items-center gap-2 mt-1">
                  <Circle 
                    className={`w-2 h-2 ${getOnlineStatus() ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`}
                  />
                  <span className={`text-sm font-medium ${getOnlineStatus() ? 'text-green-600' : 'text-gray-500'}`}>
                    {getOnlineStatus() ? 'Online' : 'Offline'}
                  </span>
                </div>
              )}
              {chat.type === 'group' && (
                <div className="flex items-center gap-2 mt-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {chat.participants.length} participants
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💬</span>
              </div>
              <p className="text-gray-600 text-lg font-medium">No messages yet.</p>
              <p className="text-gray-500 mt-2">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwn = message.sender_id === currentUserId;
              const showAvatar =
                index === 0 ||
                messages[index - 1].sender_id !== message.sender_id;

              return (
                <MessageBubble
                  key={message.message_id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  onDelete={isOwn ? handleDeleteMessage : undefined}
                  onEdit={isOwn ? handleEditMessage : undefined}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="flex items-center gap-2 mt-4 px-4 py-3 bg-white rounded-2xl shadow-sm inline-flex">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="text-sm text-gray-600 font-medium">Someone is typing...</span>
          </div>
        )}
      </div>

      {/* Message Input */}
      <form className="px-6 py-4 bg-white border-t border-gray-200" onSubmit={handleSendMessage}>
        <div className="flex items-end gap-3">
          <textarea
            value={newMessage}
            onChange={handleTyping}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Type a message..."
            rows={1}
            disabled={sending}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all bg-gray-50 focus:bg-white"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim() || sending}
            className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {sending ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

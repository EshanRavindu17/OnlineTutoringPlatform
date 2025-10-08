import React, { useEffect, useState, useRef } from 'react';
import { Chat, Message, chatApi } from '../../api/chat.api';
import { useSocket } from '../../context/SocketContext';
import { MessageBubble } from './MessageBubble';
import { auth } from '../../firebase';
import './ChatWindow.css';

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
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
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
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <h2>{getChatName()}</h2>
          {chat.type === 'direct' && (
            <span className={`status ${getOnlineStatus() ? 'online' : 'offline'}`}>
              {getOnlineStatus() ? 'Online' : 'Offline'}
            </span>
          )}
          {chat.type === 'group' && (
            <span className="participants-count">
              {chat.participants.length} participants
            </span>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        {loading ? (
          <div className="loading-messages">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="empty-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="messages-list">
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
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="typing-text">Someone is typing...</span>
          </div>
        )}
      </div>

      {/* Message Input */}
      <form className="message-input-container" onSubmit={handleSendMessage}>
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
        />
        <button type="submit" disabled={!newMessage.trim() || sending}>
          {sending ? '...' : '➤'}
        </button>
      </form>
    </div>
  );
};

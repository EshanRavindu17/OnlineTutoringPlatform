import React, { useEffect, useState } from 'react';
import { chatApi, Chat } from '../../api/chat.api';
import { useSocket } from '../../context/SocketContext';
import { auth } from '../../firebase';
import { NewChatDialog } from './NewChatDialog';
import './ChatList.css';

interface ChatListProps {
  onChatSelect: (chat: Chat) => void;
  selectedChatId?: string;
}

export const ChatList: React.FC<ChatListProps> = ({ onChatSelect, selectedChatId }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { onNewMessage, isUserOnline } = useSocket();
  const currentUser = auth.currentUser;

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
          setCurrentUserId(data.id); // Database UUID
        }
      } catch (error) {
        console.error('Failed to fetch current user ID:', error);
      }
    };

    if (currentUser) {
      fetchCurrentUserId();
    }
  }, [currentUser]);

  // Fetch user's chats
  const fetchChats = async () => {
    try {
      setLoading(true);
      const userChats = await chatApi.getUserChats();
      setChats(userChats);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // Listen for new messages to update chat list
  useEffect(() => {
    const unsubscribe = onNewMessage((message) => {
      setChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.chat_id === message.chat_id) {
            return {
              ...chat,
              lastMessage: message,
              unreadCount: chat.chat_id === selectedChatId ? 0 : (chat.unreadCount || 0) + 1,
              updated_at: message.created_at
            };
          }
          return chat;
        }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      });
    });

    return unsubscribe;
  }, [onNewMessage, selectedChatId]);

  // Get chat display name
  const getChatName = (chat: Chat): string => {
    if (chat.type === 'group') {
      return chat.name || chat.Class?.class_name || 'Group Chat';
    }
    
    // For direct chats, show the other user's name
    const otherParticipant = chat.participants.find(
      (p) => p.user_id !== currentUserId
    );
    
    if (otherParticipant) {
      return otherParticipant.User.name;
    }
    
    return 'Chat';
  };

  // Get other participant for direct chats
  const getOtherParticipant = (chat: Chat) => {
    if (chat.type === 'group') return null;
    return chat.participants.find((p) => p.user_id !== currentUserId);
  };

  // Format timestamp
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Handle new chat creation
  const handleChatCreated = async (chatId: string) => {
    await fetchChats(); // Refresh chat list
    const newChat = chats.find(c => c.chat_id === chatId);
    if (newChat) {
      onChatSelect(newChat);
    }
  };

  if (loading) {
    return <div className="chat-list-loading">Loading chats...</div>;
  }

  if (error) {
    return <div className="chat-list-error">Error: {error}</div>;
  }

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h2>Messages</h2>
        <button 
          className="new-chat-btn" 
          onClick={() => setShowNewChatDialog(true)}
          title="Start new conversation"
        >
          ✏️
        </button>
      </div>
      
      {chats.length === 0 ? (
        <div className="chat-list-empty">
          <p>No chats yet.</p>
          <button 
            className="start-chat-btn"
            onClick={() => setShowNewChatDialog(true)}
          >
            Start a conversation!
          </button>
        </div>
      ) : (
      <div className="chat-list-items">
        {chats.map((chat) => {
          const otherParticipant = getOtherParticipant(chat);
          const isOnline = otherParticipant ? isUserOnline(otherParticipant.user_id) : false;
          const hasUnread = (chat.unreadCount || 0) > 0;

          return (
            <div
              key={chat.chat_id}
              className={`chat-list-item ${selectedChatId === chat.chat_id ? 'active' : ''} ${hasUnread ? 'unread' : ''}`}
              onClick={() => onChatSelect(chat)}
            >
              <div className="chat-avatar">
                {chat.type === 'group' ? (
                  <div className="group-avatar">👥</div>
                ) : (
                  <>
                    <img
                      src={otherParticipant?.User.photo_url || '/default-avatar.png'}
                      alt={getChatName(chat)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                      }}
                    />
                    {isOnline && <div className="online-indicator" />}
                  </>
                )}
              </div>
              <div className="chat-info">
                <div className="chat-header-row">
                  <h3 className="chat-name">{getChatName(chat)}</h3>
                  {chat.lastMessage && (
                    <span className="chat-time">{formatTime(chat.lastMessage.created_at)}</span>
                  )}
                </div>
                <div className="chat-preview-row">
                  {chat.lastMessage ? (
                    <p className="chat-preview">
                      {chat.lastMessage.sender_id === currentUserId && 'You: '}
                      {chat.lastMessage.message_type === 'text' 
                        ? chat.lastMessage.content 
                        : `📎 ${chat.lastMessage.file_name || 'File'}`
                      }
                    </p>
                  ) : (
                    <p className="chat-preview no-messages">No messages yet</p>
                  )}
                  {hasUnread && (
                    <span className="unread-badge">{chat.unreadCount}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
      
      {showNewChatDialog && (
        <NewChatDialog 
          onClose={() => setShowNewChatDialog(false)}
          onChatCreated={handleChatCreated}
        />
      )}
    </div>
  );
};

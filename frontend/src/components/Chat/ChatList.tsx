import React, { useEffect, useState } from 'react';
import { chatApi, Chat } from '../../api/chat.api';
import { useSocket } from '../../context/SocketContext';
import { auth } from '../../firebase';
import { NewChatDialog } from './NewChatDialog';
import { Search, Edit3, Users, Clock } from 'lucide-react';
import chatunknown from '../../assets/chatunknown.avif';

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
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading chats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-red-600 font-medium">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Messages
          </h2>
          <button 
            className="group relative p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 shadow-lg"
            onClick={() => setShowNewChatDialog(true)}
            title="Start new conversation"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all text-sm"
          />
        </div>
      </div>
      
      {chats.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-purple-600" />
            </div>
            <p className="text-gray-600 font-medium mb-4">No chats yet.</p>
            <button 
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              onClick={() => setShowNewChatDialog(true)}
            >
              Start a conversation!
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => {
            const otherParticipant = getOtherParticipant(chat);
            const isOnline = otherParticipant ? isUserOnline(otherParticipant.user_id) : false;
            const hasUnread = (chat.unreadCount || 0) > 0;

            return (
              <div
                key={chat.chat_id}
                className={`group relative px-6 py-4 cursor-pointer transition-all duration-300 border-l-4 ${
                  selectedChatId === chat.chat_id 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-purple-600 shadow-md' 
                    : hasUnread 
                      ? 'bg-blue-50/50 border-l-blue-400 hover:bg-blue-50' 
                      : 'border-l-transparent hover:bg-gray-50 hover:border-l-gray-300'
                }`}
                onClick={() => onChatSelect(chat)}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {chat.type === 'group' ? (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <>
                        <img
                          src={otherParticipant?.User.photo_url || chatunknown}
                          alt={getChatName(chat)}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = chatunknown;
                          }}
                        />
                        {isOnline && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-md animate-pulse"></div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                        {getChatName(chat)}
                      </h3>
                      {chat.lastMessage && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 ml-2 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {formatTime(chat.lastMessage.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      {chat.lastMessage ? (
                        <p className={`text-sm truncate ${hasUnread ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                          {chat.lastMessage.sender_id === currentUserId && (
                            <span className="text-gray-500">You: </span>
                          )}
                          {chat.lastMessage.message_type === 'text' 
                            ? chat.lastMessage.content 
                            : `📎 ${chat.lastMessage.file_name || 'File'}`
                          }
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No messages yet</p>
                      )}
                      {hasUnread && (
                        <span className="flex-shrink-0 ml-2 px-2 py-0.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-md">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
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

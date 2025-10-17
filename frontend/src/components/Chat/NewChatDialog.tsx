import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../firebase';
import { X, Search, UserPlus, Users } from 'lucide-react';
import chatunknown from '../../assets/chatunknown.avif';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  photo_url?: string;
}

interface NewChatDialogProps {
  onClose: () => void;
  onChatCreated: (chatId: string) => void;
}

export const NewChatDialog: React.FC<NewChatDialogProps> = ({ onClose, onChatCreated }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const init = async () => {
      await fetchCurrentUserId();
      await fetchUsers();
    };
    init();
  }, []);

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
        return data.id;
      }
    } catch (error) {
      console.error('Failed to fetch current user ID:', error);
    }
    return null;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://onlinetutoringplatform.onrender.com';
      
      // Get current user ID first
      let userId = currentUserId;
      if (!userId) {
        userId = await fetchCurrentUserId();
      }
      
      // Fetch all users
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Response format: { success: true, data: [...], count: number }
      const allUsers = response.data.data || response.data.users || [];
      
      // Filter out current user (using database ID)
      const filteredUsers = allUsers.filter(
        (user: User) => user.id !== userId
      );
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async (targetUserId: string) => {
    try {
      setCreating(true);
      const token = await auth.currentUser?.getIdToken();
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://onlinetutoringplatform.onrender.com';
      
      const response = await axios.post(
        `${API_BASE_URL}/api/chat/chats/direct`,
        { targetUserId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      onChatCreated(response.data.chat.chat_id);
      onClose();
    } catch (error) {
      console.error('Failed to create chat:', error);
      alert('Failed to create chat. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Start New Conversation
              </h2>
            </div>
            <button 
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors" 
              onClick={onClose}
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          
          {/* Users List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-600 font-medium">Loading users...</p>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">
                  {searchQuery ? 'No users found' : 'No users available'}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {searchQuery ? 'Try a different search term' : 'Check back later'}
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                    creating 
                      ? 'cursor-not-allowed opacity-50' 
                      : 'cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md'
                  }`}
                  onClick={() => !creating && handleCreateChat(user.id)}
                >
                  <img
                    src={user.photo_url || chatunknown}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-110 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = chatunknown;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{user.name}</div>
                    <div className="text-sm text-gray-600 capitalize">{user.role}</div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <UserPlus className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

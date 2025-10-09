import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../firebase';
import './NewChatDialog.css';

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
    <div className="new-chat-dialog-overlay" onClick={onClose}>
      <div className="new-chat-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Start New Conversation</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="dialog-content">
          <input
            type="text"
            className="search-input"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          
          <div className="users-list">
            {loading ? (
              <div className="loading">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state">
                {searchQuery ? 'No users found' : 'No users available'}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="user-item"
                  onClick={() => !creating && handleCreateChat(user.id)}
                  style={{ cursor: creating ? 'not-allowed' : 'pointer' }}
                >
                  <img
                    src={user.photo_url || '/default-avatar.png'}
                    alt={user.name}
                    className="user-avatar"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/default-avatar.png';
                    }}
                  />
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-role">{user.role}</div>
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

import axios from 'axios';
import { auth } from '../firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://onlinetutoringplatform.onrender.com';

// Types
export interface Chat {
  chat_id: string;
  type: 'direct' | 'group';
  name?: string;
  class_id?: string;
  created_at: string;
  updated_at: string;
  participants: ChatParticipant[];
  lastMessage?: Message;
  unreadCount?: number;
  Class?: {
    class_id: string;
    class_name: string;
  };
}

export interface ChatParticipant {
  id: string;
  chat_id: string;
  user_id: string;
  joined_at: string;
  last_read?: string;
  User: {
    id: string;
    name: string;
    photo_url?: string;
    email: string;
    role: string;
  };
}

export interface Message {
  message_id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'file' | 'image';
  file_url?: string;
  file_name?: string;
  is_read: boolean;
  created_at: string;
  edited_at?: string;
  User?: {
    id: string;
    name: string;
    photo_url?: string;
  };
}

// Helper function to get auth token
const getAuthToken = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
};

// API client with auth
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/chat`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await getAuthToken();
    config.headers.Authorization = `Bearer ${token}`;
  } catch (error) {
    console.error('Failed to get auth token:', error);
  }
  return config;
});

// Chat API methods
export const chatApi = {
  /**
   * Get all chats for the authenticated user
   */
  getUserChats: async (): Promise<Chat[]> => {
    try {
      const response = await apiClient.get('/chats');
      return response.data.chats;
    } catch (error: any) {
      console.error('Get user chats error:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch chats');
    }
  },

  /**
   * Get chat details by ID
   */
  getChatById: async (chatId: string): Promise<Chat> => {
    try {
      const response = await apiClient.get(`/chats/${chatId}`);
      return response.data.chat;
    } catch (error: any) {
      console.error('Get chat by ID error:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch chat');
    }
  },

  /**
   * Get messages for a specific chat
   */
  getChatMessages: async (
    chatId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<Message[]> => {
    try {
      const response = await apiClient.get(`/chats/${chatId}/messages`, {
        params: { limit, offset }
      });
      return response.data.messages;
    } catch (error: any) {
      console.error('Get chat messages error:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch messages');
    }
  },

  /**
   * Create or get direct chat with another user
   */
  createDirectChat: async (targetUserId: string): Promise<Chat> => {
    try {
      const response = await apiClient.post('/chats/direct', {
        targetUserId
      });
      return response.data.chat;
    } catch (error: any) {
      console.error('Create direct chat error:', error);
      throw new Error(error.response?.data?.error || 'Failed to create chat');
    }
  },

  /**
   * Create group chat for a class
   */
  createGroupChat: async (classId: string, className: string): Promise<Chat> => {
    try {
      const response = await apiClient.post('/chats/group', {
        classId,
        className
      });
      return response.data.chat;
    } catch (error: any) {
      console.error('Create group chat error:', error);
      throw new Error(error.response?.data?.error || 'Failed to create group chat');
    }
  },

  /**
   * Get unread message count
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await apiClient.get('/unread-count');
      return response.data.unreadCount;
    } catch (error: any) {
      console.error('Get unread count error:', error);
      throw new Error(error.response?.data?.error || 'Failed to get unread count');
    }
  },

  /**
   * Add participant to group chat
   */
  addParticipant: async (chatId: string, userId: string): Promise<ChatParticipant> => {
    try {
      const response = await apiClient.post(`/chats/${chatId}/participants`, {
        userId
      });
      return response.data.participant;
    } catch (error: any) {
      console.error('Add participant error:', error);
      throw new Error(error.response?.data?.error || 'Failed to add participant');
    }
  },

  /**
   * Remove participant from group chat
   */
  removeParticipant: async (chatId: string, userId: string): Promise<void> => {
    try {
      await apiClient.delete(`/chats/${chatId}/participants/${userId}`);
    } catch (error: any) {
      console.error('Remove participant error:', error);
      throw new Error(error.response?.data?.error || 'Failed to remove participant');
    }
  },

  /**
   * Delete a message
   */
  deleteMessage: async (messageId: string): Promise<void> => {
    try {
      await apiClient.delete(`/messages/${messageId}`);
    } catch (error: any) {
      console.error('Delete message error:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete message');
    }
  },

  /**
   * Edit a message
   */
  editMessage: async (messageId: string, content: string): Promise<Message> => {
    try {
      const response = await apiClient.put(`/messages/${messageId}`, {
        content
      });
      return response.data.message;
    } catch (error: any) {
      console.error('Edit message error:', error);
      throw new Error(error.response?.data?.error || 'Failed to edit message');
    }
  },
};

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { auth } from '../firebase';

// Types
interface Message {
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

interface TypingData {
  chatId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

interface UserStatusData {
  userId: string;
  isOnline: boolean;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeUsers: number;
  sendMessage: (chatId: string, content: string, messageType?: 'text' | 'file' | 'image') => void;
  sendTyping: (chatId: string, isTyping: boolean) => void;
  markAsRead: (chatId: string) => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  onNewMessage: (callback: (message: Message) => void) => () => void;
  onTyping: (callback: (data: TypingData) => void) => () => void;
  onMessagesRead: (callback: (data: { chatId: string; userId: string; timestamp: string }) => void) => () => void;
  onUserStatusChange: (callback: (data: UserStatusData) => void) => () => void;
  isUserOnline: (userId: string) => boolean;
  onlineUsers: Set<string>;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Initialize socket connection
    const initSocket = async () => {
      try {
        const user = auth.currentUser;
        
        if (!user) {
          console.log('❌ No authenticated user found');
          return;
        }

        console.log('🔐 Current user:', user.email, 'UID:', user.uid);

        // Get Firebase ID token
        const token = await user.getIdToken();
        console.log('🎫 Got Firebase token (length:', token.length, ')');
        
        // Connect to Socket.io server
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://onlinetutoringplatform.onrender.com';
        console.log('🔌 Connecting to Socket.io server:', socketUrl);
        
        const newSocket = io(socketUrl, {
          auth: {
            token
          },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5
        });

        // Connection event handlers
        newSocket.on('connect', () => {
          console.log('✅ Socket connected:', newSocket.id);
          setIsConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
          console.log('❌ Socket disconnected:', reason);
          setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error.message);
          setIsConnected(false);
        });

        newSocket.on('error', (error) => {
          console.error('Socket error:', error);
        });

        // User status updates
        newSocket.on('user_status_change', (data: UserStatusData) => {
          setOnlineUsers((prev) => {
            const newSet = new Set(prev);
            if (data.isOnline) {
              newSet.add(data.userId);
            } else {
              newSet.delete(data.userId);
            }
            return newSet;
          });
        });

        // Active users count
        newSocket.on('active_users_count', (count: number) => {
          setActiveUsers(count);
        });

        setSocket(newSocket);

        return () => {
          newSocket.close();
        };
      } catch (error) {
        console.error('Failed to initialize socket:', error);
      }
    };

    initSocket();

    // Clean up on unmount
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  // Send message
  const sendMessage = useCallback((
    chatId: string, 
    content: string, 
    messageType: 'text' | 'file' | 'image' = 'text'
  ) => {
    if (socket && isConnected) {
      socket.emit('send_message', {
        chatId,
        content,
        messageType
      });
    }
  }, [socket, isConnected]);

  // Send typing indicator
  const sendTyping = useCallback((chatId: string, isTyping: boolean) => {
    if (socket && isConnected) {
      socket.emit('typing', {
        chatId,
        isTyping
      });
    }
  }, [socket, isConnected]);

  // Mark messages as read
  const markAsRead = useCallback((chatId: string) => {
    if (socket && isConnected) {
      socket.emit('mark_as_read', { chatId });
    }
  }, [socket, isConnected]);

  // Join chat room
  const joinChat = useCallback((chatId: string) => {
    if (socket && isConnected) {
      socket.emit('join_chat', { chatId });
    }
  }, [socket, isConnected]);

  // Leave chat room
  const leaveChat = useCallback((chatId: string) => {
    if (socket && isConnected) {
      socket.emit('leave_chat', { chatId });
    }
  }, [socket, isConnected]);

  // Listen for new messages
  const onNewMessage = useCallback((callback: (message: Message) => void) => {
    if (!socket) return () => {};
    
    socket.on('new_message', callback);
    
    return () => {
      socket.off('new_message', callback);
    };
  }, [socket]);

  // Listen for typing indicators
  const onTyping = useCallback((callback: (data: TypingData) => void) => {
    if (!socket) return () => {};
    
    socket.on('user_typing', callback);
    
    return () => {
      socket.off('user_typing', callback);
    };
  }, [socket]);

  // Listen for messages read
  const onMessagesRead = useCallback((callback: (data: { chatId: string; userId: string; timestamp: string }) => void) => {
    if (!socket) return () => {};
    
    socket.on('messages_read', callback);
    
    return () => {
      socket.off('messages_read', callback);
    };
  }, [socket]);

  // Listen for user status changes
  const onUserStatusChange = useCallback((callback: (data: UserStatusData) => void) => {
    if (!socket) return () => {};
    
    socket.on('user_status_change', callback);
    
    return () => {
      socket.off('user_status_change', callback);
    };
  }, [socket]);

  // Check if user is online
  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  const value: SocketContextType = {
    socket,
    isConnected,
    activeUsers,
    sendMessage,
    sendTyping,
    markAsRead,
    joinChat,
    leaveChat,
    onNewMessage,
    onTyping,
    onMessagesRead,
    onUserStatusChange,
    isUserOnline,
    onlineUsers
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

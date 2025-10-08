import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import admin from 'firebase-admin';
import prisma from '../prismaClient';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'online-tutoring-platform-30573',
  });
}

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  userEmail?: string;
}

export class SocketServer {
  private io: SocketIOServer;
  private activeUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
      },
    });

    this.initialize();
  }

  private async authenticate(socket: AuthenticatedSocket, token: string): Promise<boolean> {
    try {
      console.log('🔐 Attempting to authenticate socket connection...');
      console.log('Token received:', token ? 'Yes (length: ' + token.length + ')' : 'No');
      
      // Verify Firebase token
      console.log('Verifying Firebase token...');
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log('✅ Firebase token verified. UID:', decodedToken.uid, 'Email:', decodedToken.email);
      
      // Fetch user from database using firebase_uid
      console.log('Fetching user from database...');
      const user = await prisma.user.findUnique({
        where: { firebase_uid: decodedToken.uid },
        select: { id: true, role: true, email: true, name: true },
      });

      if (!user) {
        console.error('❌ User not found in database for Firebase UID:', decodedToken.uid);
        console.error('Decoded token email:', decodedToken.email);
        
        // Check if user exists with this email
        const userByEmail = await prisma.user.findUnique({
          where: { email: decodedToken.email! },
          select: { id: true, firebase_uid: true, email: true },
        });
        
        if (userByEmail) {
          console.error('⚠️ User found by email but firebase_uid mismatch!');
          console.error('Database firebase_uid:', userByEmail.firebase_uid);
          console.error('Token firebase_uid:', decodedToken.uid);
        }
        
        return false;
      }

      socket.userId = user.id;
      socket.userRole = user.role;
      socket.userEmail = user.email;
      
      console.log(`✅ Socket authenticated for user: ${user.email} (${user.id})`);
      return true;
    } catch (error: any) {
      console.error('❌ Socket authentication error:', error.message);
      console.error('Error details:', error);
      return false;
    }
  }

  private initialize() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      console.log('🔌 New socket connection attempt from:', socket.handshake.address);
      const token = socket.handshake.auth.token;
      
      if (!token) {
        console.error('❌ No authentication token provided');
        return next(new Error('Authentication token required'));
      }

      const authenticated = await this.authenticate(socket, token);
      
      if (!authenticated) {
        console.error('❌ Socket authentication failed for connection:', socket.id);
        return next(new Error('Authentication failed'));
      }

      next();
    });

    // Connection handler
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`✅ User connected: ${socket.userId} (${socket.userRole})`);
      
      // Store active user
      if (socket.userId) {
        this.activeUsers.set(socket.userId, socket.id);
        this.broadcastOnlineStatus(socket.userId, true);
      }

      // Join user's chat rooms
      this.joinUserChats(socket);

      // Event handlers
      this.handleSendMessage(socket);
      this.handleTyping(socket);
      this.handleMarkAsRead(socket);
      this.handleJoinChat(socket);
      this.handleLeaveChat(socket);

      // Disconnect handler
      socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.userId}`);
        if (socket.userId) {
          this.activeUsers.delete(socket.userId);
          this.broadcastOnlineStatus(socket.userId, false);
        }
      });
    });
  }

  private async joinUserChats(socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    try {
      const chats = await prisma.chatParticipant.findMany({
        where: { user_id: socket.userId },
        select: { chat_id: true },
      });

      chats.forEach(chat => {
        socket.join(`chat:${chat.chat_id}`);
      });

      console.log(`📝 User ${socket.userId} joined ${chats.length} chat rooms`);
    } catch (error) {
      console.error('Error joining chats:', error);
    }
  }

  private handleSendMessage(socket: AuthenticatedSocket) {
    socket.on('send_message', async (data: {
      chatId: string;
      content: string;
      messageType?: 'text' | 'file' | 'image';
      fileUrl?: string;
      fileName?: string;
    }) => {
      try {
        if (!socket.userId) return;

        // Save message to database
        const message = await prisma.message.create({
          data: {
            chat_id: data.chatId,
            sender_id: socket.userId,
            content: data.content,
            message_type: data.messageType || 'text',
            file_url: data.fileUrl,
            file_name: data.fileName,
          },
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
                photo_url: true,
              },
            },
          },
        });

        // Update chat's updated_at
        await prisma.chat.update({
          where: { chat_id: data.chatId },
          data: { updated_at: new Date() },
        });

        // Broadcast to chat room
        this.io.to(`chat:${data.chatId}`).emit('new_message', {
          ...message,
          sender: message.User,
        });

        console.log(`💬 Message sent in chat ${data.chatId} by ${socket.userId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });
  }

  private handleTyping(socket: AuthenticatedSocket) {
    socket.on('typing', (data: { chatId: string; isTyping: boolean }) => {
      socket.to(`chat:${data.chatId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userEmail,
        isTyping: data.isTyping,
        chatId: data.chatId,
      });
    });
  }

  private handleMarkAsRead(socket: AuthenticatedSocket) {
    socket.on('mark_as_read', async (data: { chatId: string }) => {
      try {
        if (!socket.userId) return;

        // Update last_read for participant
        await prisma.chatParticipant.updateMany({
          where: {
            chat_id: data.chatId,
            user_id: socket.userId,
          },
          data: {
            last_read: new Date(),
          },
        });

        // Mark messages as read
        await prisma.message.updateMany({
          where: {
            chat_id: data.chatId,
            sender_id: { not: socket.userId },
            is_read: false,
          },
          data: {
            is_read: true,
          },
        });

        socket.to(`chat:${data.chatId}`).emit('messages_read', {
          chatId: data.chatId,
          readBy: socket.userId,
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });
  }

  private handleJoinChat(socket: AuthenticatedSocket) {
    socket.on('join_chat', (data: { chatId: string }) => {
      socket.join(`chat:${data.chatId}`);
      console.log(`User ${socket.userId} joined chat ${data.chatId}`);
    });
  }

  private handleLeaveChat(socket: AuthenticatedSocket) {
    socket.on('leave_chat', (data: { chatId: string }) => {
      socket.leave(`chat:${data.chatId}`);
      console.log(`User ${socket.userId} left chat ${data.chatId}`);
    });
  }

  private broadcastOnlineStatus(userId: string, isOnline: boolean) {
    this.io.emit('user_status_change', {
      userId,
      isOnline,
      timestamp: new Date(),
    });
  }

  public getIO(): SocketIOServer {
    return this.io;
  }

  public isUserOnline(userId: string): boolean {
    return this.activeUsers.has(userId);
  }

  public getActiveUsersCount(): number {
    return this.activeUsers.size;
  }
}

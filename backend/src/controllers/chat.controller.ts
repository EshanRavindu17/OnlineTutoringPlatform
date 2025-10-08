import { Request, Response } from 'express';
import { chatService } from '../services/chat.service';

export const chatController = {
  /**
   * Get all chats for the authenticated user
   */
  async getUserChats(req: Request, res: Response) {
    try {
      // const userId = (req as any).user.uid;
      const userId = (req as any).user.userId;
      console.log("userIddddddd:", userId);
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticatedddddd' });
      }

      const chats = await chatService.getUserChats(userId);
      res.json({ success: true, chats });
    } catch (error: any) {
      console.error('Get user chats error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch chats' });
    }
  },

  /**
   * Get messages for a specific chat
   */
  async getChatMessages(req: Request, res: Response) {
    try {
      const { chatId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      if (!chatId) {
        return res.status(400).json({ error: 'Chat ID is required' });
      }

      const messages = await chatService.getChatMessages(chatId, limit, offset);
      res.json({ success: true, messages });
    } catch (error: any) {
      console.error('Get chat messages error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch messages' });
    }
  },

  /**
   * Create or get direct chat between two users
   */
  async createDirectChat(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { targetUserId } = req.body;

      if (!targetUserId) {
        return res.status(400).json({ error: 'Target user ID is required' });
      }

      if (userId === targetUserId) {
        return res.status(400).json({ error: 'Cannot create chat with yourself' });
      }

      const chat = await chatService.getOrCreateDirectChat(userId, targetUserId);
      res.json({ success: true, chat });
    } catch (error: any) {
      console.error('Create direct chat error:', error);
      res.status(500).json({ error: error.message || 'Failed to create chat' });
    }
  },

  /**
   * Create group chat for a class (Mass tutor only)
   */
  async createGroupChat(req: Request, res: Response) {
    try {
      const tutorId = (req as any).user.userId;
      const userRole = (req as any).user.role;
      const { classId, className } = req.body;

      // Verify user is a mass tutor
      if (userRole !== 'Mass') {
        return res.status(403).json({ error: 'Only mass tutors can create group chats' });
      }

      if (!classId || !className) {
        return res.status(400).json({ error: 'Class ID and name are required' });
      }

      const chat = await chatService.createGroupChat(classId, className, tutorId);
      res.json({ success: true, chat });
    } catch (error: any) {
      console.error('Create group chat error:', error);
      res.status(500).json({ error: error.message || 'Failed to create group chat' });
    }
  },

  /**
   * Get unread message count for the authenticated user
   */
  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const count = await chatService.getUnreadCount(userId);
      res.json({ success: true, unreadCount: count });
    } catch (error: any) {
      console.error('Get unread count error:', error);
      res.status(500).json({ error: error.message || 'Failed to get unread count' });
    }
  },

  /**
   * Get chat details by ID
   */
  async getChatById(req: Request, res: Response) {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        return res.status(400).json({ error: 'Chat ID is required' });
      }

      const chat = await chatService.getChatById(chatId);
      
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      res.json({ success: true, chat });
    } catch (error: any) {
      console.error('Get chat by ID error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch chat' });
    }
  },

  /**
   * Add participant to group chat
   */
  async addParticipant(req: Request, res: Response) {
    try {
      const { chatId } = req.params;
      const { userId } = req.body;

      if (!chatId || !userId) {
        return res.status(400).json({ error: 'Chat ID and User ID are required' });
      }

      const participant = await chatService.addParticipant(chatId, userId);
      res.json({ success: true, participant });
    } catch (error: any) {
      console.error('Add participant error:', error);
      res.status(500).json({ error: error.message || 'Failed to add participant' });
    }
  },

  /**
   * Remove participant from group chat
   */
  async removeParticipant(req: Request, res: Response) {
    try {
      const { chatId, userId } = req.params;

      if (!chatId || !userId) {
        return res.status(400).json({ error: 'Chat ID and User ID are required' });
      }

      await chatService.removeParticipant(chatId, userId);
      res.json({ success: true, message: 'Participant removed successfully' });
    } catch (error: any) {
      console.error('Remove participant error:', error);
      res.status(500).json({ error: error.message || 'Failed to remove participant' });
    }
  },

  /**
   * Delete a message
   */
  async deleteMessage(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const userId = (req as any).user.userId;

      if (!messageId) {
        return res.status(400).json({ error: 'Message ID is required' });
      }

      await chatService.deleteMessage(messageId, userId);
      res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error: any) {
      console.error('Delete message error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete message' });
    }
  },

  /**
   * Edit a message
   */
  async editMessage(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const userId = (req as any).user.userId;
      const { content } = req.body;

      if (!messageId || !content) {
        return res.status(400).json({ error: 'Message ID and content are required' });
      }

      const updatedMessage = await chatService.editMessage(messageId, userId, content);
      res.json({ success: true, message: updatedMessage });
    } catch (error: any) {
      console.error('Edit message error:', error);
      res.status(500).json({ error: error.message || 'Failed to edit message' });
    }
  },
};

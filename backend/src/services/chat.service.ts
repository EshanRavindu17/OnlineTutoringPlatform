import prisma from '../prismaClient';

export const chatService = {
  /**
   * Create or get direct chat between two users
   */
  async getOrCreateDirectChat(user1Id: string, user2Id: string) {
    try {
        // const chatParticipant = prisma.ChatParticipant;
      // Check if chat already exists between these two users
      const existingParticipants = await prisma.chatParticipant.groupBy({
        by: ['chat_id'],
        where: {
          user_id: {
            in: [user1Id, user2Id],
          },
          chat: {
            type: 'direct',
          },
        },
        having: {
          chat_id: {
            _count: {
              equals: 2,
            },
          },
        },
      });

      if (existingParticipants.length > 0) {
        const chatId = existingParticipants[0].chat_id;
        
        // Get full chat details
        const chat = await prisma.chat.findUnique({
          where: { chat_id: chatId },
          include: {
            participants: {
              include: {
                User: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    photo_url: true,
                    role: true,
                  },
                },
              },
            },
            messages: {
              orderBy: { created_at: 'desc' },
              take: 1,
              include: {
                User: {
                  select: {
                    id: true,
                    name: true,
                    photo_url: true,
                  },
                },
              },
            },
          },
        });

        return chat;
      }

      // Create new direct chat
      const newChat = await prisma.chat.create({
        data: {
          type: 'direct',
          participants: {
            create: [
              { user_id: user1Id },
              { user_id: user2Id },
            ],
          },
        },
        include: {
          participants: {
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  photo_url: true,
                  role: true,
                },
              },
            },
          },
          messages: true,
        },
      });

      return newChat;
    } catch (error) {
      console.error('Error in getOrCreateDirectChat:', error);
      throw new Error('Failed to create or get direct chat');
    }
  },

  /**
   * Create group chat for a class
   */
  async createGroupChat(classId: string, className: string, tutorId: string) {
    try {
      // Get all valid enrollments for this class
      const enrollments = await prisma.enrolment.findMany({
        where: {
          class_id: classId,
          status: 'valid',
        },
        select: {
          student_id: true,
        },
      });

      // Check if group chat already exists for this class
      const existingChat = await prisma.chat.findFirst({
        where: {
          class_id: classId,
          type: 'group',
        },
      });

      if (existingChat) {
        return existingChat;
      }

      // Create group chat
      const participantData = [
        { user_id: tutorId },
        ...enrollments.map(e => ({
          user_id: e.student_id!,
        })),
      ];

      const chat = await prisma.chat.create({
        data: {
          type: 'group',
          name: `${className} - Class Chat`,
          class_id: classId,
          participants: {
            create: participantData,
          },
        },
        include: {
          participants: {
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  photo_url: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      return chat;
    } catch (error) {
      console.error('Error in createGroupChat:', error);
      throw new Error('Failed to create group chat');
    }
  },

  /**
   * Get all chats for a user
   */
  async getUserChats(userId: string) {
    try {
      const chats = await prisma.chat.findMany({
        where: {
          participants: {
            some: {
              user_id: userId,
            },
          },
        },
        include: {
          participants: {
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  photo_url: true,
                  role: true,
                },
              },
            },
          },
          messages: {
            orderBy: { created_at: 'desc' },
            take: 1,
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  photo_url: true,
                },
              },
            },
          },
        },
        orderBy: {
          updated_at: 'desc',
        },
      });

      // Calculate unread count for each chat
      const chatsWithUnreadCount = await Promise.all(
        chats.map(async (chat) => {
          const unreadCount = await prisma.message.count({
            where: {
              chat_id: chat.chat_id,
              sender_id: { not: userId },
              is_read: false,
            },
          });

          return {
            ...chat,
            unreadCount,
            lastMessage: chat.messages[0] || null,
          };
        })
      );

      return chatsWithUnreadCount;
    } catch (error) {
      console.error('Error in getUserChats:', error);
      throw new Error('Failed to fetch user chats');
    }
  },

  /**
   * Get messages for a specific chat
   */
  async getChatMessages(chatId: string, limit: number = 50, offset: number = 0) {
    try {
      const messages = await prisma.message.findMany({
        where: { chat_id: chatId },
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
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      });

      // Return in chronological order (oldest first)
      return messages.reverse();
    } catch (error) {
      console.error('Error in getChatMessages:', error);
      throw new Error('Failed to fetch chat messages');
    }
  },

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(userId: string) {
    try {
      const count = await prisma.message.count({
        where: {
          chat: {
            participants: {
              some: {
                user_id: userId,
              },
            },
          },
          sender_id: { not: userId },
          is_read: false,
        },
      });

      return count;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      throw new Error('Failed to get unread count');
    }
  },

  /**
   * Get chat details by ID
   */
  async getChatById(chatId: string) {
    try {
      const chat = await prisma.chat.findUnique({
        where: { chat_id: chatId },
        include: {
          participants: {
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  photo_url: true,
                  role: true,
                },
              },
            },
          },
          Class: {
            select: {
              class_id: true,
              title: true,
              subject: true,
            },
          },
        },
      });

      return chat;
    } catch (error) {
      console.error('Error in getChatById:', error);
      throw new Error('Failed to fetch chat details');
    }
  },

  /**
   * Add participant to group chat
   */
  async addParticipant(chatId: string, userId: string) {
    try {
      // Check if already a participant
      const existing = await prisma.chatParticipant.findFirst({
        where: {
          chat_id: chatId,
          user_id: userId,
        },
      });

      if (existing) {
        return existing;
      }

      const participant = await prisma.chatParticipant.create({
        data: {
          chat_id: chatId,
          user_id: userId,
        },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
              photo_url: true,
              role: true,
            },
          },
        },
      });

      return participant;
    } catch (error) {
      console.error('Error in addParticipant:', error);
      throw new Error('Failed to add participant');
    }
  },

  /**
   * Remove participant from group chat
   */
  async removeParticipant(chatId: string, userId: string) {
    try {
      await prisma.chatParticipant.deleteMany({
        where: {
          chat_id: chatId,
          user_id: userId,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error in removeParticipant:', error);
      throw new Error('Failed to remove participant');
    }
  },

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string, userId: string) {
    try {
      // Verify user is the sender
      const message = await prisma.message.findUnique({
        where: { message_id: messageId },
      });

      if (!message || message.sender_id !== userId) {
        throw new Error('Unauthorized to delete this message');
      }

      await prisma.message.delete({
        where: { message_id: messageId },
      });

      return { success: true };
    } catch (error) {
      console.error('Error in deleteMessage:', error);
      throw new Error('Failed to delete message');
    }
  },

  /**
   * Edit a message
   */
  async editMessage(messageId: string, userId: string, newContent: string) {
    try {
      // Verify user is the sender
      const message = await prisma.message.findUnique({
        where: { message_id: messageId },
      });

      if (!message || message.sender_id !== userId) {
        throw new Error('Unauthorized to edit this message');
      }

      const updatedMessage = await prisma.message.update({
        where: { message_id: messageId },
        data: {
          content: newContent,
          edited_at: new Date(),
        },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              photo_url: true,
            },
          },
        },
      });

      return updatedMessage;
    } catch (error) {
      console.error('Error in editMessage:', error);
      throw new Error('Failed to edit message');
    }
  },
};

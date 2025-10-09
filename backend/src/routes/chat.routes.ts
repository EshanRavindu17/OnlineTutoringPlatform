import express from 'express';
import { chatController } from '../controllers/chat.controller';
import { verifyFirebaseToken } from '../middleware/authMiddleware';
import { verifyFirebaseTokenSimple } from '../middleware/authMiddlewareSimple';

const router = express.Router();

// All routes require authentication
router.use(verifyFirebaseTokenSimple);

/**
 * @route   GET /api/chat/chats
 * @desc    Get all chats for authenticated user
 * @access  Private
 */
router.get('/chats', chatController.getUserChats);

/**
 * @route   GET /api/chat/chats/:chatId
 * @desc    Get chat details by ID
 * @access  Private
 */
router.get('/chats/:chatId', chatController.getChatById);

/**
 * @route   GET /api/chat/chats/:chatId/messages
 * @desc    Get messages for a specific chat (with pagination)
 * @query   limit - Number of messages to fetch (default: 50)
 * @query   offset - Offset for pagination (default: 0)
 * @access  Private
 */
router.get('/chats/:chatId/messages', chatController.getChatMessages);

/**
 * @route   POST /api/chat/chats/direct
 * @desc    Create or get direct chat between two users
 * @body    { targetUserId: string }
 * @access  Private
 */
router.post('/chats/direct', chatController.createDirectChat);

/**
 * @route   POST /api/chat/chats/group
 * @desc    Create group chat for a class (Mass tutor only)
 * @body    { classId: string, className: string }
 * @access  Private (Mass tutors only)
 */
router.post('/chats/group', chatController.createGroupChat);

/**
 * @route   GET /api/chat/unread-count
 * @desc    Get unread message count for authenticated user
 * @access  Private
 */
router.get('/unread-count', chatController.getUnreadCount);

/**
 * @route   POST /api/chat/chats/:chatId/participants
 * @desc    Add participant to group chat
 * @body    { userId: string }
 * @access  Private
 */
router.post('/chats/:chatId/participants', chatController.addParticipant);

/**
 * @route   DELETE /api/chat/chats/:chatId/participants/:userId
 * @desc    Remove participant from group chat
 * @access  Private
 */
router.delete('/chats/:chatId/participants/:userId', chatController.removeParticipant);

/**
 * @route   DELETE /api/chat/messages/:messageId
 * @desc    Delete a message (only sender can delete)
 * @access  Private
 */
router.delete('/messages/:messageId', chatController.deleteMessage);

/**
 * @route   PUT /api/chat/messages/:messageId
 * @desc    Edit a message (only sender can edit)
 * @body    { content: string }
 * @access  Private
 */
router.put('/messages/:messageId', chatController.editMessage);

export default router;

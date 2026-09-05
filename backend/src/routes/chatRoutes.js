import express from 'express';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  markAsRead,
  archiveConversation,
  toggleBlockUser,
  reportUser,
  createOffer,
  acceptOffer,
  rejectOffer,
  counterOffer,
  searchChat,
  getUnreadCount,
} from '../controllers/chatController.js';
import {
  createConversationValidation,
  sendMessageValidation,
  offerValidation,
  reportUserValidation,
} from '../validations/chatValidation.js';
import { chatRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Protect all chat routes with JWT Authentication
router.use(authenticateUser);

// Apply rate limiting to prevent spam
router.use(chatRateLimiter);

// Conversations
router.post('/createConversation', createConversationValidation, createConversation);
router.get('/conversations', getConversations);
router.get('/unread-count', getUnreadCount);

// Messages
router.get('/messages/:conversationId', getMessages);
router.post('/send', sendMessageValidation, sendMessage);
router.delete('/delete/:messageId', deleteMessage);

// Conversation Actions
router.patch('/read/:conversationId', markAsRead);
router.patch('/archive/:conversationId', archiveConversation);
router.patch('/block/:userId', toggleBlockUser);

// Moderation & Safety
router.post('/report', reportUserValidation, reportUser);

// Price Offers
router.post('/offer', offerValidation, createOffer);
router.patch('/offer/accept', acceptOffer);
router.patch('/offer/reject', rejectOffer);
router.patch('/offer/counter', counterOffer);

// Search
router.get('/search', searchChat);

export default router;

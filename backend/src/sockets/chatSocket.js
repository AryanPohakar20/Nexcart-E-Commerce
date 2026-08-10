import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/generateTokens.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import logger from '../utils/logger.js';

// Online user sockets map: userId (String) -> Set<socketId>
const onlineUsersMap = new Map();

/**
 * Initialize Socket.IO server with JWT Authentication and Chat Event Handlers
 * @param {import('http').Server} httpServer 
 * @param {Array<String>} allowedOrigins 
 * @returns {Server}
 */
export const initSocketServer = (httpServer, allowedOrigins) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
          callback(null, true);
        } else {
          callback(null, allowedOrigins);
        }
      },
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Socket.IO Middleware for JWT Authentication
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      if (token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
      }

      if (!token) {
        return next(new Error('Authentication token missing.'));
      }

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('_id name email role avatar').lean();

      if (!user) {
        return next(new Error('User account associated with token not found.'));
      }

      socket.user = user;
      socket.userId = user._id.toString();
      next();
    } catch (error) {
      logger.warn(`Socket Authentication failed: ${error.message}`);
      next(new Error('Authentication failed: Invalid or expired token.'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    logger.info(`⚡ Socket Connected: ${socket.id} (User: ${socket.user.name} - ${userId})`);

    // Add user to online registry
    if (!onlineUsersMap.has(userId)) {
      onlineUsersMap.set(userId, new Set());
    }
    onlineUsersMap.get(userId).add(socket.id);

    // Join personal user room for direct user-targeted socket events
    socket.join(`user:${userId}`);

    // Update user online status in DB
    User.findByIdAndUpdate(userId, { online: true, lastSeen: new Date() }).catch(err => {
      logger.error('Failed to set user online state in DB:', err);
    });

    // Broadcast userOnline event to all connected clients
    socket.broadcast.emit('userOnline', {
      userId,
      online: true,
      lastSeen: new Date(),
    });

    // ─────────────────────────────────────────────────────────────────
    // Event: joinConversation
    // ─────────────────────────────────────────────────────────────────
    socket.on('joinConversation', ({ conversationId }) => {
      if (!conversationId) return;
      const room = `conv:${conversationId}`;
      socket.join(room);
      logger.info(`User ${userId} joined room ${room}`);
    });

    // ─────────────────────────────────────────────────────────────────
    // Event: leaveConversation
    // ─────────────────────────────────────────────────────────────────
    socket.on('leaveConversation', ({ conversationId }) => {
      if (!conversationId) return;
      const room = `conv:${conversationId}`;
      socket.leave(room);
      logger.info(`User ${userId} left room ${room}`);
    });

    // ─────────────────────────────────────────────────────────────────
    // Event: typing & stopTyping
    // ─────────────────────────────────────────────────────────────────
    socket.on('typing', ({ conversationId, partnerId }) => {
      if (!conversationId) return;
      socket.to(`conv:${conversationId}`).emit('typing', {
        conversationId,
        userId,
        userName: socket.user.name,
      });
      if (partnerId) {
        io.to(`user:${partnerId}`).emit('typing', {
          conversationId,
          userId,
          userName: socket.user.name,
        });
      }
    });

    socket.on('stopTyping', ({ conversationId, partnerId }) => {
      if (!conversationId) return;
      socket.to(`conv:${conversationId}`).emit('stopTyping', {
        conversationId,
        userId,
      });
      if (partnerId) {
        io.to(`user:${partnerId}`).emit('stopTyping', {
          conversationId,
          userId,
        });
      }
    });

    // ─────────────────────────────────────────────────────────────────
    // Event: sendMessage
    // ─────────────────────────────────────────────────────────────────
    socket.on('sendMessage', async (payload, callback) => {
      try {
        const { conversationId, receiverId, message, messageType, attachments, locationDetails, offerDetails, meetupDetails } = payload;

        if (!conversationId || !receiverId) {
          if (callback) callback({ error: 'conversationId and receiverId are required.' });
          return;
        }

        // Verify conversation & blocking state
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          if (callback) callback({ error: 'Conversation not found.' });
          return;
        }

        if (conversation.isBlocked) {
          if (callback) callback({ error: 'Cannot send messages in a blocked conversation.' });
          return;
        }

        const newMsg = await Message.create({
          conversationId,
          senderId: userId,
          receiverId,
          message: message || '',
          messageType: messageType || 'text',
          attachments: attachments || [],
          locationDetails: locationDetails || undefined,
          offerDetails: offerDetails || undefined,
          meetupDetails: meetupDetails || undefined,
          status: onlineUsersMap.has(receiverId.toString()) ? 'delivered' : 'sent',
        });

        const populatedMsg = await Message.findById(newMsg._id)
          .populate('senderId', '_id name avatar role')
          .populate('receiverId', '_id name avatar role')
          .lean();

        // Update conversation last message & unread count
        const currentUnread = conversation.unreadCount.get(receiverId.toString()) || 0;
        conversation.unreadCount.set(receiverId.toString(), currentUnread + 1);
        conversation.lastMessage = newMsg._id;
        conversation.lastMessageTime = new Date();
        await conversation.save();

        // Emit to conversation room & recipient direct user room
        io.to(`conv:${conversationId}`).emit('receiveMessage', populatedMsg);
        io.to(`user:${receiverId}`).emit('receiveMessage', populatedMsg);

        // Notify recipient of conversation update
        io.to(`user:${receiverId}`).emit('conversationUpdated', {
          conversationId,
          lastMessage: populatedMsg,
          unreadCount: currentUnread + 1,
        });

        // Emit updated global unread count to receiver
        const receiverConvs = await Conversation.find({ participants: receiverId });
        let totalUnread = 0;
        receiverConvs.forEach(c => {
          totalUnread += (c.unreadCount.get(receiverId.toString()) || 0);
        });
        io.to(`user:${receiverId}`).emit('updateTotalUnreadCount', totalUnread);

        if (callback) callback({ success: true, data: populatedMsg });
      } catch (err) {
        logger.error('Socket sendMessage error:', err);
        if (callback) callback({ error: err.message });
      }
    });

    // ─────────────────────────────────────────────────────────────────
    // Event: messageDelivered & messageSeen
    // ─────────────────────────────────────────────────────────────────
    socket.on('messageSeen', async ({ conversationId, messageIds }) => {
      try {
        if (!conversationId) return;

        const updateFilter = messageIds?.length
          ? { _id: { $in: messageIds }, receiverId: userId }
          : { conversationId, receiverId: userId, status: { $ne: 'read' } };

        await Message.updateMany(updateFilter, {
          $set: { status: 'read', seenAt: new Date() },
        });

        // Clear unread count for current user in conversation
        const conv = await Conversation.findById(conversationId);
        if (conv) {
          conv.unreadCount.set(userId, 0);
          await conv.save();
        }

        io.to(`conv:${conversationId}`).emit('messageSeen', {
          conversationId,
          seenBy: userId,
          seenAt: new Date(),
        });

        // Emit updated global unread count to user
        const userConvs = await Conversation.find({ participants: userId });
        let totalUnread = 0;
        userConvs.forEach(c => {
          totalUnread += (c.unreadCount.get(userId.toString()) || 0);
        });
        io.to(`user:${userId}`).emit('updateTotalUnreadCount', totalUnread);
      } catch (err) {
        logger.error('Socket messageSeen error:', err);
      }
    });

    // ─────────────────────────────────────────────────────────────────
    // Event: offerAction (accept, reject, counter)
    // ─────────────────────────────────────────────────────────────────
    socket.on('offerAction', async ({ conversationId, action, messageId, offerId, updatedOffer, systemMsg }) => {
      try {
        if (!conversationId) return;
        io.to(`conv:${conversationId}`).emit('offerUpdated', {
          conversationId,
          action,
          messageId,
          offerId,
          updatedOffer,
          systemMsg,
        });
      } catch (err) {
        logger.error('Socket offerAction error:', err);
      }
    });

    // ─────────────────────────────────────────────────────────────────
    // Event: Disconnect
    // ─────────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      logger.info(`⚡ Socket Disconnected: ${socket.id} (User: ${userId})`);

      const userSockets = onlineUsersMap.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsersMap.delete(userId);
          const lastSeenDate = new Date();

          User.findByIdAndUpdate(userId, { online: false, lastSeen: lastSeenDate }).catch(err => {
            logger.error('Failed to set user offline state in DB:', err);
          });

          socket.broadcast.emit('userOffline', {
            userId,
            online: false,
            lastSeen: lastSeenDate,
          });
        }
      }
    });
  });

  return io;
};

/**
 * Check if a user is currently connected to Socket.IO
 * @param {String} userId 
 * @returns {Boolean}
 */
export const isUserOnline = (userId) => {
  return onlineUsersMap.has(userId.toString()) && onlineUsersMap.get(userId.toString()).size > 0;
};

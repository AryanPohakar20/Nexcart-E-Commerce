import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Offer from '../models/Offer.js';
import Block from '../models/Block.js';
import Report from '../models/Report.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { AppError } from '../middlewares/errorMiddleware.js';

/**
 * @route   POST /api/chat/createConversation
 * @desc    Create or retrieve existing conversation between current user and partner for a product
 * @access  Private (JWT Protected)
 */
export const createConversation = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const { participantId, productId, listingId } = req.body;

  if (currentUserId.toString() === participantId.toString()) {
    throw new AppError('You cannot start a conversation with yourself regarding your own listing.', 400);
  }

  // Check if participant exists
  const partnerUser = await User.findById(participantId).select('_id name firstName lastName username avatar role online lastSeen').lean();
  if (!partnerUser) {
    throw new AppError('Partner user not found.', 404);
  }

  // Search for existing conversation with participants & optional listingId / productId
  const query = {
    participants: { $all: [currentUserId, participantId] },
  };
  if (listingId) {
    query.listingId = listingId;
  } else if (productId) {
    query.productId = productId;
  }

  let conversation = await Conversation.findOne(query)
    .populate('participants', '_id name firstName lastName username avatar role online lastSeen location')
    .populate('lastMessage')
    .populate('productId', '_id title price image category condition status')
    .populate('listingId', '_id title price images category condition status location sellerId')
    .exec();

  if (!conversation) {
    // Check if blocked pair exists
    const blockedPair = await Block.findOne({
      $or: [
        { blocker: currentUserId, blockedUser: participantId },
        { blocker: participantId, blockedUser: currentUserId },
      ],
    });

    conversation = await Conversation.create({
      participants: [currentUserId, participantId],
      productId: productId || null,
      listingId: listingId || null,
      unreadCount: { [currentUserId.toString()]: 0, [participantId.toString()]: 0 },
      isBlocked: !!blockedPair,
      blockedBy: blockedPair ? blockedPair.blocker : null,
    });

    // Populate initial conversation
    conversation = await Conversation.findById(conversation._id)
      .populate('participants', '_id name firstName lastName username avatar role online lastSeen location')
      .populate('productId', '_id title price image category condition status')
      .populate('listingId', '_id title price images category condition status location sellerId')
      .exec();
  }

  res.status(200).json({
    success: true,
    data: conversation,
  });
});

/**
 * @route   GET /api/chat/conversations
 * @desc    Get user conversation list with unread counts, pagination, and archive/pinned state
 * @access  Private
 */
export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { filter = 'all', search } = req.query;

  const matchQuery = {
    participants: userId,
  };

  if (filter === 'archived') {
    matchQuery.archived = userId;
  } else {
    matchQuery.archived = { $ne: userId };
  }

  let conversations = await Conversation.find(matchQuery)
    .populate('participants', '_id name firstName lastName username avatar role online lastSeen location rating reviewCount verified')
    .populate({
      path: 'lastMessage',
      populate: { path: 'senderId receiverId', select: '_id name avatar' },
    })
    .populate('productId', '_id title price image category condition status')
    .populate('listingId', '_id title price images category condition status location sellerId')
    .sort({ updatedAt: -1 })
    .lean()
    .exec();

  // Search filtering if search query provided
  if (search) {
    const searchLower = search.toLowerCase();
    conversations = conversations.filter((conv) => {
      const partner = conv.participants.find((p) => p._id.toString() !== userId.toString());
      const partnerMatch = partner && partner.name.toLowerCase().includes(searchLower);
      const productMatch = conv.productId && conv.productId.title.toLowerCase().includes(searchLower);
      const lastMsgMatch = conv.lastMessage && conv.lastMessage.message && conv.lastMessage.message.toLowerCase().includes(searchLower);
      return partnerMatch || productMatch || lastMsgMatch;
    });
  }

  // Format list for frontend consume
  const formatted = conversations.map((conv) => {
    const partner = conv.participants.find((p) => p._id.toString() !== userId.toString()) || conv.participants[0];
    const isPinned = Array.isArray(conv.pinned) && conv.pinned.some(id => id.toString() === userId.toString());
    const isArchived = Array.isArray(conv.archived) && conv.archived.some(id => id.toString() === userId.toString());
    const unread = conv.unreadCount ? (conv.unreadCount[userId.toString()] || 0) : 0;

    return {
      ...conv,
      partner,
      isPinned,
      isArchived,
      unreadCount: unread,
    };
  });

  res.status(200).json({
    success: true,
    count: formatted.length,
    data: formatted,
  });
});

/**
 * @route   GET /api/chat/messages/:conversationId
 * @desc    Get paginated chat messages for a conversation (30 per page, latest first or offset)
 * @access  Private
 */
export const getMessages = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { conversationId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 30;
  const skip = (page - 1) * limit;

  // Verify membership in conversation
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  }).lean();

  if (!conversation) {
    throw new AppError('Conversation not found or access denied.', 404);
  }

  const query = {
    conversationId,
    deletedForMe: { $ne: userId },
  };

  const totalMessages = await Message.countDocuments(query);
  const messages = await Message.find(query)
    .populate('senderId', '_id name avatar role')
    .populate('receiverId', '_id name avatar role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();

  // Reverse so chronological order is sent to client
  const chronologicalMessages = messages.reverse();

  res.status(200).json({
    success: true,
    pagination: {
      total: totalMessages,
      page,
      limit,
      totalPages: Math.ceil(totalMessages / limit),
      hasMore: skip + messages.length < totalMessages,
    },
    data: chronologicalMessages,
  });
});

/**
 * @route   POST /api/chat/send
 * @desc    Send a new message REST endpoint
 * @access  Private
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { conversationId, receiverId, message, messageType, attachments, locationDetails, offerDetails, meetupDetails } = req.body;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: senderId,
  });

  if (!conversation) {
    throw new AppError('Conversation not found.', 404);
  }

  if (conversation.isBlocked) {
    throw new AppError('Cannot send message. This conversation is blocked.', 403);
  }

  const newMessage = await Message.create({
    conversationId,
    senderId,
    receiverId,
    message: message || '',
    messageType: messageType || 'text',
    attachments: attachments || [],
    locationDetails: locationDetails || undefined,
    offerDetails: offerDetails || undefined,
    meetupDetails: meetupDetails || undefined,
    status: 'sent',
  });

  const populatedMessage = await Message.findById(newMessage._id)
    .populate('senderId', '_id name avatar role')
    .populate('receiverId', '_id name avatar role')
    .lean();

  // Update conversation last message & unread count
  const currentUnread = conversation.unreadCount.get(receiverId.toString()) || 0;
  conversation.unreadCount.set(receiverId.toString(), currentUnread + 1);
  conversation.lastMessage = newMessage._id;
  conversation.lastMessageTime = new Date();
  await conversation.save();

  res.status(201).json({
    success: true,
    data: populatedMessage,
  });
});

/**
 * @route   DELETE /api/chat/delete/:messageId
 * @desc    Delete message for me or delete for everyone
 * @access  Private
 */
export const deleteMessage = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { messageId } = req.params;
  const { deleteType = 'me' } = req.body; // 'me' | 'everyone'

  const message = await Message.findById(messageId);
  if (!message) {
    throw new AppError('Message not found.', 404);
  }

  if (deleteType === 'everyone') {
    if (message.senderId.toString() !== userId.toString()) {
      throw new AppError('You can only delete messages sent by you for everyone.', 403);
    }
    message.deletedForEveryone = true;
    message.message = 'This message was deleted';
    message.attachments = [];
    await message.save();
  } else {
    if (!message.deletedForMe.includes(userId)) {
      message.deletedForMe.push(userId);
      await message.save();
    }
  }

  res.status(200).json({
    success: true,
    message: deleteType === 'everyone' ? 'Message deleted for everyone.' : 'Message deleted for you.',
    data: { messageId, deleteType },
  });
});

/**
 * @route   PATCH /api/chat/read/:conversationId
 * @desc    Mark unread messages in conversation as read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { conversationId } = req.params;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw new AppError('Conversation not found.', 404);
  }

  await Message.updateMany(
    { conversationId, receiverId: userId, status: { $ne: 'read' } },
    { $set: { status: 'read', seenAt: new Date() } }
  );

  conversation.unreadCount.set(userId.toString(), 0);
  await conversation.save();

  res.status(200).json({
    success: true,
    message: 'Conversation marked as read.',
  });
});

/**
 * @route   PATCH /api/chat/archive/:conversationId
 * @desc    Toggle archive status for a conversation
 * @access  Private
 */
export const archiveConversation = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { conversationId } = req.params;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw new AppError('Conversation not found.', 404);
  }

  const archivedIndex = conversation.archived.indexOf(userId);
  if (archivedIndex > -1) {
    conversation.archived.splice(archivedIndex, 1);
  } else {
    conversation.archived.push(userId);
  }

  await conversation.save();

  res.status(200).json({
    success: true,
    message: archivedIndex > -1 ? 'Conversation unarchived.' : 'Conversation archived.',
    archived: archivedIndex === -1,
  });
});

/**
 * @route   PATCH /api/chat/block/:userId
 * @desc    Block or unblock a user
 * @access  Private
 */
export const toggleBlockUser = asyncHandler(async (req, res) => {
  const blockerId = req.user._id;
  const targetUserId = req.params.userId;

  if (blockerId.toString() === targetUserId.toString()) {
    throw new AppError('You cannot block yourself.', 400);
  }

  const existingBlock = await Block.findOne({ blocker: blockerId, blockedUser: targetUserId });
  let isBlockedNow = false;

  if (existingBlock) {
    await Block.deleteOne({ _id: existingBlock._id });
    isBlockedNow = false;
  } else {
    await Block.create({ blocker: blockerId, blockedUser: targetUserId });
    isBlockedNow = true;
  }

  // Update conversations involving these two users
  const conversations = await Conversation.find({
    participants: { $all: [blockerId, targetUserId] },
  });

  for (const conv of conversations) {
    conv.isBlocked = isBlockedNow;
    conv.blockedBy = isBlockedNow ? blockerId : null;
    await conv.save();
  }

  res.status(200).json({
    success: true,
    message: isBlockedNow ? 'User blocked successfully.' : 'User unblocked successfully.',
    isBlocked: isBlockedNow,
  });
});

/**
 * @route   POST /api/chat/report
 * @desc    Report a user for safety/misconduct review
 * @access  Private
 */
export const reportUser = asyncHandler(async (req, res) => {
  const reportedBy = req.user._id;
  const { reportedUserId, conversationId, reason, description } = req.body;

  const report = await Report.create({
    reportedBy,
    reportedUser: reportedUserId,
    conversationId: conversationId || undefined,
    reason,
    description: description || '',
  });

  res.status(201).json({
    success: true,
    message: 'Report submitted successfully to Safety & Moderation Team.',
    data: report,
  });
});

/**
 * @route   POST /api/chat/offer
 * @desc    Create a 1-click price offer
 * @access  Private
 */
export const createOffer = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { conversationId, sellerId, productId, offerPrice, originalPrice, note } = req.body;

  // Deactivate previous active offers for this conversation
  await Offer.updateMany({ conversationId, active: true }, { $set: { active: false } });

  const offer = await Offer.create({
    conversationId,
    buyerId,
    sellerId,
    productId: productId || undefined,
    offerPrice,
    originalPrice: originalPrice || offerPrice,
    status: 'pending',
    active: true,
  });

  // Create offer message in chat
  const messageText = note ? `Price Offer: $${offerPrice}. Note: "${note}"` : `Submitted a price offer of $${offerPrice}.00`;
  const message = await Message.create({
    conversationId,
    senderId: buyerId,
    receiverId: sellerId,
    message: messageText,
    messageType: 'offer',
    offerDetails: {
      offerId: offer._id,
      offerPrice,
      originalPrice: originalPrice || offerPrice,
      status: 'pending',
      proposedBy: buyerId,
    },
  });

  offer.messageId = message._id;
  await offer.save();

  res.status(201).json({
    success: true,
    data: { offer, message },
  });
});

/**
 * @route   PATCH /api/chat/offer/accept
 * @desc    Accept a price offer
 * @access  Private
 */
export const acceptOffer = asyncHandler(async (req, res) => {
  const { offerId, messageId } = req.body;

  const offer = await Offer.findById(offerId);
  if (!offer) {
    throw new AppError('Offer not found.', 404);
  }

  offer.status = 'accepted';
  await offer.save();

  if (messageId) {
    await Message.findByIdAndUpdate(messageId, {
      'offerDetails.status': 'accepted',
    });
  }

  // Create system notification message
  const systemMsg = await Message.create({
    conversationId: offer.conversationId,
    senderId: req.user._id,
    receiverId: offer.buyerId.toString() === req.user._id.toString() ? offer.sellerId : offer.buyerId,
    message: `🎉 Price Offer of $${offer.offerPrice} accepted! Proceed to schedule a meetup.`,
    messageType: 'system',
  });

  res.status(200).json({
    success: true,
    message: 'Offer accepted successfully.',
    data: { offer, systemMsg },
  });
});

/**
 * @route   PATCH /api/chat/offer/reject
 * @desc    Reject a price offer
 * @access  Private
 */
export const rejectOffer = asyncHandler(async (req, res) => {
  const { offerId, messageId } = req.body;

  const offer = await Offer.findById(offerId);
  if (!offer) {
    throw new AppError('Offer not found.', 404);
  }

  offer.status = 'rejected';
  offer.active = false;
  await offer.save();

  if (messageId) {
    await Message.findByIdAndUpdate(messageId, {
      'offerDetails.status': 'rejected',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Offer rejected.',
    data: offer,
  });
});

/**
 * @route   PATCH /api/chat/offer/counter
 * @desc    Counter a price offer
 * @access  Private
 */
export const counterOffer = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { offerId, messageId, counterPrice, note } = req.body;

  const offer = await Offer.findById(offerId);
  if (!offer) {
    throw new AppError('Offer not found.', 404);
  }

  const receiverId = offer.buyerId.toString() === senderId.toString() ? offer.sellerId : offer.buyerId;

  offer.status = 'countered';
  offer.counterOffers.push({
    price: counterPrice,
    proposedBy: senderId,
    createdAt: new Date(),
  });
  await offer.save();

  if (messageId) {
    await Message.findByIdAndUpdate(messageId, {
      'offerDetails.status': 'countered',
    });
  }

  const messageText = note ? `Counter Offer: $${counterPrice}. Note: "${note}"` : `Submitted a counter offer of $${counterPrice}.00`;
  const newMessage = await Message.create({
    conversationId: offer.conversationId,
    senderId,
    receiverId,
    message: messageText,
    messageType: 'offer',
    offerDetails: {
      offerId: offer._id,
      offerPrice: counterPrice,
      originalPrice: offer.originalPrice,
      status: 'pending',
      proposedBy: senderId,
    },
  });

  const populatedMessage = await Message.findById(newMessage._id)
    .populate('senderId', '_id name avatar role')
    .populate('receiverId', '_id name avatar role')
    .lean();

  const conversation = await Conversation.findById(offer.conversationId);
  if (conversation) {
    const currentUnread = conversation.unreadCount.get(receiverId.toString()) || 0;
    conversation.unreadCount.set(receiverId.toString(), currentUnread + 1);
    conversation.lastMessage = newMessage._id;
    conversation.lastMessageTime = new Date();
    await conversation.save();
  }

  res.status(200).json({
    success: true,
    message: 'Counter offer submitted.',
    data: { offer, message: populatedMessage },
  });
});

/**
 * @route   GET /api/chat/search
 * @desc    Search across chat messages, conversations, and products
 * @access  Private
 */
export const searchChat = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { q } = req.query;

  if (!q || q.trim() === '') {
    return res.status(200).json({ success: true, data: { messages: [], conversations: [] } });
  }

  const regex = new RegExp(q, 'i');

  // Find user's conversation IDs
  const userConversations = await Conversation.find({ participants: userId }).select('_id').lean();
  const convIds = userConversations.map((c) => c._id);

  // Search messages in user's conversations
  const matchingMessages = await Message.find({
    conversationId: { $in: convIds },
    message: { $regex: regex },
    deletedForMe: { $ne: userId },
  })
    .populate('senderId', '_id name avatar')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  res.status(200).json({
    success: true,
    data: {
      messages: matchingMessages,
    },
  });
});

/**
 * @route   GET /api/chat/unread-count
 * @desc    Get total unread message count across all conversations
 * @access  Private
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Conversation.find({ participants: userId }).lean();
  let totalUnread = 0;
  conversations.forEach((conv) => {
    if (conv.unreadCount && conv.unreadCount[userId.toString()]) {
      totalUnread += conv.unreadCount[userId.toString()];
    }
  });

  res.status(200).json({
    success: true,
    count: totalUnread,
  });
});

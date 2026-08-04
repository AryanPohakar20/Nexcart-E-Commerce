import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import { normalizeNotificationPayload } from '../helpers/notificationHelpers.js';
import logger from '../../utils/logger.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const buildResult = (statusCode, success, message, data = null, meta = null, errors = []) => {
  const payload = {
    success,
    statusCode,
    message,
  };

  if (data !== null && data !== undefined) {
    payload.data = data;
  }

  if (meta) {
    payload.meta = meta;
  }

  if (errors && errors.length > 0) {
    payload.errors = errors;
  }

  return payload;
};

const normalizePagination = (options = {}) => {
  const page = Math.max(1, Number(options.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(options.limit) || DEFAULT_LIMIT));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const getActorId = (actor = {}) => actor?.id || actor?._id || null;

const enforceOwnership = (notification, actor = {}) => {
  if (!notification) {
    return {
      allowed: false,
      error: buildResult(404, false, 'Notification not found'),
    };
  }

  const actorId = getActorId(actor);
  const receiverId = notification.receiver?.toString();

  if (!actorId) {
    return {
      allowed: false,
      error: buildResult(401, false, 'Authentication required to access notifications'),
    };
  }

  if (receiverId !== actorId) {
    return {
      allowed: false,
      error: buildResult(403, false, 'You are not authorized to access this notification'),
    };
  }

  return { allowed: true };
};

const buildNotificationQuery = (actor, options = {}) => {
  const actorId = getActorId(actor);
  if (!actorId) {
    return null;
  }

  const query = {
    receiver: actorId,
    isDeleted: false,
  };

  if (options.category) {
    query.category = options.category;
  }

  if (options.type) {
    query.type = options.type;
  }

  if (options.priority) {
    query.priority = options.priority;
  }

  if (options.status) {
    if (options.status === 'read') {
      query.isRead = true;
    } else if (options.status === 'unread') {
      query.isRead = false;
    }
  }

  if (options.isRead !== undefined) {
    query.isRead = Boolean(options.isRead);
  }

  if (options.startDate || options.endDate) {
    query.createdAt = {};
    if (options.startDate) {
      query.createdAt.$gte = new Date(options.startDate);
    }
    if (options.endDate) {
      query.createdAt.$lte = new Date(options.endDate);
    }
  }

  const filters = [];

  if (options.search) {
    filters.push({
      $or: [
        { title: { $regex: options.search, $options: 'i' } },
        { message: { $regex: options.search, $options: 'i' } },
      ],
    });
  }

  if (options.includeExpired !== true) {
    filters.push({
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    });
  }

  if (filters.length > 0) {
    query.$and = filters;
  }

  return query;
};

const buildSortOptions = (sortBy = 'newest', order = 'desc') => {
  const normalizedOrder = order === 'asc' ? 1 : -1;

  switch (sortBy) {
    case 'oldest':
      return { createdAt: 1 };
    case 'priority':
      return {
        priorityOrder: normalizedOrder,
        createdAt: -1,
      };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
};

export const createNotificationService = async (payload, actor = {}) => {
  try {
    if (!payload || typeof payload !== 'object') {
      return buildResult(400, false, 'Notification payload is required');
    }

    if (!payload.receiver) {
      return buildResult(400, false, 'Notification receiver is required');
    }

    if (!mongoose.isValidObjectId(payload.receiver)) {
      return buildResult(400, false, 'Notification receiver must be a valid MongoDB ObjectId');
    }

    const data = normalizeNotificationPayload(payload);
    const notification = await Notification.create(data);

    logger.info(`Notification created for receiver ${payload.receiver}`);
    return buildResult(201, true, 'Notification created successfully', notification);
  } catch (error) {
    logger.error(`Failed to create notification: ${error.message}`);
    return buildResult(500, false, 'Failed to create notification', null, null, [error.message]);
  }
};

export const createBulkNotificationsService = async (payloads = [], actor = {}) => {
  try {
    if (!Array.isArray(payloads) || payloads.length === 0) {
      return buildResult(400, false, 'At least one notification payload is required');
    }

    const invalidPayload = payloads.find((payload) => !payload?.receiver || !mongoose.isValidObjectId(payload.receiver));
    if (invalidPayload) {
      return buildResult(400, false, 'Each notification must include a valid receiver');
    }

    const normalizedPayloads = payloads.map((payload) => normalizeNotificationPayload(payload));
    const notifications = await Notification.insertMany(normalizedPayloads);

    logger.info(`Created ${notifications.length} notifications`);
    return buildResult(201, true, 'Notifications created successfully', notifications, {
      count: notifications.length,
    });
  } catch (error) {
    logger.error(`Failed to create bulk notifications: ${error.message}`);
    return buildResult(500, false, 'Failed to create bulk notifications', null, null, [error.message]);
  }
};

export const getNotificationsService = async (actor = {}, options = {}) => {
  try {
    const actorId = getActorId(actor);
    if (!actorId) {
      return buildResult(401, false, 'Authentication required to fetch notifications');
    }

    const requestedReceiver = options.receiverId || actorId;
    if (requestedReceiver && requestedReceiver.toString() !== actorId.toString()) {
      return buildResult(403, false, 'You are not authorized to access these notifications');
    }

    const { page, limit, skip } = normalizePagination(options);
    const query = buildNotificationQuery(actor, options);

    if (!query) {
      return buildResult(401, false, 'Authentication required to fetch notifications');
    }

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
    ]);

    return buildResult(200, true, 'Notifications fetched successfully', notifications, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(`Failed to fetch notifications: ${error.message}`);
    return buildResult(500, false, 'Failed to fetch notifications', null, null, [error.message]);
  }
};

export const getNotificationByIdService = async (notificationId, actor = {}) => {
  try {
    const notification = await Notification.findById(notificationId).lean();
    const ownership = enforceOwnership(notification, actor);

    if (!ownership.allowed) {
      return ownership.error;
    }

    if (!notification) {
      return buildResult(404, false, 'Notification not found');
    }

    return buildResult(200, true, 'Notification fetched successfully', notification);
  } catch (error) {
    logger.error(`Failed to fetch notification: ${error.message}`);
    return buildResult(500, false, 'Failed to fetch notification', null, null, [error.message]);
  }
};

export const getUnreadNotificationsService = async (actor = {}) => {
  try {
    const actorId = getActorId(actor);
    if (!actorId) {
      return buildResult(401, false, 'Authentication required to fetch unread notifications');
    }

    const notifications = await Notification.find({
      receiver: actorId,
      isRead: false,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    return buildResult(200, true, 'Unread notifications fetched successfully', notifications);
  } catch (error) {
    logger.error(`Failed to fetch unread notifications: ${error.message}`);
    return buildResult(500, false, 'Failed to fetch unread notifications', null, null, [error.message]);
  }
};

export const markNotificationAsReadService = async (notificationId, actor = {}) => {
  try {
    const notification = await Notification.findById(notificationId);
    const ownership = enforceOwnership(notification, actor);

    if (!ownership.allowed) {
      return ownership.error;
    }

    if (!notification) {
      return buildResult(404, false, 'Notification not found');
    }

    if (notification.isRead) {
      return buildResult(200, true, 'Notification is already marked as read', notification);
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    logger.info(`Notification ${notificationId} marked as read`);
    return buildResult(200, true, 'Notification marked as read successfully', updatedNotification);
  } catch (error) {
    logger.error(`Failed to mark notification as read: ${error.message}`);
    return buildResult(500, false, 'Failed to mark notification as read', null, null, [error.message]);
  }
};

export const markAllNotificationsAsReadService = async (actor = {}, options = {}) => {
  try {
    const actorId = getActorId(actor);
    if (!actorId) {
      return buildResult(401, false, 'Authentication required to update notifications');
    }

    const query = {
      receiver: actorId,
      isDeleted: false,
      isRead: false,
    };

    if (options.category) {
      query.category = options.category;
    }

    if (options.type) {
      query.type = options.type;
    }

    const result = await Notification.updateMany(query, {
      isRead: true,
      readAt: new Date(),
    });

    logger.info(`Marked ${result.modifiedCount} notifications as read for ${actorId}`);
    return buildResult(200, true, 'Notifications marked as read successfully', null, {
      count: result.modifiedCount,
    });
  } catch (error) {
    logger.error(`Failed to mark notifications as read: ${error.message}`);
    return buildResult(500, false, 'Failed to mark notifications as read', null, null, [error.message]);
  }
};

export const deleteNotificationService = async (notificationId, actor = {}) => {
  try {
    const notification = await Notification.findById(notificationId);
    const ownership = enforceOwnership(notification, actor);

    if (!ownership.allowed) {
      return ownership.error;
    }

    if (!notification) {
      return buildResult(404, false, 'Notification not found');
    }

    if (notification.isDeleted) {
      return buildResult(200, true, 'Notification already deleted', notification);
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    logger.info(`Notification ${notificationId} deleted`);
    return buildResult(200, true, 'Notification deleted successfully', updatedNotification);
  } catch (error) {
    logger.error(`Failed to delete notification: ${error.message}`);
    return buildResult(500, false, 'Failed to delete notification', null, null, [error.message]);
  }
};

export const deleteAllReadNotificationsService = async (actor = {}) => {
  try {
    const actorId = getActorId(actor);
    if (!actorId) {
      return buildResult(401, false, 'Authentication required to delete notifications');
    }

    const result = await Notification.updateMany(
      {
        receiver: actorId,
        isRead: true,
        isDeleted: false,
      },
      {
        isDeleted: true,
        deletedAt: new Date(),
      }
    );

    logger.info(`Soft deleted ${result.modifiedCount} read notifications for ${actorId}`);
    return buildResult(200, true, 'Read notifications deleted successfully', null, {
      count: result.modifiedCount,
    });
  } catch (error) {
    logger.error(`Failed to delete read notifications: ${error.message}`);
    return buildResult(500, false, 'Failed to delete read notifications', null, null, [error.message]);
  }
};

export const getUnreadCountService = async (actor = {}) => {
  try {
    const actorId = getActorId(actor);
    if (!actorId) {
      return buildResult(401, false, 'Authentication required to fetch unread counts');
    }

    const count = await Notification.countDocuments({
      receiver: actorId,
      isRead: false,
      isDeleted: false,
    });

    return buildResult(200, true, 'Unread count fetched successfully', null, {
      count,
    });
  } catch (error) {
    logger.error(`Failed to fetch unread count: ${error.message}`);
    return buildResult(500, false, 'Failed to fetch unread count', null, null, [error.message]);
  }
};

export const getNotificationsByCategoryService = async (actor = {}, category, options = {}) => {
  try {
    const actorId = getActorId(actor);
    if (!actorId) {
      return buildResult(401, false, 'Authentication required to fetch notifications');
    }

    const { page, limit, skip } = normalizePagination(options);
    const query = buildNotificationQuery(actor, { ...options, category });

    if (!query) {
      return buildResult(401, false, 'Authentication required to fetch notifications');
    }

    const sortOptions = buildSortOptions(options.sortBy || options.sort, options.order);
    const notificationsQuery = Notification.find(query);

    if (sortOptions && Object.keys(sortOptions).length > 0) {
      notificationsQuery.sort(sortOptions);
    }

    const [notifications, total] = await Promise.all([
      notificationsQuery.skip(skip).limit(limit).lean(),
      Notification.countDocuments(query),
    ]);

    return buildResult(200, true, 'Notifications fetched by category successfully', notifications, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(`Failed to fetch notifications by category: ${error.message}`);
    return buildResult(500, false, 'Failed to fetch notifications by category', null, null, [error.message]);
  }
};

export const getNotificationsByTypeService = async (actor = {}, type, options = {}) => {
  try {
    const actorId = getActorId(actor);
    if (!actorId) {
      return buildResult(401, false, 'Authentication required to fetch notifications');
    }

    const { page, limit, skip } = normalizePagination(options);
    const query = buildNotificationQuery(actor, { ...options, type });

    if (!query) {
      return buildResult(401, false, 'Authentication required to fetch notifications');
    }

    const sortOptions = buildSortOptions(options.sortBy || options.sort, options.order);
    const notificationsQuery = Notification.find(query);

    if (sortOptions && Object.keys(sortOptions).length > 0) {
      notificationsQuery.sort(sortOptions);
    }

    const [notifications, total] = await Promise.all([
      notificationsQuery.skip(skip).limit(limit).lean(),
      Notification.countDocuments(query),
    ]);

    return buildResult(200, true, 'Notifications fetched by type successfully', notifications, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(`Failed to fetch notifications by type: ${error.message}`);
    return buildResult(500, false, 'Failed to fetch notifications by type', null, null, [error.message]);
  }
};

export const removeExpiredNotificationsService = async (actor = {}) => {
  try {
    const actorId = getActorId(actor);
    const query = {
      isDeleted: false,
      expiresAt: { $lte: new Date() },
    };

    if (actorId) {
      query.receiver = actorId;
    }

    const result = await Notification.updateMany(query, {
      isDeleted: true,
      deletedAt: new Date(),
    });

    logger.info(`Soft deleted ${result.modifiedCount} expired notifications`);
    return buildResult(200, true, 'Expired notifications removed successfully', null, {
      count: result.modifiedCount,
    });
  } catch (error) {
    logger.error(`Failed to remove expired notifications: ${error.message}`);
    return buildResult(500, false, 'Failed to remove expired notifications', null, null, [error.message]);
  }
};

export const softDeleteNotificationService = deleteNotificationService;

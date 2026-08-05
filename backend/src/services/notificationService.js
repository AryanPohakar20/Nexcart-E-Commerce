// src/services/notificationService.js
// Platform & Admin notification management service.

import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import * as auditLogRepo from '../repositories/auditLogRepository.js';
import { ApiError } from '../utils/ApiError.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

export const NOTIFICATION_TYPES = Object.freeze([
  'Promotion',
  'Offer',
  'Discount',
  'Recommendation',
  'Announcement',
  'Order Update',
  'System Alert',
  'Custom',
]);

export const PUBLISH_STATUSES = Object.freeze(['draft', 'scheduled', 'published', 'unpublished']);

const notificationPopulate = { path: 'createdBy', select: 'firstName lastName email avatar role' };

const audit = (admin, action, target, targetId, remarks = '', ipAddress = null, status = 'success') => {
  if (!admin?._id) return Promise.resolve();

  return auditLogRepo.createLog({
    admin: admin._id,
    adminName: `${admin.firstName || ''} ${admin.lastName || ''}`.trim(),
    action,
    module: 'Notifications',
    target,
    targetId,
    remarks,
    ipAddress,
    status,
  }).catch(() => {});
};

const normalizeId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid notification id.');
  }
};

const resolveLegacyType = (notificationType) => {
  switch (notificationType) {
    case 'System Alert':
      return 'system';
    case 'Order Update':
      return 'order';
    case 'Announcement':
      return 'platform';
    case 'Promotion':
    case 'Offer':
    case 'Discount':
    case 'Recommendation':
    case 'Custom':
    default:
      return 'platform';
  }
};

const resolveRecipientRole = (targetAudience) => {
  const audience = String(targetAudience || '').toLowerCase();

  if (audience.includes('seller')) return 'seller';
  if (audience.includes('customer') || audience.includes('user')) return 'customer';
  if (audience.includes('admin')) return 'admin';
  return 'all';
};

const toDateOrNull = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `${fieldName} must be a valid date.`);
  }

  return date;
};

const ensureNotification = async (id) => {
  normalizeId(id);

  const notification = await Notification.findById(id).populate(notificationPopulate).lean();
  if (!notification) {
    throw new ApiError(404, 'Notification not found.');
  }

  return notification;
};

const buildFilter = (queryParams = {}) => {
  const filter = {};
  const search = (queryParams.search || queryParams.q || '').trim();

  if (queryParams.tab === 'unread') {
    filter.read = false;
  } else if (queryParams.tab && queryParams.tab !== 'all') {
    filter.publishStatus = queryParams.tab;
  }

  if (queryParams.notificationType && queryParams.notificationType !== 'all') {
    filter.notificationType = queryParams.notificationType;
  }

  if (queryParams.type && queryParams.type !== 'all') {
    filter.type = queryParams.type;
  }

  if (queryParams.priority) {
    filter.priority = queryParams.priority;
  }

  if (queryParams.publishStatus) {
    filter.publishStatus = queryParams.publishStatus;
  }

  if (queryParams.targetAudience) {
    filter.targetAudience = queryParams.targetAudience;
  }

  if (queryParams.createdBy) {
    if (!mongoose.isValidObjectId(queryParams.createdBy)) {
      throw new ApiError(400, 'Invalid createdBy filter.');
    }
    filter.createdBy = queryParams.createdBy;
  }

  if (queryParams.read !== undefined) {
    filter.read = String(queryParams.read) === 'true';
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } },
      { targetAudience: { $regex: search, $options: 'i' } },
    ];
  }

  return filter;
};

const hydrateNotification = async (notificationId) => {
  return await Notification.findById(notificationId).populate(notificationPopulate).lean();
};

/**
 * Fetch notifications with filtering and unread counter.
 */
export const getNotifications = async (queryParams = {}) => {
  const { page, limit, skip, sort } = parsePagination(queryParams);
  const filter = buildFilter(queryParams);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate(notificationPopulate)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ read: false }),
  ]);

  return {
    notifications,
    pagination: buildPaginationMeta(total, page, limit),
    unreadCount,
  };
};

export const listNotifications = getNotifications;

/**
 * Get total unread notifications count.
 */
export const getUnreadCount = async () => {
  return await Notification.countDocuments({ read: false });
};

/**
 * Get a notification by ID.
 */
export const getNotificationById = async (id) => {
  return await ensureNotification(id);
};

/**
 * Mark a single notification as read.
 */
export const markNotificationRead = async (id) => {
  normalizeId(id);

  const notification = await Notification.findByIdAndUpdate(
    id,
    { read: true, readAt: new Date() },
    { new: true }
  ).populate(notificationPopulate).lean();

  if (!notification) {
    throw new ApiError(404, 'Notification not found.');
  }

  return notification;
};

/**
 * Mark all notifications as read.
 */
export const markAllNotificationsRead = async () => {
  await Notification.updateMany({ read: false }, { read: true, readAt: new Date() });
  return { success: true };
};

/**
 * Create a new admin notification.
 */
export const createNotification = async (payload, admin, ipAddress = null) => {
  const notificationType = payload.notificationType || 'Announcement';
  const title = String(payload.title || '').trim();
  const message = String(payload.message || '').trim();
  const targetAudience = String(payload.targetAudience || 'all').trim();
  const scheduledAt = toDateOrNull(payload.scheduledAt, 'scheduledAt');
  const expiresAt = toDateOrNull(payload.expiresAt, 'expiresAt');
  const publishStatus = payload.publishStatus || (scheduledAt ? 'scheduled' : 'draft');

  if (!NOTIFICATION_TYPES.includes(notificationType)) {
    throw new ApiError(400, 'Invalid notification type.');
  }

  if (!PUBLISH_STATUSES.includes(publishStatus)) {
    throw new ApiError(400, 'Invalid publish status.');
  }

  if (!title) {
    throw new ApiError(400, 'Title is required.');
  }

  if (!message) {
    throw new ApiError(400, 'Message is required.');
  }

  if (expiresAt && scheduledAt && expiresAt <= scheduledAt) {
    throw new ApiError(400, 'expiresAt must be later than scheduledAt.');
  }

  const storedNotification = await Notification.create({
    type: resolveLegacyType(notificationType),
    title,
    message,
    notificationType,
    targetAudience,
    priority: payload.priority || 'normal',
    publishStatus,
    scheduledAt,
    expiresAt,
    publishedAt: publishStatus === 'published' ? new Date() : null,
    image: payload.image || '',
    actionUrl: payload.actionUrl || '',
    createdBy: admin?._id || null,
    recipientRole: resolveRecipientRole(targetAudience),
    link: payload.actionUrl || '',
    read: false,
    readAt: null,
    metadata: payload.metadata || {},
  });

  const notification = await hydrateNotification(storedNotification._id);
  audit(admin, 'CREATE_NOTIFICATION', notification.title, notification._id, JSON.stringify({ notificationType, targetAudience, publishStatus }), ipAddress);
  return notification;
};

/**
 * Update an existing notification.
 */
export const updateNotification = async (id, payload, admin, ipAddress = null) => {
  const notification = await ensureNotification(id);
  const updates = {};

  if (payload.title !== undefined) updates.title = String(payload.title).trim();
  if (payload.message !== undefined) updates.message = String(payload.message).trim();

  if (payload.notificationType !== undefined) {
    if (!NOTIFICATION_TYPES.includes(payload.notificationType)) {
      throw new ApiError(400, 'Invalid notification type.');
    }
    updates.notificationType = payload.notificationType;
    updates.type = resolveLegacyType(payload.notificationType);
  }

  if (payload.targetAudience !== undefined) {
    updates.targetAudience = payload.targetAudience.trim();
    updates.recipientRole = resolveRecipientRole(payload.targetAudience);
  }

  if (payload.priority !== undefined) updates.priority = payload.priority;
  if (payload.scheduledAt !== undefined) updates.scheduledAt = toDateOrNull(payload.scheduledAt, 'scheduledAt');
  if (payload.expiresAt !== undefined) updates.expiresAt = toDateOrNull(payload.expiresAt, 'expiresAt');
  if (payload.image !== undefined) updates.image = payload.image || '';
  if (payload.actionUrl !== undefined) {
    updates.actionUrl = payload.actionUrl || '';
    updates.link = payload.actionUrl || '';
  }
  if (payload.metadata !== undefined) updates.metadata = payload.metadata;

  if (updates.scheduledAt && updates.expiresAt && updates.expiresAt <= updates.scheduledAt) {
    throw new ApiError(400, 'expiresAt must be later than scheduledAt.');
  }

  if (payload.publishStatus !== undefined) {
    throw new ApiError(400, 'Use publish/unpublish endpoints to change publish status.');
  }

  Object.assign(notification, updates);
  await notification.save();

  const updated = await hydrateNotification(notification._id);
  audit(admin, 'UPDATE_NOTIFICATION', updated.title, updated._id, JSON.stringify(updates), ipAddress);
  return updated;
};

/**
 * Publish a notification.
 */
export const publishNotification = async (id, admin, ipAddress = null) => {
  normalizeId(id);

  const notification = await Notification.findById(id);
  if (!notification) {
    throw new ApiError(404, 'Notification not found.');
  }

  if (notification.expiresAt && notification.expiresAt < new Date()) {
    throw new ApiError(400, 'Cannot publish an expired notification.');
  }

  notification.publishStatus = 'published';
  notification.publishedAt = new Date();
  await notification.save();

  const updated = await hydrateNotification(notification._id);
  audit(admin, 'PUBLISH_NOTIFICATION', updated.title, updated._id, '', ipAddress);
  return updated;
};

/**
 * Unpublish a notification.
 */
export const unpublishNotification = async (id, admin, ipAddress = null) => {
  normalizeId(id);

  const notification = await Notification.findById(id);
  if (!notification) {
    throw new ApiError(404, 'Notification not found.');
  }

  notification.publishStatus = 'unpublished';
  await notification.save();

  const updated = await hydrateNotification(notification._id);
  audit(admin, 'UNPUBLISH_NOTIFICATION', updated.title, updated._id, '', ipAddress);
  return updated;
};

/**
 * Delete a notification.
 */
export const deleteNotification = async (id, admin, ipAddress = null) => {
  const notification = await ensureNotification(id);
  await Notification.deleteOne({ _id: id });
  audit(admin, 'DELETE_NOTIFICATION', notification.title, notification._id, '', ipAddress);
  return notification;
};

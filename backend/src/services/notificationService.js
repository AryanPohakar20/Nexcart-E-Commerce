// src/services/notificationService.js
// Platform & Admin notification management service.

import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import * as auditLogRepo from '../repositories/auditLogRepository.js';
import { ApiError } from '../utils/ApiError.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

export const NOTIFICATION_TYPES = Object.freeze([
  'Success',
  'Warning',
  'Error',
  'Information',
  'Announcement',
  'Promotion',
  'Offer',
  'Discount',
  'Recommendation',
  'Order Update',
  'Seller Update',
  'Product Update',
  'Account Alert',
  'Security Alert',
  'Maintenance',
  'System Alert',
  'System Update',
  'Custom',
]);

export const PUBLISH_STATUSES = Object.freeze(['draft', 'scheduled', 'published', 'unpublished']);

/**
 * Internal application routes that a notification actionUrl may point to.
 * actionUrl is deliberately restricted to these routes; absolute URLs,
 * protocol-relative URLs and any other external link are rejected.
 */
export const INTERNAL_ACTION_ROUTES = Object.freeze([
  '/',
  '/products',
  '/product/',
  '/categories',
  '/category/',
  '/search',
  '/wishlist',
  '/cart',
  '/checkout',
  '/orders',
  '/order-details/',
  '/order-success/',
  '/track-order/',
  '/profile',
  '/account',
  '/addresses',
  '/notifications',
  '/promotion',
  '/about',
  '/contact',
  '/faq',
  '/privacy',
  '/terms',
  '/login',
  '/register',
  '/seller/become-seller',
  '/seller/',
]);

/**
 * Validate that an actionUrl is a safe, internal, application-relative path.
 * Returns true when value is empty (actionUrl is optional).
 */
export const isValidInternalActionUrl = (value) => {
  if (value === undefined || value === null || value === '') return true;

  const url = String(value).trim();
  if (!url.startsWith('/') || url.startsWith('//')) return false;
  if (url.includes('://') || url.includes('..')) return false;
  if (/[\s<>"'\\]/.test(url)) return false;
  if (/(?:javascript|vbscript|data|mailto):/i.test(url)) return false;

  return INTERNAL_ACTION_ROUTES.some((route) => url === route || url.startsWith(route));
};

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
    case 'Maintenance':
    case 'System Update':
    case 'Seller Update':
      return 'system';
    case 'Order Update':
      return 'order';
    case 'Warning':
    case 'Error':
    case 'Security Alert':
    case 'Account Alert':
      return 'alert';
    case 'Product Update':
      return 'inventory';
    case 'Announcement':
    case 'Success':
    case 'Information':
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

  if (queryParams.startDate || queryParams.endDate) {
    filter.createdAt = {};

    if (queryParams.startDate) {
      const startDate = new Date(queryParams.startDate);
      if (Number.isNaN(startDate.getTime())) {
        throw new ApiError(400, 'startDate must be a valid date.');
      }
      filter.createdAt.$gte = startDate;
    }

    if (queryParams.endDate) {
      const endDate = new Date(queryParams.endDate);
      if (Number.isNaN(endDate.getTime())) {
        throw new ApiError(400, 'endDate must be a valid date.');
      }
      endDate.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = endDate;
    }
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

const toAudienceValue = (recipients) => recipients && recipients.length > 0 ? 'specific users' : null;

const sanitizeRecipientList = (value) => {
  if (value === undefined || value === null || value === '') return [];
  const list = Array.isArray(value) ? value : [value];
  return list
    .map((id) => String(id).trim())
    .filter((id) => mongoose.isValidObjectId(id));
};

/**
 * Create one or more notifications.
 * - Broadcast audiences (all / customers / sellers / admins) resolve to a single
 *   record targeting recipientRole; every user of that role receives it.
 * - Specific recipients (recipientUsers) create one record per recipient so each
 *   notification belongs to exactly one user.
 */
export const createNotification = async (payload, admin, ipAddress = null) => {
  const notificationType = payload.notificationType || 'Announcement';
  const title = String(payload.title || '').trim();
  const message = String(payload.message || '').trim();
  const targetAudience = String(payload.targetAudience || 'all').trim();
  const scheduledAt = toDateOrNull(payload.scheduledAt, 'scheduledAt');
  const expiresAt = toDateOrNull(payload.expiresAt, 'expiresAt');
  const publishStatus = payload.publishStatus || (scheduledAt ? 'scheduled' : 'published');
  const actionUrl = String(payload.actionUrl || '').trim();

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

  if (!isValidInternalActionUrl(actionUrl)) {
    throw new ApiError(400, 'Action URL must be an internal application route (e.g. /promotion, /products/123, /orders/123, /account, /notifications).');
  }

  if (expiresAt && scheduledAt && expiresAt <= scheduledAt) {
    throw new ApiError(400, 'expiresAt must be later than scheduledAt.');
  }

  const recipientUserIds = sanitizeRecipientList(payload.recipientUsers || payload.recipientUser);

  if (recipientUserIds.length > 0) {
    if (payload.recipientUsers !== undefined && payload.recipientUser !== undefined) {
      throw new ApiError(400, 'Provide either recipientUser or recipientUsers, not both.');
    }

    const recipients = await User.find({ _id: { $in: recipientUserIds } })
      .select('firstName lastName email role status isDeleted')
      .lean();

    if (recipients.length !== new Set(recipientUserIds.map((id) => String(id))).size) {
      throw new ApiError(400, 'One or more recipient users do not exist.');
    }

    const base = {
      type: resolveLegacyType(notificationType),
      title,
      message,
      notificationType,
      targetAudience: toAudienceValue(recipientUserIds) || targetAudience,
      category: payload.category || 'general',
      priority: payload.priority || 'normal',
      publishStatus,
      scheduledAt,
      expiresAt,
      publishedAt: publishStatus === 'published' ? new Date() : null,
      image: payload.image || '',
      actionUrl,
      actionText: payload.actionText || '',
      icon: payload.icon || '',
      createdBy: admin?._id || null,
      link: actionUrl,
      read: false,
      readAt: null,
      metadata: payload.metadata || {},
    };

    const records = recipients.map((recipient) => ({
      ...base,
      recipientRole: recipient.role || 'customer',
      recipientUser: recipient._id,
    }));

    const created = await Notification.insertMany(records);
    const hydrated = await Notification.find({ _id: { $in: created.map((doc) => doc._id) } })
      .populate(notificationPopulate)
      .sort({ createdAt: -1 })
      .lean();

    audit(admin, 'CREATE_NOTIFICATION', title, null, JSON.stringify({ notificationType, recipientUsers: recipientUserIds, publishStatus }), ipAddress);
    return hydrated.length === 1 ? hydrated[0] : hydrated;
  }

  const targetAudienceValue = String(targetAudience).toLowerCase();

  if (
    targetAudienceValue.includes('specific') &&
    payload.recipientUsers === undefined &&
    payload.recipientUser === undefined
  ) {
    throw new ApiError(400, 'recipientUsers is required when targeting specific users.');
  }

  const storedNotification = await Notification.create({
    type: resolveLegacyType(notificationType),
    title,
    message,
    notificationType,
    targetAudience,
    category: payload.category || 'general',
    priority: payload.priority || 'normal',
    publishStatus,
    scheduledAt,
    expiresAt,
    publishedAt: publishStatus === 'published' ? new Date() : null,
    image: payload.image || '',
    actionUrl,
    actionText: payload.actionText || '',
    icon: payload.icon || '',
    createdBy: admin?._id || null,
    recipientRole: resolveRecipientRole(targetAudience),
    link: actionUrl,
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
  if (payload.category !== undefined) updates.category = String(payload.category).trim() || 'general';
  if (payload.actionText !== undefined) updates.actionText = String(payload.actionText).trim();
  if (payload.icon !== undefined) updates.icon = String(payload.icon).trim();
  if (payload.scheduledAt !== undefined) updates.scheduledAt = toDateOrNull(payload.scheduledAt, 'scheduledAt');
  if (payload.expiresAt !== undefined) updates.expiresAt = toDateOrNull(payload.expiresAt, 'expiresAt');
  if (payload.image !== undefined) updates.image = payload.image || '';
  if (payload.actionUrl !== undefined) {
    const nextActionUrl = String(payload.actionUrl || '').trim();
    if (!isValidInternalActionUrl(nextActionUrl)) {
      throw new ApiError(400, 'Action URL must be an internal application route (e.g. /promotion, /products/123, /orders/123, /account, /notifications).');
    }
    updates.actionUrl = nextActionUrl;
    updates.link = nextActionUrl;
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

// ═══════════════════════════════════════════════════════════════════════════════
// USER-FACING NOTIFICATION APIs
// Every query is scoped to the authenticated user so users can only ever see,
// mark, or delete notifications that belong to them.
// ═══════════════════════════════════════════════════════════════════════════════

const roleValuesFor = (role) => {
  const roleList = [String(role || '').toLowerCase()];
  if (roleList[0] === 'marketplace_seller') roleList.push('seller');
  return roleList;
};

const buildUserRecipientFilter = (userId, role) => ({
  $or: [
    { recipientUser: userId },
    { recipientRole: { $in: roleValuesFor(role) } },
    { recipientRole: 'all' },
  ],
});

const buildUserVisibilityFilter = (userId, role) => ({
  publishStatus: 'published',
  $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  ...buildUserRecipientFilter(userId, role),
});

const serializeForUser = (notification) => {
  const doc = notification && notification._doc ? { ...notification._doc } : { ...notification };
  return {
    ...doc,
    isRead: Boolean(doc.read),
    actionUrl: doc.actionUrl || doc.link || '',
    actionText: doc.actionText || '',
    category: doc.category || 'general',
    icon: doc.icon || '',
  };
};

const serializeListForUser = (notifications) => notifications.map(serializeForUser);

const findOwnedNotification = async (userId, role, id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid notification id.');
  }

  const notification = await Notification.findOne({
    _id: id,
    ...buildUserRecipientFilter(userId, role),
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found.');
  }

  return notification;
};

/**
 * Fetch the authenticated user's notifications (published, not expired).
 */
export const getUserNotifications = async (userId, role, query = {}) => {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = buildUserVisibilityFilter(userId, role);
  const search = (query.search || query.q || '').trim();

  if (search) {
    filter.$and = [{ $or: [{ title: { $regex: search, $options: 'i' } }, { message: { $regex: search, $options: 'i' } }] }];
  }

  if (query.status === 'unread') filter.read = false;
  if (query.status === 'read') filter.read = true;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, read: false }),
  ]);

  return {
    notifications: serializeListForUser(notifications),
    pagination: buildPaginationMeta(total, page, limit),
    unreadCount,
  };
};

/**
 * Unread count for the authenticated user.
 */
export const getUserUnreadCount = async (userId, role) => {
  return await Notification.countDocuments({
    ...buildUserVisibilityFilter(userId, role),
    read: false,
  });
};

/**
 * Get one of the authenticated user's notifications.
 */
export const getUserNotificationById = async (userId, role, id) => {
  const notification = await findOwnedNotification(userId, role, id);
  return serializeForUser(notification);
};

/**
 * Mark one of the authenticated user's notifications as read.
 */
export const markUserNotificationRead = async (userId, role, id) => {
  const notification = await findOwnedNotification(userId, role, id);
  notification.read = true;
  notification.readAt = new Date();
  await notification.save();
  return serializeForUser(notification);
};

/**
 * Mark all of the authenticated user's notifications as read.
 */
export const markAllUserNotificationsRead = async (userId, role) => {
  await Notification.updateMany(
    { ...buildUserVisibilityFilter(userId, role), read: false },
    { read: true, readAt: new Date() }
  );
  return { success: true };
};

/**
 * Delete one of the authenticated user's notifications.
 */
export const deleteUserNotification = async (userId, role, id) => {
  const notification = await findOwnedNotification(userId, role, id);
  await Notification.deleteOne({ _id: notification._id });
  return serializeForUser(notification);
};

/**
 * Delete all read notifications belonging to the authenticated user.
 */
export const deleteReadUserNotifications = async (userId, role) => {
  const result = await Notification.deleteMany({
    ...buildUserRecipientFilter(userId, role),
    read: true,
  });
  return { success: true, deletedCount: result.deletedCount };
};

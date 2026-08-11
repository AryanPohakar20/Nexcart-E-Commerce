// src/services/notificationService.js
// Platform & Admin notification management service.

import Notification from '../models/Notification.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

/**
 * Fetch notifications with tab filtering and unread counter.
 */
export const getNotifications = async (queryParams = {}) => {
  const { page, limit, skip } = parsePagination(queryParams);
  const filter = {};

  if (queryParams.tab === 'unread') {
    filter.read = false;
  } else if (queryParams.tab && queryParams.tab !== 'all') {
    filter.type = queryParams.tab;
  }

  if (queryParams.type && queryParams.type !== 'all') {
    filter.type = queryParams.type;
  }

  if (queryParams.priority) {
    filter.priority = queryParams.priority;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ read: false }),
  ]);

  const pagination = buildPaginationMeta(total, page, limit);

  return {
    notifications,
    pagination,
    unreadCount,
  };
};

/**
 * Get total unread notifications count.
 */
export const getUnreadCount = async () => {
  return await Notification.countDocuments({ read: false });
};

/**
 * Mark a single notification as read.
 */
export const markNotificationRead = async (id) => {
  return await Notification.findByIdAndUpdate(
    id,
    { read: true, readAt: new Date() },
    { new: true }
  ).lean();
};

/**
 * Mark all notifications as read.
 */
export const markAllNotificationsRead = async () => {
  await Notification.updateMany({ read: false }, { read: true, readAt: new Date() });
  return { success: true };
};

/**
 * Delete a notification.
 */
export const deleteNotification = async (id) => {
  return await Notification.findByIdAndDelete(id).lean();
};

/**
 * Create a new platform/admin notification.
 */
export const createNotification = async ({
  type = 'platform',
  title,
  message,
  priority = 'normal',
  recipientRole = 'admin',
  recipientUser = null,
  link = '',
  metadata = {},
}) => {
  return await Notification.create({
    type,
    title,
    message,
    priority,
    recipientRole,
    recipientUser,
    link,
    metadata,
  });
};

import NOTIFICATION_TYPES from '../constants/notificationTypes.js';
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
} from '../constants/notificationEnums.js';

export const normalizeNotificationPayload = (payload = {}) => ({
  receiver: payload.receiver ?? null,
  sender: payload.sender ?? null,
  receiverRole: payload.receiverRole ?? 'customer',
  title: payload.title ?? 'New notification',
  message: payload.message ?? '',
  type: payload.type ?? NOTIFICATION_TYPES.SYSTEM_BROADCAST,
  category: payload.category ?? NOTIFICATION_CATEGORIES.GENERAL,
  priority: payload.priority ?? NOTIFICATION_PRIORITIES.MEDIUM,
  relatedEntityRef: payload.relatedEntityRef ?? null,
  relatedEntityType: payload.relatedEntityType ?? null,
  metadata: payload.metadata ?? {},
  actionUrl: payload.actionUrl ?? null,
  icon: payload.icon ?? 'bell',
  isRead: false,
  readAt: null,
  expiresAt: payload.expiresAt ?? null,
  isDeleted: false,
  deletedAt: null,
});

export const isNotificationExpired = (notification) => {
  if (!notification?.expiresAt) {
    return false;
  }

  return new Date(notification.expiresAt) <= new Date();
};

export const buildNotificationQuery = (query = {}) => {
  const normalizedQuery = { ...query };

  if (query.isRead !== undefined) {
    normalizedQuery.isRead = Boolean(query.isRead);
  }

  if (query.isDeleted !== undefined) {
    normalizedQuery.isDeleted = Boolean(query.isDeleted);
  }

  return normalizedQuery;
};

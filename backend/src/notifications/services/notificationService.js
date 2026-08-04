import Notification from '../models/Notification.js';
import { normalizeNotificationPayload, buildNotificationQuery } from '../helpers/notificationHelpers.js';

export const createNotificationService = async (payload) => {
  const data = normalizeNotificationPayload(payload);
  return Notification.create(data);
};

export const createBulkNotificationsService = async (payloads = []) => {
  const normalizedPayloads = payloads.map((payload) => normalizeNotificationPayload(payload));
  return Notification.insertMany(normalizedPayloads);
};

export const getNotificationsService = async (query = {}) => {
  const normalizedQuery = buildNotificationQuery(query);
  return Notification.find(normalizedQuery).sort({ createdAt: -1 });
};

export const getUnreadNotificationsService = async (receiverId) => {
  return Notification.find({ receiver: receiverId, isRead: false, isDeleted: false }).sort({ createdAt: -1 });
};

export const markNotificationAsReadService = async (notificationId) => {
  return Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true, readAt: new Date() },
    { new: true }
  );
};

export const softDeleteNotificationService = async (notificationId) => {
  return Notification.findByIdAndUpdate(
    notificationId,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
};

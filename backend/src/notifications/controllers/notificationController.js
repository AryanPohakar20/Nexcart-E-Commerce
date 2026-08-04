import { ApiError } from '../../utils/ApiError.js';
import {
  createNotificationService,
  createBulkNotificationsService,
  getNotificationsService,
  getUnreadNotificationsService,
  markNotificationAsReadService,
  softDeleteNotificationService,
} from '../services/notificationService.js';

export const createNotification = async (req, res, next) => {
  try {
    const notification = await createNotificationService(req.body);
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

export const createBulkNotifications = async (req, res, next) => {
  try {
    const notifications = await createBulkNotificationsService(req.body?.notifications ?? []);
    res.status(201).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await getNotificationsService({
      receiver: req.user?.id,
      ...req.query,
    });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const getUnreadNotifications = async (req, res, next) => {
  try {
    const notifications = await getUnreadNotificationsService(req.user?.id);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await markNotificationAsReadService(req.params.notificationId);
    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

export const softDeleteNotification = async (req, res, next) => {
  try {
    const notification = await softDeleteNotificationService(req.params.notificationId);
    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

import {
  createNotificationService,
  createBulkNotificationsService,
  getNotificationByIdService,
  getNotificationsService,
  getUnreadNotificationsService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
  deleteNotificationService,
  deleteAllReadNotificationsService,
  getUnreadCountService,
  softDeleteNotificationService,
} from '../services/notificationService.js';

export const createNotification = async (req, res, next) => {
  try {
    const result = await createNotificationService(req.body, req.user);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return next(error);
  }
};

export const createBulkNotifications = async (req, res, next) => {
  try {
    const result = await createBulkNotificationsService(req.body?.notifications ?? [], req.user);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return next(error);
  }
};

export const getNotificationById = async (req, res, next) => {
  try {
    const result = await getNotificationByIdService(req.params.notificationId, req.user);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const result = await getNotificationsService(req.user, {
      ...req.query,
      receiverId: req.user?.id,
    });
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return next(error);
  }
};

export const getUnreadNotifications = async (req, res, next) => {
  try {
    const result = await getUnreadNotificationsService(req.user);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return next(error);
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    const result = await markNotificationAsReadService(req.params.notificationId, req.user);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return next(error);
  }
};

export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const result = await markAllNotificationsAsReadService(req.user, req.query);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const result = await deleteNotificationService(req.params.notificationId, req.user);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return next(error);
  }
};

export const deleteAllReadNotifications = async (req, res, next) => {
  try {
    const result = await deleteAllReadNotificationsService(req.user);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const result = await getUnreadCountService(req.user);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return next(error);
  }
};

export const softDeleteNotification = async (req, res, next) => {
  try {
    const result = await softDeleteNotificationService(req.params.notificationId, req.user);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return next(error);
  }
};

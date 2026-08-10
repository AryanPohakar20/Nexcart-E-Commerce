// src/controllers/notificationController.js
// User-facing notification endpoints. Every handler is scoped to the
// authenticated user via req.user so users can only ever access their own
// notifications. Admin notification management lives in adminController.js.

import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/ApiResponse.js';
import * as notificationService from '../services/notificationService.js';

// GET /api/notifications
export const getUserNotifications = asyncHandler(async (req, res) => {
  const data = await notificationService.getUserNotifications(req.user._id, req.user.role, req.query);
  return successResponse(res, 'Notifications fetched successfully.', data);
});

// GET /api/notifications/unread-count
export const getUserUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await notificationService.getUserUnreadCount(req.user._id, req.user.role);
  return successResponse(res, 'Unread notification count fetched.', { unreadCount });
});

// GET /api/notifications/unread
export const getUserUnreadNotifications = asyncHandler(async (req, res) => {
  const data = await notificationService.getUserNotifications(req.user._id, req.user.role, { ...req.query, status: 'unread' });
  return successResponse(res, 'Unread notifications fetched successfully.', data);
});

// GET /api/notifications/:id
export const getUserNotificationById = asyncHandler(async (req, res) => {
  const notification = await notificationService.getUserNotificationById(req.user._id, req.user.role, req.params.id);
  return successResponse(res, 'Notification fetched successfully.', { notification });
});

// PATCH /api/notifications/:id/read
export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markUserNotificationRead(req.user._id, req.user.role, req.params.id);
  return successResponse(res, 'Notification marked as read.', { notification });
});

// PATCH /api/notifications/read-all
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllUserNotificationsRead(req.user._id, req.user.role);
  return successResponse(res, 'All notifications marked as read.');
});

// DELETE /api/notifications/:id
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.deleteUserNotification(req.user._id, req.user.role, req.params.id);
  return successResponse(res, 'Notification deleted successfully.', { notification });
});

// DELETE /api/notifications/read
export const deleteReadNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.deleteReadUserNotifications(req.user._id, req.user.role);
  return successResponse(res, 'Read notifications cleared successfully.', result);
});

import { Router } from 'express';
import {
  createNotification,
  createBulkNotifications,
  getNotificationById,
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
  getUnreadCount,
  softDeleteNotification,
} from '../controllers/notificationController.js';
import {
  validateNotificationCreation,
  validateNotificationIdParam,
  validateNotificationQuery,
} from '../validators/notificationValidator.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';

const router = Router();

router.post('/', authenticate, authorize('admin'), validateNotificationCreation, createNotification);
router.post('/bulk', authenticate, authorize('admin'), createBulkNotifications);
router.get('/', authenticate, validateNotificationQuery, getNotifications);
router.get('/unread', authenticate, getUnreadNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.get('/:notificationId', authenticate, validateNotificationIdParam, getNotificationById);
router.patch('/read-all', authenticate, markAllNotificationsAsRead);
router.patch('/:notificationId/read', authenticate, validateNotificationIdParam, markNotificationAsRead);
router.delete('/read', authenticate, deleteAllReadNotifications);
router.delete('/:notificationId', authenticate, validateNotificationIdParam, deleteNotification);
router.delete('/:notificationId/soft-delete', authenticate, validateNotificationIdParam, softDeleteNotification);

export default router;

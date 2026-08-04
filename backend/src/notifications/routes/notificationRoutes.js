import { Router } from 'express';
import {
  createNotification,
  createBulkNotifications,
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  softDeleteNotification,
} from '../controllers/notificationController.js';
import { validateNotificationCreation, validateNotificationRead } from '../validators/notificationValidator.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';

const router = Router();

router.post('/', authenticate, authorize('admin'), validateNotificationCreation, createNotification);
router.post('/bulk', authenticate, authorize('admin'), createBulkNotifications);
router.get('/', authenticate, getNotifications);
router.get('/unread', authenticate, getUnreadNotifications);
router.patch('/:notificationId/read', authenticate, validateNotificationRead, markNotificationAsRead);
router.delete('/:notificationId', authenticate, softDeleteNotification);

export default router;

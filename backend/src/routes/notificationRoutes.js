// src/routes/notificationRoutes.js
// User-facing notification routes. All routes are protected by JWT and scoped
// to the authenticated user. Admin notification management is under /admin.

import { Router } from 'express';
import {
  getUserNotifications,
  getUserUnreadCount,
  getUserUnreadNotifications,
  getUserNotificationById,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteReadNotifications,
} from '../controllers/notificationController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

// All routes below require a valid JWT
router.use(authenticate);

// ─── Notification list & counters ─────────────────────────────────────────────
router.get('/', getUserNotifications);
router.get('/unread', getUserUnreadNotifications);
router.get('/unread-count', getUserUnreadCount);

// IMPORTANT: /read-all and /read must be declared BEFORE /:id so Express does
// not treat them as notification ids.
router.patch('/read-all', markAllNotificationsRead);
router.delete('/read', deleteReadNotifications);

// ─── Single notification operations ───────────────────────────────────────────
router.get('/:id', getUserNotificationById);
router.patch('/:id/read', markNotificationRead);
router.delete('/:id', deleteNotification);

export default router;

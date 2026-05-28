import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import * as notificationController from '../../controllers/notification.controller.js';

const router = Router();

/**
 * Notification Routes (all authenticated)
 *
 * GET    /                    — Get notifications (paginated, with unread filter)
 * GET    /unread-count        — Get unread notification count (for badge)
 * PATCH  /:id/read            — Mark a single notification as read
 * PATCH  /read-all            — Mark all notifications as read
 * DELETE /:id                 — Delete a notification
 */

router.use(authenticate); // All notification routes require auth

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;

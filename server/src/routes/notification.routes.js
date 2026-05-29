import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
} from '../controllers/notification.controller.js';

const router = Router();

// Apply authentication globally to all notification routes
router.use(requireAuth);

router.get('/mine', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markAsRead); // Defined parameterized after named routes

export default router;

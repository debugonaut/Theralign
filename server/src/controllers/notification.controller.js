import Notification from '../models/Notification.model.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';

/**
 * GET /api/notifications/mine
 * Retrieves the 20 most recent notifications for the logged-in user.
 * Protect: requireAuth
 */
export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user.id })
    .sort({ createdAt: -1 })
    .limit(20);

  return successResponse(res, 200, 'Notifications retrieved successfully', notifications);
});

/**
 * GET /api/notifications/unread-count
 * Returns only the count of unread notifications for polling purposes.
 * Protect: requireAuth
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user.id,
    isRead: false,
  });

  return successResponse(res, 200, 'Unread count retrieved', { count });
});

/**
 * PATCH /api/notifications/:id/read
 * Marks a specific notification as read.
 * Protect: requireAuth
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipient: req.user.id },
    { $set: { isRead: true } },
    { new: true }
  );

  if (!notification) {
    throw new AppError('Notification not found or access denied.', 404);
  }

  return successResponse(res, 200, 'Notification marked as read', notification);
});

/**
 * PATCH /api/notifications/read-all
 * Flags all unread notifications for the user as read.
 * Protect: requireAuth
 */
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user.id, isRead: false },
    { $set: { isRead: true } }
  );

  return successResponse(res, 200, 'All notifications marked as read');
});

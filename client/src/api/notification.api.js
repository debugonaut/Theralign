import axiosInstance from './axiosInstance';

/**
 * Fetch the 20 most recent notifications for the logged-in user.
 */
export const getMyNotifications = () =>
  axiosInstance.get('/notifications/mine');

/**
 * Get only the count of unread notifications for polling purposes.
 */
export const getUnreadCount = () =>
  axiosInstance.get('/notifications/unread-count');

/**
 * Mark a single notification as read.
 */
export const markAsRead = (id) =>
  axiosInstance.patch(`/notifications/${id}/read`);

/**
 * Mark all notifications as read.
 */
export const markAllRead = () =>
  axiosInstance.patch('/notifications/read-all');

import Notification from '../models/Notification.model.js';
import logger from '../utils/logger.js';

/**
 * Creates an in-app notification record in MongoDB.
 * Never throws exceptions, ensuring a failed notification does not break parent database transactions.
 */
export const createNotification = async ({
  recipientId,
  type,
  title,
  message,
  link = null,
  relatedId = null,
}) => {
  try {
    await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      link,
      relatedId,
    });
  } catch (err) {
    logger.error(`[ERROR] Notification creation failure: ${err.message}`);
  }
};

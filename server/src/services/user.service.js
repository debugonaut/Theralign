import User from '../models/User.model.js';
import AppError from '../utils/AppError.js';
import { PAGINATION } from '../utils/constants.js';

/**
 * Retrieve all users with optional role filter and pagination.
 * Used by admin in Phase 9.
 *
 * @param {{ role?: string, page?: number, limit?: number }} options
 * @returns {{ users: object[], total: number, page: number, totalPages: number }}
 */
export const getAllUsers = async ({
  role,
  page = PAGINATION.DEFAULT_PAGE,
  limit = PAGINATION.DEFAULT_LIMIT,
} = {}) => {
  const query = role ? { role } : {};

  const [users, total] = await Promise.all([
    User.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }),
    User.countDocuments(query),
  ]);

  return {
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Deactivate a user account (soft delete).
 * The user can no longer log in while deactivated.
 *
 * @param {string} userId
 * @returns {object} Updated user document
 */
export const deactivateUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  return user;
};

/**
 * Reactivate a previously deactivated user account.
 *
 * @param {string} userId
 * @returns {object} Updated user document
 */
export const reactivateUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.isActive = true;
  await user.save({ validateBeforeSave: false });

  return user;
};

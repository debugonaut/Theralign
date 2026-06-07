import crypto from 'crypto';
import User from '../models/User.model.js';
import AppError from '../utils/AppError.js';
import config from '../config/env.js';
import { ROLES } from '../utils/constants.js';
import { sendPasswordResetEmail } from './emailService.js';

/**
 * Register a new user.
 * Password hashing is handled by the User model's pre-save hook.
 * Admin role cannot be self-registered — enforced at the validation layer.
 *
 * @param {{ name: string, email: string, password: string, role: string }} userData
 * @returns {{ user: object, token: string }}
 */
export const registerUser = async ({ name, email, password, role }) => {
  // Server-side role guard — admin accounts are seeded, never self-registered
  const safeRole = role === ROLES.DOCTOR ? ROLES.DOCTOR : ROLES.PATIENT;
  if (role === ROLES.ADMIN) {
    throw new AppError('Admin accounts cannot be self-registered', 403);
  }

  // 1. Check for duplicate email
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  // 2. Create the user — pre-save hook handles hashing
  const user = await User.create({ name, email, password, role: safeRole });

  // 3. Generate token
  const token = user.generateAuthToken();

  // 4. Sanitize: remove password from the returned object
  const sanitized = user.toObject();
  delete sanitized.password;

  return { user: sanitized, token };
};

/**
 * Log in an existing user.
 * Uses identical error messages for wrong email and wrong password to prevent
 * email enumeration attacks.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {{ user: object, token: string }}
 */
export const loginUser = async ({ email, password }) => {
  // 1. Find user and explicitly include the password field (select: false by default)
  const user = await User.findOne({ email }).select('+password');

  // 2. User not found — generic message to prevent email enumeration
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // 3. Deactivated account check
  if (!user.isActive) {
    throw new AppError('Account has been deactivated. Please contact support.', 403);
  }

  // 4. Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    // Same generic message as "user not found" — prevents enumeration
    throw new AppError('Invalid credentials', 401);
  }

  // 5. Generate auth token
  const token = user.generateAuthToken();

  // 6. Sanitize: remove password
  const sanitized = user.toObject();
  delete sanitized.password;

  return { user: sanitized, token };
};

/**
 * Retrieve a user by their MongoDB ObjectId.
 * Password is excluded by default (select: false on schema).
 *
 * @param {string} userId
 * @returns {object} User document
 */
export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

/**
 * Generate a password reset token for a user email.
 * Token is hashed with sha256 before storage — raw token returned for demo.
 *
 * @param {{ email: string }} param
 * @returns {{ resetToken: string } | { message: string }}
 */
export const forgotPassword = async ({ email }) => {
  // Always return generic message — never confirm email existence (prevents enumeration)
  const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpiry');

  if (!user) {
    // Return same generic message even if email not found
    return { message: 'If this email exists, a reset link has been sent.' };
  }

  // Generate secure random token
  const rawToken = crypto.randomBytes(32).toString('hex');

  // Hash and store — never store the raw token in DB
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await user.save({ validateBeforeSave: false });

  // Check if SMTP is configured
  const isMailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;

  if (isMailConfigured) {
    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      token: rawToken,
    });

    return {
      message: 'If this email exists, a reset link has been sent.',
    };
  }

  // Production: fail closed — never expose reset tokens in API responses
  if (config.nodeEnv === 'production') {
    throw new AppError(
      'Password reset is temporarily unavailable. Please contact support.',
      503
    );
  }

  // Development-only fallback when SMTP is not configured
  return {
    message: 'If this email exists, a reset link has been sent.',
    resetToken: rawToken,
  };
};

/**
 * Reset password using a valid reset token.
 *
 * @param {{ token: string, newPassword: string }}
 */
export const resetPassword = async ({ token, newPassword }) => {
  if (!token || !newPassword) {
    throw new AppError('Token and new password are required', 400);
  }

  // Hash incoming token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user where token matches AND expiry is in the future
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiry: { $gt: Date.now() },
  }).select('+password +passwordResetToken +passwordResetExpiry');

  if (!user) {
    throw new AppError('Reset token is invalid or has expired', 400);
  }

  // Update password — pre-save hook handles hashing
  user.password = newPassword;
  user.passwordResetToken = null;
  user.passwordResetExpiry = null;
  await user.save();

  return { message: 'Password updated successfully. You can now log in.' };
};


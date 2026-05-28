import User from '../models/User.model.js';
import AppError from '../utils/AppError.js';

/**
 * Register a new user.
 * Password hashing is handled by the User model's pre-save hook.
 * Admin role cannot be self-registered — enforced at the validation layer.
 *
 * @param {{ name: string, email: string, password: string, role: string }} userData
 * @returns {{ user: object, token: string }}
 */
export const registerUser = async ({ name, email, password, role }) => {
  // 1. Check for duplicate email
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  // 2. Create the user — pre-save hook handles hashing
  const user = await User.create({ name, email, password, role });

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

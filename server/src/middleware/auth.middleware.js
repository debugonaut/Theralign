import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import User from '../models/User.model.js';
import config from '../config/env.js';

/**
 * requireAuth — JWT Authentication Middleware
 *
 * Verifies the Bearer token from the Authorization header, confirms the user
 * still exists and is active in the database, then attaches a minimal plain
 * object to req.user for downstream use.
 *
 * Why DB check on every request?
 * A valid JWT does NOT guarantee the user still exists or is still active.
 * An admin could deactivate an account after a token was issued. The DB check
 * catches this. At scale, short token expiry + refresh tokens handles this more
 * efficiently, but for MVP the DB lookup is the correct pragmatic choice.
 */
export const requireAuth = asyncHandler(async (req, res, next) => {
  // Step 1: Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required. Please log in.', 401);
  }

  const token = authHeader.split(' ')[1];

  // Step 2: Verify token signature and expiry
  // jwt.verify throws JsonWebTokenError or TokenExpiredError — caught by global error middleware
  const decoded = jwt.verify(token, config.jwtSecret);

  // Step 3: Confirm user still exists and is active
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('User account no longer exists.', 401);
  }
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact support.', 403);
  }

  // Step 4: Attach a plain object (NOT the Mongoose document) to req.user
  // Using a plain object prevents accidentally triggering Mongoose save hooks
  // via the request object.
  req.user = {
    id: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
  };

  next();
});

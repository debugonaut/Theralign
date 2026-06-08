import AppError from '../utils/AppError.js';

/**
 * requireRole — Role-Based Authorization Middleware Factory
 *
 * Returns a middleware that checks whether req.user.role is included
 * in the list of allowedRoles. Must always be used AFTER requireAuth.
 *
 * Intentionally separated from requireAuth because:
 * - Some routes need identity verification only (requireAuth)
 * - Some routes need both identity + role check (requireAuth + requireRole)
 * - The role check supports multiple allowed roles via spread arguments
 *
 * Usage:
 *   router.get('/admin/doctors', requireAuth, requireRole('admin'), getDoctors)
 *   router.get('/bookings', requireAuth, requireRole('patient', 'admin'), getBookings)
 *
 * @param {...string} allowedRoles - One or more role strings that may access the route
 * @returns {Function} Express middleware
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // requireAuth must have run before this — if req.user is absent something is wrong
    if (!req.user) {
      throw new AppError('Authentication required. Please log in.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        `Access denied. This route requires one of: ${allowedRoles.join(', ')}`,
        403
      );
    }

    next();
  };
};

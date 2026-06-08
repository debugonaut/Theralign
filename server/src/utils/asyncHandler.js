/**
 * Custom wrapper to eliminate try-catch boilerplate in async Express routes.
 * Thrown errors are automatically sent to the next middleware (error.middleware.js).
 * @param {Function} fn - Async controller function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;

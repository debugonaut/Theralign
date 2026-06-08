import { errorResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

/**
 * Global Express Error Handling Middleware.
 * Handles operational, mongoose, jwt and programmatic exceptions consistently.
 */
const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log all errors for transparency
  logger.error(`${req.method} ${req.originalUrl} — ${err.message}`, err.stack);

  let error = { ...err };
  error.message = err.message;

  // 1. Mongoose invalid ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid path: ${err.path}`;
    return errorResponse(res, 400, message);
  }

  // 2. Mongoose schema validation failure (ValidationError)
  if (err.name === 'ValidationError') {
    const message = 'Validation failed. Please verify your input parameters.';
    const fields = {};
    Object.keys(err.errors).forEach((key) => {
      fields[key] = err.errors[key].message;
    });
    return errorResponse(res, 422, message, fields);
  }

  // 3. Mongoose unique constraint duplicate key violation (Code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value field validation failure: "${field}" already exists.`;
    return errorResponse(res, 409, message);
  }

  // 4. JWT Validation Failures
  if (err.name === 'JsonWebTokenError') {
    const message = 'Authentication failed: Invalid authorization token.';
    return errorResponse(res, 401, message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Authentication failed: Your authorization token has expired.';
    return errorResponse(res, 401, message);
  }

  // 5. Custom operational error (AppError) or handled operational failures
  if (err.isOperational) {
    return errorResponse(
      res,
      err.statusCode,
      err.message,
      process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
    );
  }

  // 6. Generic system error (500)
  const isDev = process.env.NODE_ENV === 'development';
  const responseMessage = isDev ? err.message : 'An unexpected system error occurred on the server.';
  const responseErrors = isDev ? { stack: err.stack } : null;

  return errorResponse(res, 500, responseMessage, responseErrors);
};

export default errorMiddleware;

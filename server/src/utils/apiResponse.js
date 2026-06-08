/**
 * Centralized success response formatter.
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Custom readable message
 * @param {Object|Array|null} data - Payload data
 */
export const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Centralized error response formatter.
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error description message
 * @param {Object|Array|null} errors - Field-level validations or detailed errors
 */
export const errorResponse = (res, statusCode = 500, message = 'Something went wrong', errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};

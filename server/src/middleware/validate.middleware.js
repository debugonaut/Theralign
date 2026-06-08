import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Reusable validation result middleware.
 * Must be placed AFTER the express-validator chains in a route definition.
 * Returns 422 with the full errors array if validation fails.
 *
 * Usage: router.post('/register', registerValidation, validate, register)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation Error Details:', JSON.stringify(errors.array(), null, 2));
    return errorResponse(res, 422, 'Validation failed', errors.array());
  }
  next();
};

export default validate;

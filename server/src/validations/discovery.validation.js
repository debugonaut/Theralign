import { query } from 'express-validator';

export const discoveryListingValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),

  query('minFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('minFee must be a non-negative number'),

  query('maxFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('maxFee must be a non-negative number')
    .custom((value, { req }) => {
      if (req.query.minFee && Number(value) < Number(req.query.minFee)) {
        throw new Error('maxFee must be greater than or equal to minFee');
      }
      return true;
    }),

  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 }).withMessage('minRating must be between 0 and 5'),

  query('minExperience')
    .optional()
    .isInt({ min: 0 }).withMessage('minExperience must be a non-negative integer'),
];

export const nearbyDoctorsValidation = [
  query('latitude')
    .exists().withMessage('latitude is required')
    .isFloat({ min: -90, max: 90 }).withMessage('latitude must be a valid float between -90 and 90'),

  query('longitude')
    .exists().withMessage('longitude is required')
    .isFloat({ min: -180, max: 180 }).withMessage('longitude must be a valid float between -180 and 180'),

  query('maxDistance')
    .optional()
    .isInt({ min: 1, max: 100000 }).withMessage('maxDistance must be a positive integer up to 100000 (100km)'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
];

export const searchDoctorsValidation = [
  query('q')
    .exists().withMessage('Search query parameter q is required')
    .isLength({ min: 2, max: 100 }).withMessage('Search query must be between 2 and 100 characters'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),

  query('minFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('minFee must be a non-negative number'),

  query('maxFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('maxFee must be a non-negative number')
    .custom((value, { req }) => {
      if (req.query.minFee && Number(value) < Number(req.query.minFee)) {
        throw new Error('maxFee must be greater than or equal to minFee');
      }
      return true;
    }),

  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 }).withMessage('minRating must be between 0 and 5'),

  query('minExperience')
    .optional()
    .isInt({ min: 0 }).withMessage('minExperience must be a non-negative integer'),
];

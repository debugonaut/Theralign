import { body, param, query } from 'express-validator';

export const submitReviewValidation = [
  body('appointmentId')
    .notEmpty().withMessage('Appointment ID is required')
    .isMongoId().withMessage('Invalid appointment ID'),
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .optional()
    .isString()
    .isLength({ max: 500 }).withMessage('Comment must not exceed 500 characters')
    .trim(),
];

export const getDoctorReviewsValidation = [
  param('doctorId')
    .isMongoId().withMessage('Invalid doctor ID'),
];

export const getAllReviewsAdminValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
];

export const toggleReviewVisibilityValidation = [
  param('id')
    .isMongoId().withMessage('Invalid review ID'),
];

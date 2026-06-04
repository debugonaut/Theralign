import { body } from 'express-validator';

export const updateMyProfileValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .trim(),
  body('phone')
    .optional()
    .isString()
    .trim(),
  body('dateOfBirth')
    .optional()
    .isISO8601().toDate().withMessage('Invalid date of birth format'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Invalid gender value'),
  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']).withMessage('Invalid blood group'),
  body('height')
    .optional()
    .isFloat({ min: 0, max: 300 }).withMessage('Height must be a valid number in cm'),
  body('weight')
    .optional()
    .isFloat({ min: 0, max: 500 }).withMessage('Weight must be a valid number in kg'),
  body('medicalHistory')
    .optional()
    .isObject().withMessage('Medical history must be an object'),
  body('lifestyle')
    .optional()
    .isObject().withMessage('Lifestyle details must be an object'),
  body('emergencyContacts')
    .optional()
    .isArray().withMessage('Emergency contacts must be an array'),
  body('insurance')
    .optional()
    .isObject().withMessage('Insurance details must be an object'),
];

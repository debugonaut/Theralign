import { body, param, query } from 'express-validator';

export const verifyDoctorValidation = [
  param('profileId').isMongoId().withMessage('Invalid doctor profile ID'),
];

export const rejectDoctorValidation = [
  param('profileId').isMongoId().withMessage('Invalid doctor profile ID'),
  body('rejectionReason')
    .notEmpty().withMessage('Rejection reason is required')
    .isLength({ min: 10, max: 500 }).withMessage('Rejection reason must be between 10 and 500 characters')
    .trim(),
];

export const suspendDoctorValidation = [
  param('profileId').isMongoId().withMessage('Invalid doctor profile ID'),
  body('reason')
    .notEmpty().withMessage('Suspension reason is required')
    .isLength({ min: 10, max: 500 }).withMessage('Suspension reason must be between 10 and 500 characters')
    .trim(),
];

export const reconsiderDoctorValidation = [
  param('profileId').isMongoId().withMessage('Invalid doctor profile ID'),
];

export const getDoctorDetailAdminValidation = [
  param('profileId').isMongoId().withMessage('Invalid doctor profile ID'),
];

export const getAllDoctorsValidation = [
  query('status')
    .optional()
    .isIn(['pending', 'verified', 'rejected'])
    .withMessage('Status must be pending, verified, or rejected'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .isString()
    .trim(),
];

export const getAllUsersAdminValidation = [
  query('role')
    .optional()
    .isIn(['patient', 'doctor', 'admin'])
    .withMessage('Role must be patient, doctor, or admin'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .isString()
    .trim(),
];

export const toggleUserStatusValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];

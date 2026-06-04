import { body, param } from 'express-validator';

export const bookAppointmentValidation = [
  body('slotId')
    .notEmpty().withMessage('Slot ID is required')
    .isMongoId().withMessage('Invalid slot ID'),
  body('patientNotes')
    .optional()
    .isString()
    .isLength({ max: 500 }).withMessage('Patient notes must not exceed 500 characters')
    .trim(),
];

export const cancelAppointmentValidation = [
  param('id').isMongoId().withMessage('Invalid appointment ID'),
  body('reason')
    .optional()
    .isString()
    .isLength({ max: 500 }).withMessage('Reason must not exceed 500 characters')
    .trim(),
];

export const completeAppointmentValidation = [
  param('id').isMongoId().withMessage('Invalid appointment ID'),
];

export const rescheduleAppointmentValidation = [
  param('id').isMongoId().withMessage('Invalid appointment ID'),
  body('newSlotId')
    .notEmpty().withMessage('New slot ID is required')
    .isMongoId().withMessage('Invalid new slot ID'),
];

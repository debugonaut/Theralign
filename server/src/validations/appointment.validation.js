import { body, param } from 'express-validator';
import mongoose from 'mongoose';

const isValidSlotId = (value) => {
  if (typeof value === 'string' && value.startsWith('slot_weekly_')) {
    const parts = value.split('_');
    return parts.length >= 5 && mongoose.Types.ObjectId.isValid(parts[2]);
  }
  return mongoose.Types.ObjectId.isValid(value);
};

export const bookAppointmentValidation = [
  body('slotId')
    .notEmpty().withMessage('Slot ID is required')
    .custom((value) => {
      if (!isValidSlotId(value)) throw new Error('Invalid slot ID');
      return true;
    }),
  body('patientNotes')
    .optional({ checkFalsy: true })
    .isString()
    .isLength({ max: 500 }).withMessage('Patient notes must not exceed 500 characters')
    .trim(),
];

export const cancelAppointmentValidation = [
  param('id').isMongoId().withMessage('Invalid appointment ID'),
  body('reason')
    .optional({ checkFalsy: true })
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
    .custom((value) => {
      if (!isValidSlotId(value)) throw new Error('Invalid new slot ID');
      return true;
    }),
];

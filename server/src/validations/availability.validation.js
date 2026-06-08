import { body, param, query } from 'express-validator';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}$/;

export const createSlotValidation = [
  body('date')
    .notEmpty().withMessage('Date is required')
    .matches(dateRegex).withMessage('Date must be in YYYY-MM-DD format'),
  body('startTime')
    .notEmpty().withMessage('Start time is required')
    .matches(timeRegex).withMessage('Start time must be in HH:MM format'),
  body('endTime')
    .notEmpty().withMessage('End time is required')
    .matches(timeRegex).withMessage('End time must be in HH:MM format'),
];

export const createRecurringSlotsValidation = [
  body('date')
    .notEmpty().withMessage('Date is required')
    .matches(dateRegex).withMessage('Date must be in YYYY-MM-DD format'),
  body('startTime')
    .notEmpty().withMessage('Start time is required')
    .matches(timeRegex).withMessage('Start time must be in HH:MM format'),
  body('endTime')
    .notEmpty().withMessage('End time is required')
    .matches(timeRegex).withMessage('End time must be in HH:MM format'),
  body('repeatWeeks')
    .notEmpty().withMessage('Repeat weeks is required')
    .isInt({ min: 1, max: 12 }).withMessage('Repeat weeks must be between 1 and 12'),
];

export const updateSlotValidation = [
  param('slotId').isMongoId().withMessage('Invalid slot ID'),
  body('startTime')
    .optional()
    .matches(timeRegex).withMessage('Start time must be in HH:MM format'),
  body('endTime')
    .optional()
    .matches(timeRegex).withMessage('End time must be in HH:MM format'),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

export const deleteSlotValidation = [
  param('slotId').isMongoId().withMessage('Invalid slot ID'),
];

export const saveWeeklyScheduleValidation = [
  body('schedule')
    .notEmpty().withMessage('Schedule is required')
    .isObject().withMessage('Schedule must be an object'),
  body('slotDurationMinutes')
    .optional()
    .isInt({ min: 10, max: 120 }).withMessage('Slot duration must be between 10 and 120 minutes'),
  body('breakEnabled')
    .optional()
    .isBoolean().withMessage('breakEnabled must be a boolean'),
  body('breakStartTime')
    .optional()
    .matches(timeRegex).withMessage('Break start time must be in HH:MM format'),
  body('breakEndTime')
    .optional()
    .matches(timeRegex).withMessage('Break end time must be in HH:MM format'),
];

export const blockDateValidation = [
  body('date')
    .notEmpty().withMessage('Date is required')
    .matches(dateRegex).withMessage('Date must be in YYYY-MM-DD format'),
];

export const unblockDateValidation = [
  body('date')
    .notEmpty().withMessage('Date is required')
    .matches(dateRegex).withMessage('Date must be in YYYY-MM-DD format'),
];

export const getAvailableSlotsValidation = [
  param('doctorId').isMongoId().withMessage('Invalid doctor ID'),
];

export const getAvailableSlotsByDateValidation = [
  param('doctorId').isMongoId().withMessage('Invalid doctor ID'),
  query('date')
    .optional()
    .matches(dateRegex).withMessage('Date must be in YYYY-MM-DD format'),
];

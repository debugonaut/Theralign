import { body, param } from 'express-validator';

export const interpretSymptomsValidation = [
  body('symptoms')
    .notEmpty().withMessage('Symptoms description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Symptoms description must be between 10 and 2000 characters')
    .trim(),
];

export const getDoctorAISummaryValidation = [
  param('doctorId')
    .isMongoId().withMessage('Invalid doctor ID'),
];

import { param } from 'express-validator';

export const uploadSessionDocumentValidation = [
  param('appointmentId')
    .isMongoId().withMessage('Invalid appointment ID'),
];

export const deleteSessionDocumentValidation = [
  param('appointmentId')
    .isMongoId().withMessage('Invalid appointment ID'),
];

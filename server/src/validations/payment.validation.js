import { body } from 'express-validator';

export const createOrderValidation = [
  body('appointmentId')
    .notEmpty().withMessage('Appointment ID is required')
    .isMongoId().withMessage('Invalid appointment ID'),
];

export const verifyPaymentValidation = [
  body('razorpayOrderId')
    .notEmpty().withMessage('Razorpay Order ID is required')
    .isString().trim(),
  body('razorpayPaymentId')
    .notEmpty().withMessage('Razorpay Payment ID is required')
    .isString().trim(),
  body('razorpaySignature')
    .notEmpty().withMessage('Razorpay Signature is required')
    .isString().trim(),
  body('appointmentId')
    .notEmpty().withMessage('Appointment ID is required')
    .isMongoId().withMessage('Invalid appointment ID'),
];

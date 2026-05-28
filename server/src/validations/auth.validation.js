import { body } from 'express-validator';
import { ROLES } from '../utils/constants.js';

/**
 * Validation chain for POST /api/auth/register
 * Admin role is deliberately excluded from allowed values — admin accounts are seeded, not registered.
 */
export const registerValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .trim(),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('role')
    .optional()
    .isIn([ROLES.PATIENT, ROLES.DOCTOR])
    .withMessage('Role must be either "patient" or "doctor"'),
    // ROLES.ADMIN is intentionally excluded — admin cannot self-register
];

/**
 * Validation chain for POST /api/auth/login
 */
export const loginValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

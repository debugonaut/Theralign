import { body } from 'express-validator';

/**
 * Validation schema for doctor onboarding/profile updates.
 */
export const onboardValidation = [
  body('maxJuniorDoctors')
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 10 })
    .withMessage('Maximum junior doctors must be an integer between 0 and 10'),
  body('practiceName')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Practice name must be under 100 characters'),
];

import { body } from 'express-validator';

// Shared progress rating values — also used in frontend badge colors
export const PROGRESS_RATING_VALUES = [
  'worse',
  'no_change',
  'slight_improvement',
  'significant_improvement',
  'resolved',
];

const EDITABLE_FIELDS = [
  'presentingCondition',
  'treatmentProvided',
  'progressRating',
  'painScoreBefore',
  'painScoreAfter',
  'exercisePrescription',
  'medications',
  'clinicalObservations',
  'followUpRecommendation',
  'isSharedWithPatient',
];

// Export so the service can reuse this list when computing editHistory changedFields
export { EDITABLE_FIELDS };

export const createSessionRecordValidation = [
  body('presentingCondition')
    .trim()
    .notEmpty().withMessage('Presenting condition is required')
    .isLength({ max: 500 }).withMessage('Presenting condition must not exceed 500 characters'),

  body('treatmentProvided')
    .trim()
    .notEmpty().withMessage('Treatment provided is required')
    .isLength({ max: 1000 }).withMessage('Treatment provided must not exceed 1000 characters'),

  body('progressRating')
    .notEmpty().withMessage('Progress rating is required')
    .isIn(PROGRESS_RATING_VALUES).withMessage(`Progress rating must be one of: ${PROGRESS_RATING_VALUES.join(', ')}`),

  body('painScoreBefore')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 10 }).withMessage('Pain score before must be an integer between 0 and 10'),

  body('painScoreAfter')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 10 }).withMessage('Pain score after must be an integer between 0 and 10'),

  body('exercisePrescription')
    .optional()
    .isArray().withMessage('Exercise prescription must be an array'),

  body('exercisePrescription.*.exerciseName')
    .trim()
    .notEmpty().withMessage('Each exercise must have a name'),

  body('exercisePrescription.*.exerciseLibraryId')
    .optional({ nullable: true })
    .isString().trim(),

  body('exercisePrescription.*.sets')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Sets must be a positive integer'),

  body('exercisePrescription.*.reps')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Reps must be a positive integer'),

  body('exercisePrescription.*.frequency')
    .optional({ nullable: true })
    .isString().trim(),

  body('exercisePrescription.*.duration')
    .optional({ nullable: true })
    .isString().trim(),

  body('exercisePrescription.*.prescriptionDuration')
    .optional({ nullable: true })
    .isString().trim(),

  body('exercisePrescription.*.notes')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 300 }).withMessage('Exercise notes must not exceed 300 characters'),

  body('medications')
    .optional()
    .isArray().withMessage('Medications must be an array'),

  body('medications.*')
    .isString().trim(),

  body('clinicalObservations')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('Clinical observations must not exceed 2000 characters'),

  body('followUpRecommendation.recommended')
    .optional()
    .isBoolean().withMessage('followUpRecommendation.recommended must be a boolean'),

  body('followUpRecommendation.intervalDays')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 365 }).withMessage('Follow-up interval must be between 1 and 365 days'),

  body('followUpRecommendation.suggestedDate')
    .optional({ nullable: true })
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Suggested date must be in YYYY-MM-DD format'),

  body('followUpRecommendation.sessionGoal')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 300 }).withMessage('Session goal must not exceed 300 characters'),

  body('isSharedWithPatient')
    .optional()
    .isBoolean().withMessage('isSharedWithPatient must be a boolean'),
];

// PUT — all fields optional, but body must not be empty (enforced in service layer)
export const updateSessionRecordValidation = [
  body('presentingCondition')
    .optional()
    .trim()
    .notEmpty().withMessage('Presenting condition cannot be blank')
    .isLength({ max: 500 }).withMessage('Presenting condition must not exceed 500 characters'),

  body('treatmentProvided')
    .optional()
    .trim()
    .notEmpty().withMessage('Treatment provided cannot be blank')
    .isLength({ max: 1000 }).withMessage('Treatment provided must not exceed 1000 characters'),

  body('progressRating')
    .optional()
    .isIn(PROGRESS_RATING_VALUES).withMessage(`Progress rating must be one of: ${PROGRESS_RATING_VALUES.join(', ')}`),

  body('painScoreBefore')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 10 }).withMessage('Pain score before must be between 0 and 10'),

  body('painScoreAfter')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 10 }).withMessage('Pain score after must be between 0 and 10'),

  body('exercisePrescription')
    .optional()
    .isArray().withMessage('Exercise prescription must be an array'),

  body('exercisePrescription.*.exerciseName')
    .trim()
    .notEmpty().withMessage('Each exercise must have a name'),

  body('exercisePrescription.*.exerciseLibraryId')
    .optional({ nullable: true })
    .isString().trim(),

  body('exercisePrescription.*.prescriptionDuration')
    .optional({ nullable: true })
    .isString().trim(),

  body('medications')
    .optional()
    .isArray().withMessage('Medications must be an array'),

  body('clinicalObservations')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('Clinical observations must not exceed 2000 characters'),

  body('followUpRecommendation.recommended')
    .optional()
    .isBoolean().withMessage('followUpRecommendation.recommended must be a boolean'),

  body('followUpRecommendation.intervalDays')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 365 }).withMessage('Follow-up interval must be between 1 and 365 days'),

  body('followUpRecommendation.suggestedDate')
    .optional({ nullable: true })
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Suggested date must be in YYYY-MM-DD format'),

  body('followUpRecommendation.sessionGoal')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 300 }).withMessage('Session goal must not exceed 300 characters'),

  body('isSharedWithPatient')
    .optional()
    .isBoolean().withMessage('isSharedWithPatient must be a boolean'),
];

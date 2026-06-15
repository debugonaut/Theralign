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

export const generateExerciseValidation = [
  body('prompt')
    .notEmpty().withMessage('A prompt is required to generate an exercise.')
    .isLength({ min: 10, max: 500 }).withMessage('Describe the exercise in at least 10 characters and keep it under 500.')
    .trim(),
  body('targetMuscleGroups')
    .optional()
    .isArray().withMessage('targetMuscleGroups must be an array'),
  body('targetMuscleGroups.*')
    .optional()
    .isString().trim(),
  body('patientCondition')
    .optional({ nullable: true })
    .isLength({ max: 200 }).withMessage('Patient condition must be under 200 characters')
    .trim(),
  body('difficultyLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced']).withMessage('difficultyLevel must be beginner, intermediate, or advanced'),
];

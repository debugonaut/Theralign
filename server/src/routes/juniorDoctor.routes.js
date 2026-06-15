import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { seniorOnly } from '../middleware/juniorGuard.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { body, param } from 'express-validator';
import {
  inviteJunior,
  acceptInvitation,
  getTeam,
  removeJunior,
  updateSettings,
  cancelInvitation,
} from '../controllers/juniorDoctor.controller.js';

const router = Router();

// ─── Public: accept invitation and register ─────────────────────────────────
router.post(
  '/accept/:token',
  [
    param('token').notEmpty().withMessage('Invitation token is required').trim(),
    body('name')
      .notEmpty().trim().isLength({ min: 2, max: 80 })
      .withMessage('Name must be between 2 and 80 characters'),
    body('email')
      .isEmail().normalizeEmail()
      .withMessage('A valid email is required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number'),
    body('phone')
      .trim()
      .matches(/^\+?[0-9]{10,13}$/)
      .withMessage('Please provide a valid phone number (10–13 digits)'),
  ],
  validate,
  acceptInvitation
);

// ─── Senior-only: Practice management routes ────────────────────────────────
router.post(
  '/invite',
  requireAuth,
  requireRole('doctor'),
  seniorOnly,
  [
    body('email')
      .isEmail().normalizeEmail()
      .withMessage('A valid email is required'),
  ],
  validate,
  inviteJunior
);

router.get('/team', requireAuth, requireRole('doctor'), seniorOnly, getTeam);

router.delete(
  '/team/:juniorProfileId',
  requireAuth,
  requireRole('doctor'),
  seniorOnly,
  [
    param('juniorProfileId').isMongoId().withMessage('Invalid junior profile ID'),
  ],
  validate,
  removeJunior
);

router.patch(
  '/settings',
  requireAuth,
  requireRole('doctor'),
  seniorOnly,
  [
    body('maxJuniorDoctors')
      .isInt({ min: 0, max: 10 })
      .withMessage('maxJuniorDoctors must be an integer between 0 and 10'),
    body('practiceName')
      .optional({ nullable: true })
      .trim()
      .isLength({ max: 100 })
      .withMessage('Practice name must be under 100 characters'),
  ],
  validate,
  updateSettings
);

router.delete(
  '/invite',
  requireAuth,
  requireRole('doctor'),
  seniorOnly,
  [
    body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
  ],
  validate,
  cancelInvitation
);

export default router;

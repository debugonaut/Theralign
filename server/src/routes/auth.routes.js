import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { registerValidation, loginValidation } from '../validations/auth.validation.js';
import validate from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * POST /api/auth/register
 * Public — Register a new patient or doctor account.
 * Admin accounts are seeded programmatically and cannot be registered here.
 */
router.post('/register', registerValidation, validate, register);

/**
 * POST /api/auth/login
 * Public — Log in with email and password. Returns JWT token.
 */
router.post('/login', loginValidation, validate, login);

/**
 * GET /api/auth/me
 * Protected — Return the authenticated user's profile.
 * Requires: valid Bearer token in Authorization header.
 */
router.get('/me', requireAuth, getMe);

export default router;

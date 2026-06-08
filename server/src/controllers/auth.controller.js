import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import * as authService from '../services/auth.service.js';

/**
 * POST /api/auth/register
 * Register a new user (patient or doctor).
 * Admin accounts are seeded — cannot be created through this endpoint.
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const result = await authService.registerUser({ name, email, password, role });
  return successResponse(res, 201, 'Registration successful', result);
});

/**
 * POST /api/auth/login
 * Log in with email and password. Returns a JWT token.
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser({ email, password });
  return successResponse(res, 200, 'Login successful', result);
});

/**
 * GET /api/auth/me
 * Return the currently authenticated user's profile.
 * Requires: requireAuth middleware (populates req.user).
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);
  return successResponse(res, 200, 'User retrieved successfully', { user });
});

/**
 * POST /api/auth/forgot-password
 * Public — Generate a password reset token.
 * For demo: returns the raw token in the response (skip email delivery).
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return successResponse(res, 200, 'If this email exists, a reset link has been sent.', {
      message: 'If this email exists, a reset link has been sent.',
    });
  }
  const result = await authService.forgotPassword({ email });
  return successResponse(res, 200, result.message, result);
});

/**
 * POST /api/auth/reset-password
 * Public — Reset password using a valid token.
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const result = await authService.resetPassword({ token, newPassword });
  return successResponse(res, 200, result.message, result);
});


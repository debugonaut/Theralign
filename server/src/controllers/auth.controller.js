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

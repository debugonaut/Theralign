import axiosInstance from './axiosInstance';

/**
 * Register a new patient or doctor account.
 * @param {{ name: string, email: string, password: string, role?: string }} userData
 */
export const registerAPI = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

/**
 * Log in with email and password.
 * @param {{ email: string, password: string }} credentials
 */
export const loginAPI = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

/**
 * Fetch the currently authenticated user's profile.
 * Requires: Authorization header (injected automatically by axiosInstance interceptor).
 */
export const getMeAPI = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

/**
 * Request a password reset token for a given email address.
 * Demo mode: the API returns the raw token in the response body.
 * @param {string} email
 */
export const forgotPasswordAPI = async (email) => {
  const response = await axiosInstance.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * Reset password using the token received from forgotPasswordAPI.
 * @param {{ token: string, newPassword: string }} params
 */
export const resetPasswordAPI = async ({ token, newPassword }) => {
  const response = await axiosInstance.post('/auth/reset-password', { token, newPassword });
  return response.data;
};


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

import axiosInstance from './axiosInstance';

/**
 * Public — Accept a junior doctor invitation and register.
 * @param {string} token - The invitation token
 * @param {{ name: string, email: string, password: string, phone: string }} data
 */
export const acceptJuniorInviteAPI = (token, data) =>
  axiosInstance.post(`/junior/accept/${token}`, data);

/**
 * Senior — Send/resend an invitation email.
 * @param {{ email: string }} data
 */
export const inviteJuniorDoctorAPI = (data) =>
  axiosInstance.post('/junior/invite', data);

/**
 * Senior — Get list of team members (active and pending).
 */
export const getJuniorDoctorsAPI = () =>
  axiosInstance.get('/junior/team');

/**
 * Senior — Remove a junior doctor from the practice.
 * @param {string} juniorProfileId
 */
export const removeJuniorDoctorAPI = (juniorProfileId) =>
  axiosInstance.delete(`/junior/team/${juniorProfileId}`);

/**
 * Senior — Update practice limit and name settings.
 * @param {{ maxJuniorDoctors: number, practiceName: string }} data
 */
export const updatePracticeSettingsAPI = (data) =>
  axiosInstance.patch('/junior/settings', data);

/**
 * Senior — Cancel a pending junior doctor invitation.
 * @param {string} email
 */
export const cancelJuniorInviteAPI = (email) =>
  axiosInstance.delete('/junior/invite', { data: { email } });

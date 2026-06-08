import axiosInstance from './axiosInstance';

/**
 * Patient joins a doctor's waitlist.
 */
export const joinWaitlist = (doctorId) =>
  axiosInstance.post(`/waitlist/join/${doctorId}`);

/**
 * Patient leaves/unsubscribes from a doctor's waitlist.
 */
export const leaveWaitlist = (doctorId) =>
  axiosInstance.delete(`/waitlist/leave/${doctorId}`);

/**
 * Checks if the current authenticated patient is subscribed to the waitlist of a specific doctor.
 */
export const checkWaitlistStatus = (doctorId) =>
  axiosInstance.get(`/waitlist/status/${doctorId}`);

/**
 * Fetches all waitlists for the current patient.
 */
export const getMyWaitlists = () =>
  axiosInstance.get('/waitlist/mine');

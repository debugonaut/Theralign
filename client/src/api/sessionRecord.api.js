import axiosInstance from './axiosInstance';

const BASE = '/session-records';

/**
 * POST /api/session-records/:appointmentId
 * Doctor creates a session record for a completed appointment.
 */
export const createSessionRecord = (appointmentId, data) =>
  axiosInstance.post(`${BASE}/${appointmentId}`, data);

/**
 * GET /api/session-records/:appointmentId
 * Retrieves the session record for an appointment.
 * Access rules enforced server-side (role-based).
 */
export const getSessionRecord = (appointmentId) =>
  axiosInstance.get(`${BASE}/${appointmentId}`);

/**
 * PUT /api/session-records/:appointmentId
 * Doctor updates a session record within the 24-hour edit window.
 */
export const updateSessionRecord = (appointmentId, data) =>
  axiosInstance.put(`${BASE}/${appointmentId}`, data);

/**
 * GET /api/session-records/doctor/history
 * Doctor's paginated session record history.
 * @param {Object} params — { patientId?, page?, limit? }
 */
export const getDoctorSessionHistory = (params = {}) =>
  axiosInstance.get(`${BASE}/doctor/history`, { params });

/**
 * GET /api/session-records/patient/timeline
 * Patient's care timeline with optional filters.
 * @param {Object} params — { doctorId?, dateFrom?, dateTo?, page?, limit? }
 */
export const getPatientTimeline = (params = {}) =>
  axiosInstance.get(`${BASE}/patient/timeline`, { params });

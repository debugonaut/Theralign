import axiosInstance from './axiosInstance';

/**
 * Patient cancels appointment and requests refund
 */
export const cancelAppointmentPatientAPI = (appointmentId, reason) =>
  axiosInstance.post(`/appointments/${appointmentId}/cancel-patient`, { reason });

/**
 * Doctor cancels appointment (automatic refund)
 */
export const cancelAppointmentDoctorAPI = (appointmentId) =>
  axiosInstance.post(`/appointments/${appointmentId}/cancel-doctor`);

/**
 * Admin fetches pending refund requests
 */
export const getPendingRefundsAPI = (params) =>
  axiosInstance.get('/admin/refunds', { params });

/**
 * Admin gets refund statistics
 */
export const getRefundStatsAPI = () =>
  axiosInstance.get('/admin/refunds/stats');

/**
 * Admin approves a pending refund
 */
export const approveRefundAPI = (paymentId, adminNote) =>
  axiosInstance.patch(`/admin/refunds/${paymentId}/approve`, { adminNote });

/**
 * Admin rejects a pending refund
 */
export const rejectRefundAPI = (paymentId, adminNote) =>
  axiosInstance.patch(`/admin/refunds/${paymentId}/reject`, { adminNote });

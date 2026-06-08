import axiosInstance from './axiosInstance';

export const cancelAppointmentPatientAPI = (appointmentId, reason) =>
  axiosInstance.post(`/appointments/${appointmentId}/cancel-patient`, { reason });

export const cancelAppointmentDoctorAPI = (appointmentId) =>
  axiosInstance.post(`/appointments/${appointmentId}/cancel-doctor`);

// Admin: GET /payments/admin/refunds?status=requested
export const getPendingRefundsAPI = (params) =>
  axiosInstance.get('/payments/admin/refunds', { params: { status: 'requested', ...params } });

// Admin: approve — PATCH /payments/admin/:paymentId/refund { action: 'approve', adminNote }
export const approveRefundAPI = (paymentId, adminNote) =>
  axiosInstance.patch(`/payments/admin/${paymentId}/refund`, { action: 'approve', adminNote });

// Admin: reject — PATCH /payments/admin/:paymentId/refund { action: 'reject', adminNote }
export const rejectRefundAPI = (paymentId, adminNote) =>
  axiosInstance.patch(`/payments/admin/${paymentId}/refund`, { action: 'reject', adminNote });

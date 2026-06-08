import axiosInstance from './axiosInstance';

export const getPendingRefundsAPI = () =>
  axiosInstance.get('/payments/admin/refunds', { params: { status: 'requested' } });

export const approveRefundAPI = (paymentId, adminNote) =>
  axiosInstance.patch(`/payments/admin/${paymentId}/refund`, { action: 'approve', adminNote });

export const rejectRefundAPI = (paymentId, adminNote) =>
  axiosInstance.patch(`/payments/admin/${paymentId}/refund`, { action: 'reject', adminNote });

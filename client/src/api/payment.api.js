import axiosInstance from './axiosInstance';

/**
 * Patient: Initiates Razorpay payment order.
 * @param {string} appointmentId
 */
export const createPaymentOrder = async (appointmentId) => {
  const response = await axiosInstance.post('/payments/create-order', { appointmentId });
  return response.data;
};

/**
 * Patient: Cryptographically verifies signature on server.
 * @param {object} data - { razorpayOrderId, razorpayPaymentId, razorpaySignature, appointmentId }
 */
export const verifyPayment = async (data) => {
  const response = await axiosInstance.post('/payments/verify', data);
  return response.data;
};

/**
 * Patient: Retrieves their paid payment receipts.
 */
export const getMyPayments = async () => {
  const response = await axiosInstance.get('/payments/mine');
  return response.data;
};

export const requestRefund = async (paymentId, reason) => {
  const response = await axiosInstance.post(`/payments/${paymentId}/request-refund`, { reason });
  return response.data;
};

export const getRefundRequestsAdmin = async (status = 'requested') => {
  const response = await axiosInstance.get(`/payments/admin/refunds?status=${status}`);
  return response.data;
};

export const resolveRefund = async (paymentId, action, adminNote = '') => {
  const response = await axiosInstance.patch(`/payments/admin/${paymentId}/refund`, { action, adminNote });
  return response.data;
};

import axiosInstance from './axiosInstance';

/**
 * Retrieve all pending doctor verification requests.
 */
export const getPendingDoctorsAPI = async () => {
  const response = await axiosInstance.get('/admin/doctors/pending');
  return response.data;
};

/**
 * Approve a doctor's onboarding application.
 *
 * @param {string} profileId - The DoctorProfile ID
 */
export const verifyDoctorAPI = async (profileId) => {
  const response = await axiosInstance.patch(`/admin/doctors/${profileId}/verify`);
  return response.data;
};

/**
 * Reject a doctor's onboarding application with a detailed feedback reason.
 *
 * @param {string} profileId - The DoctorProfile ID
 * @param {string} rejectionReason - Rejection explanation
 */
export const rejectDoctorAPI = async (profileId, rejectionReason) => {
  const response = await axiosInstance.patch(`/admin/doctors/${profileId}/reject`, {
    rejectionReason,
  });
  return response.data;
};

/**
 * Admin: Retrieve paginated list of all system appointments.
 * @param {number} page
 * @param {number} limit
 */
export const getAllAppointments = async (page = 1, limit = 10) => {
  const response = await axiosInstance.get(`/appointments/admin/all?page=${page}&limit=${limit}`);
  return response.data;
};


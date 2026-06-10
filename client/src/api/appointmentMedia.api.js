import axiosInstance from './axiosInstance';

/**
 * POST /api/appointment-media/upload/:appointmentId
 * Upload media file (image, video, audio) for an appointment.
 * @param {string} appointmentId - Appointment ID
 * @param {File} file - Media file to upload
 * @param {string} description - Optional description of media
 */
export const uploadAppointmentMedia = async (appointmentId, file, description = '') => {
  const formData = new FormData();
  formData.append('media', file);
  if (description) {
    formData.append('description', description);
  }

  const response = await axiosInstance.post(
    `/appointment-media/upload/${appointmentId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * GET /api/appointment-media/:appointmentId
 * Retrieve all media for an appointment.
 * @param {string} appointmentId - Appointment ID
 */
export const getAppointmentMedia = async (appointmentId) => {
  const response = await axiosInstance.get(`/appointment-media/${appointmentId}`);
  return response.data;
};

/**
 * DELETE /api/appointment-media/:mediaId
 * Delete a specific media file from an appointment.
 * @param {string} mediaId - Media ID to delete
 */
export const deleteAppointmentMedia = async (mediaId) => {
  const response = await axiosInstance.delete(`/appointment-media/${mediaId}`);
  return response.data;
};

/**
 * GET /api/appointment-media/count/:appointmentId
 * Get the count of media files for an appointment.
 * @param {string} appointmentId - Appointment ID
 */
export const getAppointmentMediaCount = async (appointmentId) => {
  const response = await axiosInstance.get(`/appointment-media/count/${appointmentId}`);
  return response.data;
};

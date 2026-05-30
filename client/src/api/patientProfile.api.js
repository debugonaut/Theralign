import api from './axiosInstance';

export const patientProfileService = {
  /**
   * Get the current patient's profile
   */
  getProfile: async () => {
    const response = await api.get('/patients/profile/me');
    return response.data;
  },

  /**
   * Update the patient's profile (supports partial updates)
   * @param {Object} data - The fields to update
   */
  updateProfile: async (data) => {
    const response = await api.put('/patients/profile/me', data);
    return response.data;
  },

  /**
   * Upload an avatar image to Cloudinary
   * @param {File} file - The image file
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    const response = await api.post('/patients/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default patientProfileService;

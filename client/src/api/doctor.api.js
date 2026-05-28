import axiosInstance from './axiosInstance';

/**
 * Submit professional onboarding data and document files.
 * Since this endpoint processes files, it expects a FormData payload.
 *
 * @param {FormData} formData - Multipart data containing files and fields
 */
export const onboardDoctorAPI = async (formData) => {
  const response = await axiosInstance.put('/doctors/profile/onboard', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Fetch the currently authenticated doctor's profile.
 */
export const getDoctorProfileAPI = async () => {
  const response = await axiosInstance.get('/doctors/profile/me');
  return response.data;
};

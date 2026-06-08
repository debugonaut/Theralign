import axiosInstance from './axiosInstance';

/**
 * Sends patient symptoms to the AI service for specialization analysis.
 * 
 * @param {string} symptoms 
 */
export const interpretSymptomsAPI = async (symptoms) => {
  const response = await axiosInstance.post('/ai/interpret-symptoms', { symptoms });
  return response.data;
};

/**
 * Lazily retrieves or generates the AI summary for a specific doctor profile.
 * 
 * @param {string} doctorId 
 */
export const getDoctorAISummaryAPI = async (doctorId) => {
  const response = await axiosInstance.get(`/ai/doctor-summary/${doctorId}`);
  return response.data;
};

/**
 * Triggers batch summary generation for all verified doctors without summaries. Admin only.
 */
export const triggerBatchSummariesAPI = async () => {
  const response = await axiosInstance.post('/ai/admin/batch-summaries');
  return response.data;
};

import axiosInstance from './axiosInstance';

/**
 * Fetch a standard, paginated, optionally filtered listing of doctors.
 * @param {object} params - query parameters { specialization, minFee, maxFee, minRating, minExperience, sortBy, page, limit }
 */
export const getDiscoveryListingAPI = async (params) => {
  const response = await axiosInstance.get('/discover', { params });
  return response.data;
};

/**
 * Fetch nearby doctors based on geolocation.
 * @param {object} params - query parameters { latitude, longitude, maxDistance, specialization, page, limit }
 */
export const getNearbyDoctorsAPI = async (params) => {
  const response = await axiosInstance.get('/discover/nearby', { params });
  return response.data;
};

/**
 * Perform a full-text search across doctor names and attributes.
 * @param {object} params - query parameters { q, specialization, page, limit }
 */
export const searchDoctorsAPI = async (params) => {
  const response = await axiosInstance.get('/discover/search', { params });
  return response.data;
};

/**
 * Retrieve featured doctors list (top rated).
 */
export const getFeaturedDoctorsAPI = async () => {
  const response = await axiosInstance.get('/discover/featured');
  return response.data;
};

/**
 * Fetch all available specializations with count of verified, available doctors.
 */
export const getSpecializationsAPI = async () => {
  const response = await axiosInstance.get('/discover/specializations');
  return response.data;
};

/**
 * Retrieve the complete public detail profile of a doctor.
 * @param {string} id - The DoctorProfile ID
 */
export const getDoctorPublicProfileAPI = async (id) => {
  const response = await axiosInstance.get(`/discover/${id}`);
  return response.data;
};

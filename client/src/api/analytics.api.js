import axiosInstance from './axiosInstance';

export const getPlatformOverviewAPI = () =>
  axiosInstance.get('/admin/analytics/overview');

export const getRevenueSeriesAPI = (params) =>
  axiosInstance.get('/admin/analytics/revenue', { params });

export const getAppointmentBreakdownAPI = () =>
  axiosInstance.get('/admin/analytics/appointments');

export const getTopDoctorsAPI = (params) =>
  axiosInstance.get('/admin/analytics/top-doctors', { params });

export const getSpecializationBreakdownAPI = () =>
  axiosInstance.get('/admin/analytics/specializations');

export const getUserGrowthAPI = (params) =>
  axiosInstance.get('/admin/analytics/user-growth', { params });

export const getRecentActivityAPI = (params) =>
  axiosInstance.get('/admin/analytics/recent-activity', { params });

// User management
export const getAllUsersAdminAPI = (params) =>
  axiosInstance.get('/admin/users', { params });

export const toggleUserStatusAPI = (userId) =>
  axiosInstance.patch(`/admin/users/${userId}/status`);

// Doctor management
export const getAllDoctorsAdminAPI = (params) =>
  axiosInstance.get('/admin/doctors/all', { params });

export const suspendDoctorAPI = (profileId, reason) =>
  axiosInstance.patch(`/admin/doctors/${profileId}/suspend`, { reason });

export const reconsiderDoctorAPI = (profileId) =>
  axiosInstance.patch(`/admin/doctors/${profileId}/reconsider`);

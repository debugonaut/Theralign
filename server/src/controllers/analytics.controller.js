import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import AppError from '../utils/AppError.js';
import * as analyticsService from '../services/analytics.service.js';

/**
 * GET /api/admin/analytics/overview
 */
export const getPlatformOverviewController = asyncHandler(async (req, res) => {
  const overview = await analyticsService.getPlatformOverview();
  return successResponse(res, 200, 'Platform overview retrieved', overview);
});

/**
 * GET /api/admin/analytics/revenue
 */
export const getRevenueSeriesController = asyncHandler(async (req, res) => {
  const { period = 'daily', startDate, endDate } = req.query;

  if (!['daily', 'weekly', 'monthly'].includes(period)) {
    throw new AppError('period must be daily, weekly, or monthly', 400);
  }

  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  if (start > end) {
    throw new AppError('startDate must be before endDate', 400);
  }

  const data = await analyticsService.getRevenueTimeSeries({
    period,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  });

  return successResponse(res, 200, 'Revenue series retrieved', {
    series: data,
    period,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  });
});

/**
 * GET /api/admin/analytics/appointments
 */
export const getAppointmentBreakdownController = asyncHandler(async (req, res) => {
  const data = await analyticsService.getAppointmentStatusBreakdown();
  return successResponse(res, 200, 'Appointment breakdown retrieved', data);
});

/**
 * GET /api/admin/analytics/top-doctors
 */
export const getTopDoctorsController = asyncHandler(async (req, res) => {
  const { limit = 10, metric = 'earnings' } = req.query;

  if (!['earnings', 'appointments', 'rating'].includes(metric)) {
    throw new AppError('metric must be earnings, appointments, or rating', 400);
  }

  const doctors = await analyticsService.getTopDoctors({
    limit: Math.min(Number(limit), 20),
    metric,
  });

  return successResponse(res, 200, 'Top doctors retrieved', { doctors, metric });
});

/**
 * GET /api/admin/analytics/specializations
 */
export const getSpecializationBreakdownController = asyncHandler(async (req, res) => {
  const data = await analyticsService.getSpecializationBreakdown();
  return successResponse(res, 200, 'Specialization breakdown retrieved', data);
});

/**
 * GET /api/admin/analytics/user-growth
 */
export const getUserGrowthController = asyncHandler(async (req, res) => {
  const { period = 'daily' } = req.query;

  if (!['daily', 'weekly', 'monthly'].includes(period)) {
    throw new AppError('period must be daily, weekly, or monthly', 400);
  }

  const data = await analyticsService.getUserGrowthTimeSeries({ period });
  return successResponse(res, 200, 'User growth retrieved', { series: data, period });
});

/**
 * GET /api/admin/analytics/recent-activity
 */
export const getRecentActivityController = asyncHandler(async (req, res) => {
  const { limit = 15 } = req.query;
  const activity = await analyticsService.getRecentActivity({
    limit: Math.min(Number(limit), 50),
  });
  return successResponse(res, 200, 'Recent activity retrieved', { activity });
});

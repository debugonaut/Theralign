import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import * as analyticsController from '../controllers/analytics.controller.js';

const router = express.Router();

// Apply auth + admin role check to ALL analytics routes
router.use(requireAuth, requireRole('admin'));

router.get('/overview',        analyticsController.getPlatformOverviewController);
router.get('/revenue',         analyticsController.getRevenueSeriesController);
router.get('/appointments',    analyticsController.getAppointmentBreakdownController);
router.get('/top-doctors',     analyticsController.getTopDoctorsController);
router.get('/specializations', analyticsController.getSpecializationBreakdownController);
router.get('/user-growth',     analyticsController.getUserGrowthController);
router.get('/recent-activity', analyticsController.getRecentActivityController);

export default router;

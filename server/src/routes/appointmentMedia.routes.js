import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
  uploadAppointmentMedia,
  getAppointmentMedia,
  deleteAppointmentMedia,
  getAppointmentMediaCount,
} from '../controllers/appointmentMedia.controller.js';

const router = express.Router();

/**
 * Media upload routes
 * - POST /appointment-media/upload/:appointmentId — Upload media
 * - GET /appointment-media/:appointmentId — Fetch all media
 * - DELETE /appointment-media/:mediaId — Delete specific media
 * - GET /appointment-media/count/:appointmentId — Get media count
 */

// Upload media (multipart form-data, single file)
router.post(
  '/upload/:appointmentId',
  requireAuth,
  upload.single('media'),
  uploadAppointmentMedia
);

// Retrieve all media for an appointment
router.get(
  '/:appointmentId',
  requireAuth,
  getAppointmentMedia
);

// Delete specific media
router.delete(
  '/:mediaId',
  requireAuth,
  deleteAppointmentMedia
);

// Get media count
router.get(
  '/count/:appointmentId',
  requireAuth,
  getAppointmentMediaCount
);

export default router;

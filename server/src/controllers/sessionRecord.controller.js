import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import * as sessionRecordService from '../services/sessionRecord.service.js';

/**
 * POST /api/session-records/:appointmentId
 * Doctor creates a session record for a completed appointment.
 */
export const createSessionRecord = asyncHandler(async (req, res) => {
  const record = await sessionRecordService.createSessionRecord(
    req.user.id,
    req.params.appointmentId,
    req.body
  );
  return successResponse(res, 201, 'Session record created', record);
});

/**
 * GET /api/session-records/:appointmentId
 * Retrieves a session record. Access rules enforced in service layer.
 */
export const getSessionRecord = asyncHandler(async (req, res) => {
  const record = await sessionRecordService.getSessionRecordByAppointment(
    req.params.appointmentId,
    req.user.id,
    req.user.role
  );
  return successResponse(res, 200, 'Session record retrieved', record);
});

/**
 * PUT /api/session-records/:appointmentId
 * Doctor updates a session record within the 24-hour edit window.
 */
export const updateSessionRecord = asyncHandler(async (req, res) => {
  const record = await sessionRecordService.updateSessionRecord(
    req.user.id,
    req.params.appointmentId,
    req.body
  );
  return successResponse(res, 200, 'Session record updated', record);
});

/**
 * GET /api/session-records/doctor/history
 * Doctor's paginated session record history with optional patient filter.
 */
export const getDoctorHistory = asyncHandler(async (req, res) => {
  const { patientId, page = 1, limit = 10 } = req.query;
  const result = await sessionRecordService.getDoctorSessionHistory(req.user.id, {
    patientId,
    page: Number(page),
    limit: Number(limit),
  });
  return successResponse(res, 200, 'Doctor session history retrieved', result);
});

/**
 * GET /api/session-records/patient/timeline
 * Patient's care timeline with optional filters and summary metrics.
 */
export const getPatientTimeline = asyncHandler(async (req, res) => {
  const { doctorId, dateFrom, dateTo, page = 1, limit = 10 } = req.query;
  const result = await sessionRecordService.getPatientCareTimeline(req.user.id, {
    doctorId,
    dateFrom,
    dateTo,
    page: Number(page),
    limit: Number(limit),
  });
  return successResponse(res, 200, 'Patient care timeline retrieved', result);
});

/**
 * PATCH /api/session-records/:appointmentId/archive
 * Admin-only soft archive. Never hard-deletes clinical records.
 */
export const archiveSessionRecord = asyncHandler(async (req, res) => {
  const record = await sessionRecordService.archiveSessionRecord(
    req.user.id,
    req.params.appointmentId
  );
  return successResponse(res, 200, 'Session record archived', record);
});

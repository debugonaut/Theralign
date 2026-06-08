import * as refundService from '../services/refund.service.js';
import { successResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// Patient cancels their appointment
export const cancelAppointmentPatient = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { reason } = req.body;

  const result = await refundService.initiatePatientCancellation(
    appointmentId,
    req.user.id,
    reason
  );

  return successResponse(
    res,
    200,
    'Appointment cancelled. Refund request submitted.',
    result
  );
});

// Doctor cancels appointment
export const cancelAppointmentDoctor = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const result = await refundService.initiateDoctorCancellation(
    appointmentId,
    req.user.doctorProfile
  );

  return successResponse(
    res,
    200,
    'Appointment cancelled. Patient refund initiated automatically.',
    result
  );
});

// Admin gets pending refund queue
export const getPendingRefunds = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const result = await refundService.getPendingRefunds({
    page: Number(page),
    limit: Number(limit),
  });

  return successResponse(res, 200, 'Pending refunds retrieved', result);
});

// Admin approves refund
export const approveRefund = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { adminNote } = req.body;

  const result = await refundService.approveRefund(
    paymentId,
    req.user.id,
    adminNote
  );

  return successResponse(res, 200, 'Refund approved and processed', result);
});

// Admin rejects refund
export const rejectRefund = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { adminNote } = req.body;

  const result = await refundService.rejectRefund(
    paymentId,
    req.user.id,
    adminNote
  );

  return successResponse(res, 200, 'Refund request rejected', result);
});

// Admin gets refund stats
export const getRefundStats = asyncHandler(async (req, res) => {
  const result = await refundService.getRefundStats();

  return successResponse(res, 200, 'Refund statistics retrieved', result);
});

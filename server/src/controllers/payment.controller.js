import crypto from 'crypto';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import AppError from '../utils/AppError.js';
import Appointment from '../models/Appointment.model.js';
import Payment from '../models/Payment.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import User from '../models/User.model.js';
import razorpayInstance from '../config/razorpay.js';
import config from '../config/env.js';
import {
  sendBookingConfirmation,
  sendRefundApprovedEmail,
  sendRefundInitiatedEmail,
  sendRefundRejectedEmail,
} from '../services/emailService.js';
import { createNotification } from '../services/notificationService.js';

/**
 * POST /api/payments/create-order
 * Patient initiates payment for an appointment.
 * Protect: requireAuth, requireRole('patient')
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { appointmentId } = req.body;

  if (!appointmentId) {
    throw new AppError('Appointment ID is required to create a payment order.', 400);
  }

  // 1. Find Appointment and check validations
  const appointment = await Appointment.findById(appointmentId)
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' }
    });

  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  // Verify appointment belongs to this patient
  if (appointment.patient.toString() !== req.user.id.toString()) {
    throw new AppError('You are not authorized to pay for this appointment.', 403);
  }

  if (appointment.paymentStatus === 'paid') {
    throw new AppError('This appointment has already been paid for.', 400);
  }

  if (appointment.status === 'cancelled') {
    throw new AppError('Cannot pay for a cancelled appointment.', 400);
  }

  // 2. Create Razorpay order
  let order;
  try {
    order = await razorpayInstance.orders.create({
      amount: Math.round(appointment.consultationFee * 100), // Convert rupees to paise
      currency: 'INR',
      receipt: `receipt_${appointmentId}`,
      notes: {
        appointmentId: appointmentId.toString(),
        patientId: req.user.id.toString(),
      }
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw new AppError('Failed to create payment order with payment gateway.', 500);
  }

  // 3. Upsert Payment document in database
  let payment = await Payment.findOne({ appointment: appointmentId });
  if (payment) {
    payment.razorpayOrderId = order.id;
    payment.amount = appointment.consultationFee;
    payment.status = 'created';
    payment.platformCommission = appointment.platformCommission;
    payment.doctorEarnings = appointment.doctorEarnings;
    await payment.save();
  } else {
    payment = await Payment.create({
      appointment: appointmentId,
      patient: req.user.id,
      doctor: appointment.doctor._id,
      razorpayOrderId: order.id,
      amount: appointment.consultationFee,
      currency: 'INR',
      status: 'created',
      platformCommission: appointment.platformCommission,
      doctorEarnings: appointment.doctorEarnings,
    });
  }

  // 4. Return order configuration details
  return successResponse(res, 201, 'Payment order created successfully', {
    orderId: order.id,
    amount: appointment.consultationFee,
    currency: 'INR',
    keyId: config.razorpay.keyId,
    appointmentId,
    doctorName: appointment.doctor?.user?.name || 'Physiotherapist',
  });
});

/**
 * POST /api/payments/verify
 * Verify Razorpay signature after client-side payment.
 * Protect: requireAuth, requireRole('patient')
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, appointmentId } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !appointmentId) {
    throw new AppError('Missing required verification credentials.', 400);
  }

  // 1. Find Payment record and verify ownership + appointment binding
  const payment = await Payment.findOne({ razorpayOrderId });
  if (!payment) {
    throw new AppError('Payment record not found.', 404);
  }

  if (payment.patient.toString() !== req.user.id.toString()) {
    throw new AppError('You are not authorized to verify this payment.', 403);
  }

  if (payment.appointment.toString() !== appointmentId.toString()) {
    throw new AppError('Payment does not match the provided appointment.', 400);
  }

  // Idempotent: already verified — return without re-processing side effects
  if (payment.status === 'paid') {
    return successResponse(res, 200, 'Payment already verified.', { appointmentId });
  }

  // 2. Cryptographically verify signature
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  let isMatch = false;
  if (expectedSignature.length === razorpaySignature.length) {
    try {
      isMatch = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(razorpaySignature, 'utf-8')
      );
    } catch (e) {
      isMatch = false;
    }
  }

  if (!isMatch) {
    throw new AppError('Payment verification failed. Invalid signature.', 400);
  }

  // 3. Update Payment record
  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  payment.status = 'paid';
  await payment.save();

  // 4. Update Appointment record and populate details for email/notification
  const appointment = await Appointment.findByIdAndUpdate(
    appointmentId,
    {
      $set: {
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentId: razorpayPaymentId,
      },
    },
    { new: true }
  ).populate([
    { path: 'patient', select: 'name email' },
    { path: 'doctor', populate: { path: 'user', select: 'name' } }
  ]);

  if (!appointment) {
    throw new AppError('Associated appointment not found.', 404);
  }

  const appointmentPatientId = appointment.patient?._id || appointment.patient;
  if (appointmentPatientId.toString() !== req.user.id.toString()) {
    throw new AppError('You are not authorized to verify this payment.', 403);
  }

  // 5. Increment Doctor totalEarnings
  await DoctorProfile.findByIdAndUpdate(payment.doctor, {
    $inc: { totalEarnings: payment.doctorEarnings }
  });

  // 6. Send Booking Confirmation Email (Fire and forget)
  if (appointment.patient?.email) {
    sendBookingConfirmation({
      patientEmail: appointment.patient.email,
      patientName: appointment.patient.name,
      doctorName: appointment.doctor?.user?.name || 'Physiotherapist',
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      consultationFee: appointment.consultationFee,
      appointmentId: appointment._id,
    });
  }

  // 7. Create Notifications
  // Notify Doctor
  const doctorUserId = appointment.doctor?.user?._id || appointment.doctor?.user;
  if (doctorUserId) {
    createNotification({
      recipientId: doctorUserId,
      type: 'appointment_booked',
      title: 'New Appointment Booked',
      message: `A new appointment has been scheduled by patient ${appointment.patient?.name} on ${appointment.date} at ${appointment.startTime}.`,
      link: '/doctor/appointments',
      relatedId: appointment._id,
    });
  }

  // Notify Patient
  const patientUserId = appointment.patient?._id || appointment.patient;
  if (patientUserId) {
    createNotification({
      recipientId: patientUserId,
      type: 'appointment_booked',
      title: 'Booking Confirmed',
      message: `Your appointment with Dr. ${appointment.doctor?.user?.name || 'Physiotherapist'} on ${appointment.date} at ${appointment.startTime} is confirmed.`,
      link: '/patient/appointments',
      relatedId: appointment._id,
    });
  }

  return successResponse(res, 200, 'Payment verified successfully.', { appointmentId });
});

/**
 * GET /api/payments/mine
 * Patient views their payment history.
 * Protect: requireAuth, requireRole('patient')
 */
export const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({
    patient: req.user.id,
    status: { $in: ['paid', 'refunded'] },
  })
    .populate('appointment', 'date startTime endTime status cancellationReason cancelledBy')
    .populate({
      path: 'doctor',
      select: 'specialization user',
      populate: { path: 'user', select: 'name' }
    })
    .sort({ createdAt: -1 });

  return successResponse(res, 200, 'Payment history retrieved successfully', payments);
});

/**
 * GET /api/payments/admin/all
 * Admin views all payments with revenue totals.
 * Protect: requireAuth, requireRole('admin')
 */
export const getAllPaymentsAdmin = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Run in parallel to avoid multiple round-trips
  const [payments, totalCount, aggregateData] = await Promise.all([
    Payment.find({ status: 'paid' })
      .populate('patient', 'name email')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' }
      })
      .populate('appointment', 'date startTime endTime')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments({ status: 'paid' }),
    Payment.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalCommission: { $sum: '$platformCommission' },
          totalDoctorEarnings: { $sum: '$doctorEarnings' },
        }
      }
    ])
  ]);

  const revenue = aggregateData[0] || {
    totalRevenue: 0,
    totalCommission: 0,
    totalDoctorEarnings: 0
  };

  return successResponse(res, 200, 'All payments retrieved successfully for admin', {
    payments,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    revenue: {
      totalRevenue: revenue.totalRevenue,
      totalCommission: revenue.totalCommission,
      totalDoctorEarnings: revenue.totalDoctorEarnings
    }
  });
});

/**
 * POST /api/payments/:paymentId/request-refund
 * Patient requests a refund for a cancelled paid appointment.
 * Protect: requireAuth, requireRole('patient')
 */
export const requestRefund = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { reason } = req.body;

  const payment = await Payment.findById(paymentId)
    .populate('patient', 'name email')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' }
    })
    .populate('appointment', 'date startTime status cancellationReason');
  if (!payment) throw new AppError('Payment record not found.', 404);

  if (payment.patient._id.toString() !== req.user.id.toString())
    throw new AppError('Not authorized.', 403);

  if (payment.status !== 'paid')
    throw new AppError('Only paid payments are eligible for refund.', 400);

  if (payment.refundStatus !== 'none')
    throw new AppError('A refund request already exists for this payment.', 400);

  const appointment = await Appointment.findById(payment.appointment);
  if (!appointment || appointment.status !== 'cancelled')
    throw new AppError('Refund is only available for cancelled appointments.', 400);

  payment.refundStatus = 'pending';
  payment.refundReason = reason || appointment.cancellationReason || '';
  payment.refundAmount = payment.amount;
  payment.refundInitiatedBy = 'patient';
  payment.refundRequestedAt = new Date();
  await payment.save();

  await createNotification({
    recipientId: req.user.id,
    type: 'appointment_cancelled',
    title: 'Refund Requested',
    message: `Your refund request of ₹${payment.amount} has been submitted and is under review.`,
    link: '/patient/payments',
  });

  const adminUsers = await User.find({ role: 'admin', isActive: true }).select('_id');
  await Promise.all(
    adminUsers.map((admin) =>
      createNotification({
        recipientId: admin._id,
        type: 'REFUND_REQUEST',
        title: 'New Refund Request',
        message: `Refund requested by ${payment.patient.name} for the appointment with Dr. ${payment.doctor?.user?.name || 'Physiotherapist'}.`,
        link: '/admin/refunds',
        relatedId: payment._id,
      })
    )
  );

  await sendRefundInitiatedEmail({
    patientEmail: payment.patient.email,
    patientName: payment.patient.name,
    doctorName: payment.doctor?.user?.name || 'Physiotherapist',
    date: payment.appointment?.date,
    startTime: payment.appointment?.startTime,
    amount: payment.amount,
  });

  return successResponse(res, 200, 'Refund request submitted successfully.', payment);
});

/**
 * GET /api/payments/admin/refunds
 * Admin views all pending refund requests.
 * Protect: requireAuth, requireRole('admin')
 */
export const getRefundRequestsAdmin = asyncHandler(async (req, res) => {
  const { status = 'requested' } = req.query;
  const refundStatusFilter = status === 'requested' ? { $in: ['requested', 'pending'] } : status;

  const payments = await Payment.find({ refundStatus: refundStatusFilter })
    .populate('patient', 'name email')
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
    .populate('appointment', 'date startTime cancellationReason cancelledBy')
    .sort({ refundRequestedAt: -1 });

  return successResponse(res, 200, 'Refund requests retrieved.', payments);
});

/**
 * PATCH /api/payments/admin/:paymentId/refund
 * Admin approves or rejects a refund request.
 * On approval — calls Razorpay refund API and marks payment as refunded.
 * Protect: requireAuth, requireRole('admin')
 */
export const resolveRefund = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { action, adminNote } = req.body; // action: 'approve' | 'reject'

  if (!['approve', 'reject'].includes(action))
    throw new AppError('Action must be approve or reject.', 400);

  const payment = await Payment.findById(paymentId).populate('patient', 'name email');
  if (!payment) throw new AppError('Payment not found.', 404);

  if (!['requested', 'pending'].includes(payment.refundStatus))
    throw new AppError('This refund request is not in a pending state.', 400);

  if (action === 'reject') {
    payment.refundStatus = 'rejected';
    payment.refundAdminNote = adminNote || '';
    payment.adminNote = adminNote || '';
    payment.refundResolvedAt = new Date();
    await payment.save();

    await createNotification({
      recipientId: payment.patient._id,
      type: 'appointment_cancelled',
      title: 'Refund Request Rejected',
      message: `Your refund request of ₹${payment.amount} was reviewed and rejected. ${adminNote ? `Note: ${adminNote}` : ''}`,
      link: '/patient/payments',
    });

    await sendRefundRejectedEmail({
      patientEmail: payment.patient.email,
      patientName: payment.patient.name,
      amount: payment.refundAmount || payment.amount,
      adminNote,
    });

    return successResponse(res, 200, 'Refund request rejected.', payment);
  }

  // Approve — call Razorpay refund API
  if (!payment.razorpayPaymentId)
    throw new AppError('No Razorpay payment ID on record — cannot process refund.', 400);

  let refund;
  try {
    refund = await razorpayInstance.payments.refund(payment.razorpayPaymentId, {
      amount: Math.round(payment.amount * 100), // paise
      notes: { reason: payment.refundReason || 'Patient requested refund' },
    });
  } catch (err) {
    throw new AppError(`Razorpay refund failed: ${err.error?.description || err.message}`, 500);
  }

  payment.status = 'refunded';
  payment.refundStatus = 'processed';
  payment.refundId = refund.id;
  payment.refundAdminNote = adminNote || '';
  payment.adminNote = adminNote || '';
  payment.refundAmount = payment.refundAmount || payment.amount;
  payment.refundProcessedAt = new Date();
  payment.refundResolvedAt = new Date();
  await payment.save();

  // Deduct doctor earnings
  await DoctorProfile.findByIdAndUpdate(payment.doctor, {
    $inc: { totalEarnings: -payment.doctorEarnings },
  });

  await createNotification({
    recipientId: payment.patient._id,
    type: 'appointment_cancelled',
    title: 'Refund Approved',
    message: `Your refund of ₹${payment.refundAmount || payment.amount} has been approved and processed. It will reflect in 5–7 business days.`,
    link: '/patient/payments',
  });

  await sendRefundApprovedEmail({
    patientEmail: payment.patient.email,
    patientName: payment.patient.name,
    amount: payment.refundAmount || payment.amount,
    adminNote,
  });

  return successResponse(res, 200, 'Refund processed successfully.', payment);
});

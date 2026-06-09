import Appointment from '../models/Appointment.model.js';
import Payment from '../models/Payment.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import User from '../models/User.model.js';
import razorpayInstance from '../config/razorpay.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';
import { createNotification } from './notificationService.js';
import {
  sendRefundInitiatedEmail,
  sendRefundApprovedEmail,
  sendRefundRejectedEmail,
  sendDoctorCancelledRefundEmail,
} from './emailService.js';

/**
 * Patient cancels their appointment and requests a refund.
 * Creates a pending refund request requiring admin approval.
 */
export const initiatePatientCancellation = async (appointmentId, patientId, reason) => {
  // Validations
  const appointment = await Appointment.findById(appointmentId)
    .populate('doctor')
    .populate('patient');

  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  if (appointment.patient._id.toString() !== patientId.toString()) {
    throw new AppError('You can only cancel your own appointments', 403);
  }

  if (appointment.status !== 'confirmed') {
    throw new AppError('Only confirmed appointments can be cancelled', 400);
  }

  if (!reason || reason.trim().length < 10) {
    throw new AppError('Please provide a reason for cancellation (minimum 10 characters)', 400);
  }

  const payment = await Payment.findOne({
    appointment: appointmentId,
    status: 'paid',
  });

  if (!payment) {
    throw new AppError('No paid payment found for this appointment', 400);
  }

  // Actions
  // 1. Update Appointment
  appointment.status = 'cancelled';
  appointment.cancellationReason = reason;
  appointment.cancelledBy = 'patient';
  appointment.cancelledAt = new Date();
  await appointment.save();

  // 2. Update Payment
  payment.refundStatus = 'pending';
  payment.refundReason = reason;
  payment.refundRequestedAt = new Date();
  payment.refundInitiatedBy = 'patient';
  payment.refundAmount = payment.amount;
  await payment.save();

  // 3. Get doctor name for notifications
  const doctorUser = await User.findById(appointment.doctor.user);
  const doctorName = doctorUser?.name || 'the physiotherapist';

  // 4. Create notification for admin (send to all admins)
  const adminUsers = await User.find({ role: 'admin', isActive: true });
  for (const admin of adminUsers) {
    await createNotification({
      recipientId: admin._id,
      type: 'REFUND_REQUEST',
      title: 'New Refund Request',
      message: `Refund requested by patient for appointment with Dr. ${doctorName}`,
      link: '/admin/refunds',
      relatedId: payment._id,
    });
  }

  // 5. Create notification for patient
  await createNotification({
    recipientId: patientId,
    type: 'CANCELLATION_CONFIRMED',
    title: 'Appointment Cancelled',
    message: 'Your appointment has been cancelled. Your refund request is under review.',
    link: '/patient/appointments',
    relatedId: appointment._id,
  });

  // 6. Send email confirmation to patient (fire-and-forget — never blocks refund flow)
  sendRefundInitiatedEmail({
    patientEmail: appointment.patient.email,
    patientName: appointment.patient.name,
    doctorName,
    date: appointment.date,
    startTime: appointment.startTime,
    amount: payment.amount,
  }).catch((err) => logger.warn(`Refund initiation email failed: ${err.message}`));

  return { appointment, payment };
};

/**
 * Doctor cancels appointment. Refund is automatic — no admin approval needed.
 */
export const initiateDoctorCancellation = async (appointmentId, doctorId) => {
  // Validations
  const appointment = await Appointment.findById(appointmentId)
    .populate('doctor')
    .populate('patient');

  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  if (appointment.doctor._id.toString() !== doctorId.toString()) {
    throw new AppError('You can only cancel your own appointments', 403);
  }

  if (appointment.status !== 'confirmed') {
    throw new AppError('Only confirmed appointments can be cancelled', 400);
  }

  const payment = await Payment.findOne({
    appointment: appointmentId,
    status: 'paid',
  });

  if (!payment) {
    throw new AppError('No paid payment found for this appointment', 400);
  }

  // Actions
  // 1. Update Appointment
  appointment.status = 'cancelled';
  appointment.cancellationReason = 'Cancelled by physiotherapist';
  appointment.cancelledBy = 'doctor';
  appointment.cancelledAt = new Date();
  await appointment.save();

  // 2. Call Razorpay refund API immediately
  let refund;
  try {
    refund = await razorpayInstance.payments.refund(payment.razorpayPaymentId, {
      amount: payment.amount * 100, // Razorpay expects amount in paise
    });
  } catch (razorpayError) {
    logger.error(`Razorpay refund failed: ${razorpayError.message}`);
    // Keep payment in pending state for manual retry
    payment.refundStatus = 'pending';
    payment.refundInitiatedBy = 'doctor';
    payment.refundAmount = payment.amount;
    payment.refundRequestedAt = new Date();
    await payment.save();

    throw new AppError(
      `Refund initiation failed with Razorpay: ${razorpayError.error?.description || razorpayError.message}. Please try again or contact Razorpay support.`,
      502
    );
  }

  // 3. Update Payment
  payment.status = 'refunded';
  payment.refundStatus = 'approved';
  payment.refundId = refund.id;
  payment.refundInitiatedBy = 'doctor';
  payment.refundAmount = payment.amount;
  payment.refundRequestedAt = payment.refundRequestedAt || new Date();
  payment.refundProcessedAt = new Date();
  await payment.save();

  // 3b. Keep payment history visible on the appointment; refund state lives on Payment.
  appointment.paymentStatus = 'refunded';
  await appointment.save();

  // 3c. Deduct doctor earnings
  await DoctorProfile.findByIdAndUpdate(appointment.doctor._id, {
    $inc: { totalEarnings: -payment.doctorEarnings },
  });

  // 4. Get doctor name
  const doctorUser = await User.findById(appointment.doctor.user);
  const doctorName = doctorUser?.name || 'the physiotherapist';

  // 5. Create notification for patient
  await createNotification({
    recipientId: appointment.patient._id,
    type: 'DOCTOR_CANCELLED',
    title: 'Appointment Cancelled',
    message: `Dr. ${doctorName} has cancelled your appointment. A full refund of ₹${payment.amount} will be credited to your original payment method within 2-3 business days.`,
    link: '/patient/appointments',
    relatedId: appointment._id,
  });

  // 6. Create notification for doctor
  await createNotification({
    recipientId: appointment.doctor.user,
    type: 'CANCELLATION_CONFIRMED',
    title: 'Cancellation Confirmed',
    message: 'Appointment cancelled. The patient has been automatically refunded.',
    link: '/doctor/appointments',
    relatedId: appointment._id,
  });

  // 7. Send email to patient notifying of cancellation + automatic refund (fire-and-forget)
  sendDoctorCancelledRefundEmail({
    patientEmail: appointment.patient.email,
    patientName: appointment.patient.name,
    doctorName,
    date: appointment.date,
    startTime: appointment.startTime,
    amount: payment.amount,
  }).catch((err) => logger.warn(`Doctor-cancelled refund email failed: ${err.message}`));

  return { appointment, payment, refund };
};

/**
 * Admin approves a pending refund request.
 */
export const approveRefund = async (paymentId, adminId, adminNote) => {
  // Validations
  const payment = await Payment.findById(paymentId).populate({
    path: 'appointment',
    populate: [
      { path: 'patient' },
      {
        path: 'doctor',
        populate: { path: 'user', select: 'name' },
      },
    ],
  });

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  if (payment.refundStatus !== 'pending') {
    throw new AppError('This refund request is not in pending status', 400);
  }

  // Actions
  // 1. Call Razorpay refund API
  let refund;
  try {
    refund = await razorpayInstance.payments.refund(payment.razorpayPaymentId, {
      amount: payment.refundAmount * 100,
    });
  } catch (razorpayError) {
    logger.error(`Razorpay refund failed: ${razorpayError.message}`);
    throw new AppError(
      `Refund initiation failed with Razorpay: ${razorpayError.error?.description || razorpayError.message}. Please try again or contact Razorpay support.`,
      502
    );
  }

  // 2. Update Payment
  payment.status = 'refunded';
  payment.refundStatus = 'approved';
  payment.refundId = refund.id;
  payment.refundAmount = payment.refundAmount || payment.amount;
  payment.refundInitiatedBy = payment.refundInitiatedBy || 'patient';
  payment.refundProcessedAt = new Date();
  payment.refundResolvedAt = new Date();
  payment.adminNote = adminNote || 'Refund approved';
  await payment.save();

  // 2b. Preserve the original successful payment in doctor/patient history.
  if (payment.appointment) {
    payment.appointment.paymentStatus = 'refunded';
    await payment.appointment.save();
  }

  // 2c. Deduct doctor earnings
  await DoctorProfile.findByIdAndUpdate(payment.doctor, {
    $inc: { totalEarnings: -payment.doctorEarnings },
  });

  // 3. Create notification for patient
  await createNotification({
    recipientId: payment.appointment.patient._id,
    type: 'REFUND_APPROVED',
    title: 'Refund Approved',
    message: `Your refund of ₹${payment.refundAmount} has been approved and processed. It will appear in your account within 2-3 business days depending on your payment method.`,
    link: '/patient/payments',
    relatedId: payment._id,
  });

  // 4. Send approval email to patient (fire-and-forget)
  const doctorName = payment.appointment?.doctor?.user?.name || 'the physiotherapist';
  sendRefundApprovedEmail({
    patientEmail: payment.appointment.patient.email,
    patientName: payment.appointment.patient.name,
    amount: payment.refundAmount,
    adminNote: payment.adminNote,
  }).catch((err) => logger.warn(`Refund approval email failed: ${err.message}`));

  return { payment, refund };
};

/**
 * Admin rejects a pending refund request.
 */
export const rejectRefund = async (paymentId, adminId, adminNote) => {
  // Validations
  const payment = await Payment.findById(paymentId).populate('patient');

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  if (payment.refundStatus !== 'pending') {
    throw new AppError('This refund request is not in pending status', 400);
  }

  if (!adminNote || adminNote.trim().length === 0) {
    throw new AppError('A rejection reason is required', 400);
  }

  // Actions
  // 1. Update Payment
  payment.refundStatus = 'rejected';
  payment.adminNote = adminNote;
  payment.refundResolvedAt = new Date();
  await payment.save();

  // 2. Create notification for patient
  await createNotification({
    recipientId: payment.patient._id,
    type: 'REFUND_REJECTED',
    title: 'Refund Request Reviewed',
    message: `Your refund request has been reviewed. Note from our team: ${adminNote}`,
    link: '/patient/payments',
    relatedId: payment._id,
  });

  // 3. Send rejection email to patient (fire-and-forget)
  sendRefundRejectedEmail({
    patientEmail: payment.patient.email,
    patientName: payment.patient.name,
    amount: payment.refundAmount,
    adminNote,
  }).catch((err) => logger.warn(`Refund rejection email failed: ${err.message}`));

  return { payment };
};

/**
 * Admin fetches all pending refund requests with pagination.
 */
export const getPendingRefunds = async ({ page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const refunds = await Payment.find({ refundStatus: 'pending' })
    .populate({
      path: 'appointment',
      populate: [
        { path: 'patient', select: 'name email' },
        {
          path: 'doctor',
          populate: { path: 'user', select: 'name' },
        },
      ],
    })
    .sort({ refundRequestedAt: 1 }) // oldest first — fair queue
    .skip(skip)
    .limit(limit);

  const total = await Payment.countDocuments({ refundStatus: 'pending' });

  return {
    refunds,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get refund statistics for admin dashboard
 */
export const getRefundStats = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const pendingCount = await Payment.countDocuments({ refundStatus: 'pending' });

  const processedThisMonth = await Payment.countDocuments({
    refundStatus: { $in: ['approved', 'processed'] },
    refundProcessedAt: { $gte: startOfMonth },
  });

  const totalRefundedResult = await Payment.aggregate([
    { $match: { refundStatus: { $in: ['approved', 'processed'] } } },
    { $group: { _id: null, total: { $sum: '$refundAmount' } } },
  ]);

  const totalRefunded = totalRefundedResult[0]?.total || 0;

  return {
    pendingCount,
    processedThisMonth,
    totalRefunded,
  };
};

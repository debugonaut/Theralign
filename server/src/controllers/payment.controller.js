import crypto from 'crypto';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import AppError from '../utils/AppError.js';
import Appointment from '../models/Appointment.model.js';
import Payment from '../models/Payment.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import razorpayInstance from '../config/razorpay.js';
import config from '../config/env.js';

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

  // 1. Cryptographically verify signature
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

  // 2. Find Payment record
  const payment = await Payment.findOne({ razorpayOrderId });
  if (!payment) {
    throw new AppError('Payment record not found.', 404);
  }

  // 3. Update Payment record
  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  payment.status = 'paid';
  await payment.save();

  // 4. Update Appointment record
  await Appointment.findByIdAndUpdate(appointmentId, {
    $set: {
      paymentStatus: 'paid',
      paymentId: razorpayPaymentId,
    }
  });

  // 5. Increment Doctor totalEarnings
  await DoctorProfile.findByIdAndUpdate(payment.doctor, {
    $inc: { totalEarnings: payment.doctorEarnings }
  });

  return successResponse(res, 200, 'Payment verified successfully.', { appointmentId });
});

/**
 * GET /api/payments/mine
 * Patient views their payment history.
 * Protect: requireAuth, requireRole('patient')
 */
export const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ patient: req.user.id, status: 'paid' })
    .populate('appointment', 'date startTime endTime status')
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

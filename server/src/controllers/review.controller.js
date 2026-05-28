import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import Review from '../models/Review.model.js';
import Appointment from '../models/Appointment.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reviews  →  Patient submits a review
// ─────────────────────────────────────────────────────────────────────────────
export const submitReview = asyncHandler(async (req, res) => {
  const { appointmentId, rating, comment } = req.body;

  // 1. Validate inputs
  const errors = {};
  if (!appointmentId) errors.appointmentId = 'Appointment ID is required.';
  if (!rating || !Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
    errors.rating = 'Rating must be an integer between 1 and 5.';
  }
  if (!comment || String(comment).trim().length < 10) {
    errors.comment = 'Comment must be at least 10 characters.';
  }
  if (Object.keys(errors).length > 0) {
    return errorResponse(res, 400, 'Validation failed.', errors);
  }

  // 2. Find appointment
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return errorResponse(res, 404, 'Appointment not found.');
  }

  // 3. Gate 1 — Ownership
  if (appointment.patient.toString() !== req.user.id.toString()) {
    return errorResponse(res, 403, 'You can only review your own appointments.');
  }

  // 4. Gate 2 — Completion
  if (appointment.status !== 'completed') {
    return errorResponse(res, 400, 'You can only review a completed appointment.');
  }

  // 5. Gate 3 — Payment
  if (appointment.paymentStatus !== 'paid') {
    return errorResponse(res, 400, 'Payment must be confirmed before submitting a review.');
  }

  // 6. Gate 4 — No Prior Review (application-level check for clean UX)
  if (appointment.reviewSubmitted === true) {
    return errorResponse(res, 400, 'You have already submitted a review for this appointment.');
  }

  // 7. Create Review (post-save hook fires automatically and updates DoctorProfile rating)
  const review = await Review.create({
    appointment: appointmentId,
    patient: req.user.id,
    doctor: appointment.doctor,
    rating: Number(rating),
    comment: String(comment).trim(),
  });

  // 8. Mark appointment as reviewed
  await Appointment.findByIdAndUpdate(appointmentId, { reviewSubmitted: true });

  return successResponse(res, 201, 'Review submitted successfully.', { review });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reviews/doctor/:doctorId  →  Public: all visible reviews for a doctor
// ─────────────────────────────────────────────────────────────────────────────
export const getDoctorReviews = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  const reviews = await Review.find({ doctor: doctorId, isVisible: true })
    .populate('patient', 'name')
    .sort({ createdAt: -1 });

  return successResponse(res, 200, 'Doctor reviews fetched.', { reviews });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reviews/mine  →  Patient: reviews they have written
// ─────────────────────────────────────────────────────────────────────────────
export const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ patient: req.user.id })
    .populate('doctor', 'specialization averageRating totalReviews user')
    .populate({
      path: 'doctor',
      populate: {
        path: 'user',
        select: 'name profileImage',
      },
    })
    .populate('appointment', 'date startTime endTime')
    .sort({ createdAt: -1 });

  return successResponse(res, 200, 'Your reviews fetched.', { reviews });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reviews/admin/all  →  Admin: all reviews including hidden
// ─────────────────────────────────────────────────────────────────────────────
export const getAllReviewsAdmin = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const [reviews, totalCount] = await Promise.all([
    Review.find({})
      .populate('patient', 'name email')
      .populate('doctor', 'specialization user')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({}),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return successResponse(res, 200, 'All reviews fetched.', {
    reviews,
    totalCount,
    totalPages,
    currentPage: page,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/reviews/:id/visibility  →  Admin toggles review visibility
// ─────────────────────────────────────────────────────────────────────────────
export const toggleReviewVisibility = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return errorResponse(res, 404, 'Review not found.');
  }

  // Toggle visibility
  review.isVisible = !review.isVisible;
  await review.save();

  // Explicitly recalculate doctor rating after visibility toggle
  const stats = await Review.aggregate([
    { $match: { doctor: review.doctor, isVisible: true } },
    {
      $group: {
        _id: '$doctor',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await DoctorProfile.findByIdAndUpdate(review.doctor, {
      averageRating: parseFloat(stats[0].averageRating.toFixed(1)),
      totalReviews: stats[0].totalReviews,
    });
  } else {
    // All reviews hidden — reset to zero
    await DoctorProfile.findByIdAndUpdate(review.doctor, {
      averageRating: 0,
      totalReviews: 0,
    });
  }

  return successResponse(res, 200, 'Review visibility updated.', { review });
});

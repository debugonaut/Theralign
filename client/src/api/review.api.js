import axiosInstance from './axiosInstance';

// ─── Public ───────────────────────────────────────────────────────────────────

/**
 * Fetch all visible reviews for a specific doctor.
 * Public endpoint — no auth required.
 */
export const getDoctorReviews = (doctorId) =>
  axiosInstance.get(`/reviews/doctor/${doctorId}`);

// ─── Patient ──────────────────────────────────────────────────────────────────

/**
 * Patient submits a review for a completed, paid appointment.
 */
export const submitReview = (data) =>
  axiosInstance.post('/reviews', data);

/**
 * Patient fetches all reviews they have previously submitted.
 */
export const getMyReviews = () =>
  axiosInstance.get('/reviews/mine');

// ─── Admin ────────────────────────────────────────────────────────────────────

/**
 * Admin fetches all reviews (including hidden ones) — paginated.
 */
export const getAllReviewsAdmin = (page = 1, limit = 10) =>
  axiosInstance.get(`/reviews/admin/all?page=${page}&limit=${limit}`);

/**
 * Admin toggles a review's visibility (hide / unhide).
 */
export const toggleReviewVisibilityAPI = (reviewId) =>
  axiosInstance.patch(`/reviews/${reviewId}/visibility`);

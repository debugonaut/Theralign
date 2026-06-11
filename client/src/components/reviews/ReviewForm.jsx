import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { submitReview } from '../../api/review.api';

/**
 * ReviewForm — inline review submission form for the appointment card.
 *
 * Props:
 *   appointmentId — _id of the appointment being reviewed
 *   doctorName    — displayed in the form header
 *   onSuccess     — called after successful submission to update parent state
 */
const ReviewForm = ({ appointmentId, doctorName, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (rating === 0) {
      setError('Please select a star rating before submitting.');
      return;
    }
    if (comment.trim().length < 10) {
      setError('Comment must be at least 10 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await submitReview({ appointmentId, rating, comment: comment.trim() });
      toast.success('Review submitted! Thank you.');
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 400 && msg) {
        setError(msg);
      } else {
        toast.error('Failed to submit review. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 pt-3 border-t border-slate-100 space-y-3 text-left"
    >
      <p className="text-sm font-medium text-slate-700">
        How was your experience with Dr. {doctorName}?
      </p>

      {/* Interactive Star Selector */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-2xl focus:outline-none cursor-pointer transition-transform hover:scale-110"
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <span
              className={
                star <= (hoverRating || rating) ? 'text-amber-400' : 'text-slate-200'
              }
            >
              {star <= (hoverRating || rating) ? '★' : '☆'}
            </span>
          </button>
        ))}
        {(hoverRating || rating) > 0 && (
          <span className="text-sm text-slate-500 font-medium ml-1">
            {hoverRating || rating} / 5
          </span>
        )}
      </div>

      {/* Comment textarea */}
      <div className="space-y-1">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience... (min 10 characters)"
          maxLength={1000}
          rows={3}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all resize-none"
        />
        <p className="text-sm text-slate-400 text-right font-medium">
          {comment.length}/1000
        </p>
      </div>

      {/* Error display */}
      {error && (
        <p className="text-sm text-rose-600 font-normal bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={submitting || rating === 0 || comment.trim().length < 10}
        className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Review'
        )}
      </button>
    </form>
  );
};

export default ReviewForm;

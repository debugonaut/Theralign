import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { getMyReviews } from '../../api/review.api';

/**
 * MyReviews (Patient) — shows all reviews the patient has submitted.
 * Route: /patient/reviews
 */
const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getMyReviews();
        if (res.data?.data?.reviews) {
          setReviews(res.data.data.reviews);
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-amber-400' : 'text-slate-200'}>
        {i < Math.floor(rating) ? '★' : '☆'}
      </span>
    ));

  return (
    <div className="space-y-8 select-none p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Star className="text-primary" size={24} />
          My Reviews
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Reviews you have submitted for completed appointments.
        </p>
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-100 rounded-3xl h-36" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        /* Empty state */
        <div className="bg-white border border-slate-100 border-dashed rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm flex flex-col items-center gap-3">
          <span className="text-4xl">⭐</span>
          <p className="text-sm font-bold text-slate-700">You haven't written any reviews yet.</p>
          <p className="text-xs text-slate-400 max-w-sm">
            After a completed appointment, you can share your experience directly from your appointments page.
          </p>
          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white rounded-xl px-5 py-2.5 font-bold text-xs shadow-md transition-all cursor-pointer mt-3"
          >
            Find a Doctor
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        /* Review cards */
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewHistoryCard key={review._id} review={review} renderStars={renderStars} />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Inner component for each review history card.
 */
const ReviewHistoryCard = ({ review, renderStars }) => {
  const [expanded, setExpanded] = useState(false);
  const MAX_COMMENT_LENGTH = 200;

  const doctorName = review.doctor?.user?.name || 'Physiotherapist';
  const specialization = Array.isArray(review.doctor?.specialization)
    ? review.doctor.specialization.join(', ')
    : review.doctor?.specialization || '';

  const appointmentDate = review.appointment?.date || '';
  const appointmentTime = review.appointment?.startTime || '';

  const reviewedOn = new Date(review.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const comment = review.comment || '';
  const isLong = comment.length > MAX_COMMENT_LENGTH;
  const displayComment = !expanded && isLong ? comment.slice(0, MAX_COMMENT_LENGTH) + '...' : comment;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:border-slate-200 transition-all text-left">
      {/* Doctor info */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800">Dr. {doctorName}</h3>
          {specialization && (
            <p className="text-xs text-primary font-bold mt-0.5 uppercase tracking-wide">{specialization}</p>
          )}
        </div>
        {/* Star rating */}
        <div className="flex items-center gap-0.5 text-lg">{renderStars(review.rating)}</div>
      </div>

      {/* Appointment info */}
      {appointmentDate && (
        <p className="text-[10px] text-slate-400 font-medium mt-1.5">
          Appointment: {appointmentDate}
          {appointmentTime && ` · ${appointmentTime}`}
        </p>
      )}

      {/* Comment */}
      <p className="mt-3 text-sm text-slate-600 font-medium leading-relaxed italic border-l-2 border-primary/20 pl-3">
        "{displayComment}"
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary font-bold hover:underline mt-1 cursor-pointer"
        >
          {expanded ? 'read less' : 'read more'}
        </button>
      )}

      {/* Reviewed on */}
      <p className="text-[10px] text-slate-400 font-medium mt-3">Reviewed on {reviewedOn}</p>
    </div>
  );
};

export default MyReviews;

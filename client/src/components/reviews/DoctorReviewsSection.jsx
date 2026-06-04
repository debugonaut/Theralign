import React, { useState, useEffect } from 'react';
import { MessageSquare, Star } from 'lucide-react';
import { getDoctorReviews } from '../../api/review.api';
import ReviewCard from './ReviewCard';

/**
 * DoctorReviewsSection — displays the rating summary and all visible reviews
 * for a doctor on the public doctor profile page.
 *
 * Props:
 *   doctorId      — MongoDB ObjectId of the DoctorProfile
 *   averageRating — pre-computed from DoctorProfile (denormalized)
 *   totalReviews  — pre-computed from DoctorProfile (denormalized)
 */
const DoctorReviewsSection = ({ doctorId, averageRating = 0, totalReviews = 0 }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await getDoctorReviews(doctorId);
        if (res.data?.data?.reviews) {
          setReviews(res.data.data.reviews);
        }
      } catch (err) {
        console.error('Failed to fetch doctor reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    if (doctorId) fetchReviews();
  }, [doctorId]);

  const renderStars = (rating, large = false) => {
    const starClass = large ? 'text-3xl' : 'text-xl';
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`${starClass} ${i < Math.floor(rating) ? 'text-amber-400' : 'text-slate-200'}`}>
        {i < Math.floor(rating) ? '★' : '☆'}
      </span>
    ));
  };

  const displayedReviews = showAll ? reviews : reviews.slice(0, 5);

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left">
      {/* Section Header */}
      <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-50 flex items-center gap-2">
        <MessageSquare size={20} className="text-primary" />
        Patient Reviews
      </h2>

      {/* Rating Summary */}
      <div className="flex items-center gap-5 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 mb-6">
        <div className="flex items-center gap-1 leading-none">
          {renderStars(averageRating, true)}
        </div>
        <div>
          <p className="text-2xl font-extrabold text-slate-800">
            {totalReviews > 0 ? averageRating.toFixed(1) : '—'}
            <span className="text-sm font-medium text-slate-400 ml-1">/ 5</span>
          </p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-100 rounded-2xl h-24" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-8 text-center flex flex-col items-center gap-2">
          <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
          <p className="text-sm font-bold text-slate-700">No reviews yet</p>
          <p className="text-xs text-slate-400 max-w-sm">
            No reviews yet. Be the first to share your experience.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {displayedReviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>

          {/* Show All / Collapse toggle */}
          {reviews.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-4 w-full py-2.5 text-xs font-bold text-primary border border-primary/20 bg-blue-50/50 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
            >
              {showAll
                ? 'Show fewer reviews'
                : `Show all ${reviews.length} reviews`}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default DoctorReviewsSection;

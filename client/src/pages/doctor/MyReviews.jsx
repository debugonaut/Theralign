import React, { useState, useEffect } from 'react';
import { Star, Info } from 'lucide-react';
import { getDoctorReviews } from '../../api/review.api';
import { getDoctorProfileAPI } from '../../api/doctor.api';

/**
 * MyReviews (Doctor) — read-only view of all reviews patients have left.
 * Route: /doctor/reviews
 */
const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch doctor's own profile to get their _id and rating stats
        const profileRes = await getDoctorProfileAPI();
        if (profileRes.success && profileRes.data?.profile) {
          const profile = profileRes.data.profile;
          setDoctorProfile(profile);

          // Fetch reviews using the doctor profile _id
          const reviewsRes = await getDoctorReviews(profile._id);
          if (reviewsRes.data?.data?.reviews) {
            setReviews(reviewsRes.data.data.reviews);
          }
        }
      } catch (err) {
        console.error('Failed to load doctor reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
          Patient Reviews About You
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Reviews submitted by patients after completed appointments.
        </p>
      </div>

      {/* Disclaimer note */}
      <div className="flex items-start gap-3 p-4 bg-blue-50/80 border border-blue-100 rounded-2xl">
        <Info size={16} className="text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          Reviews are submitted by patients after completed appointments.
          Contact support if you believe a review violates platform guidelines.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-100 rounded-3xl h-28" />
          ))}
        </div>
      ) : (
        <>
          {/* Rating Summary Card */}
          {doctorProfile && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-5">
              <div className="text-3xl leading-none flex">
                {renderStars(doctorProfile.averageRating || 0)}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Rating</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-0.5">
                  {(doctorProfile.totalReviews || 0) > 0
                    ? doctorProfile.averageRating.toFixed(1)
                    : '—'}
                  <span className="text-sm font-medium text-slate-400 ml-1">
                    · {doctorProfile.totalReviews || 0} total review{doctorProfile.totalReviews !== 1 ? 's' : ''}
                  </span>
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  This is how patients see you on the platform.
                </p>
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews.length === 0 ? (
            <div className="bg-white border border-slate-100 border-dashed rounded-3xl p-12 text-center shadow-sm flex flex-col items-center gap-3">
              <span className="text-4xl">⭐</span>
              <p className="text-sm font-bold text-slate-700">No reviews yet.</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Complete appointments to receive patient feedback.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const patientName = review.patient?.name || 'Anonymous';
                const initial = patientName.charAt(0).toUpperCase();
                const formattedDate = new Date(review.createdAt).toLocaleDateString('en-IN', {
                  month: 'long',
                  year: 'numeric',
                });

                return (
                  <div
                    key={review._id}
                    className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:border-slate-200 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      {/* Patient avatar */}
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100">
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-sm font-bold text-slate-800 truncate">{patientName}</p>
                          <span className="text-xs text-slate-400 font-medium shrink-0">{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-base mt-0.5">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 font-medium leading-relaxed italic border-l-2 border-primary/20 pl-3">
                      "{review.comment}"
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyReviews;

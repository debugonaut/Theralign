import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getDoctorReviews } from '../../api/review.api';
import { getDoctorProfileAPI } from '../../api/doctor.api';
import SectionHeader from '../../components/common/SectionHeader';
import EmptyState from '../../components/common/EmptyState';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const profileRes = await getDoctorProfileAPI();
        if (profileRes.success && profileRes.data?.profile) {
          const profile = profileRes.data.profile;
          setDoctorProfile(profile);

          const reviewsRes = await getDoctorReviews(profile._id);
          const rawReviews = reviewsRes.data?.reviews || reviewsRes.data?.data?.reviews || reviewsRes.reviews || [];
          setReviews(rawReviews);
        }
      } catch (err) {
        console.error('Failed to load doctor reviews:', err);
        toast.error('FAILED TO FETCH REPUTATION RECORD LEDGERS.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute rating distribution
  const totalReviews = reviews.length;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (ratingCounts[r.rating] !== undefined) {
      ratingCounts[r.rating]++;
    }
  });

  const getTreatedSpecialization = () => {
    if (doctorProfile?.specialization && doctorProfile.specialization.length > 0) {
      return doctorProfile.specialization[0].toUpperCase();
    }
    return 'PHYSICAL THERAPY';
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-ui-sm font-medium text-neutral-500 uppercase tracking-widest bg-white">
        LOADING REPUTATION REVIEWS PANELS...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 select-none text-left bg-white">
      
      {/* ── Page Header Section ── */}
      <SectionHeader title="MY REVIEWS" size="lg" ruled={true} className="mb-0" />

      {reviews.length === 0 ? (
        <div className="py-6 bg-white select-none">
          <EmptyState
            title="NO REVIEWS YET"
            description="Patient reviews appear here after completed appointments. Focus on delivering excellent care."
          />
        </div>
      ) : (
        <>
          {/* ── Rating Summary Card (4:8 split) ── */}
          {doctorProfile && (
            <div className="w-full p-6 bg-neutral-50 border border-neutral-200/50 rounded-lg shadow-level-1 text-left transition-warm max-w-[1200px]">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                
                {/* Left 4 Columns */}
                <div className="md:col-span-4 flex flex-col gap-2 border-b-2 md:border-b-0 md:border-r border-neutral-200 pb-6 md:pb-0 md:pr-6">
                  <span className="text-[64px] font-semibold text-neutral-900 select-none leading-none block">
                    {doctorProfile.averageRating ? parseFloat(doctorProfile.averageRating).toFixed(1) : '0.0'}
                  </span>
                  <span className="text-ui-sm font-semibold text-neutral-500 uppercase tracking-widest block">
                    OUT OF 5
                  </span>
                  <span className="text-ui-sm font-medium text-neutral-700 uppercase tracking-wider block mt-1">
                    BASED ON {totalReviews} {totalReviews === 1 ? 'REVIEW' : 'REVIEWS'}
                  </span>
                </div>

                {/* Right 8 Columns (Distribution bars) */}
                <div className="md:col-span-8 flex flex-col gap-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = ratingCounts[rating];
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-3 w-full max-w-[1200px]">
                        {/* Star Rating Number label */}
                        <span className="text-ui-sm font-semibold text-neutral-900 w-3 shrink-0">
                          {rating}
                        </span>
                        
                        {/* Horizontal rectangular track */}
                        <div className="flex-1 h-3 bg-neutral-200/50 rounded-md overflow-hidden relative border border-neutral-200/30">
                          <div
                            className="h-full bg-neutral-900 rounded-md"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        {/* Count text */}
                        <span className="text-sm font-semibold text-neutral-500 uppercase tracking-widest w-12 text-right shrink-0">
                          {count} {count === 1 ? 'REV' : 'REVS'}
                        </span>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          )}

          {/* Centered supportive disclaimer text */}
          <p className="text-ui-sm text-neutral-500 font-medium uppercase tracking-wider text-center max-w-2xl mx-auto leading-relaxed">
            Reviews are submitted by verified patients after completed, paid appointments. Contact support if a review violates platform guidelines.
          </p>

          {/* ── Reviews Feedback List ── */}
          <div className="flex flex-col gap-6 select-none">
            <SectionHeader title="PATIENT FEEDBACK" size="sm" ruled={true} className="mb-0" />
            
            <div className="flex flex-col gap-6">
              {reviews.map((review) => {
                const patientName = review.patient?.name || 'Anonymous';
                const initial = patientName.charAt(0).toUpperCase();
                const firstName = patientName.split(' ')[0];
                const lastName = patientName.split(' ')[1] || '';
                const displayPatient = `${firstName} ${lastName ? lastName[0] + '.' : ''}`;

                const formattedDate = new Date(review.createdAt)
                  .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  .toUpperCase();

                return (
                  <div
                    key={review._id}
                    className="w-full p-6 bg-white border border-neutral-200/50 rounded-lg shadow-level-1 text-left flex flex-col md:flex-row justify-between gap-6 transition-warm"
                  >
                    {/* Left 9 Columns - Content */}
                    <div className="flex-1 flex gap-4">
                      {/* Quote symbol */}
                      <span className="text-display-xs text-neutral-500 font-semibold leading-none select-none">
                        “
                      </span>

                      <div className="flex flex-col gap-4">
                        <p className="text-ui-lg text-neutral-900 italic font-medium leading-relaxed uppercase">
                          {review.comment}
                        </p>
                        
                        <div className="flex items-center gap-3">
                          {/* 24px initial circle */}
                          <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center font-medium text-sm shrink-0 select-none">
                            {initial}
                          </div>
                          
                          <span className="text-ui-sm font-semibold text-neutral-900 uppercase tracking-wider">
                            {displayPatient}
                          </span>
                          <span className="text-sm text-neutral-500 font-medium uppercase tracking-wider">
                            · {formattedDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right 3 Columns - Rating box */}
                    <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                      <div className="w-14 h-14 border border-neutral-200 bg-neutral-50 text-neutral-800 font-medium text-display-xs flex items-center justify-center rounded-md select-none shadow-level-1">
                        {review.rating}
                      </div>
                      <span className="text-sm font-semibold text-accent tracking-widest uppercase block select-none">
                        {getTreatedSpecialization()}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default MyReviews;

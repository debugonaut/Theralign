import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { getMyReviews } from '../../api/review.api';
import SectionHeader from '../../components/common/SectionHeader';
import EmptyState from '../../components/common/EmptyState';

const MyReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'MY REVIEWS — Theralign';
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getMyReviews();
        if (res.data?.data?.reviews) {
          setReviews(res.data.data.reviews);
        } else if (res.success && res.data) {
          setReviews(res.data);
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="flex flex-col gap-5 select-none text-left bg-white">
      {/* Page Header */}
      <SectionHeader
        title="MY REVIEWS"
        size="lg"
        ruled={true}
        className="mb-0"
      />

      {/* Reviews List */}
      {loading ? (
        <div className="py-6 text-center text-ui-sm font-medium text-neutral-500 uppercase tracking-widest">
          LOADING SUBMITTED REVIEWS...
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          title="NO REVIEWS YET"
          description="Reviews help other patients find the right physiotherapist. Share your experience after a completed session."
          icon={Star}
          context="informational"
        />
      ) : (
        <div className="flex flex-col gap-6 max-w-content">
          {reviews.map((rev) => {
            const docName = rev.doctor?.user?.name || 'Physiotherapist';
            const specText = Array.isArray(rev.doctor?.specialization)
              ? rev.doctor.specialization[0]
              : rev.doctor?.specialization || 'Clinical';

            const apptDate = rev.appointment?.date
              ? new Date(rev.appointment.date + 'T00:00:00').toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }).toUpperCase()
              : 'N/A';

            const submittedOn = new Date(rev.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }).toUpperCase();

            return (
              <div
                key={rev._id}
                className="relative bg-white border border-neutral-200/50 p-6 rounded-lg shadow-level-1 text-left transition-warm"
              >
                {/* Rating square in top-right corner */}
                <div className="absolute top-6 right-6 w-10 h-10 border border-neutral-200 bg-neutral-50 flex items-center justify-center text-ui-md font-medium text-neutral-800 rounded-md select-none shadow-level-1">
                  {rev.rating}
                </div>

                <div className="flex flex-col gap-1 pr-16 mb-4">
                  <h3 className="font-medium text-neutral-900 text-ui-xl uppercase tracking-tighter">
                    DR. {docName.toUpperCase()}
                  </h3>
                  <span className="text-sm text-accent font-semibold uppercase tracking-widest">
                    {specText.toUpperCase()}
                  </span>
                  <span className="text-sm text-neutral-500 font-medium uppercase tracking-widest mt-0.5">
                    APPOINTMENT DATE: {apptDate}
                  </span>
                </div>

                <p className="text-ui-lg text-neutral-900 italic font-medium leading-relaxed mb-4 pl-4 border-l-2 border-neutral-200">
                  "{rev.comment}"
                </p>

                <div className="text-sm font-semibold text-neutral-500 uppercase tracking-widest">
                  FILED ON {submittedOn}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyReviews;

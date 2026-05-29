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
    document.title = 'MY REVIEWS — KINETIQ';
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
    <div className="flex flex-col gap-8 select-none text-left bg-swiss-white">
      {/* Page Header */}
      <SectionHeader
        title="MY REVIEWS"
        size="lg"
        ruled={true}
        className="mb-0"
      />

      {/* Reviews List */}
      {loading ? (
        <div className="py-12 text-center text-ui-xs font-bold text-swiss-gray-400 uppercase tracking-widest">
          LOADING SUBMITTED REVIEWS...
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          title="NO REVIEWS YET"
          description="Reviews help other patients find the right physiotherapist. Share your experience after a completed session."
          icon={Star}
          actionLabel="VIEW MY APPOINTMENTS"
          onAction={() => navigate('/patient/appointments')}
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
                className="relative bg-swiss-white border-2 border-swiss-black p-6 rounded-none shadow-none text-left"
              >
                {/* Rating square in top-right corner */}
                <div className="absolute top-6 right-6 w-10 h-10 border-2 border-swiss-black flex items-center justify-center text-ui-md font-black text-swiss-black bg-swiss-white rounded-none select-none">
                  {rev.rating}
                </div>

                <div className="flex flex-col gap-1 pr-16 mb-4">
                  <h3 className="font-black text-swiss-black text-ui-xl uppercase tracking-tighter">
                    DR. {docName.toUpperCase()}
                  </h3>
                  <span className="text-[10px] text-swiss-red font-black uppercase tracking-widest">
                    {specText.toUpperCase()}
                  </span>
                  <span className="text-[9px] text-swiss-gray-400 font-bold uppercase tracking-widest mt-0.5">
                    APPOINTMENT DATE: {apptDate}
                  </span>
                </div>

                <p className="text-ui-lg text-swiss-black italic font-medium leading-relaxed mb-4 pl-4 border-l-2 border-swiss-gray-200">
                  "{rev.comment}"
                </p>

                <div className="text-[9px] font-black text-swiss-gray-400 uppercase tracking-widest">
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

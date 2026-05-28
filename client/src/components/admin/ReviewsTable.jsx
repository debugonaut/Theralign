import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Star, Eye, EyeOff } from 'lucide-react';
import { getAllReviewsAdmin, toggleReviewVisibilityAPI } from '../../api/review.api';

/**
 * ReviewsTable — Admin component to view all reviews and toggle visibility.
 * Embedded in AdminDashboard or accessible from the admin sidebar.
 */
const ReviewsTable = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [toggling, setToggling] = useState(null); // reviewId being toggled

  const LIMIT = 10;

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAllReviewsAdmin(page, LIMIT);
      if (res.data?.data) {
        setReviews(res.data.data.reviews || []);
        setTotalPages(res.data.data.totalPages || 1);
        setTotalCount(res.data.data.totalCount || 0);
        setCurrentPage(res.data.data.currentPage || page);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
      toast.error('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, []);

  const handleToggle = async (reviewId) => {
    setToggling(reviewId);
    try {
      const res = await toggleReviewVisibilityAPI(reviewId);
      if (res.data?.data?.review) {
        const updatedReview = res.data.data.review;
        // Update only the specific row in local state
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, isVisible: updatedReview.isVisible } : r))
        );
        toast.success(
          updatedReview.isVisible ? 'Review is now visible.' : 'Review hidden from public.'
        );
      }
    } catch (err) {
      toast.error('Failed to update review visibility.');
    } finally {
      setToggling(null);
    }
  };

  const handlePageChange = (page) => {
    fetchReviews(page);
  };

  const truncate = (text, max = 80) =>
    text && text.length > max ? text.slice(0, max) + '…' : text;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Star size={18} className="text-amber-400" />
            Platform Reviews
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {loading ? 'Loading...' : `${totalCount} total reviews (including hidden)`}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
          <p className="text-slate-400 text-sm font-medium">No reviews submitted yet.</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-800/70 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-3 text-left font-bold">Patient</th>
                  <th className="px-4 py-3 text-left font-bold">Doctor</th>
                  <th className="px-4 py-3 text-left font-bold">Rating</th>
                  <th className="px-4 py-3 text-left font-bold">Comment</th>
                  <th className="px-4 py-3 text-left font-bold">Visibility</th>
                  <th className="px-4 py-3 text-left font-bold">Date</th>
                  <th className="px-4 py-3 text-left font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {reviews.map((review) => {
                  const patientName = review.patient?.name || '—';
                  const doctorName = review.doctor?.user?.name || '—';
                  const specialization = Array.isArray(review.doctor?.specialization)
                    ? review.doctor.specialization[0]
                    : review.doctor?.specialization || '';

                  const reviewDate = new Date(review.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={review._id}
                      className="bg-slate-950 hover:bg-slate-900 transition-colors"
                    >
                      {/* Patient */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-200">{patientName}</p>
                        <p className="text-slate-500 text-[10px]">{review.patient?.email || ''}</p>
                      </td>

                      {/* Doctor */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-200">Dr. {doctorName}</p>
                        {specialization && (
                          <p className="text-slate-500 text-[10px] truncate max-w-[120px]">
                            {specialization}
                          </p>
                        )}
                      </td>

                      {/* Rating */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-0.5 text-base">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span
                              key={i}
                              className={i < review.rating ? 'text-amber-400' : 'text-slate-600'}
                            >
                              {i < review.rating ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Comment */}
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="text-slate-400 italic">{truncate(review.comment)}</p>
                      </td>

                      {/* Visibility badge */}
                      <td className="px-4 py-3">
                        {review.isVisible ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-900/30 text-emerald-400 border border-emerald-700/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <Eye size={10} /> Visible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-rose-900/30 text-rose-400 border border-rose-700/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <EyeOff size={10} /> Hidden
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{reviewDate}</td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggle(review._id)}
                          disabled={toggling === review._id}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50 ${
                            review.isVisible
                              ? 'bg-rose-900/30 text-rose-400 hover:bg-rose-900/50 border border-rose-700/40'
                              : 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-700/40'
                          }`}
                        >
                          {toggling === review._id ? '...' : review.isVisible ? 'Hide' : 'Unhide'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 text-xs font-bold text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                ← Prev
              </button>
              <span className="text-xs text-slate-500 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 text-xs font-bold text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewsTable;

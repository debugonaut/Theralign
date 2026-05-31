import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getAllReviewsAdmin, toggleReviewVisibilityAPI } from '../../api/review.api';
import Table, { ActionLink } from '../common/Table';
import Badge from '../common/Badge';

const ReviewsTable = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [toggling, setToggling] = useState(null); // ID of toggling review

  const LIMIT = 10;

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAllReviewsAdmin(page, LIMIT);
      const data = res.data?.data || res.data || {};
      setReviews(data.reviews || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
      setCurrentPage(data.currentPage || page);
    } catch (err) {
      toast.error('Failed to load platform reviews.');
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
      const updated = res.data?.data?.review || res.data?.review || {};
      
      // Update locally in-place
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, isVisible: updated.isVisible } : r))
      );
      toast.success(
        updated.isVisible ? 'Review is now visible.' : 'Review hidden successfully.'
      );
    } catch (err) {
      toast.error('Failed to toggle review visibility.');
    } finally {
      setToggling(null);
    }
  };

  const handlePageChange = (page) => {
    fetchReviews(page);
  };

  return (
    <div className="space-y-6">
      {/* Table grid wrapper */}
      <div className="bg-white border-2 border-neutral-900 rounded-none shadow-none text-left">
        {/* Table Header block */}
        <div className="p-6 border-b border-neutral-200">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">
            PATIENT FEEDBACK AUDIT
          </span>
          <h3 className="text-ui-lg font-black text-neutral-900 uppercase tracking-tight">
            REVIEWS MODERATION LEDGER
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-neutral-500 text-xs font-bold uppercase tracking-wider">
            <span className="inline-block animate-spin mr-2">⏳</span> RETRIEVING REVIEWS LEDGER...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-ui-sm font-bold uppercase tracking-wider">
            NO REVIEWS SUBMITTED YET.
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Header>Patient</Table.Header>
                <Table.Header>Doctor</Table.Header>
                <Table.Header numeric={true} className="w-[100px]">Rating</Table.Header>
                <Table.Header>Comment</Table.Header>
                <Table.Header>Date</Table.Header>
                <Table.Header>Visibility</Table.Header>
                <Table.Header actions={true} className="w-[150px]">Actions</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {reviews.map((rev) => {
                const patientName = rev.patient?.name || 'Anonymous';
                const doctorName = rev.doctor?.user?.name || 'Practitioner';
                const specialization = Array.isArray(rev.doctor?.specialization)
                  ? rev.doctor.specialization[0]
                  : rev.doctor?.specialization || 'GENERAL';

                const reviewDate = new Date(rev.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                const truncatedComment = rev.comment && rev.comment.length > 90
                  ? `${rev.comment.slice(0, 90)}...`
                  : rev.comment || '—';

                return (
                  <Table.Row key={rev._id}>
                    {/* Patient */}
                    <Table.Cell>
                      <div className="text-left">
                        <span className="font-bold text-neutral-900 uppercase tracking-wide text-xs block">
                          {patientName}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono block">
                          {rev.patient?.email || ''}
                        </span>
                      </div>
                    </Table.Cell>

                    {/* Doctor */}
                    <Table.Cell>
                      <div className="text-left">
                        <span className="font-bold text-neutral-900 uppercase tracking-wide text-xs block">
                          Dr. {doctorName}
                        </span>
                        <span className="text-[10px] text-accent font-bold block uppercase tracking-widest text-[9px] mt-0.5">
                          {specialization.toUpperCase()}
                        </span>
                      </div>
                    </Table.Cell>

                    {/* Rating square */}
                    <Table.Cell numeric={true}>
                      <div className="flex justify-end">
                        <div className="w-8 h-8 border-2 border-neutral-900 bg-white flex items-center justify-center text-xs font-black text-neutral-900 rounded-none">
                          {rev.rating}
                        </div>
                      </div>
                    </Table.Cell>

                    {/* Comment with full text tooltip */}
                    <Table.Cell className="text-swiss-gray-650 font-medium italic" title={rev.comment}>
                      “{truncatedComment}”
                    </Table.Cell>

                    {/* Date */}
                    <Table.Cell className="font-mono text-xs text-neutral-500 whitespace-nowrap">
                      {reviewDate}
                    </Table.Cell>

                    {/* Visibility */}
                    <Table.Cell>
                      {rev.isVisible ? (
                        <Badge variant="paid" label="VISIBLE" size="sm" />
                      ) : (
                        <Badge variant="neutral" label="HIDDEN" size="sm" />
                      )}
                    </Table.Cell>

                    {/* Action - HIDE red link or UNHIDE black link */}
                    <Table.Cell actions={true}>
                      <ActionLink
                        onClick={() => handleToggle(rev._id)}
                        disabled={toggling === rev._id}
                        destructive={rev.isVisible}
                        className="hover:underline"
                      >
                        {toggling === rev._id ? '...' : rev.isVisible ? 'HIDE' : 'UNHIDE'}
                      </ActionLink>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider pt-2 select-none">
          <span className="text-neutral-500">
            PAGE {currentPage} OF {totalPages} · {totalCount} REVIEWS
          </span>
          <div className="flex gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-4 py-2 border-2 border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-neutral-900 transition-all shrink-0 cursor-pointer"
            >
              ← PREV
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-4 py-2 border-2 border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-neutral-900 transition-all shrink-0 cursor-pointer"
            >
              NEXT →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsTable;

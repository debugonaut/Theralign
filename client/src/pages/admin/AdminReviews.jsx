import React from 'react';
import ReviewsTable from '../../components/admin/ReviewsTable';

/**
 * AdminReviews — dedicated admin page for review moderation.
 * Route: /admin/reviews
 */
const AdminReviews = () => {
  return (
    <div className="p-8 space-y-8 select-none">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Review Moderation</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage platform reviews, toggle visibility, and monitor patient feedback quality.
        </p>
      </div>
      <ReviewsTable />
    </div>
  );
};

export default AdminReviews;

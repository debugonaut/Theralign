import React from 'react';
import ReviewsTable from '../../components/admin/ReviewsTable';
import SectionHeader from '../../components/common/SectionHeader';

const AdminReviews = () => {
  return (
    <div className="space-y-8 select-none text-swiss-black bg-swiss-white">
      {/* Page Title */}
      <SectionHeader
        title="REVIEWS"
        subtitle="PATIENT REVIEWS DIRECTORY MODERATION, VERIFIED QUALITY CHECKS, AND VISIBILITY CONTROLS."
      />
      
      {/* Reviews Moderation Table */}
      <div>
        <ReviewsTable />
      </div>
    </div>
  );
};

export default AdminReviews;

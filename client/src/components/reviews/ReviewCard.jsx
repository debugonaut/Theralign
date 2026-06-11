import React from 'react';

/**
 * ReviewCard — displays a single patient review on the doctor's public profile.
 *
 * Props:
 *   review: { patient: { name }, rating, comment, createdAt }
 */
const ReviewCard = ({ review }) => {
  const patientName = review.patient?.name || 'Anonymous';
  const initial = patientName.charAt(0).toUpperCase();

  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-amber-400' : 'text-slate-200'}>
        {i < Math.floor(rating) ? '★' : '☆'}
      </span>
    ));
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:border-slate-200 transition-all">
      {/* Header row: avatar + name + rating + date */}
      <div className="flex items-start gap-3">
        {/* Patient initial avatar */}
        <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center font-bold text-base shrink-0 border border-blue-100">
          {initial}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-sm font-bold text-slate-800 truncate">{patientName}</p>
            <span className="text-xs text-slate-400 font-medium shrink-0">{formattedDate}</span>
          </div>

          {/* Star rating row */}
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-base leading-none">{renderStars(review.rating)}</span>
            <span className="text-xs text-slate-500 font-semibold ml-1">{review.rating}.0</span>
          </div>
        </div>
      </div>

      {/* Review comment */}
      <p className="mt-3 text-sm text-slate-600 leading-relaxed font-medium italic border-l-2 border-primary/20 pl-3">
        "{review.comment}"
      </p>
    </div>
  );
};

export default ReviewCard;

import React from 'react';

const VerifiedBadge = ({ size = 'sm' }) => {
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-0.5',
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  const currentSize = sizeClasses[size] || sizeClasses.sm;
  const currentIconSize = iconSizes[size] || iconSizes.sm;

  return (
    <span
      className={`inline-flex items-center font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full select-none ${currentSize}`}
    >
      <svg
        className={`${currentIconSize} text-emerald-600 fill-emerald-100 shrink-0`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
      Verified
    </span>
  );
};

export default VerifiedBadge;

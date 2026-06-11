import React from 'react';

const StarRating = ({ rating, count, showCount = true, size = 'sm' }) => {
  const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
  
  const stars = Array.from({ length: 5 }, (_, i) => {
    const starVal = i + 1;
    if (roundedRating >= starVal) {
      return 'full';
    } else if (roundedRating === starVal - 0.5) {
      return 'half';
    } else {
      return 'empty';
    }
  });

  const sizeClasses = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const currentSize = sizeClasses[size] || sizeClasses.sm;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {stars.map((type, i) => {
          if (type === 'full') {
            return (
              <svg
                key={i}
                className={`${currentSize} text-amber-400 fill-amber-400`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            );
          } else if (type === 'half') {
            return (
              <div key={i} className="relative">
                {/* Empty Background Star */}
                <svg
                  className={`${currentSize} text-slate-200 fill-slate-200`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                {/* Filled Half Overlay */}
                <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
                  <svg
                    className={`${currentSize} text-amber-400 fill-amber-400 max-w-none`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>
              </div>
            );
          } else {
            return (
              <svg
                key={i}
                className={`${currentSize} text-slate-200 fill-slate-200`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            );
          }
        })}
      </div>
      {showCount && (
        <span className="text-sm text-slate-500 font-medium">
          {rating > 0 ? `${Number(rating).toFixed(1)} (${count} reviews)` : 'No reviews yet'}
        </span>
      )}
    </div>
  );
};

export default StarRating;

import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-card p-5 border border-slate-100 shadow-card animate-pulse flex flex-col gap-4">
      {/* Header Skeleton */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-slate-200 rounded-full shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-3.5 bg-slate-200 rounded w-1/2" />
          <div className="h-3 bg-slate-200 rounded w-2/3" />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100 w-full" />

      {/* Details Grid Skeleton */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div className="space-y-1.5">
          <div className="h-3 bg-slate-200 rounded w-5/6" />
          <div className="h-3 bg-slate-200 rounded w-2/3" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 bg-slate-200 rounded w-4/5" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
        </div>
      </div>

      {/* Tags Skeleton */}
      <div className="flex gap-2 mt-2">
        <div className="h-5 bg-slate-200 rounded-full w-14" />
        <div className="h-5 bg-slate-200 rounded-full w-16" />
        <div className="h-5 bg-slate-200 rounded-full w-12" />
      </div>

      {/* Action Skeleton */}
      <div className="flex justify-end mt-auto pt-2">
        <div className="h-4 bg-slate-200 rounded w-24" />
      </div>
    </div>
  );
};

export default SkeletonCard;

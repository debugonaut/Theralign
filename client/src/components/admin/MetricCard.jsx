import React from 'react';
import Card from '../common/Card';
import Skeleton from '../common/Skeleton';

const MetricCard = ({ title = '', value, subtitle, loading }) => {
  const cleanTitle = title.toUpperCase().trim();
  
  // Conditional border signals
  let borderClass = 'hover:border-neutral-900';
  let titleColorClass = 'text-neutral-500';
  let valueColorClass = 'text-neutral-900';

  if (cleanTitle === 'TOTAL REVENUE' || cleanTitle === 'PLATFORM COMMISSION' || cleanTitle === 'PLATFORM COMMISSION (10%)') {
    borderClass = '!border-success hover:!border-success';
    titleColorClass = 'text-success';
    valueColorClass = 'text-success';
  } else if (cleanTitle === 'PENDING VERIFICATION' || cleanTitle.includes('PENDING')) {
    borderClass = '!border-warning hover:!border-warning';
    titleColorClass = 'text-warning';
    valueColorClass = 'text-warning';
  }

  if (loading) {
    return (
      <div className="border border-neutral-200/50 bg-neutral-50 p-6 flex flex-col justify-between h-36 rounded-lg shadow-level-1 transition-warm">
        <Skeleton className="h-4 w-2/3 mb-3 bg-swiss-gray-250" />
        <Skeleton className="h-8 w-1/2 mb-3 bg-swiss-gray-250" />
        <div className="border-t border-neutral-200 my-1" />
        <Skeleton className="h-3 w-3/4 mt-2 bg-swiss-gray-250" />
      </div>
    );
  }

  return (
    <Card
      variant="metric"
      className={`p-6 flex flex-col justify-between h-36 transition-all duration-fast ${borderClass}`}
    >
      <div className="text-left">
        <span className={`text-[11px] font-bold uppercase tracking-widest block leading-none mb-2 ${titleColorClass}`}>
          {cleanTitle}
        </span>
        <span className={`text-display-xs font-black tracking-tighter leading-none block ${valueColorClass}`}>
          {value}
        </span>
      </div>
      
      <div>
        <div className="border-t border-neutral-200 my-1" />
        {subtitle && (
          <span className="text-[11px] text-neutral-700 font-bold uppercase tracking-wider block mt-1.5 leading-none">
            {subtitle}
          </span>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;

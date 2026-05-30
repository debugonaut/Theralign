import React from 'react';
import Card from '../common/Card';
import Skeleton from '../common/Skeleton';

const MetricCard = ({ title = '', value, subtitle, loading }) => {
  const cleanTitle = title.toUpperCase().trim();
  
  // Conditional border signals
  let borderClass = 'hover:border-swiss-black';
  let titleColorClass = 'text-swiss-gray-400';
  let valueColorClass = 'text-swiss-black';

  if (cleanTitle === 'TOTAL REVENUE' || cleanTitle === 'PLATFORM COMMISSION' || cleanTitle === 'PLATFORM COMMISSION (10%)') {
    borderClass = '!border-swiss-teal hover:!border-swiss-teal';
    titleColorClass = 'text-swiss-teal';
    valueColorClass = 'text-swiss-teal';
  } else if (cleanTitle === 'PENDING VERIFICATION' || cleanTitle.includes('PENDING')) {
    borderClass = '!border-swiss-amber hover:!border-swiss-amber';
    titleColorClass = 'text-swiss-amber';
    valueColorClass = 'text-swiss-amber';
  }

  if (loading) {
    return (
      <div className="border-2 border-swiss-black bg-swiss-gray-100 p-6 flex flex-col justify-between h-36">
        <Skeleton className="h-4 w-2/3 mb-3 bg-swiss-gray-250" />
        <Skeleton className="h-8 w-1/2 mb-3 bg-swiss-gray-250" />
        <div className="border-t border-swiss-gray-200 my-1" />
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
        <div className="border-t border-swiss-gray-200 my-1" />
        {subtitle && (
          <span className="text-[11px] text-swiss-gray-600 font-bold uppercase tracking-wider block mt-1.5 leading-none">
            {subtitle}
          </span>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;

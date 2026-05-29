import React from 'react';

const colorMap = {
  blue:   'border-l-blue-500',
  green:  'border-l-green-500',
  amber:  'border-l-amber-500',
  purple: 'border-l-purple-500',
  red:    'border-l-red-500',
};

const bgMap = {
  blue:   'bg-blue-500/10 text-blue-400',
  green:  'bg-green-500/10 text-green-400',
  amber:  'bg-amber-500/10 text-amber-400',
  purple: 'bg-purple-500/10 text-purple-400',
  red:    'bg-red-500/10 text-red-400',
};

const MetricCard = ({ title, value, subtitle, icon, color = 'blue', loading }) => {
  const borderClass = colorMap[color] || colorMap.blue;
  const iconBgClass = bgMap[color] || bgMap.blue;

  if (loading) {
    return (
      <div className={`bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-lg border-l-4 ${borderClass} flex items-center justify-between`}>
        <div className="space-y-2 flex-1">
          <div className="h-3 w-24 bg-slate-800 rounded animate-pulse" />
          <div className="h-7 w-20 bg-slate-800 rounded animate-pulse" />
          <div className="h-2.5 w-32 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="h-12 w-12 bg-slate-800 rounded-xl animate-pulse ml-4" />
      </div>
    );
  }

  return (
    <div className={`bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-lg border-l-4 ${borderClass} flex items-center justify-between hover:border-opacity-100 transition-all`}>
      <div className="text-left min-w-0">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          {title}
        </span>
        <span className="text-2xl font-extrabold text-slate-100 mt-1.5 block truncate">
          {value}
        </span>
        {subtitle && (
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            {subtitle}
          </span>
        )}
      </div>
      <div className={`p-3 rounded-xl shrink-0 ml-3 text-xl ${iconBgClass}`}>
        {icon}
      </div>
    </div>
  );
};

export default MetricCard;

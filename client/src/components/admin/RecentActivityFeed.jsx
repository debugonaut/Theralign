import React from 'react';

const ICONS = {
  appointment: '📅',
  registration: '👤',
  payment: '💳',
  review: '⭐',
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const RecentActivityFeed = ({ activity = [] }) => {
  if (activity.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm text-center">
        <span className="text-2xl mb-2">📭</span>
        <p>No recent activity.</p>
        <p className="text-xs text-slate-600 mt-1">Platform activity will appear here.</p>
      </div>
    );
  }

  return (
    <div className="max-h-[380px] overflow-y-auto pr-1 space-y-1">
      {activity.map((item, index) => (
        <div
          key={index}
          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors group"
        >
          <div className="text-lg shrink-0 mt-0.5">
            {ICONS[item.type] || '📌'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors leading-snug">
              {item.message}
            </p>
          </div>
          <span className="text-[11px] text-slate-600 shrink-0 font-medium">
            {timeAgo(item.timestamp)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default RecentActivityFeed;

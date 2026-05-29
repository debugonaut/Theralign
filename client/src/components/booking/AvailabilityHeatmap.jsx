import React from 'react';

/**
 * AvailabilityHeatmap — Surfaced density map of the next 28 days of doctor slot density.
 * Helps patients find dates with high booking flexibility instantly.
 */
const AvailabilityHeatmap = ({ availabilityByDate, selectedDate, onDateSelect }) => {
  
  // Helper to query slot density status for a specific date YYYY-MM-DD
  const getDateStatus = (dateStr) => {
    const entry = availabilityByDate.find(group => group.date === dateStr);
    if (!entry || entry.slots.length === 0) return 'unavailable';

    const total = entry.slots.length;
    const available = entry.slots.filter(s => !s.isBooked && s.isActive).length;

    if (available === 0) return 'full';
    if (available < total / 2) return 'limited';
    return 'available';
  };

  // Color schemas matching clinical statuses
  const statusStyles = {
    available:   'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 cursor-pointer border-emerald-100',
    limited:     'bg-amber-50 text-amber-700 hover:bg-amber-100/80 cursor-pointer border-amber-100',
    full:        'bg-slate-100 text-slate-400 border-slate-200/50 cursor-not-allowed opacity-60',
    unavailable: 'bg-slate-50/60 text-slate-300 border-slate-100 cursor-not-allowed opacity-40',
  };

  // Generate date array for the subsequent 28 days from local today
  const generateNext28Days = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 28; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]); // "YYYY-MM-DD"
    }
    return dates;
  };

  const next28Days = generateNext28Days();

  // Helper to format days name titles
  const daysHeader = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-4 border border-slate-100 bg-slate-50/30 rounded-2xl p-4 select-none">
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
          Availability Heatmap
        </label>
        <span className="text-[10px] font-bold text-slate-400">Next 28 Days</span>
      </div>

      {/* Grid wrapper */}
      <div className="space-y-1.5">
        {/* Mon-Sun Day Titles */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {daysHeader.map(day => (
            <span key={day} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-0.5">
              {day}
            </span>
          ))}
        </div>

        {/* 28-day grid cell items */}
        <div className="grid grid-cols-7 gap-1.5">
          {next28Days.map((dateStr) => {
            const status = getDateStatus(dateStr);
            const dateObj = new Date(dateStr + 'T00:00:00');
            const dayNum = dateObj.getDate();
            const isSelected = dateStr === selectedDate;
            const isClickable = status === 'available' || status === 'limited';

            return (
              <button
                key={dateStr}
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onDateSelect(dateStr)}
                className={`
                  aspect-square rounded-xl text-xs font-extrabold border
                  flex flex-col items-center justify-center
                  transition-all duration-150
                  ${statusStyles[status]}
                  ${isSelected ? 'ring-2 ring-primary ring-offset-1 border-primary/20 scale-105' : ''}
                `}
                title={`${dateStr} (${status})`}
              >
                <span>{dayNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend indicator bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-slate-100">
        {[
          { color: 'bg-emerald-50 border-emerald-100', label: 'Available' },
          { color: 'bg-amber-50 border-amber-100', label: 'Limited' },
          { color: 'bg-slate-100 border-slate-200/50', label: 'Fully Booked' },
          { color: 'bg-slate-50/60 border-slate-100', label: 'No Slots' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span className={`w-3.5 h-3.5 rounded-md border shrink-0 ${color}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityHeatmap;

import React from 'react';

/**
 * AvailabilityHeatmap — D3.3 availability heatmap in strict Swiss minimalist style.
 * 7×4 grid, 36px×36px square cells, 4px gaps, zero rounded corners, explicit state colors.
 */
const AvailabilityHeatmap = ({ availabilityByDate, selectedDate, onDateSelect }) => {
  
  // Helper to query slot density status for a specific date YYYY-MM-DD
  const getDateStatus = (dateStr) => {
    const entry = availabilityByDate.find(group => group.date === dateStr);
    if (!entry || entry.slots.length === 0) return 'unavailable';

    const total = entry.slots.length;
    const available = entry.slots.filter(s => !s.isBooked && s.isActive).length;

    if (available === 0) return 'full';
    if (available <= 2) return 'limited'; // 1-2 slots remaining
    return 'available';
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
  const daysHeader = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Cell state style selectors
  const getCellClassName = (status, isSelected) => {
    if (isSelected) {
      return 'bg-swiss-black text-swiss-white border-swiss-black';
    }

    switch (status) {
      case 'available':
        return 'bg-swiss-gray-100 border-swiss-black text-swiss-black hover:bg-swiss-gray-200 cursor-pointer';
      case 'limited':
        return 'bg-swiss-amber/10 border-swiss-amber text-swiss-amber hover:bg-swiss-amber/20 cursor-pointer';
      case 'full':
        return 'bg-swiss-gray-50 border-swiss-gray-200 text-swiss-gray-400 cursor-not-allowed';
      case 'unavailable':
      default:
        return 'bg-swiss-white border-transparent text-swiss-gray-200 cursor-not-allowed';
    }
  };

  return (
    <div className="flex flex-col gap-4 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-swiss-gray-200">
        <label className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest block">
          AVAILABILITY HEATMAP
        </label>
        <span className="text-[9px] font-bold text-swiss-gray-400 uppercase tracking-widest">
          28-DAY GRID
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {/* Mon-Sun Day Titles */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {daysHeader.map((day, idx) => (
            <span key={idx} className="text-[10px] font-bold text-swiss-gray-400 uppercase tracking-widest">
              {day}
            </span>
          ))}
        </div>

        {/* 7x4 square cells, 36px x 36px approx, 4px gaps (gap-1 matches ~4px in modern flex/grid) */}
        <div className="grid grid-cols-7 gap-1">
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
                  w-[36px] h-[36px] border-2 text-[11px] font-bold
                  flex items-center justify-center transition-all duration-fast select-none rounded-none
                  ${getCellClassName(status, isSelected)}
                `}
                title={`${dateStr} — ${status.toUpperCase()}`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend utilizing bordered squares */}
      <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-swiss-gray-200">
        {[
          { color: 'bg-swiss-gray-100 border-swiss-black', label: 'AVAILABLE' },
          { color: 'bg-swiss-amber/10 border-swiss-amber', label: 'LIMITED' },
          { color: 'bg-swiss-gray-50 border-swiss-gray-200', label: 'FULL' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-[9px] text-swiss-gray-400 font-bold uppercase tracking-widest">
            <span className={`w-3.5 h-3.5 border-2 rounded-none shrink-0 ${item.color}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityHeatmap;

import React, { useState } from 'react';

const STATUS_COLORS = {
  completed: '#0F0F0F',
  cancelled: '#A3A3A3',
  pending:   '#B45309',
  confirmed: '#0D7377',
};

const AppointmentDonutChart = ({ data = [] }) => {
  const [hovered, setHovered] = useState(null);

  const total = data.reduce((sum, d) => sum + (d.count || 0), 0);
  const filtered = data.filter((d) => d.count > 0);

  if (total === 0) {
    return (
      <div className="bg-swiss-white border-2 border-swiss-black p-6 flex flex-col items-center justify-center h-[280px] text-swiss-gray-400 text-ui-sm font-bold uppercase tracking-wider">
        NO BOOKING DATA AVAILABLE
      </div>
    );
  }

  // Build SVG donut slices
  const CX = 120, CY = 120, R_OUTER = 90, R_INNER = 58;
  let startAngle = -90; // Start from top

  const slices = filtered.map((item) => {
    const pct = item.count / total;
    const sweepAngle = pct * 360;
    const endAngle = startAngle + sweepAngle;

    const rad = (deg) => (deg * Math.PI) / 180;
    const x1 = CX + R_OUTER * Math.cos(rad(startAngle));
    const y1 = CY + R_OUTER * Math.sin(rad(startAngle));
    const x2 = CX + R_OUTER * Math.cos(rad(endAngle));
    const y2 = CY + R_OUTER * Math.sin(rad(endAngle));
    const ix1 = CX + R_INNER * Math.cos(rad(startAngle));
    const iy1 = CY + R_INNER * Math.sin(rad(startAngle));
    const ix2 = CX + R_INNER * Math.cos(rad(endAngle));
    const iy2 = CY + R_INNER * Math.sin(rad(endAngle));

    const largeArc = sweepAngle > 180 ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${R_OUTER} ${R_OUTER} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${R_INNER} ${R_INNER} 0 ${largeArc} 0 ${ix1} ${iy1}`,
      'Z',
    ].join(' ');

    const result = { ...item, path, startAngle, endAngle, pct };
    startAngle = endAngle;
    return result;
  });

  const hoveredSlice = hovered !== null ? slices[hovered] : null;

  return (
    <div className="bg-swiss-white border-2 border-swiss-black p-6 rounded-none shadow-none text-left flex flex-col gap-6">
      {/* Header */}
      <div className="pb-4 border-b border-swiss-gray-200">
        <span className="text-[11px] font-bold text-swiss-gray-400 uppercase tracking-widest block mb-1">
          OPERATIONAL METRICS
        </span>
        <h3 className="text-ui-lg font-black text-swiss-black uppercase tracking-tight">
          APPOINTMENT STATUS INDEX
        </h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
        {/* SVG Donut */}
        <div className="relative shrink-0 select-none">
          <svg width="240" height="240" viewBox="0 0 240 240">
            {slices.map((slice, i) => (
              <path
                key={slice.status}
                d={slice.path}
                fill={STATUS_COLORS[slice.status] || '#A3A3A3'}
                opacity={hovered !== null && hovered !== i ? 0.6 : 1}
                stroke="#FFFFFF"
                strokeWidth="2.5"
                style={{ cursor: 'pointer', transition: 'opacity 150ms' }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
            {/* Center display size total count */}
            <text
              x={CX} y={CY + 4}
              textAnchor="middle"
              fill="#0F0F0F"
              fontSize="32" fontWeight="900"
              fontFamily="Inter, sans-serif"
            >
              {hoveredSlice ? hoveredSlice.count : total}
            </text>
            <text
              x={CX} y={CY + 22}
              textAnchor="middle"
              fill="#A3A3A3"
              fontSize="10"
              fontWeight="900"
              letterSpacing="0.08em"
              fontFamily="Inter, sans-serif"
            >
              {hoveredSlice ? hoveredSlice.status.toUpperCase() : 'TOTAL'}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="space-y-3 flex-1 w-full sm:w-auto">
          {data.map((item) => {
            const color = STATUS_COLORS[item.status] || '#A3A3A3';
            return (
              <div key={item.status} className="flex items-center justify-between border border-swiss-gray-200 p-2.5 bg-swiss-gray-50">
                <div className="flex items-center gap-2.5">
                  {/* Square color swatch with 2px black border matching other rectangular shapes */}
                  <div
                    className="w-3.5 h-3.5 border border-swiss-black shrink-0 rounded-none"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[11px] font-black uppercase text-swiss-black tracking-widest">{item.status}</span>
                </div>
                <div className="text-right flex items-baseline gap-1">
                  <span className="text-ui-sm font-black text-swiss-black swiss-numeric">{item.count}</span>
                  <span className="text-[10px] font-bold text-swiss-gray-400 uppercase tracking-wider">({item.percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDonutChart;

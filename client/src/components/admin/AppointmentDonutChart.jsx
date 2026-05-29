import React, { useState } from 'react';

const STATUS_COLORS = {
  confirmed: '#3B82F6',
  completed: '#10B981',
  cancelled: '#EF4444',
  pending:   '#F59E0B',
};

const AppointmentDonutChart = ({ data = [] }) => {
  const [hovered, setHovered] = useState(null);

  const total = data.reduce((sum, d) => sum + (d.count || 0), 0);
  const filtered = data.filter((d) => d.count > 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] text-slate-500">
        <p className="text-sm">No appointment data yet.</p>
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

  const hoveredItem = hovered !== null ? slices[hovered] : null;

  return (
    <div>
      <div className="flex items-center gap-6">
        {/* SVG Donut */}
        <div className="relative shrink-0">
          <svg width="240" height="240" viewBox="0 0 240 240">
            {slices.map((slice, i) => (
              <path
                key={slice.status}
                d={slice.path}
                fill={STATUS_COLORS[slice.status] || '#64748b'}
                opacity={hovered !== null && hovered !== i ? 0.5 : 1}
                stroke="#0f172a"
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
            {/* Center text */}
            <text
              x={CX} y={CY - 8}
              textAnchor="middle"
              fill={hoveredItem ? STATUS_COLORS[hoveredItem.status] : '#f1f5f9'}
              fontSize="24" fontWeight="800"
            >
              {hoveredItem ? hoveredItem.count : total}
            </text>
            <text
              x={CX} y={CY + 12}
              textAnchor="middle"
              fill="#64748b"
              fontSize="10"
              fontWeight="500"
            >
              {hoveredItem ? hoveredItem.status.toUpperCase() : 'TOTAL'}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="space-y-3 flex-1">
          {data.map((item) => (
            <div key={item.status} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[item.status] || '#64748b' }}
                />
                <span className="text-slate-400 text-xs capitalize">{item.status}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-200 font-semibold text-sm">{item.count}</span>
                <span className="text-slate-600 text-xs ml-1">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDonutChart;

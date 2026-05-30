import React, { useState } from 'react';

const PERIOD_OPTIONS = ['daily', 'weekly', 'monthly'];

const formatYAxis = (value) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
};

const RevenueChart = ({ data = [], period = 'daily', onPeriodChange }) => {
  const WIDTH = 640;
  const HEIGHT = 280;
  const PADDING = { top: 30, right: 30, bottom: 40, left: 70 };
  const chartWidth = WIDTH - PADDING.left - PADDING.right;
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const hasData = data.length > 1;

  const maxRevenue = hasData ? Math.max(...data.map((d) => d.revenue || 0)) : 1;
  const maxDisplay = maxRevenue > 0 ? maxRevenue * 1.15 : 1000;

  const xStep = hasData ? chartWidth / (data.length - 1) : chartWidth;

  const toX = (i) => PADDING.left + i * xStep;
  const toY = (val) =>
    PADDING.top + chartHeight - (val / maxDisplay) * chartHeight;

  const points = data.map((d, i) => `${toX(i)},${toY(d.revenue || 0)}`).join(' ');

  // Tooltip state
  const [tooltip, setTooltip] = useState(null);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    value: maxDisplay * t,
    y: PADDING.top + chartHeight - t * chartHeight,
  }));

  const formatDate = (val) => {
    if (!val) return '';
    if (val.length === 10 && val.includes('-')) {
      const parts = val.split('-');
      return `${parts[2]}/${parts[1]}`;
    }
    return val.toUpperCase();
  };

  return (
    <div className="bg-swiss-white border-2 border-swiss-black p-6 rounded-none shadow-none text-left flex flex-col gap-6 relative">
      {/* Chart Title and Period Control Header */}
      <div className="flex items-center justify-between pb-4 border-b border-swiss-gray-200">
        <div>
          <span className="text-[11px] font-bold text-swiss-gray-400 uppercase tracking-widest block mb-1">
            FINANCIAL INDEX
          </span>
          <h3 className="text-ui-lg font-black text-swiss-black uppercase tracking-tight">
            REVENUE STREAM TREND
          </h3>
        </div>
        
        {/* Segmented Control Toggle */}
        <div className="flex border-2 border-swiss-black rounded-none shadow-none">
          {PERIOD_OPTIONS.map((p) => {
            const isActive = period === p;
            return (
              <button
                key={p}
                onClick={() => onPeriodChange?.(p)}
                className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-fast border-r-2 last:border-r-0 border-swiss-black select-none cursor-pointer ${
                  isActive 
                    ? 'bg-swiss-black text-swiss-white' 
                    : 'bg-swiss-white text-swiss-black hover:bg-swiss-gray-150'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-[240px] text-swiss-gray-400 text-ui-sm font-bold uppercase tracking-wider">
          NO INDEX DATA AVAILABLE
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full h-auto select-none"
            style={{ height: 280 }}
            onMouseLeave={() => setTooltip(null)}
          >
            {/* Grid horizontal lines */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={PADDING.left} y1={tick.y}
                  x2={PADDING.left + chartWidth} y2={tick.y}
                  stroke="#E5E5E5" strokeWidth="1"
                />
                <text
                  x={PADDING.left - 12} y={tick.y + 4}
                  textAnchor="end"
                  fill="#A3A3A3" fontSize="10" fontWeight="bold"
                  className="swiss-numeric"
                >
                  {formatYAxis(tick.value)}
                </text>
              </g>
            ))}

            {/* Crispy single black line - NO gradients, NO background fills */}
            <polyline
              points={points}
              fill="none"
              stroke="#0F0F0F"
              strokeWidth="3"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />

            {/* Active hover markers */}
            {tooltip && (
              <>
                <line
                  x1={tooltip.x} y1={PADDING.top}
                  x2={tooltip.x} y2={PADDING.top + chartHeight}
                  stroke="#A3A3A3" strokeWidth="1" strokeDasharray="4,4"
                />
                <circle 
                  cx={tooltip.x} 
                  cy={toY(tooltip.data.revenue || 0)} 
                  r="5" 
                  fill="#0F0F0F" 
                  stroke="#FFFFFF" 
                  strokeWidth="2" 
                />
              </>
            )}

            {/* X axis labels and hover targets */}
            {data.map((d, i) => {
              const showLabel = data.length <= 15 || i % Math.ceil(data.length / 10) === 0;
              return (
                <g key={i}>
                  {showLabel && (
                    <text
                      x={toX(i)} y={HEIGHT - 8}
                      textAnchor="middle"
                      fill="#A3A3A3" fontSize="10" fontWeight="bold"
                      className="swiss-numeric"
                    >
                      {formatDate(d.date)}
                    </text>
                  )}
                  {/* Hover detector rect */}
                  <rect
                    x={toX(i) - xStep / 2}
                    y={PADDING.top}
                    width={xStep}
                    height={chartHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setTooltip({ index: i, data: d, x: toX(i), y: toY(d.revenue || 0) })}
                  />
                </g>
              );
            })}
          </svg>

          {/* Snappy Tooltip Box: 0px border-radius, no shadow, snappy 150ms hover */}
          {tooltip && (
            <div
              className="absolute bg-swiss-white border-2 border-swiss-black p-3.5 z-20 pointer-events-none text-left select-none rounded-none shadow-none transition-all duration-fast"
              style={{
                left: `${Math.min(85, Math.max(15, (tooltip.index / (data.length - 1)) * 100))}%`,
                top: '5%',
                transform: 'translateX(-50%)',
              }}
            >
              <p className="text-[10px] font-black text-swiss-red uppercase tracking-widest mb-1.5">{tooltip.data.date}</p>
              <p className="text-ui-sm font-black text-swiss-black uppercase">REVENUE: <span className="swiss-numeric text-swiss-black">₹{(tooltip.data.revenue || 0).toLocaleString('en-IN')}</span></p>
              <p className="text-ui-xs font-bold text-swiss-gray-600 uppercase mt-0.5">COMMISSION: <span className="swiss-numeric">₹{(tooltip.data.commission || 0).toLocaleString('en-IN')}</span></p>
              <p className="text-[10px] font-bold text-swiss-gray-400 uppercase mt-1">{tooltip.data.appointments} SESSIONS COMPLETED</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RevenueChart;

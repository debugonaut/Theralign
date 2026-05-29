import React from 'react';

const PERIOD_OPTIONS = ['daily', 'weekly', 'monthly'];

const formatYAxis = (value) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
};

const RevenueChart = ({ data = [], period = 'daily', onPeriodChange }) => {
  const WIDTH = 560;
  const HEIGHT = 260;
  const PADDING = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartWidth = WIDTH - PADDING.left - PADDING.right;
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const hasData = data.length > 1;

  const maxRevenue = hasData ? Math.max(...data.map((d) => d.revenue || 0)) : 1;
  const maxDisplay = maxRevenue * 1.15;

  const xStep = hasData ? chartWidth / (data.length - 1) : chartWidth;

  const toX = (i) => PADDING.left + i * xStep;
  const toY = (val) =>
    PADDING.top + chartHeight - (val / maxDisplay) * chartHeight;

  const revenuePoints = data.map((d, i) => `${toX(i)},${toY(d.revenue || 0)}`).join(' ');
  const commissionPoints = data.map((d, i) => `${toX(i)},${toY(d.commission || 0)}`).join(' ');

  // Tooltip state
  const [tooltip, setTooltip] = React.useState(null);

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
    return val;
  };

  return (
    <div>
      {/* Period Toggle */}
      <div className="flex gap-2 mb-4 justify-end">
        {PERIOD_OPTIONS.map((p) => (
          <button
            key={p}
            onClick={() => onPeriodChange?.(p)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
              period === p
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-[260px] text-slate-500 text-sm">
          No revenue data for this period.
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full"
            style={{ height: 280 }}
            onMouseLeave={() => setTooltip(null)}
          >
            {/* Grid lines */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={PADDING.left} y1={tick.y}
                  x2={PADDING.left + chartWidth} y2={tick.y}
                  stroke="#1e293b" strokeWidth="1"
                />
                <text
                  x={PADDING.left - 8} y={tick.y + 4}
                  textAnchor="end"
                  fill="#64748b" fontSize="11"
                >
                  {formatYAxis(tick.value)}
                </text>
              </g>
            ))}

            {/* Revenue line */}
            <polyline
              points={revenuePoints}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Commission dashed line */}
            <polyline
              points={commissionPoints}
              fill="none"
              stroke="#a855f7"
              strokeWidth="1.5"
              strokeDasharray="5,3"
              strokeLinejoin="round"
            />

            {/* X axis labels + hover targets */}
            {data.map((d, i) => {
              const showLabel = data.length <= 15 || i % Math.ceil(data.length / 10) === 0;
              return (
                <g key={i}>
                  {showLabel && (
                    <text
                      x={toX(i)} y={HEIGHT - 8}
                      textAnchor="middle"
                      fill="#64748b" fontSize="10"
                    >
                      {formatDate(d.date)}
                    </text>
                  )}
                  {/* Invisible hover rect */}
                  <rect
                    x={toX(i) - xStep / 2}
                    y={PADDING.top}
                    width={xStep}
                    height={chartHeight}
                    fill="transparent"
                    onMouseEnter={() => setTooltip({ index: i, data: d, x: toX(i), y: toY(d.revenue || 0) })}
                  />
                </g>
              );
            })}

            {/* Tooltip vertical line */}
            {tooltip && (
              <>
                <line
                  x1={tooltip.x} y1={PADDING.top}
                  x2={tooltip.x} y2={PADDING.top + chartHeight}
                  stroke="#475569" strokeWidth="1" strokeDasharray="3,2"
                />
                <circle cx={tooltip.x} cy={toY(tooltip.data.revenue || 0)} r="4" fill="#3b82f6" />
                <circle cx={tooltip.x} cy={toY(tooltip.data.commission || 0)} r="3" fill="#a855f7" />
              </>
            )}
          </svg>

          {/* Tooltip box */}
          {tooltip && (
            <div
              className="absolute bg-slate-900 border border-slate-700 rounded-lg p-2.5 shadow-xl text-xs pointer-events-none z-10"
              style={{
                left: `${Math.min(85, (tooltip.index / (data.length - 1)) * 100)}%`,
                top: '10%',
                transform: 'translateX(-50%)',
              }}
            >
              <p className="font-semibold text-slate-200 mb-1">{tooltip.data.date}</p>
              <p className="text-blue-400">Revenue: ₹{(tooltip.data.revenue || 0).toLocaleString('en-IN')}</p>
              <p className="text-purple-400">Commission: ₹{(tooltip.data.commission || 0).toLocaleString('en-IN')}</p>
              <p className="text-slate-400">{tooltip.data.appointments} appts</p>
            </div>
          )}

          {/* Legend */}
          <div className="flex gap-4 mt-2 justify-center text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 bg-blue-500 inline-block rounded" />
              Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-0 inline-block border-t-2 border-dashed border-purple-500" style={{borderTopWidth: '2px'}} />
              Commission
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;

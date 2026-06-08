import React, { useState, useEffect } from 'react';

/**
 * D1.9 — Skeleton Loading Placeholder
 *
 * All skeletons are neutral-100 rectangles.
 * Animation: opacity oscillates between 0.5 and 1.0
 *             — opacity pulse ONLY. NO movement/translation.
 *
 * Variants:
 *   line   — height 16px, width as specified (default 100%)
 *   box    — width and height as specified
 *   circle — full-radius (only for avatar skeleton)
 *
 * RULE: Skeletons must match the EXACT shape of the content they represent.
 * Generic skeleton boxes are not acceptable — build card-specific skeletons.
 *
 * Border-radius:
 *   line + box → 0 (never rounded)
 *   circle     → full (avatar only — the one permitted circular element)
 */

const Skeleton = ({
  variant = 'line',
  width = '100%',
  height,
  className = '',
  style = {},
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const baseStyle = {
    backgroundColor: '#F2F2F2',   // neutral-100
    animation: 'swiss-pulse 1.2s ease-in-out infinite',
    display: 'block',
    ...style,
  };

  switch (variant) {
    case 'circle':
      // Only for avatar skeleton — the one permitted circular element
      return (
        <span
          className={`inline-block ${className}`}
          style={{
            ...baseStyle,
            width: width,
            height: height || width,
            borderRadius: '9999px',   // Full — avatar ONLY
          }}
          aria-hidden="true"
        />
      );

    case 'box':
      return (
        <span
          className={`block ${className}`}
          style={{
            ...baseStyle,
            width: width,
            height: height || '48px',
            borderRadius: '0',        // Never rounded
          }}
          aria-hidden="true"
        />
      );

    default: // 'line'
      return (
        <span
          className={`block ${className}`}
          style={{
            ...baseStyle,
            width: width,
            height: height || '16px',
            borderRadius: '0',        // Never rounded
          }}
          aria-hidden="true"
        />
      );
  }
};

/* ── Composite Skeletons (match actual card shapes) ──────── */

/** Doctor card skeleton — matches the DoctorCard proportions exactly */
export const DoctorCardSkeleton = () => (
  <div className="h-[160px] rounded-xl overflow-hidden flex"
       style={{ boxShadow: '0 2px 8px rgba(11,79,108,0.07)' }}>
    <div className="w-[220px] bg-[#E8F4F8] flex-shrink-0 animate-pulse" />
    <div className="w-[200px] flex-shrink-0 border-r border-[#EEF2F6] p-5 flex flex-col gap-4 animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-4/5" />
      <div className="h-3 bg-gray-100 rounded w-full" />
    </div>
    <div className="flex-1 p-5 flex flex-col gap-3 animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-3/5" />
      <div className="h-3 bg-gray-100 rounded w-2/5" />
      <div className="h-3 bg-gray-100 rounded w-4/5" />
      <div className="flex gap-2">
        <div className="h-5 bg-gray-100 rounded w-16" />
        <div className="h-5 bg-gray-100 rounded w-16" />
      </div>
    </div>
    <div className="w-[180px] flex-shrink-0 bg-[#FAFBFC] border-l border-[#EEF2F6] p-5 flex flex-col gap-3 items-center justify-center animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-3/4" />
      <div className="h-9 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  </div>
);

/** Table row skeleton — matches a standard data table row */
export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr style={{ borderBottom: '1px solid #E5E5E5' }} aria-busy="true">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} style={{ padding: '16px' }}>
        <Skeleton variant="line" width={i === 0 ? '80%' : i === columns - 1 ? '40%' : '65%'} />
      </td>
    ))}
  </tr>
);

/** Metric card skeleton */
export const MetricCardSkeleton = () => (
  <div
    className="p-6 bg-neutral-100"
    style={{ border: '2px solid #0F0F0F', borderRadius: '0' }}
    aria-busy="true"
  >
    <Skeleton variant="line" width="40%" height="12px" style={{ marginBottom: '12px' }} />
    <Skeleton variant="line" width="60%" height="32px" style={{ marginBottom: '8px' }} />
    <Skeleton variant="line" width="35%" height="12px" />
  </div>
);

export default Skeleton;

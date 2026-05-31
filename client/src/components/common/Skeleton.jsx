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
  <div
    className="p-8"
    style={{ border: '2px solid #E5E5E5', borderRadius: '0' }}
    aria-label="Loading doctor information"
    aria-busy="true"
  >
    <div className="flex items-start gap-4 mb-6">
      {/* Avatar circle */}
      <Skeleton variant="circle" width="48px" height="48px" />
      <div className="flex-1 flex flex-col gap-2">
        {/* Name */}
        <Skeleton variant="line" width="60%" height="16px" />
        {/* Specialization */}
        <Skeleton variant="line" width="40%" height="12px" />
      </div>
    </div>
    {/* Rating + fee row */}
    <div className="flex gap-4 mb-4">
      <Skeleton variant="line" width="30%" height="12px" />
      <Skeleton variant="line" width="25%" height="12px" />
    </div>
    {/* Location */}
    <Skeleton variant="line" width="50%" height="12px" />
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
    className="p-8 bg-neutral-100"
    style={{ border: '2px solid #0F0F0F', borderRadius: '0' }}
    aria-busy="true"
  >
    <Skeleton variant="line" width="40%" height="12px" style={{ marginBottom: '12px' }} />
    <Skeleton variant="line" width="60%" height="32px" style={{ marginBottom: '8px' }} />
    <Skeleton variant="line" width="35%" height="12px" />
  </div>
);

export default Skeleton;

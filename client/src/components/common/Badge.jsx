import React, { useState } from 'react';

/**
 * Structured Warmth — Badge & Status Chip Primitive
 *
 * Badges use 2px solid borders, matching text colors, and translucent background fills.
 * Badge text uses uppercase tracked text and is rounded-sm (4px).
 * Supports interactive filter/removal chips with hover close indicators.
 */

const VARIANT_CONFIG = {
  verified:  { bg: 'rgba(10, 126, 110, 0.06)', hoverBg: 'rgba(10, 126, 110, 0.12)', color: '#0A7E6E', border: '2px solid #0A7E6E', label: 'VERIFIED'  },
  confirmed: { bg: 'rgba(10, 126, 110, 0.06)', hoverBg: 'rgba(10, 126, 110, 0.12)', color: '#0A7E6E', border: '2px solid #0A7E6E', label: 'CONFIRMED' },
  paid:      { bg: 'rgba(10, 126, 110, 0.06)', hoverBg: 'rgba(10, 126, 110, 0.12)', color: '#0A7E6E', border: '2px solid #0A7E6E', label: 'PAID'      },
  completed: { bg: 'rgba(10, 126, 110, 0.06)', hoverBg: 'rgba(10, 126, 110, 0.12)', color: '#0A7E6E', border: '2px solid #0A7E6E', label: 'COMPLETED' },
  active:    { bg: 'rgba(10, 126, 110, 0.06)', hoverBg: 'rgba(10, 126, 110, 0.12)', color: '#0A7E6E', border: '2px solid #0A7E6E', label: 'ACTIVE'    },
  teal:      { bg: 'rgba(10, 126, 110, 0.06)', hoverBg: 'rgba(10, 126, 110, 0.12)', color: '#0A7E6E', border: '2px solid #0A7E6E', label: 'TEAL'      },
  
  pending:   { bg: 'rgba(180, 83, 9, 0.06)',  hoverBg: 'rgba(180, 83, 9, 0.12)',  color: '#B45309', border: '2px solid #B45309', label: 'PENDING'   },
  warning:   { bg: 'rgba(180, 83, 9, 0.06)',  hoverBg: 'rgba(180, 83, 9, 0.12)',  color: '#B45309', border: '2px solid #B45309', label: 'WARNING'   },
  amber:     { bg: 'rgba(180, 83, 9, 0.06)',  hoverBg: 'rgba(180, 83, 9, 0.12)',  color: '#B45309', border: '2px solid #B45309', label: 'AMBER'     },
  
  cancelled: { bg: 'rgba(156, 163, 175, 0.06)', hoverBg: 'rgba(156, 163, 175, 0.12)', color: '#6B7280', border: '2px solid #9CA3AF', label: 'CANCELLED' },
  rejected:  { bg: 'rgba(156, 163, 175, 0.06)', hoverBg: 'rgba(156, 163, 175, 0.12)', color: '#6B7280', border: '2px solid #9CA3AF', label: 'REJECTED'  },
  gray:      { bg: 'rgba(156, 163, 175, 0.06)', hoverBg: 'rgba(156, 163, 175, 0.12)', color: '#6B7280', border: '2px solid #9CA3AF', label: 'GRAY'      },
  neutral:   { bg: 'rgba(156, 163, 175, 0.06)', hoverBg: 'rgba(156, 163, 175, 0.12)', color: '#6B7280', border: '2px solid #9CA3AF', label: ''          },
  
  new:       { bg: 'rgba(244, 132, 95, 0.06)',  hoverBg: 'rgba(244, 132, 95, 0.12)',  color: '#F4845F', border: '2px solid #F4845F', label: 'NEW'       },
  coral:     { bg: 'rgba(244, 132, 95, 0.06)',  hoverBg: 'rgba(244, 132, 95, 0.12)',  color: '#F4845F', border: '2px solid #F4845F', label: 'CORAL'     },
  
  suspended: { bg: 'rgba(192, 57, 43, 0.06)',  hoverBg: 'rgba(192, 57, 43, 0.12)',  color: '#C0392B', border: '2px solid #C0392B', label: 'SUSPENDED' },
};

const SIZE_STYLES = {
  sm: { padding: '4px 8px',   fontSize: '14px', letterSpacing: '0.08em' },
  md: { padding: '6px 12px',  fontSize: '14px', letterSpacing: '0.08em' },
};

const Badge = ({
  variant = 'neutral',
  size = 'sm',
  label,
  onRemove,
  onClick,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.neutral;
  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.sm;
  
  // Format the label as uppercase tracked text
  const displayLabel = (label ?? config.label)?.toUpperCase();
  const isInteractive = !!onRemove || !!onClick;

  return (
    <span
      onMouseEnter={() => isInteractive && setIsHovered(true)}
      onMouseLeave={() => isInteractive && setIsHovered(false)}
      onClick={onRemove ? undefined : onClick}
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider select-none ${
        isInteractive ? 'cursor-pointer' : 'cursor-default'
      } ${className}`}
      style={{
        backgroundColor: isHovered ? config.hoverBg : config.bg,
        color: config.color,
        border: config.border,
        borderRadius: '4px',          // 4px border-radius
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize,
        letterSpacing: sizeStyle.letterSpacing,
        lineHeight: '1',
        fontFamily: 'Inter, sans-serif',
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
        transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <span>{displayLabel}</span>
      {onRemove && isHovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(e);
          }}
          className="hover:scale-110 active:scale-95 transition-transform cursor-pointer font-medium focus:outline-none flex items-center justify-center"
          style={{
            color: config.color,
            fontSize: '14px',
            lineHeight: '1',
            background: 'none',
            border: 'none',
            padding: 0,
            marginLeft: '2px',
          }}
          aria-label="Remove filter"
        >
          ✕
        </button>
      )}
    </span>
  );
};

export default Badge;

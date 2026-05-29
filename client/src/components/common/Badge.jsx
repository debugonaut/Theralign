import React from 'react';

/**
 * D1.5 — Badge & Status Chip Primitive
 *
 * The visual language of trust and status across the entire platform.
 * Every status indicator uses this single component — verification,
 * appointment, payment, availability, and categorical labels.
 *
 * Key rules:
 *   - White fill ONLY — no colored backgrounds
 *   - Color is expressed through BORDER and TEXT, never background fill
 *   - Zero border-radius — sharp rectangles, not pills
 *   - All text is uppercase and tracked
 *
 * Why no colored backgrounds?
 *   Filled colored badges in a table of 20 rows create a chaotic color
 *   field that competes with the content. Bordered badges allow the
 *   data to remain primary.
 *
 * Color contexts (STRICTLY enforced):
 *   Teal  → verified, confirmed, paid (trust signals)
 *   Amber → pending (attention, not alarm)
 *   Gray  → cancelled, rejected (deprioritized, informational)
 *   Black → suspended, completed, active (operational)
 */

const VARIANT_CONFIG = {
  verified:  { color: '#0D7377', label: 'VERIFIED'  },
  confirmed: { color: '#0D7377', label: 'CONFIRMED' },
  paid:      { color: '#0D7377', label: 'PAID'      },
  pending:   { color: '#B45309', label: 'PENDING'   },
  cancelled: { color: '#A3A3A3', label: 'CANCELLED' },
  rejected:  { color: '#A3A3A3', label: 'REJECTED'  },
  suspended: { color: '#0F0F0F', label: 'SUSPENDED' },
  completed: { color: '#0F0F0F', label: 'COMPLETED' },
  active:    { color: '#0F0F0F', label: 'ACTIVE'    },
  neutral:   { color: '#E5E5E5', label: ''          },  // label via prop
};

const SIZE_STYLES = {
  sm: { padding: '4px 8px',   fontSize: '11px', letterSpacing: '0.08em' },
  md: { padding: '6px 12px',  fontSize: '12px', letterSpacing: '0.06em' },
};

const Badge = ({
  variant = 'neutral',
  size = 'sm',
  label,
  className = '',
}) => {
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.neutral;
  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.sm;
  const displayLabel = label ?? config.label;

  return (
    <span
      className={`inline-flex items-center font-bold uppercase ${className}`}
      style={{
        border: `2px solid ${config.color}`,
        color: config.color,
        backgroundColor: '#FFFFFF',   // White fill only — non-negotiable
        borderRadius: '0',            // No pill shapes
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize,
        letterSpacing: sizeStyle.letterSpacing,
        lineHeight: '1',
        fontFamily: 'Inter, sans-serif',
        whiteSpace: 'nowrap',
      }}
    >
      {displayLabel}
    </span>
  );
};

export default Badge;

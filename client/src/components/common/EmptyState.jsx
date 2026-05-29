import React from 'react';
import Button from './Button';

/**
 * D1.9 — EmptyState Component
 *
 * Used whenever a list, table, or data section has no content.
 *
 * Pattern:
 *   00. (red) → LARGE UPPERCASE TITLE → description → action button
 *
 * Rules:
 *   - NO illustrations. NO decorative graphics. NO SVG art.
 *   - Structure and typography only
 *   - Icon (optional): must be inside a 48×48 bordered square — not floating
 *   - Section number is always '00.' in swiss-red
 *   - Title is Inter 900, display-sm (32px), uppercase
 *   - Description: max-width 400px to prevent overly long lines
 */

const EmptyState = ({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  actionVariant = 'primary',
  className = '',
}) => (
  <div
    className={`flex flex-col items-center justify-center text-center py-12 px-8 ${className}`}
  >
    {/* Optional icon — must be in a bordered square */}
    {Icon && (
      <div
        className="flex items-center justify-center mb-6"
        style={{
          width: '48px',
          height: '48px',
          border: '2px solid #0F0F0F',
          borderRadius: '0',   // Bordered square — not a circle
        }}
      >
        <Icon size={24} strokeWidth={1.5} className="text-swiss-black" />
      </div>
    )}

    {/* Section number — always 00. in red */}
    <span className="swiss-section-number block mb-4">00.</span>

    {/* Title — display-sm, Inter 900, uppercase */}
    <h3
      className="font-black uppercase text-swiss-black mb-4"
      style={{
        fontSize: '32px',
        lineHeight: '36px',
        letterSpacing: '-0.03em',
        fontFamily: 'Inter, sans-serif',
        textTransform: 'uppercase',
      }}
    >
      {title}
    </h3>

    {/* Description */}
    {description && (
      <p
        className="text-swiss-gray-400"
        style={{
          fontSize: '16px',
          lineHeight: '1.6',
          maxWidth: '400px',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {description}
      </p>
    )}

    {/* Action button */}
    {actionLabel && onAction && (
      <div className="mt-6">
        <Button variant={actionVariant} onClick={onAction}>
          {actionLabel} →
        </Button>
      </div>
    )}
  </div>
);

export default EmptyState;

import React from 'react';

/**
 * D1.6 — Card Primitive Component
 *
 * A bordered rectangular container with four behavioral modes.
 * Zero border-radius. No shadows. Elevation through border + background shift.
 *
 * Variants:
 *   default     — static data display, border grows to 4px on hover
 *   interactive — full black inversion on hover (specialization cards, nav actions)
 *   metric      — data card, border grows only (NOT inverted — data ≠ action)
 *   highlight   — always 4px border, shifts to red on hover (urgent attention)
 *
 * Surface:
 *   white — primary background
 *   gray  — swiss-gray-100 (#F2F2F2) secondary surface
 *
 * Pattern:
 *   null     — no texture
 *   'grid'   — 24px grid overlay
 *   'dots'   — 16px dot matrix
 *   'diagonal' — 45° repeating lines
 *
 * PATTERN RULE: Never apply patterns to black, red, or teal surfaces.
 * Never stack two patterns on the same element.
 */

const PATTERN_CLASS = {
  grid:     'swiss-grid-pattern',
  dots:     'swiss-dot-matrix',
  diagonal: 'swiss-diagonal',
};

const Card = ({
  variant = 'default',
  surface = 'white',
  pattern = null,
  onClick,
  className = '',
  children,
  ...rest
}) => {
  const patternClass = pattern ? PATTERN_CLASS[pattern] : '';

  const baseClasses = [
    'rounded-none',          // Zero border-radius. Always.
    'shadow-none',           // No shadows. Always.
    'p-8',                   // 32px padding — consistent, generous, never less
    'transition-all duration-fast',
    patternClass,
  ].filter(Boolean);

  // Surface background
  const surfaceClass = surface === 'gray' ? 'bg-swiss-gray-100' : 'bg-swiss-white';

  let variantClasses = '';
  let cursorClass = '';

  switch (variant) {
    case 'interactive':
      // Full color inversion on hover.
      // Children MUST use currentColor for text/borders to inherit inversion.
      variantClasses = [
        'border-2 border-swiss-black',
        'bg-swiss-white text-swiss-black',
        'hover:bg-swiss-black hover:text-swiss-white hover:border-swiss-black',
        'group',   // Allows children to react with group-hover:
      ].join(' ');
      cursorClass = 'cursor-pointer';
      break;

    case 'metric':
      // Data card — border weight increases only, no inversion.
      // Optional overrides via className for amber (pending) or teal (revenue) borders.
      variantClasses = [
        'border-2 border-swiss-black bg-swiss-gray-100',
        'hover:border-4',
      ].join(' ');
      cursorClass = 'cursor-default';
      break;

    case 'highlight':
      // Always heavy border, shifts to red on hover.
      variantClasses = [
        'border-4 border-swiss-black',
        'bg-swiss-white',
        'hover:border-swiss-red',
      ].join(' ');
      cursorClass = onClick ? 'cursor-pointer' : 'cursor-default';
      break;

    default: // 'default'
      variantClasses = [
        'border-2 border-swiss-black',
        surfaceClass,
        'hover:border-4',
      ].join(' ');
      cursorClass = 'cursor-default';
      break;
  }

  return (
    <div
      onClick={onClick}
      className={[
        ...baseClasses,
        variantClasses,
        cursorClass,
        className,
      ].filter(Boolean).join(' ')}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;

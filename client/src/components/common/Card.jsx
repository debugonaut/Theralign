import React from 'react';

/**
 * Structured Warmth — Card Primitive Component
 *
 * Cards are defined by their shadow and white background sitting on the
 * warm page background, not by hard black borders.
 * Uses custom Three-Level Shadow System and precise transition physics.
 */

const Card = ({
  variant = 'default',
  surface = 'white',
  selected = false,
  disabled = false,
  expanded = false,
  onClick,
  className = '',
  children,
  ...rest
}) => {
  // Mobile uses rounded-xl (12px), desktop uses rounded-lg (8px)
  const baseClasses = [
    className.includes('rounded-') ? '' : 'rounded-xl md:rounded-lg', 
    className.includes('p-') ? '' : 'p-6',
    'transition-[background-color,border-color] duration-fast transition-[box-shadow] duration-standard ease-swiss border-2',
  ].filter(Boolean);

  // Surface background
  let bgClass = surface === 'gray' ? 'bg-neutral-100' : 'bg-white';
  let borderClass = 'border-neutral-200';
  let shadowClass = 'shadow-level-1';
  let cursorClass = onClick ? 'cursor-pointer' : 'cursor-default';
  let opacityClass = '';

  // Apply Disabled state
  if (disabled) {
    opacityClass = 'opacity-50';
    cursorClass = 'cursor-default';
    borderClass = 'border-neutral-200/50';
  }

  // Apply Selected state
  if (selected) {
    borderClass = 'border-primary';
    bgClass = 'bg-primary-light'; // Light blue tint
  }

  // Apply Expanded state
  if (expanded) {
    borderClass = 'border-l-4 border-l-primary border-t-transparent border-r-transparent border-b-transparent';
    bgClass = 'bg-neutral-50';
  }

  let hoverClasses = '';
  if (!disabled && (onClick || variant === 'interactive')) {
    // Hover: bg becomes #F0F0ED (swiss-gray-100), border becomes 3px #1A1A1A (swiss-black), shadow lifts to level-2
    hoverClasses = 'hover:bg-[#F0F0ED] hover:border-[3px] hover:border-[#1A1A1A] hover:shadow-level-2';
  }

  let variantClasses = '';
  switch (variant) {
    case 'interactive':
      variantClasses = `shadow-level-1 bg-white text-neutral-900 ${hoverClasses}`;
      cursorClass = 'cursor-pointer';
      break;

    case 'metric':
      variantClasses = 'shadow-level-1 bg-neutral-100 text-neutral-900 hover:shadow-level-2';
      cursorClass = 'cursor-default';
      break;

    case 'highlight':
      variantClasses = `border-accent shadow-level-1 bg-white text-neutral-900 hover:border-accent-dark hover:shadow-level-2`;
      cursorClass = onClick ? 'cursor-pointer' : 'cursor-default';
      break;

    default: // 'default'
      variantClasses = [
        shadowClass,
        bgClass,
        borderClass,
        'text-neutral-900',
        hoverClasses,
      ].filter(Boolean).join(' ');
      break;
  }

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={[
        ...baseClasses,
        variantClasses,
        cursorClass,
        opacityClass,
        className,
      ].filter(Boolean).join(' ')}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={onClick && !disabled ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;

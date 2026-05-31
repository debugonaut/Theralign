import React from 'react';

/**
 * Structured Warmth — Button Primitive Component
 *
 * All buttons use rounded-md (6px) and title case.
 * Active states use scale transforms (.active-press) and subtle custom shadows.
 * Supports a `loadingText` prop for status communication.
 */

const Spinner = ({ color }) => (
  <span
    className="inline-block shrink-0"
    style={{
      width: '16px',
      height: '16px',
      border: '2px solid currentColor',
      borderRightColor: 'transparent',
      borderRadius: '50%',
      animation: 'swiss-spin 0.72s linear infinite',
    }}
    aria-hidden="true"
  />
);

const VARIANT_CLASSES = {
  primary: {
    base:    'bg-primary text-white border-2 border-transparent shadow-btn-primary',
    hover:   'hover:bg-primary-dark',
    focus:   'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4',
  },
  secondary: {
    base:    'bg-transparent text-primary border-2 border-primary',
    hover:   'hover:bg-primary-light hover:border-[3px]',
    focus:   'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4',
  },
  accent: {
    base:    'bg-accent text-white border-2 border-transparent shadow-btn-accent',
    hover:   'hover:bg-accent-dark',
    focus:   'focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4',
  },
  ghost: {
    base:    'bg-transparent text-neutral-900 border-2 border-neutral-200',
    hover:   'hover:bg-neutral-100 hover:border-[3px] hover:border-neutral-900',
    focus:   'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4',
  },
  danger: {
    base:    'bg-transparent text-danger border-2 border-danger',
    hover:   'hover:bg-[#FDF2F2] hover:border-[3px]',
    focus:   'focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4',
  },
  destructive: {
    base:    'bg-transparent text-swiss-black border-2 border-swiss-black',
    hover:   'hover:text-danger hover:border-danger hover:bg-[#FDF2F2] hover:border-[3px]',
    focus:   'focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4',
  },
};

const SIZE_CLASSES = {
  sm: 'h-8  px-4  text-ui-xs',
  md: 'h-10 px-6  text-ui-sm',
  lg: 'h-12 px-8  text-ui-md',
};

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText = '',
  disabled = false,
  fullWidth = false,
  onClick,
  children,
  type = 'button',
  className = '',
  ...rest
}) => {
  const isDisabled = disabled || loading;
  const visualDisabled = disabled; // Loading state is visually active, not faded!
  const { base, hover, focus } = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  // If className overrides height, clean default height classes to prevent collisions
  const filteredSizeClass = className.includes('h-') 
    ? sizeClass.replace(/h-\d+|h-\[.*?\]/, '') 
    : sizeClass;

  return (
    <button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={[
        // Shape & layout
        'inline-flex items-center justify-center gap-2',
        'font-bold transition-all cubic-bezier(0.4, 0, 0.2, 1) transition-warm',
        'active:scale-[0.97] active:duration-[80ms] active:shadow-none',
        'rounded-md',                // 6px border-radius
        // Variant
        base,
        // Hover
        !isDisabled ? hover : '',
        // Focus state
        focus,
        'focus:outline-none',
        // Disabled / loading
        visualDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        // Full width
        fullWidth ? 'w-full' : '',
        // Size
        filteredSizeClass,
        // Touch target expansion for small size (32px height needs 6px top/bottom invisible padding to reach 44px)
        size === 'sm' ? 'relative before:absolute before:-top-[6px] before:-bottom-[6px] before:left-0 before:right-0' : '',
        // Override classes
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {loading ? (
        <>
          <Spinner />
          {loadingText && <span className="normal-case font-medium text-[13px]">{loadingText}</span>}
        </>
      ) : children}
    </button>
  );
};

export default Button;
export { Button };

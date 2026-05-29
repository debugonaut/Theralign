import React from 'react';

/**
 * D1.3 — Button Primitive Component
 *
 * The primary conversion mechanism across the entire Theralign platform.
 * Four variants, three sizes, five states. All uppercase. Zero border-radius.
 * Hover states are mechanical color inversions — NOT subtle fades.
 *
 * Variants:
 *   primary  — black fill → red on hover  (default actions)
 *   secondary — white fill → black inversion (subordinate actions)
 *   accent   — red fill → darker red      (Confirm & Pay, Get Started ONLY)
 *   ghost    — transparent → gray fill    (tertiary options)
 *
 * DO NOT add border-radius, shadow, or duration above 150ms to any variant.
 */

/** Rectangular spinner — consistent with zero-radius system geometry.
 *  A circular spinner would be the only non-avatar circle in the UI. */
const Spinner = ({ color }) => (
  <span
    className="inline-block"
    style={{
      width: '14px',
      height: '14px',
      border: `2px solid ${color}`,
      borderRightColor: 'transparent',
      borderRadius: '0',            // Rectangular. Always.
      animation: 'swiss-spin 0.6s linear infinite',
    }}
    aria-hidden="true"
  />
);

const VARIANT_CLASSES = {
  primary: {
    base:    'bg-swiss-black text-swiss-white border-swiss-black border-2',
    hover:   'hover:bg-swiss-red hover:border-swiss-red',
    spinner: '#FFFFFF',
  },
  secondary: {
    base:    'bg-swiss-white text-swiss-black border-swiss-black border-2',
    hover:   'hover:bg-swiss-black hover:text-swiss-white',
    spinner: '#0F0F0F',
  },
  accent: {
    base:    'bg-swiss-red text-swiss-white border-swiss-red border-2',
    hover:   'hover:bg-[#CC2600] hover:border-[#CC2600]',
    spinner: '#FFFFFF',
  },
  ghost: {
    base:    'bg-transparent text-swiss-black border-swiss-black border-2',
    hover:   'hover:bg-swiss-gray-100',
    spinner: '#0F0F0F',
  },
};

const SIZE_CLASSES = {
  sm: 'h-8  px-4  text-ui-sm  tracking-widest',
  md: 'h-10 px-6  text-ui-md  tracking-widest',
  lg: 'h-12 px-8  text-ui-lg  tracking-widest',
};

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  children,
  type = 'button',
  className = '',
  ...rest
}) => {
  const isDisabled = disabled || loading;
  const { base, hover, spinner } = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;

  return (
    <button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={[
        // Shape & layout
        'inline-flex items-center justify-center gap-2',
        'font-bold uppercase tracking-widest',
        'rounded-none',              // Zero border-radius. Always.
        'border-0',                  // Reset browser default, borders declared per variant
        'transition-all duration-fast',
        // Variant
        base,
        // Hover (only when not disabled)
        !isDisabled ? hover : '',
        // Active
        !isDisabled ? 'active:scale-[0.98]' : '',
        // Disabled / loading
        isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        // Full width
        fullWidth ? 'w-full' : '',
        // Size
        SIZE_CLASSES[size] || SIZE_CLASSES.md,
        // Escape hatch — positioning only, never visual overrides
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {loading ? <Spinner color={spinner} /> : children}
    </button>
  );
};

export default Button;

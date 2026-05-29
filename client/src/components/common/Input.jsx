import React, { forwardRef } from 'react';

/**
 * D1.4 — Input Primitive Component
 *
 * Covers text inputs, textareas, and select dropdowns.
 * Every form field across the platform uses this component.
 *
 * Rules:
 *   - Label is ALWAYS above the input. Never inside as placeholder.
 *   - Focus = 4px border weight increase (not a color change or glow)
 *   - Error = red border + "ERROR: [message]" prefix below
 *   - Zero border-radius on all variants
 *   - No blue rings, no Tailwind default focus styles
 *
 * Why label above?
 *   Placeholder-as-label disappears when the user types — unacceptable
 *   in a healthcare context where form accuracy matters.
 *
 * Why 4px border on focus?
 *   A border weight increase is a pure structural signal that works in
 *   all contexts without color conflict with error or validation states.
 */

const Input = forwardRef(({
  label,
  placeholder,
  error,
  disabled = false,
  required = false,
  type = 'text',
  value,
  onChange,
  name,
  id,
  className = '',
  rows = 4,
  multiline = false,
  select = false,
  children,   // For <select> options
  ...rest
}, ref) => {
  const inputId = id || name;

  const sharedInputStyles = [
    'w-full font-swiss font-regular text-ui-md text-swiss-black',
    'border-2 rounded-none',            // 2px border, zero radius
    'px-3 py-2.5',                       // ~12px horizontal, ~10px vertical
    'placeholder:text-swiss-gray-400',
    'transition-all duration-fast',
    // Focus: border WEIGHT increases to 4px — structural signal, not color
    'focus:border-4 focus:border-swiss-black focus:outline-none',
    // Error state
    error
      ? 'border-swiss-red focus:border-swiss-red'
      : 'border-swiss-black',
    // Disabled state
    disabled
      ? 'bg-swiss-gray-100 text-swiss-gray-400 cursor-not-allowed'
      : 'bg-swiss-white',
  ].filter(Boolean).join(' ');

  const renderField = () => {
    if (multiline) {
      return (
        <textarea
          ref={ref}
          id={inputId}
          name={name}
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${sharedInputStyles} resize-y min-h-[80px]`}
          aria-describedby={error ? `${inputId}-error` : undefined}
          aria-invalid={!!error}
          {...rest}
        />
      );
    }

    if (select) {
      return (
        <select
          ref={ref}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${sharedInputStyles} h-10 cursor-pointer`}
          aria-describedby={error ? `${inputId}-error` : undefined}
          aria-invalid={!!error}
          {...rest}
        >
          {children}
        </select>
      );
    }

    return (
      <input
        ref={ref}
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${sharedInputStyles} h-10`}
        aria-describedby={error ? `${inputId}-error` : undefined}
        aria-invalid={!!error}
        {...rest}
      />
    );
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={[
            'swiss-label',
            error ? 'text-swiss-red' : 'text-swiss-black',
          ].join(' ')}
        >
          {label}
          {required && (
            <span className="text-swiss-red ml-0.5" aria-label="required">
              {' '}*
            </span>
          )}
        </label>
      )}

      {renderField()}

      {error && (
        <p
          id={`${inputId}-error`}
          className="swiss-label text-swiss-red mt-1"
          role="alert"
        >
          ERROR: {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

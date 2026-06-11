import React, { forwardRef, useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

/**
 * Structured Warmth — Input Primitive Component
 *
 * Micro-interactions:
 *   - Focus = primary color border + warm focus glow ring.
 *   - Success Confirm = quiet success confirmation border on blur (valid value, no error)
 *   - Error = danger border + soft red glow, prepends "↑ " to helper text.
 *   - Disabled = bg-neutral-50 (#F7F9FB), border-neutral-200 (#DDE3EA), text-neutral-500 (#6B7C93), cursor-default.
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
  onFocus,
  onBlur,
  name,
  id,
  className = '',
  rows = 4,
  multiline = false,
  select = false,
  loading = false,
  showLock = false,
  children,
  ...rest
}, ref) => {
  const inputId = id || name;

  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e) => {
    setHasValue(!!e.target.value);
    if (onChange) onChange(e);
  };

  // Conversational placeholder transformer (removes Swiss loud uppercase casing if present)
  const formatPlaceholder = (ph) => {
    if (!ph) return '';
    if (ph === ph.toUpperCase()) {
      return ph.toLowerCase().replace(/(^\s*e\.g\.\s*|^\s*)/, (m) => m + ' ');
    }
    return ph;
  };

  const formattedPlaceholder = formatPlaceholder(placeholder);

  // Focus vs Success vs Error vs Default borders
  const getBorderStyles = () => {
    if (error) {
      return 'border-danger shadow-[0_0_0_3px_rgba(192,57,43,0.12)]';
    }
    if (isFocused) {
      return 'border-primary shadow-[0_0_0_3px_rgba(11,79,108,0.12)]';
    }
    // Post-focus success confirm: quiet confirmation when blurred, has value, and no error
    if (!isFocused && hasValue && !error) {
      return 'border-success/60'; // quiet success confirm border
    }
    return 'border-neutral-200';
  };

  const sharedInputStyles = [
    'w-full font-swiss font-regular text-ui-md text-neutral-900 transition-all duration-fast cubic-bezier(0.4, 0, 0.2, 1)',
    'border-2 rounded-md',        // 2px border, 6px radius (rounded-md)
    'px-3 py-2',
    'placeholder:text-neutral-300 placeholder:transition-opacity placeholder:duration-fast placeholder:ease-swiss focus:placeholder:opacity-50',
    'focus:outline-none',
    getBorderStyles(),
    // Disabled state
    disabled
      ? 'bg-neutral-50 text-neutral-500 border-neutral-200 cursor-default'
      : 'bg-white',
  ].filter(Boolean).join(' ');

  const renderField = () => {
    if (multiline) {
      return (
        <textarea
          ref={ref}
          id={inputId}
          name={name}
          rows={rows}
          placeholder={formattedPlaceholder}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
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
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
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

    const hasRightContent = showLock || loading;
    const inputElement = (
      <input
        ref={ref}
        id={inputId}
        name={name}
        type={type}
        placeholder={formattedPlaceholder}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className={`${sharedInputStyles} h-10 ${hasRightContent ? 'pr-10' : ''}`}
        aria-describedby={error ? `${inputId}-error` : undefined}
        aria-invalid={!!error}
        {...rest}
      />
    );

    if (hasRightContent) {
      return (
        <div className="relative w-full">
          {inputElement}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-neutral-400 pointer-events-none">
            {loading ? (
              <span className="animate-spin inline-block w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full" />
            ) : showLock ? (
              <Lock size={14} className="text-neutral-400" />
            ) : null}
          </div>
        </div>
      );
    }

    return inputElement;
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={[
            'text-sm font-normal uppercase tracking-wide transition-colors',
            error ? 'text-danger' : 'text-neutral-500',
          ].join(' ')}
        >
          {label}
          {required && (
            <span className="text-danger ml-0.5" aria-label="required">
              {' '}*
            </span>
          )}
        </label>
      )}

      {renderField()}

      {error && (
        <p
          id={`${inputId}-error`}
          className="text-sm text-danger mt-1 normal-case leading-tight font-medium"
          role="alert"
        >
          ↑ {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
export { Input };

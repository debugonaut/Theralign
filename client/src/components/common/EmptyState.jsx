import React from 'react';
import Button from './Button';

/**
 * Structured Warmth — EmptyState Component
 *
 * Used whenever a list, table, or data section has no content.
 * Supports actionable and informational voices using the `context` prop.
 *
 * Registers:
 *   - actionable: reassurance + clear CTA to guide progress
 *   - informational: gentle description explaining platform status, no button
 */

const EmptyState = ({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  actionVariant = 'primary',
  context = 'actionable', // 'actionable' | 'informational'
  className = '',
}) => {
  const isActionable = context === 'actionable' && actionLabel && onAction;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-8 ${className}`}
    >
      {/* Icon — must be in a soft bordered square */}
      {Icon && (
        <div
          className="flex items-center justify-center mb-6 bg-neutral-50 rounded-md"
          style={{
            width: '48px',
            height: '48px',
            border: '1.5px solid #DDE3EA',
          }}
        >
          <Icon size={24} strokeWidth={1.5} className="text-primary" />
        </div>
      )}

      {/* Section number — always 00. in accent */}
      <span className="text-[12px] font-semibold text-accent normal-case block mb-4">00.</span>

      {/* Title — display-sm, Inter 900 */}
      <h3
        className="font-black text-neutral-900 mb-4"
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
          className="text-neutral-500"
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

      {/* Action button — rendered ONLY in actionable contexts */}
      {isActionable && (
        <div className="mt-6">
          <Button variant={actionVariant} onClick={onAction}>
            {actionLabel} →
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
export { EmptyState };

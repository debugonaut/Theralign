import React from 'react';

/**
 * D1.10 — SectionHeader Pattern Component
 *
 * The inviolable section header pattern used on EVERY page section
 * across all 5 design phases.
 *
 * Pattern: [section number in red] → [display title in black] → [4px rule]
 *
 * This component must be visually identical every time it appears.
 * If any section header is hand-coded, replace it with this component.
 *
 * Props:
 *   number   — '01.' '02.' etc. in red. null for dashboard/functional pages.
 *   title    — always rendered UPPERCASE regardless of the string passed in.
 *   subtitle — single sentence, gray, mixed-case. max-width 560px.
 *   size     — 'sm' (24px), 'md' (32px), 'lg' (48px). Default: 'md'.
 *   ruled    — shows 4px bottom rule. Default: true.
 *              False only for inline sub-section headers inside cards.
 */

const SIZE_STYLES = {
  sm: { fontSize: '24px', lineHeight: '28px', letterSpacing: '-0.02em' },
  md: { fontSize: '32px', lineHeight: '36px', letterSpacing: '-0.03em' },
  lg: { fontSize: '48px', lineHeight: '52px', letterSpacing: '-0.04em' },
};

const SectionHeader = ({
  number = null,
  title,
  subtitle = null,
  size = 'md',
  ruled = true,
  className = '',
}) => {
  const titleStyle = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <div className={`mb-12 ${className}`}>
      {/* Section number — red, small, uppercase */}
      {number && (
        <span
          className="swiss-section-number block mb-2"
          aria-hidden="true"
        >
          {number}
        </span>
      )}

      {/* Title — Inter 900, uppercase, negative tracking */}
      <h2
        className="font-black text-swiss-black block"
        style={{
          ...titleStyle,
          fontFamily: 'Inter, sans-serif',
          textTransform: 'uppercase',   // Enforced in CSS — not dependent on the string
          lineHeight: '1.05',
        }}
      >
        {title}
      </h2>

      {/* Subtitle — optional, gray, mixed-case, max-width 560px */}
      {subtitle && (
        <p
          className="text-swiss-gray-400 block"
          style={{
            fontSize: '16px',
            lineHeight: '24px',
            marginTop: '12px',
            maxWidth: '560px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {subtitle}
        </p>
      )}

      {/* Horizontal rule — 4px solid black. The structural ground line. */}
      {ruled && (
        <div
          className="block w-full"
          style={{
            height: '4px',
            backgroundColor: '#0F0F0F',
            marginTop: '24px',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default SectionHeader;

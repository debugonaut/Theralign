import React from 'react';

/**
 * Structured Warmth — SectionHeader Component
 *
 * Visual pattern: [coral prefix number] → [title in primary] → [1px rule]
 *
 * Rules:
 *   - Main headings (md, lg) are uppercase architectural dividers.
 *   - Sub-sections (sm) inside dashboards are title-cased operational labels.
 *   - Horizontal divider is 1px solid #DDE3EA Slate instead of 4px pure black.
 */

const SIZE_STYLES = {
  sm: { fontSize: '24px', lineHeight: '28px', letterSpacing: '-0.02em' },
  md: { fontSize: '32px', lineHeight: '36px', letterSpacing: '-0.03em' },
  lg: { fontSize: '48px', lineHeight: '52px', letterSpacing: '-0.04em' },
};

const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.includes("'")) {
        // Handle possessives like today's -> Today's
        return word.split("'").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("'");
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
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
  const isDashboardSubSection = size === 'sm';
  const displayTitle = isDashboardSubSection ? toTitleCase(title) : title;
  const textTransform = isDashboardSubSection ? 'none' : 'uppercase';

  return (
    <div className={`mb-12 ${className}`}>
      {/* Section number — coral prefix */}
      {number && (
        <span
          className="text-[12px] font-semibold text-accent normal-case block mb-2"
          aria-hidden="true"
        >
          {number}
        </span>
      )}

      {/* Title */}
      <h2
        className="font-black text-neutral-900 block"
        style={{
          ...titleStyle,
          fontFamily: 'Inter, sans-serif',
          textTransform,
          lineHeight: '1.05',
        }}
      >
        {displayTitle}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p
          className="text-neutral-500 block"
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

      {/* Horizontal rule — 1px Slate */}
      {ruled && (
        <div
          className="block w-full"
          style={{
            height: '1px',
            backgroundColor: '#DDE3EA',
            marginTop: '24px',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default SectionHeader;

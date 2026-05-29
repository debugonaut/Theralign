/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    // NOTE: Using `theme` (not `theme.extend`) for colors, borderRadius, and
    // boxShadow so that Tailwind defaults DO NOT leak into the system.
    // This enforces the design system contract — no team member can accidentally
    // use `rounded-lg`, `shadow-md`, or a non-Swiss color.

    colors: {
      // Base surfaces
      'swiss-white': '#FFFFFF',   // Primary background — pure canvas
      'swiss-black': '#0F0F0F',   // Primary text — not pure #000, one degree warmer
      'swiss-gray': {
        50:  '#FAFAFA',           // Lightest surface — barely off-white
        100: '#F2F2F2',           // Muted surface — card backgrounds, sidebar panels
        200: '#E5E5E5',           // Light border — internal table row separators only
        400: '#A3A3A3',           // Secondary text — labels, metadata, timestamps
        600: '#525252',           // Body text on gray surfaces
        900: '#171717',           // Near-black for high-contrast text on white
      },

      // Signal colors — used in EXACTLY the permitted contexts
      'swiss-red':   '#FF3000',   // CTAs, active nav, section prefixes, destructive actions
      'swiss-teal':  '#0D7377',   // Verified badges, confirmed status, paid status ONLY
      'swiss-amber': '#B45309',   // Pending state — dark amber, never bright yellow
      // Cancelled uses swiss-gray-400 — gray IS the cancelled signal

      // Utility — needed for Tailwind internals
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      black: '#000000',
    },

    borderRadius: {
      // Zero border radius except for avatar circles and status dots.
      // If you are tempted to use rounded-lg, use rounded-none instead.
      'none': '0px',     // Default — used everywhere
      'full': '9999px',  // Avatar initials and status dots ONLY
    },

    boxShadow: {
      // No drop shadows in this system. Zero.
      // Elevation is expressed through border contrast and background color shifts.
      // If you are adding a shadow, you are breaking the system.
      'none': 'none',
    },

    fontFamily: {
      swiss: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      // Inter only. No exceptions. No serif. No display fonts.
    },

    fontSize: {
      // UI track — interface elements, data, labels
      'ui-xs':  ['11px', { lineHeight: '16px', letterSpacing: '0.08em'  }],
      'ui-sm':  ['12px', { lineHeight: '18px', letterSpacing: '0.06em'  }],
      'ui-md':  ['14px', { lineHeight: '20px', letterSpacing: '0.01em'  }],
      'ui-lg':  ['16px', { lineHeight: '24px', letterSpacing: '0em'     }],
      'ui-xl':  ['18px', { lineHeight: '28px', letterSpacing: '-0.01em' }],

      // Display track — section headers, page titles, hero type
      'display-xs':  ['24px', { lineHeight: '28px',  letterSpacing: '-0.02em' }],
      'display-sm':  ['32px', { lineHeight: '36px',  letterSpacing: '-0.03em' }],
      'display-md':  ['48px', { lineHeight: '52px',  letterSpacing: '-0.04em' }],
      'display-lg':  ['64px', { lineHeight: '68px',  letterSpacing: '-0.04em' }],
      'display-xl':  ['80px', { lineHeight: '84px',  letterSpacing: '-0.05em' }],
      'display-2xl': ['96px', { lineHeight: '100px', letterSpacing: '-0.05em' }],
    },

    fontWeight: {
      regular: '400',
      medium:  '500',
      bold:    '700',
      black:   '900',
    },

    spacing: {
      // 8px base unit — every spacing value is a multiple
      '0':  '0px',
      '1':  '4px',    // Half-unit — for tight internal spacing only
      '2':  '8px',    // Base unit
      '3':  '12px',
      '4':  '16px',
      '5':  '20px',
      '6':  '24px',
      '8':  '32px',
      '10': '40px',
      '12': '48px',
      '16': '64px',
      '20': '80px',
      '24': '96px',
      '32': '128px',
      // Page-level horizontal padding
      'page-x': '64px',
      // Section vertical rhythm
      'section-y': '96px',
    },

    borderWidth: {
      DEFAULT: '2px',  // Standard structural border
      '0': '0px',
      '1': '1px',      // Internal table row separators only
      '2': '2px',      // Standard cards, inputs, sidebar
      '4': '4px',      // Section separators, active states, navbar ground line
    },

    maxWidth: {
      'page':    '1440px',  // Outer page container
      'content': '1280px',  // Content area within page
      'prose':   '680px',   // Long-form text columns
      'none': 'none',
      'full': '100%',
    },

    screens: {
      'sm':  '640px',
      'md':  '768px',
      'lg':  '1024px',
      'xl':  '1280px',
      '2xl': '1440px',
    },

    extend: {
      transitionDuration: {
        'fast':     '150ms',  // Button hovers, color changes
        'standard': '200ms',  // Card state changes, input focus
        // No durations above 200ms. No spring/bounce. No scroll animations.
      },
      transitionTimingFunction: {
        'swiss': 'cubic-bezier(0.4, 0, 0.2, 1)',
        // Use this for all transitions. No ease-in-bounce. No elastic.
      },
      keyframes: {
        'swiss-spin': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'swiss-slide-in': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
        'swiss-slide-out': {
          from: { transform: 'translateX(0)',    opacity: '1' },
          to:   { transform: 'translateX(100%)', opacity: '0' },
        },
        'swiss-pulse': {
          '0%, 100%': { opacity: '1'   },
          '50%':      { opacity: '0.5' },
        },
      },
      animation: {
        'swiss-spin':     'swiss-spin 0.6s linear infinite',
        'swiss-slide-in': 'swiss-slide-in 150ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'swiss-slide-out':'swiss-slide-out 150ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'swiss-pulse':    'swiss-pulse 1.2s ease-in-out infinite',
      },
      scale: {
        '98': '0.98',
      },
      zIndex: {
        '50': '50',
        '9999': '9999',
      },
      width: {
        '280': '280px',
        '240': '240px',
        '320': '320px',
      },
    },
  },
  plugins: [],
}

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
      // Primary — deep teal-navy. The dominant brand color.
      primary: {
        DEFAULT: '#00374e',   // Updated per DESIGN(1).md
        container: '#0b4f6c', // Added per DESIGN(1).md
        light:   '#E8F4F8',
        dark:    '#083A52',
      },

      // Secondary per DESIGN(1).md
      secondary: {
        DEFAULT: '#9d4223',
        container: '#fe8c66',
        'on-container': '#742406',
      },

      // Accent — warm coral. CTAs, highlights, active states.
      accent: {
        DEFAULT: '#F4845F',
        light:   '#FDF0EB',
        dark:    '#D96840',
      },

      // Neutral — the text and surface system
      neutral: {
        900: '#1C2B3A',   // Primary text — dark navy-black
        700: '#3D5166',   // Secondary headings
        500: '#6B7C93',   // Secondary text, metadata, timestamps
        300: '#A8B8C8',   // Placeholder text, disabled states
        200: '#DDE3EA',   // Borders — soft blue-gray
        100: '#F0F4F7',   // Muted surfaces — sidebar, table headers
        50:  '#F7F9FB',   // Page background
      },

      // Semantic — status signals
      success: '#0A7E6E',   // Verified, confirmed, paid — keep existing teal
      warning: '#B45309',   // Pending — keep existing amber
      danger:  '#C0392B',   // Destructive actions only — a considered red, not alarm red

      // Surface
      white: '#FFFFFF',     // Cards, panels, modals sit on this

      // DESIGN(1).md / code.html colors additions
      'accent-coral': '#F4845F',
      'surface-bright': '#f7f9ff',
      'surface-dim': '#c7dcf6',
      'surface-container-low': '#edf4ff',
      'surface-container': '#e3efff',
      'surface-container-high': '#d9eaff',
      'surface-container-highest': '#cfe5fe',
      'on-background': '#061d30',
      'on-surface': '#061d30',
      'on-surface-variant': '#41484d',
      'obsidian': '#061d30',
      'cloud': '#E8F4F8',
      'background': '#f7f9ff',
      'radical-red': '#0b4f6c',

      // Swiss Colors Addition from Accessibility Spec
      'swiss-surface': '#FFFFFF',
      'swiss-black': '#1A1A1A',
      'swiss-gray-100': '#F0F0ED',
      'swiss-red': '#E8341A',
      'swiss-teal': '#0A7E6E',

      // Semantic aliases for dark-mode readiness and system abstraction
      'text-primary': '#1C2B3A', // Maps to neutral.900 (swiss-black / dark navy)
      'text-secondary': '#6B7C93', // Maps to neutral.500
      'surface-bg': '#F7F9FB', // Maps to neutral.50 (warm page background)
      'surface-card': '#FFFFFF', // Maps to white (card surfaces)
      'border-default': '#DDE3EA', // Maps to neutral.200 (soft borders)
      'brand-teal': '#0A7E6E', // Maps to success (Theralign teal)
      'brand-coral': '#F4845F', // Maps to accent (Theralign coral)

      // Utility — needed for Tailwind internals
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000000',
    },

    borderRadius: {
      'none':  '0px',      // Structural elements
      'sm':    '4px',      // Badges, status chips, tags
      'md':    '6px',      // Buttons, inputs, textareas, toasts
      'lg':    '8px',      // Cards, panels
      'xl':    '12px',     // Modals, dropdowns, booking panel
      '2xl':   '16px',     // Large feature cards
      'full':  '9999px',   // Avatar circles and status dots only
    },

    boxShadow: {
      'none':  'none',
      'level-1': '0px 1px 3px rgba(11, 79, 108, 0.06), 0px 1px 2px rgba(11, 79, 108, 0.04)',
      'level-2': '0px 4px 16px rgba(11, 79, 108, 0.10), 0px 2px 6px rgba(11, 79, 108, 0.07)',
      'level-3': '0px 20px 60px rgba(11, 79, 108, 0.18), 0px 8px 24px rgba(11, 79, 108, 0.12)',
      'btn-primary': '0 2px 8px rgba(11, 79, 108, 0.25)',
      'btn-accent': '0 2px 8px rgba(244, 132, 95, 0.30)',
    },

    fontFamily: {
      swiss: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      // Inter only. No exceptions. No serif. No display fonts.
    },

    fontSize: {
      // UI track — interface elements, data, labels (scaled up by ~2px for superior readability)
      'ui-xs':  ['13px', { lineHeight: '18px', letterSpacing: '0.08em'  }],
      'ui-sm':  ['14px', { lineHeight: '20px', letterSpacing: '0.06em'  }],
      'ui-md':  ['16px', { lineHeight: '24px', letterSpacing: '0.01em'  }],
      'ui-lg':  ['18px', { lineHeight: '28px', letterSpacing: '0em'     }],
      'ui-xl':  ['20px', { lineHeight: '30px', letterSpacing: '-0.01em' }],

      // Display track — section headers, page titles, hero type
      'display-xs':  ['26px', { lineHeight: '30px',  letterSpacing: '-0.02em' }],
      'display-sm':  ['34px', { lineHeight: '38px',  letterSpacing: '-0.03em' }],
      'display-md':  ['48px', { lineHeight: '52px',  letterSpacing: '-0.04em' }],
      'display-lg':  ['64px', { lineHeight: '68px',  letterSpacing: '-0.04em' }],
      'display-xl':  ['80px', { lineHeight: '84px',  letterSpacing: '-0.05em' }],
      'display-2xl': ['96px', { lineHeight: '100px', letterSpacing: '-0.05em' }],
    },

    fontWeight: {
      regular:  '400',
      medium:   '500',
      semibold: '600',  // Required: used by font-semibold on all card titles, labels
      bold:     '700',
      black:    '900',
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
      '7':  '28px',
      '8':  '32px',
      '9':  '36px',
      '10': '40px',
      '11': '44px',
      '12': '48px',
      '14': '56px',
      '16': '64px',
      '20': '80px',
      '24': '96px',
      '28': '112px',
      '32': '128px',
      '36': '144px',
      '40': '160px',
      '48': '192px',
      '64': '256px',
      '80': '320px',
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

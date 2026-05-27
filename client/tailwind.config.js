/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary: Modern Blue-Teal — Theralign brand color
        primary: {
          DEFAULT: '#0EA5E9',  // Sky blue — clean SaaS primary
          dark: '#0284C7',     // Darker variant for hover states
        },
        // Secondary: Sleek dark navy for text and UI elements
        secondary: '#1E293B',

        // Surface: Soft background for page canvas and cards
        surface: '#F8FAFC',

        // Accent: Warm teal for highlights and secondary CTAs
        accent: '#0D9488',

        // Status Colors
        success: '#10B981',   // Emerald green — verified/confirmed
        warning: '#F59E0B',   // Amber — pending states
        danger:  '#EF4444',   // Red — rejected/cancelled
      },

      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      borderRadius: {
        card:   '12px',
        button: '8px',
      },

      boxShadow: {
        card:     '0 2px 12px rgba(0, 0, 0, 0.06)',
        elevated: '0 4px 24px rgba(0, 0, 0, 0.10)',
      },
    },
  },
  plugins: [],
}

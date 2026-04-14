/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Brand ──────────────────────────────────────────────────────────
        brand: {
          lime: '#d4e33b',
          teal: '#83d0d8',
          green: '#4ade80',
        },

        // ── Sidebar / Header shell ──────────────────────────────────────
        sidebar: {
          bg: '#1c2f39',
          'bg-hover': '#223843',
          'bg-active': '#223843',
          text: '#ffffff',
          'text-muted': 'rgba(255,255,255,0.6)',
          border: 'rgba(255,255,255,0.08)',
          'header-border': '#2d4857',
        },

        // ── Content area ───────────────────────────────────────────────
        canvas: '#f3f6f8',
        surface: '#ffffff',

        // ── Text ───────────────────────────────────────────────────────
        ink: {
          DEFAULT: '#243038',
          muted: '#6b7880',
          faint: '#9ca8b0',
        },

        // ── Border ─────────────────────────────────────────────────────
        line: {
          DEFAULT: '#e3e8eb',
          strong: '#d5dde1',
        },

        // ── Status badges ──────────────────────────────────────────────
        status: {
          'reviewing-bg': '#dcfce7',
          'reviewing-text': '#166534',
          'waiting-bg': '#dbeafe',
          'waiting-text': '#1d4ed8',
          'in-review-bg': '#fef3c7',
          'in-review-text': '#92400e',
          'pending-bg': '#ffedd5',
          'pending-text': '#9a3412',
          'approved-bg': '#d1fae5',
          'approved-text': '#065f46',
          'rejected-bg': '#fee2e2',
          'rejected-text': '#991b1b',
          'draft-bg': '#f1f5f9',
          'draft-text': '#475569',
        },

        // ── Accent ─────────────────────────────────────────────────────
        accent: {
          DEFAULT: '#1c2f39',
          hover: '#223843',
          light: '#e8edf0',
        },

        // ── Alerts ─────────────────────────────────────────────────────
        alert: '#ef6b63',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },

      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },

      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
        full: '9999px',
      },

      boxShadow: {
        xs: '0 1px 2px 0 rgba(0,0,0,0.04)',
        sm: '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
        DEFAULT: '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)',
        md: '0 4px 16px rgba(0,0,0,0.08)',
        lg: '0 8px 24px rgba(0,0,0,0.10)',
        xl: '0 20px 40px rgba(0,0,0,0.12)',
        nav: '0 8px 18px rgba(31,52,63,0.16)',
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      },

      spacing: {
        sidebar: '226px',
        header: '56px',
      },

      transitionDuration: {
        DEFAULT: '150ms',
        fast: '100ms',
        slow: '300ms',
      },
    },
  },
  plugins: [],
};

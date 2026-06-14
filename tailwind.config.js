/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces
        'surface-app':   '#1e1e1e',
        'surface-panel': '#0d0d0d',
        'surface-card':  '#1b1b1b',
        'surface-card2': '#232323',

        // Text
        't1': '#f6f6f6',
        't2': '#9a9a9a',
        't3': '#6b6b6b',

        // Accent — static default; JS overrides via --accent CSS var at runtime
        'accent':     '#ffde42',
        'accent-ink': '#1a1600',

        // Borders
        'line':   '#2a2a2a',
        'line-2': '#383838',

        // Identity / category colors
        'c-purple': '#8b5cf6',
        'c-orange': '#f97316',
        'c-teal':   '#14b8a6',
        'c-blue':   '#3b82f6',
        'c-pink':   '#ec4899',
        'c-green':  '#22c55e',
        'c-red':    '#ef4444',

        // shadcn/ui hsl-based tokens
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        input:  'hsl(var(--input))',
        ring:   'hsl(var(--ring))',
      },
      borderRadius: {
        sm:  '10px',
        DEFAULT: '14px',
        lg:  '20px',
        xl:  '24px',
      },
      fontFamily: {
        sans: ['Archivo', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        gut:     'var(--gut)',
        sidebar: 'var(--sidebar-w)',
      },
    },
  },
  plugins: [],
}

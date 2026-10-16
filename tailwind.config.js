/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        indigo: {
          300: 'rgb(var(--accent-primary-rgb) / <alpha-value>)',
          400: 'rgb(var(--accent-primary-rgb) / <alpha-value>)',
          500: 'rgb(var(--accent-primary-rgb) / <alpha-value>)',
          600: 'rgb(var(--accent-primary-strong-rgb) / <alpha-value>)',
        },
        cyan: {
          200: 'rgb(var(--accent-secondary-rgb) / <alpha-value>)',
          300: 'rgb(var(--accent-secondary-rgb) / <alpha-value>)',
          400: 'rgb(var(--accent-secondary-rgb) / <alpha-value>)',
          500: 'rgb(var(--accent-secondary-rgb) / <alpha-value>)',
        },
        surface: {
          50: 'var(--surface-50)',
          100: 'var(--surface-100)',
          200: 'var(--surface-200)',
          300: 'var(--surface-300)',
          400: 'var(--surface-400)',
          500: 'var(--surface-500)',
          600: 'var(--surface-600)',
          700: 'var(--surface-700)',
          800: 'var(--surface-800)',
          900: 'var(--surface-900)',
          950: 'var(--surface-950)',
        },
        accent: {
          cyan: '#22d3ee',
          violet: '#a78bfa',
          rose: '#fb7185',
          amber: '#fbbf24',
          emerald: '#34d399',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.06)',
          medium: 'rgba(255, 255, 255, 0.10)',
          heavy: 'rgba(255, 255, 255, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.4), 0 0 60px rgba(99, 102, 241, 0.1)' },
          '50%': { boxShadow: '0 0 30px rgba(99, 102, 241, 0.6), 0 0 80px rgba(99, 102, 241, 0.2)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.3)',
        'glow-violet': '0 0 20px rgba(167, 139, 250, 0.3)',
        'glow-rose': '0 0 20px rgba(251, 113, 133, 0.3)',
        'glow-amber': '0 0 20px rgba(251, 191, 36, 0.3)',
        'glow-emerald': '0 0 20px rgba(52, 211, 153, 0.3)',
      },
    },
  },
  plugins: [],
};

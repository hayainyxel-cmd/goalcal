/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f7f6f3',
          100: '#eeece6',
          200: '#ddd9ce',
          300: '#c8c3b3',
          400: '#a99e8a',
          500: '#8a7e69',
          600: '#6e6351',
          700: '#544c3e',
          800: '#3a3530',
          900: '#1e1c19',
          950: '#0f0e0c',
        },
        sage: {
          400: '#7fa882',
          500: '#5d8f62',
          600: '#4a7250',
        },
        amber: {
          400: '#e8b84b',
          500: '#d4a035',
        },
        rose: {
          400: '#d4756b',
          500: '#bc5c52',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#0B0F19',
          card: '#121826',
          cardAlt: '#182033',
          border: 'rgba(148, 163, 184, 0.2)',
          muted: '#0F1628',
        },
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
      },
      boxShadow: {
        soft: '0 16px 42px rgba(0, 0, 0, 0.38)',
        glow: '0 0 0 1px rgba(255, 255, 255, 0.06), 0 14px 40px rgba(59, 130, 246, 0.14)',
        lift: '0 20px 52px rgba(0, 0, 0, 0.45)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.25)', opacity: '0.65' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        pulseSoft: 'pulseSoft 1.6s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};

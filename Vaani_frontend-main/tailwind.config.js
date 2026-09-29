/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vaani: {
          bg: '#050B10',
          dark: '#081218',
          card: '#0a1622',
          surface: '#0d1d2b',
          border: 'rgba(255, 255, 255, 0.08)',
          borderTeal: 'rgba(0, 214, 199, 0.25)',
          teal: '#00D6C7',
          cyan: '#16D8D0',
          green: '#43E0B0',
          amber: '#F59E0B',
          red: '#EF4444',
          muted: '#94A3B8',
          text: '#F8FAFC'
        },
        asha: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        health: {
          teal: '#00D6C7',
          darkTeal: '#0f766e',
          cyan: '#16D8D0',
          amber: '#f59e0b',
          rose: '#ef4444',
          indigo: '#6366f1',
        }
      },
      boxShadow: {
        'glow-teal': '0 0 24px rgba(0, 214, 199, 0.25)',
        'glow-teal-lg': '0 0 40px rgba(0, 214, 199, 0.35)',
        'glow-green': '0 0 20px rgba(67, 224, 176, 0.25)',
        'card-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 1.5s cubic-bezier(0, 0.2, 0.8, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(0, 214, 199, 0.2)' },
          '100%': { boxShadow: '0 0 28px rgba(0, 214, 199, 0.55)' }
        }
      }
    },
  },
  plugins: [],
}

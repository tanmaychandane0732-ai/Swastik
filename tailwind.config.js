/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fin: {
          bg: '#0F172A',         // Canvas Slate
          surface: '#1E293B',    // Card Slate
          surfaceLight: '#334155',
          emerald: '#059669',    // Wealth Accent
          emeraldGlow: '#10B981',
          indigo: '#4F46E5',     // Brand UI Glow
          indigoLight: '#6366F1',
          amber: '#F59E0B',      // Warning
          rose: '#EF4444',       // Danger / Scam
          cyan: '#06B6D4',       // Secondary Tech Accent
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-emerald': '0 0 20px -2px rgba(16, 185, 129, 0.35)',
        'neon-indigo': '0 0 25px -2px rgba(99, 102, 241, 0.4)',
        'neon-rose': '0 0 25px -2px rgba(239, 68, 68, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backdropBlur: {
        xs: '2px',
        glass: '12px',
      }
    },
  },
  plugins: [],
}


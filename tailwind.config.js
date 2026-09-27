/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Body/UI: Inter — clean, neutral, premium
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        // Headings: Plus Jakarta Sans — bold, distinctive, premium display
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        // Monospace: JetBrains Mono — numeric labels, telemetry only
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Signature Orange / Black / White Industrial Theme
        brand: {
          orange: '#FF5E1E',
          orangeHover: '#E04E15',
          orangeLight: '#FFF3ED',
          orangeGlow: 'rgba(255, 94, 30, 0.4)',
          // Dark Obsidian & Carbon Surfaces
          darkCanvas: '#0A0A0C',
          darkCard: '#121215',
          darkPanel: '#18181D',
          darkHover: '#1F2025',
          darkBorder: '#27272A',
          // Light Studio White Surfaces
          lightCanvas: '#F8F9FA',
          lightCard: '#FFFFFF',
          lightPanel: '#F0F2F5',
          lightHover: '#E5E7EB',
          lightBorder: '#E4E7EC',
          // Text
          textDark: '#0A0A0C',
          textMuted: '#71717A',
          textLight: '#F4F4F5',
        },
        // Discord & Fin Compatibility Tokens
        discord: {
          blurple: '#FF5E1E',        // Themed to vibrant orange
          blurpleHover: '#E04E15',
          green: '#22C55E',
          yellow: '#F59E0B',
          red: '#EF4444',
          darkCanvas: '#0A0A0C',
          darkCard: '#121215',
          darkPanel: '#18181D',
          darkHover: '#1F2025',
          darkBorder: '#27272A',
          lightCanvas: '#F8F9FA',
          lightCard: '#FFFFFF',
          lightPanel: '#F0F2F5',
          lightHover: '#E5E7EB',
          lightBorder: '#E4E7EC',
        },
        fin: {
          bg: '#0A0A0C',
          surface: '#121215',
          surfaceLight: '#18181D',
          emerald: '#22C55E',
          emeraldGlow: '#4ADE80',
          indigo: '#FF5E1E',
          indigoLight: '#FF7A45',
          amber: '#F59E0B',
          rose: '#EF4444',
          cyan: '#38BDF8',
          orange: '#FF5E1E',
        }
      },
      boxShadow: {
        'brand-orange': '0 0 25px -4px rgba(255, 94, 30, 0.5)',
        'brand-dark': '0 8px 24px -4px rgba(0, 0, 0, 0.5)',
        'brand-light': '0 4px 16px -2px rgba(0, 0, 0, 0.05)',
        'discord': '0 8px 24px -4px rgba(0, 0, 0, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        'neon-emerald': '0 0 20px -2px rgba(34, 197, 94, 0.4)',
        'neon-indigo': '0 0 25px -2px rgba(255, 94, 30, 0.45)',
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

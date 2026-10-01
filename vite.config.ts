import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-framer';
          }
          if (
            id.includes('node_modules/lenis') ||
            id.includes('node_modules/howler') ||
            id.includes('node_modules/canvas-confetti')
          ) {
            return 'vendor-utils';
          }
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['backend/**', 'node_modules/**', 'dist/**'],
  },
})


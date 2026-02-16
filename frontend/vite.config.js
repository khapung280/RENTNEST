import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Explicit base for correct asset paths on Vercel (root deployment)
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Ensure CSS is processed and emitted so Tailwind output is included
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
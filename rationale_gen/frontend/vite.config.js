import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://api.vikashbagaria.com',
        changeOrigin: true
      }
    }
  },
  base: '/',
  build: {
    outDir: '../public',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React and React DOM into a separate chunk
          'react-vendor': ['react', 'react-dom'],
          // Split xlsx library into its own chunk
          'xlsx': ['xlsx'],
          // Split jsPDF library into its own chunk
          'jspdf': ['jspdf'],
          // Split react-icons into its own chunk
          'react-icons': ['react-icons/fi']
        }
      }
    },
    // Increase chunk size warning limit to 1000 kB (optional, but manual chunks should fix it)
    chunkSizeWarningLimit: 1000
  }
})


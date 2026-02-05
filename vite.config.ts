import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  // Empty base path for Capacitor hybrid app
  base: '',
  build: {
    // Ensure assets are loaded correctly in Capacitor
    outDir: 'dist',
    assetsDir: 'assets',
    // Generate sourcemaps for debugging
    sourcemap: true
  }
})

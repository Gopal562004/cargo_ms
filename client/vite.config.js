import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  // Use relative base './' for Electron desktop builds, '/' for web (Vercel)
  base: process.env.VITE_APP_ENV === 'electron' || process.env.ELECTRON_BUILD === 'true' ? './' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});

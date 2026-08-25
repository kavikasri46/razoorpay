import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Redirect vite dependency cache to D: drive to avoid disk space issues on C:
  cacheDir: 'D:\\.vite-cache\\laserpay',
  server: {
    port: 5173,
    host: true,
  },
});

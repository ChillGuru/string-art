import path from 'path';

import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), legacy()],
  build: { sourcemap: true },
  resolve: {
    alias: {
      styles: path.resolve(__dirname, '../../packages/ui/styles'),
      '@': path.resolve(__dirname, './src'),
    },
    // preserveSymlinks: true,
  },
  define: {
    global: {},
    process: { env: {} },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'lz-string': path.resolve(__dirname, 'node_modules/lz-string/libs/lz-string.js'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});

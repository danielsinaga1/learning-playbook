import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`        → dist/ biasa (untuk hosting)
// `npm run build:single` → satu file HTML yang bisa langsung dibuka di Chrome (double-click)
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  build: mode === 'single' ? { outDir: 'dist-single', chunkSizeWarningLimit: 4000 } : { chunkSizeWarningLimit: 4000 },
}));

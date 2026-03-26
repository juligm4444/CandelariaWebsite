import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ViteImagemin from 'vite-plugin-imagemin';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imageminPlugin = typeof ViteImagemin === 'function' ? ViteImagemin : ViteImagemin?.default;

export default defineConfig({
  plugins: [
    react(),
    imageminPlugin?.({
      gifsicle: { optimizationLevel: 7, interlaced: false },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 85 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: { plugins: [{ removeViewBox: false }] },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

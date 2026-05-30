import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, 'playground'),
  resolve: {
    alias: {
      'expub-tool/smil': resolve(__dirname, 'dist/esm/smil/index.mjs'),
      'expub-tool/behaviors': resolve(__dirname, 'dist/esm/behaviors/index.mjs'),
      'expub-tool/html': resolve(__dirname, 'dist/esm/html/index.mjs'),
      'expub-tool/css': resolve(__dirname, 'dist/esm/css/index.mjs'),
      'expub-tool/utils': resolve(__dirname, 'dist/esm/utils/index.mjs'),
    },
  },
  build: {
    outDir: resolve(__dirname, 'dist-playground'),
    sourcemap: true,
  },
})

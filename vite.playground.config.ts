import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, 'playground'),
  resolve: {
    alias: {
      'expub-tool/svg': resolve(__dirname, 'dist/esm/svg/index.mjs'),
      'expub-tool/smil': resolve(__dirname, 'dist/esm/smil/index.mjs'),
      'expub-tool/behaviors': resolve(__dirname, 'dist/esm/behaviors/index.mjs'),
      'expub-tool/html': resolve(__dirname, 'dist/esm/html/index.mjs'),
      'expub-tool/css': resolve(__dirname, 'dist/esm/css/index.mjs'),
      'expub-tool/utils': resolve(__dirname, 'dist/esm/utils/index.mjs'),
      'expub-tool/bake-svg': resolve(__dirname, 'dist/esm/bake-svg/index.mjs'),
    },
  },

  // Satori 内部用了 process.env(6 处),浏览器环境没有 process 全局变量。
  // 这里把 process.env 替换为 {} 让它在浏览器跑通(只影响 satori 内部,不影响业务代码)。
  define: {
    'process.env': '{}',
  },
  build: {
    outDir: resolve(__dirname, 'dist-playground'),
    sourcemap: true,
  },
})

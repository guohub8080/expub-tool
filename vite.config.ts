import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@html': resolve(__dirname, 'src/html'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@common': resolve(__dirname, 'src/common'),
      '@css': resolve(__dirname, 'src/css'),
      '@svg': resolve(__dirname, 'src/svg'),
      '@bezier': resolve(__dirname, 'src/bezier'),
      '@colors': resolve(__dirname, 'src/common/colors'),
      '@css-fn': resolve(__dirname, 'src/css/cssFunctions'),
      '@css-presets': resolve(__dirname, 'src/css/cssPresets'),
      '@pub-svg': resolve(__dirname, 'src/svg/presets'),
      '@svg-anim': resolve(__dirname, 'src/svg/genSvgAnimate'),
    },
  },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'bezier/index': resolve(__dirname, 'src/bezier/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'lodash', /^lodash\//],
      output: [
        {
          format: 'es',
          dir: 'dist/esm',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].mjs',
        },
        {
          format: 'cjs',
          dir: 'dist/cjs',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].cjs',
        },
      ],
    },
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true,
  },
})

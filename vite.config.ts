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
        bezier: resolve(__dirname, 'src/bezier/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext: Record<string, string> = { es: 'mjs', cjs: 'cjs' }
        return `${entryName}.${ext[format]}`
      },
      name: 'ExpubTool',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
    sourcemap: true,
  },
})

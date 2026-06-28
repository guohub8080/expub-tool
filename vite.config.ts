import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@utils': resolve(__dirname, 'src/utils'),
      '@smil': resolve(__dirname, 'src/smil'),
      '@html': resolve(__dirname, 'src/html'),
      '@css': resolve(__dirname, 'src/css'),
      '@css-fn': resolve(__dirname, 'src/css/cssFunctions'),
      '@css-presets': resolve(__dirname, 'src/css/cssPresets'),
      // '@svg-comps': resolve(__dirname, 'src/svg-comps'),  // 旧目录，待删除
      '@behaviors': resolve(__dirname, 'src/behaviors'),
      '@svg': resolve(__dirname, 'src/svg'),
    },
  },
  build: {
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.ts'),
        'smil/index': resolve(__dirname, 'src/smil/index.ts'),
        'behaviors/index': resolve(__dirname, 'src/behaviors/index.ts'),
        'css/index': resolve(__dirname, 'src/css/index.ts'),
        'utils/index': resolve(__dirname, 'src/utils/index.ts'),
        'html/index': resolve(__dirname, 'src/html/index.ts'),
        'svg/index': resolve(__dirname, 'src/svg/index.ts'),
        'bake-svg/index': resolve(__dirname, 'src/bake-svg/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'lodash', /^lodash\//,
        // bake-svg 的依赖:external(不打包,运行时从 node_modules 解析)
        'harfbuzzjs', 'gradient-parser', 'transformation-matrix', 'uid'],
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

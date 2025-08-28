import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import laravel from 'laravel-vite-plugin'
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import istanbul from 'vite-plugin-istanbul'

export default defineConfig({
  plugins: [
    vue(),
    laravel({
      input: [
        'resources/assets/js/app.ts',
        'resources/assets/js/remote/app.ts',
      ],
      refresh: true,
    }),

    istanbul({
      include: [
        'resources/assets/js/**/*', // đúng thư mục chứa Vue/TS
      ],
      exclude: [
        'node_modules',
        'cypress',
      ],
      extension: ['.js', '.ts', '.vue'],
      cypress: true,
      requireEnv: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './resources/assets/js'),
      '@modules': path.resolve(__dirname, './node_modules'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: path.resolve(__dirname, './resources/assets/js/__tests__/setup.ts'),
  },
})

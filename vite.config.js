import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(fileURLToPath(new URL('.', import.meta.url)), './src')
    }
  },
  server: {
    port: 3000,
    open: true, // 自动打开浏览器
    proxy: {
      // 代理 /api 请求到后端 Spring Boot 服务（开发环境）
      '/api': {
        target: 'http://localhost:7777',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@element-plus/icons-vue')) {
            return 'vendor-element-icons'
          }

          if (id.includes('node_modules/element-plus')) {
            return 'vendor-element-plus'
          }

          if (id.includes('node_modules/vue') || id.includes('node_modules/pinia') || id.includes('node_modules/vue-router')) {
            return 'vendor-vue'
          }

          if (id.includes('node_modules/axios')) {
            return 'vendor-axios'
          }

          if (id.includes('/src/data/') || id.includes('/src/composables/')) {
            return 'portal'
          }
        }
      }
    }
  }
})

import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // Backend API proxy (development)
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        timeout: 3000,
        configure: (proxy) => {
          proxy.on('error', () => {});
        },
      },
    },
  },

  // Multi-page app: Mini App (/) va Web Platform (/web)
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        web:  path.resolve(__dirname, 'web.html'),
      },
    },
  },

  // Production build'dan barcha console.* va debugger chiqarib tashlash.
  // Dev rejimida ('vite dev') bu qoidalar ISHLAMAYDI — debug normal ishlaydi.
  esbuild: {
    drop: command === 'build' ? ['console', 'debugger'] : [],
  },
}))

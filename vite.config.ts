import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command }) => ({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'MedSmart-Pro',
        short_name: 'MedSmart',
        description: "O'zbekiston tibbiy ma'lumotlar platformasi",
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Cache strategies
        runtimeCaching: [
          {
            // API responses cache
            urlPattern: /^https?:\/\/.*\/api\/v1\/diseases/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'diseases-api',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 1 kun
              },
            },
          },
          {
            // Static assets
            urlPattern: /\.(js|css|woff2?|png|svg|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 kun
              },
            },
          },
        ],
        // App shell offline
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
      },
      devOptions: {
        enabled: false, // dev da SW ni o'chirib qo'y
      },
    }),
  ],
  resolve: {
    alias: [
      // Alias @ to the src directory
      { find: '@', replacement: path.resolve(__dirname, './src') },

      // ── HIGH-8: Mock data tree-shake ──────────────────────────────────────
      // Production build'da:
      //   1. core-switch.mock → core-switch.prod  (mock services → API services)
      //   2. /data/mockData   → mockData.prod      (858 sat mock ma'lumot → bo'sh stub)
      // Natijada mockData.ts production bundle'ga KIRMAYDI.
      // Dev rejimida ('vite dev') bu aliaslar ISHLAMAYDI — mock ma'lumotlar saqlanadi.
      ...(command === 'build' ? [
        // Regex BUTUN import specifier ni match qiladi (^ dan $ gacha) —
        // aks holda faqat oxirgi qismi replace bo'lib, prefix (../../..)
        // qolib ketadi va Windows yo'llarida broken path beradi.
        {
          find: /^(\.{1,2}\/)+(services\/)?core-switch\.mock$/,
          replacement: path.resolve(__dirname, 'src/services/core-switch.prod.ts'),
        },
        {
          find: /^(\.{1,2}\/)+.*data\/mockData$/,
          replacement: path.resolve(__dirname, 'src/app/data/mockData.prod.ts'),
        },
      ] : []),
    ],
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

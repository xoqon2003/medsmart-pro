import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// ═══════════════════════════════════════════════════════════════════════════
// Phase 2.1 — apps/web/ skeleton vite config
// ═══════════════════════════════════════════════════════════════════════════
// Hozirgi holat: src/ hali monorepo root'da (../../src/). Vite'ning `root`
// option'i projectRoot (../..) ga yo'naltirilgan — shu tufayli fayllarni
// ko'chirmasdan `pnpm --filter @medsmart/web dev` ishlaydi.
//
// Phase 2.2 da src/ → apps/web/src/ ko'chadi va:
//   - `root: projectRoot` olib tashlanadi (default apps/web/ bo'ladi)
//   - alias `@` to `./src` ga o'zgaradi
//   - rollup input `web.html` → `index.html`
//   - root'dagi vite.config.ts / web.html / index.html / src/ o'chiriladi
// ═══════════════════════════════════════════════════════════════════════════

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../..')

export default defineConfig(({ command }) => ({
  root: projectRoot,

  plugins: [
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
          { src: 'vite.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'vite.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/v1\/diseases/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'diseases-api',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: /\.(js|css|woff2?|png|svg|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
      },
      devOptions: { enabled: false },
    }),
  ],

  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(projectRoot, 'src') },
      ...(command === 'build'
        ? [
            // Production: mock services → prod stubs (tree-shake)
            {
              find: /^(\.{1,2}\/)+(services\/)?core-switch\.mock$/,
              replacement: path.resolve(projectRoot, 'src/services/core-switch.prod.ts'),
            },
            {
              find: /^(\.{1,2}\/)+.*data\/mockData$/,
              replacement: path.resolve(projectRoot, 'src/app/data/mockData.prod.ts'),
            },
          ]
        : []),
    ],
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],

  // Backend API proxy (dev)
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        timeout: 3000,
        configure: (proxy) => {
          proxy.on('error', () => {})
        },
      },
    },
  },

  // Web-only: faqat web.html. Mini-app (index.html) — boshqa surface
  // (apps/telegram-miniapp/ yoki root'ning mini-app entry'si).
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        web: path.resolve(projectRoot, 'web.html'),
      },
    },
  },

  // Production: console.* va debugger ni bundle'dan olib tashlaydi.
  esbuild: {
    drop: command === 'build' ? ['console', 'debugger'] : [],
  },
}))

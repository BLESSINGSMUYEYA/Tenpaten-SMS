import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Keep the service worker alive and up-to-date automatically
      devOptions: {
        enabled: true, // Enable SW in dev so you can test offline mode
        type: 'module',
      },
      manifest: {
        name: 'Tenpaten School Management',
        short_name: 'Tenpaten',
        description: 'Smart attendance, grades & communication for schools',
        theme_color: '#4f46e5',
        background_color: '#0f0f1a',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Cache the app shell (JS, CSS, HTML, SVG, fonts)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Runtime caching strategies
        runtimeCaching: [
          // ── Attendance mark (POST) — Background Sync fallback ────────────
          {
            urlPattern: /\/api\/attendance\/mark/,
            handler: 'NetworkOnly',
            method: 'POST',
            options: {
              backgroundSync: {
                name: 'attendance-mark-queue',
                options: {
                  maxRetentionTime: 7 * 24 * 60, // 7 days (minutes)
                },
              },
            },
          },
          // ── Classes & Terms — Network-first, fall back to cache ──────────
          {
            urlPattern: /\/api\/schools\/(classes|terms)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'tenpaten-api-reference',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
              networkTimeoutSeconds: 5,
            },
          },
          // ── Students list — Network-first, fall back to cache ────────────
          {
            urlPattern: /\/api\/people\/students/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'tenpaten-api-students',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 24 * 60 * 60, // 1 day
              },
              networkTimeoutSeconds: 5,
            },
          },
          // ── General API GET — Network-first, short TTL ───────────────────
          {
            urlPattern: /\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'tenpaten-api-general',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
    }),
  ],
  envDir: '../../',
  resolve: {
    alias: {
      '@tenpaten/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor: React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          // Vendor: React Router
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }
          // Vendor: Charts (recharts, d3, etc.)
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) {
            return 'vendor-charts';
          }
          // Vendor: Everything else in node_modules
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }

          // App: Auth pages
          if (id.includes('/pages/auth/')) {
            return 'pages-auth';
          }
          // App: Head Teacher pages
          if (id.includes('/pages/HeadTeacher')) {
            return 'pages-head-teacher';
          }
          // App: Teacher pages
          if (id.includes('/pages/Teacher')) {
            return 'pages-teacher';
          }
          // App: Deputy Head pages
          if (id.includes('/pages/DeputyHead')) {
            return 'pages-deputy-head';
          }
          // App: Super Admin pages
          if (id.includes('/pages/SuperAdmin')) {
            return 'pages-super-admin';
          }
          // App: Remaining pages (Bursar, Student, Parent, Landing)
          if (id.includes('/pages/')) {
            return 'pages-other';
          }
        },
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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

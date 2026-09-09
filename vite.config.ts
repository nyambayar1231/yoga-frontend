import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Proxying keeps the browser on one origin, so the httpOnly auth cookie
      // is stored and replayed without the backend needing CORS.
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
        // hono/csrf rejects form-encoded posts whose Origin does not match the
        // backend's host, which would break multipart uploads later. Vite
        // forwards its own origin by default, so present the backend's instead.
        headers: { Origin: BACKEND_URL },
      },
    },
  },
})

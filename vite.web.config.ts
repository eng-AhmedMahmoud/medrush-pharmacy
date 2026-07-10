import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Browser-only preview of the renderer (no Electron). The UI already degrades
// gracefully when `window.api` is absent (see src/renderer/src/api/desktop.ts),
// so this serves the exact same React app for quick web demos / screenshots.
// Not used for the packaged desktop build — that goes through electron.vite.config.ts.
export default defineConfig({
  root: resolve(__dirname, 'src/renderer'),
  resolve: {
    alias: { '@': resolve(__dirname, 'src/renderer/src') }
  },
  plugins: [
    react(),
    {
      // The strict production CSP blocks React Fast Refresh's inline preamble
      // in dev; drop the meta tag for the web preview only.
      name: 'strip-csp-dev',
      transformIndexHtml(html: string): string {
        return html.replace(
          /<meta[^>]*http-equiv="Content-Security-Policy"[^>]*>/,
          ''
        )
      }
    }
  ],
  server: {
    port: Number(process.env.PORT) || 5173,
    host: true
  }
})

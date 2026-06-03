import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages project site: VITE_BASE_PATH=/repo-name/
// User site (username.github.io): VITE_BASE_PATH=/
const base = process.env.VITE_BASE_PATH || '/'

function apiPreconnectPlugin(): Plugin {
  return {
    name: 'api-preconnect',
    transformIndexHtml(html) {
      const api = process.env.VITE_API_URL
      if (!api) return html
      try {
        const origin = new URL(api).origin
        return html.replace(
          '</head>',
          `    <link rel="preconnect" href="${origin}" crossorigin />\n    <link rel="dns-prefetch" href="${origin}" />\n  </head>`,
        )
      } catch {
        return html
      }
    },
  }
}

export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), apiPreconnectPlugin()],
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/three') ||
            id.includes('node_modules/@react-three') ||
            id.includes('three/addons')
          ) {
            return 'three-vendor'
          }
        },
      },
    },
  },
})

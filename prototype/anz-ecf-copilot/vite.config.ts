import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig(({ mode }) => ({
  // 'share' mode produces a portable, single-file build that opens via file:// (no
  // server) — see npm run build:share. Chrome blocks type="module" script fetches
  // over file://, so singlefile inlines everything into one HTML file. Normal
  // dev/build is untouched (base defaults to '/', singlefile plugin not applied).
  base: mode === 'share' ? './' : '/',
  plugins: [
    tailwindcss(),
    react(),
    ...(mode === 'share' ? [viteSingleFile()] : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))

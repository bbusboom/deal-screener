import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// Two pages: the website (index.html) and the Underwriting Desk phone app (learn.html, served at /learn).
export default defineConfig({
  plugins: [react()],
  build: { rollupOptions: { input: { main: resolve(__dirname, 'index.html'), learn: resolve(__dirname, 'learn.html') } } },
})

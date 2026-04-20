import { defineConfig } from 'vite'

export default defineConfig({
  // base './' makes all asset paths relative — required for Electron to load built files from disk
  base: './',
  build: {
    outDir: 'dist',
  },
  esbuild: {
    jsx: 'automatic',
  },
})

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  build: { outDir: 'dist/client' },
  server: { host: '127.0.0.1' },
  // Bundle the router into the SSR build: Vercel's file tracing misses the
  // conditional react-router/dist/development files and the function crashes.
  // Build only — the dev server can't inline react-router-dom's CommonJS.
  ssr: command === 'build' ? { noExternal: [/^react-router/] } : undefined,
}));

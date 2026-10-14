import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist/client' },
  // Bundle the router into the SSR build: Vercel's file tracing misses the
  // conditional react-router/dist/development files and the function crashes.
  ssr: { noExternal: [/^react-router/] },
  server: { host: '127.0.0.1' },
});

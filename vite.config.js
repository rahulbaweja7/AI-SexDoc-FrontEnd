import { defineConfig } from 'vite';

// Enable production source maps for easier debugging of dist bundles
export default defineConfig({
  build: {
    sourcemap: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});



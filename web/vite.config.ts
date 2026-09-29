import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    port: 5180,
    strictPort: true,
    proxy: { '/api': 'http://127.0.0.1:8787' },
  },
});

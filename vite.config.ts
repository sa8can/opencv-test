import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app.js`,
      },
    },
  },
  server: {
    port: 3000,
    watch: {
      usePolling: true,
    },
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    },
  },
});

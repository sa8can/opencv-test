import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig({
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

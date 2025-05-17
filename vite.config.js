import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  base: '/tic-tac-toe/',
  server: {
    port: 5173,
    https: process.env.NODE_ENV === 'development' ? {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem')
    } : undefined
  }
});
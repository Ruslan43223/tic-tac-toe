import { defineConfig } from 'vite';
   import fs from 'fs';

   export default defineConfig({
     base: '/tic-tac-toe/', // Замени на имя твоего репозитория, например, '/tic-tac-toe/'
     server: {
       port: 5173,
       https: process.env.NODE_ENV === 'development' ? {
         key: fs.readFileSync('./localhost-key.pem'),
         cert: fs.readFileSync('./localhost.pem')
       } : undefined
     }
   });
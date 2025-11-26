import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // CRÍTICO: Esto permite que si llamaste a tu variable solo "API_KEY" en Vercel,
  // Vite la exponga al código del navegador. Por defecto solo expone las que empiezan por VITE_.
  envPrefix: ['VITE_', 'API_KEY'],
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga todas las variables de entorno
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // ESTO ES CRÍTICO: Toma la variable del sistema (Vercel) y la "pega" en el código
      // Si env.API_KEY no existe, intentará usar una cadena vacía para no romper el build
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});

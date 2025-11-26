import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno para uso local
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // No necesitamos 'define' complejo si usamos el prefijo VITE_ en la variable
    // Vercel detectará automáticamente VITE_API_KEY
  };
});

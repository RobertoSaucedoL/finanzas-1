import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno desde el archivo .env o desde el sistema (Vercel)
  // el tercer parámetro '' le dice a Vite que cargue TODAS las variables, no solo las que empiezan por VITE_
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Esto inyecta tu clave API de manera segura en el código del navegador
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});
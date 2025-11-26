import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Vite expone automáticamente las variables que empiezan con VITE_
  // No necesitamos configuración extra compleja.
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuración de Vite para React + TS
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Configuración crítica para SPA: redirige todas las rutas a index.html
    historyApiFallback: true,
  },
  preview: {
    port: 3000,
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    // Configuración correcta para SPA fallback en Vite
    // Redirige todas las rutas 404 a index.html
    proxy: {},
  },
  preview: {
    port: 3000,
  },
  // Esta es la configuración clave para SPA
  appType: 'spa',
});

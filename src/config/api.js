import axios from 'axios';

// Soportar tanto Vite (import.meta.env) como Jest (global.importMetaEnv)
const getApiUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_URL || 'http://localhost:8000';
  }
  if (typeof global !== 'undefined' && global.importMetaEnv) {
    return global.importMetaEnv.VITE_API_URL || 'http://localhost:8000';
  }
  return 'http://localhost:8000';
};

const API_URL = getApiUrl();

// Normalizar la URL: si la variable viene sin protocolo, añadimos https://
const NORMALIZED_API_URL = (() => {
  let url = API_URL;
  if (typeof url === 'string' && url.length > 0 && !/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
})();

// Logs de depuración para verificar qué valor llega desde Vercel/Vite
/* eslint-disable no-console */
console.info('[config/api] API_URL raw:', API_URL);
console.info('[config/api] API_URL normalized:', NORMALIZED_API_URL);
console.info('[config/api] import.meta.env.VITE_API_URL:', import.meta?.env?.VITE_API_URL);
// console.info('[config/api] global.importMetaEnv.VITE_API_URL:', global?.importMetaEnv?.VITE_API_URL);
/* eslint-enable no-console */

const api = axios.create({
  baseURL: NORMALIZED_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Asegurar que las peticiones incluyan credenciales si es necesario
  withCredentials: false,
});

// Interceptor de petición para depuración: mostrar la URL final que se enviará
api.interceptors.request.use((config) => {
  try {
    const base = config.baseURL || '';
    const url = config.url || '';
    // Intentamos construir la URL absoluta para inspección
    const final = new URL(url, base).href;
    console.info('[config/api] axios request ->', { base, url, final });
  } catch (e) {
    console.warn('[config/api] axios request - no se pudo construir URL:', e);
  }
  return config;
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log de errores para debugging
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url
      });
    }
    return Promise.reject(error);
  }
);

export default api;
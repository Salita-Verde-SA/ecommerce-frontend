import axios from 'axios';

// Función para obtener la URL de la API compatible con Vite (import.meta.env) y Jest (global.importMetaEnv)
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

// Normalización de URL: se añade protocolo https:// si no está presente
const NORMALIZED_API_URL = (() => {
  let url = API_URL;
  if (typeof url === 'string' && url.length > 0 && !/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
})();

// Registros de depuración para verificación de valores en entornos Vercel/Vite
// Estos comentarios se mantienen desactivados por defecto
// console.info('[config/api] API_URL raw:', API_URL);
// console.info('[config/api] API_URL normalized:', NORMALIZED_API_URL);
// console.info('[config/api] import.meta.env.VITE_API_URL:', import.meta?.env?.VITE_API_URL);
// console.info('[config/api] global.importMetaEnv.VITE_API_URL:', global?.importMetaEnv?.VITE_API_URL);

const api = axios.create({
  baseURL: NORMALIZED_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Configuración de credenciales para peticiones cross-origin
  withCredentials: false,
});

// Interceptor de petición para depuración (desactivado por defecto)
// Permite visualizar la URL final antes del envío
// api.interceptors.request.use((config) => {
//   try {
//     const base = config.baseURL || '';
//     const url = config.url || '';
//     const final = new URL(url, base).href;
//     console.info('[config/api] axios request ->', { base, url, final });
//   } catch (e) {
//     console.warn('[config/api] Error al construir URL:', e);
//   }
//   return config;
// });

// Interceptor de respuesta para depuración (desactivado por defecto)
// Registra respuestas exitosas y errores con información detallada
// api.interceptors.response.use(
//   (response) => {
//     console.info('[config/api] Respuesta exitosa:', {
//       status: response.status,
//       url: response.config.url,
//       dataLength: Array.isArray(response.data) ? response.data.length : 'N/A'
//     });
//     return response;
//   },
//   (error) => {
//     console.error('[config/api] Error de petición:', {
//       message: error.message,
//       status: error.response?.status,
//       data: error.response?.data,
//       url: error.config?.url,
//       baseURL: error.config?.baseURL,
//       isNetworkError: !error.response && error.request,
//       isCorsError: error.message?.includes('Network Error') || error.message?.includes('CORS')
//     });
//     return Promise.reject(error);
//   }
// );

export default api;
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

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Asegurar que las peticiones incluyan credenciales si es necesario
  withCredentials: false,
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
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar Token JWT automáticamente
api.interceptors.request.use(
  (config) => {
    // No agregar token para rutas de autenticación
    const publicRoutes = ['/token', '/clients'];
    const isPublicRoute = publicRoutes.some(route => 
      config.url === route || (config.url === '/clients' && config.method === 'post')
    );
    
    if (!isPublicRoute) {
      try {
        const authStorage = localStorage.getItem('techstore-auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          const token = parsed?.state?.token;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch (e) {
        console.error('Error reading auth token:', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de respuesta (401, etc.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo redirigir a login si es 401 y no estamos ya en una ruta de auth
    if (error.response?.status === 401) {
      const isAuthRoute = error.config?.url === '/token';
      if (!isAuthRoute) {
        localStorage.removeItem('techstore-auth-storage');
        // Solo redirigir si no estamos ya en login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
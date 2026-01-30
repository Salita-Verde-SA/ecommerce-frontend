import api from '../config/api';

export const healthService = {
  // Verificación del estado del sistema y servicios
  check: async () => {
    const response = await api.get('/health_check/');
    return response.data;
  }
};
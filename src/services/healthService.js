import api from '../config/api';

export const healthService = {
  // Verificar estado del sistema
  check: async () => {
    const response = await api.get('/health_check/');
    return response.data;
  }
};
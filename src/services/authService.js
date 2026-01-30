import api from '../config/api';

// Servicio de autenticación - Actualmente en desuso, utilizar useAuthStore como alternativa

export const authService = {
  login: async (email) => {
    // Verificación de existencia del email en el backend
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', ''); // Campo requerido por OAuth2, valor vacío

    const response = await api.post('/token/', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Estructura de respuesta del backend: { access_token, token_type, user: {...} }
    const { access_token, user } = response.data;
    
    return {
      token: access_token,
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        // Nota: El campo role no está implementado en el backend actual
        role: user.role
      }
    };
  },

  register: async (userData) => {
    // Creación de nuevo cliente mediante POST /clients
    const response = await api.post('/clients/', {
      name: userData.name,
      lastname: userData.lastname,
      email: userData.email,
      telephone: userData.telephone || ''
    });
    return response.data;
  },

  // Obtención del perfil del usuario autenticado mediante endpoint de clientes
  getProfile: async (userId) => {
    const response = await api.get(`/clients/${userId}/`);
    return response.data;
  }
};
import api from '../config/api';

// POR AHORA EN DESUSO, EN SU LUGAR UTILIZAR useAuthStore

export const authService = {
  login: async (email) => {
    // El backend verifica solo la existencia del email
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', ''); // Campo requerido por OAuth2, pero vacío

    const response = await api.post('/token/', formData, {  // Trailing slash añadido
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // El backend retorna: { access_token, token_type, user: {...} }
    const { access_token, user } = response.data;
    
    return {
      token: access_token,
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        // TODO: Eliminar el role porque no está en el backend
        role: user.role // 'admin' o 'client'
      }
    };
  },

  register: async (userData) => {
    // POST /clients para crear nuevo cliente sin contraseña
    const response = await api.post('/clients/', {  // Trailing slash añadido
      name: userData.name,
      lastname: userData.lastname,
      email: userData.email,
      telephone: userData.telephone || ''
    });
    return response.data;
  },

  // Obtener perfil del usuario autenticado usando el endpoint de clientes
  getProfile: async (userId) => {
    const response = await api.get(`/clients/${userId}/`);  // Trailing slash añadido
    return response.data;
  }
};
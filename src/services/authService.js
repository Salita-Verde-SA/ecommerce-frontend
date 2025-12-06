import api from '../config/api';

export const authService = {
  login: async (email, password) => {
    // El backend espera form-data para OAuth2 en /token (no /auth/token)
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/token', formData, {
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
        role: user.role // 'admin' o 'client'
      }
    };
  },

  register: async (userData) => {
    // POST /clients para crear nuevo cliente
    const response = await api.post('/clients', {
      name: userData.name,
      lastname: userData.lastname,
      email: userData.email,
      password: userData.password,
      telephone: userData.telephone || ''
    });
    return response.data;
  },

  // Obtener perfil del usuario autenticado usando el endpoint de clientes
  getProfile: async (userId) => {
    const response = await api.get(`/clients/${userId}`);
    return response.data;
  }
};
import api from '../config/api';

export const addressService = {
  // Obtención de todas las direcciones registradas
  getAll: async () => {
    const response = await api.get('/addresses/');
    return response.data;
  },

  // Obtención de direcciones asociadas a un cliente específico
  getMyAddresses: async (clientId) => {
    const response = await api.get('/addresses/');
    // Filtrado por client_id realizado en el frontend
    return response.data.filter(addr => addr.client_id === clientId);
  },

  // Obtención de dirección por identificador
  getById: async (id) => {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },

  // Creación de nueva dirección
  create: async (addressData) => {
    const payload = {
      street: addressData.street,
      number: addressData.number || '',
      city: addressData.city,
      client_id: addressData.client_id
    };
    const response = await api.post('/addresses/', payload);
    return response.data;
  },

  // Actualización de dirección existente
  update: async (id, addressData) => {
    const payload = {
      street: addressData.street,
      number: addressData.number || '',
      city: addressData.city
    };
    const response = await api.put(`/addresses/${id}`, payload);
    return response.data;
  },

  // Eliminación de dirección por identificador
  delete: async (id) => {
    await api.delete(`/addresses/${id}`);
    return true;
  }
};
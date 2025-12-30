import api from '../config/api';

export const addressService = {
  // Obtener todas las direcciones
  getAll: async () => {
    const response = await api.get('/addresses/');
    return response.data;
  },

  // Obtener direcciones de un cliente
  getMyAddresses: async (clientId) => {
    const response = await api.get('/addresses/');
    // Filtrar por client_id en el frontend si el backend no soporta filtrado
    return response.data.filter(addr => addr.client_id === clientId);
  },

  // Obtener por ID (CORREGIDO: Sin barra final)
  getById: async (id) => {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },

  // Crear dirección
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

  // Actualizar dirección (CORREGIDO: Sin barra final)
  update: async (id, addressData) => {
    const payload = {
      street: addressData.street,
      number: addressData.number || '',
      city: addressData.city
    };
    const response = await api.put(`/addresses/${id}`, payload);
    return response.data;
  },

  // Eliminar dirección (CORREGIDO: Sin barra final)
  delete: async (id) => {
    await api.delete(`/addresses/${id}`);
    return true;
  }
};
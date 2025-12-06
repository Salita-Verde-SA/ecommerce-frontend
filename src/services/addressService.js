import api from '../config/api';

export const addressService = {
  // Obtener todas las direcciones del usuario
  getMyAddresses: async () => {
    const response = await api.get('/addresses/my-addresses');
    return response.data;
  },

  // Obtener dirección por ID
  getById: async (id) => {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },

  // Crear nueva dirección
  create: async (addressData) => {
    const response = await api.post('/addresses', {
      street: addressData.street,
      city: addressData.city,
      zip_code: addressData.zip_code,
      client_id: addressData.client_id
    });
    return response.data;
  },

  // Actualizar dirección
  update: async (id, addressData) => {
    const response = await api.put(`/addresses/${id}`, addressData);
    return response.data;
  },

  // Eliminar dirección
  delete: async (id) => {
    await api.delete(`/addresses/${id}`);
    return true;
  }
};
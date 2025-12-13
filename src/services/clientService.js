import api from '../config/api';

export const clientService = {
  // GET /clients/ - Listar todos los clientes
  getAll: async (skip = 0, limit = 100) => {
    const response = await api.get(`/clients/?skip=${skip}&limit=${limit}`);  // Trailing slash añadido
    return response.data;
  },

  // GET /clients/{id}/ - Obtener cliente por ID
  getById: async (id) => {
    const response = await api.get(`/clients/${id}/`);  // Trailing slash añadido
    return response.data;
  },

  // POST /clients/ - Crear nuevo cliente
  create: async (clientData) => {
    const response = await api.post('/clients/', {  // Trailing slash añadido
      name: clientData.name,
      lastname: clientData.lastname,
      email: clientData.email,
      telephone: clientData.telephone || ''
    });
    return response.data;
  },

  // PUT /clients/{id}/ - Actualizar cliente
  update: async (id, clientData) => {
    const response = await api.put(`/clients/${id}/`, clientData);  // Trailing slash añadido
    return response.data;
  },

  // DELETE /clients/{id}/ - Eliminar cliente
  delete: async (id) => {
    await api.delete(`/clients/${id}/`);  // Trailing slash añadido
  },

  // Buscar cliente por email (usando getAll y filtrando)
  findByEmail: async (email) => {
    const clients = await clientService.getAll();
    return clients.find(c => c.email === email);
  }
};

import api from '../config/api';

export const clientService = {
  // Obtención de todos los clientes registrados (GET /clients/)
  getAll: async (skip = 0, limit = 100) => {
    const response = await api.get(`/clients/?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Obtención de cliente por identificador (GET /clients/{id})
  getById: async (id) => {
    const response = await api.get(`/clients/${id}`); 
    return response.data;
  },

  // Creación de nuevo cliente (POST /clients/)
  create: async (clientData) => {
    const response = await api.post('/clients/', {
      name: clientData.name,
      lastname: clientData.lastname,
      email: clientData.email,
      telephone: clientData.telephone || ''
    });
    return response.data;
  },

  // Actualización de datos de cliente (PUT /clients/{id})
  // El identificador se envía exclusivamente en la URL, los datos en el body
  update: async (id, clientData) => {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },

  // Eliminación de cliente (DELETE /clients/{id})
  delete: async (id) => {
    await api.delete(`/clients/${id}`);
  },

  // Búsqueda de cliente por dirección de correo electrónico
  findByEmail: async (email) => {
    const clients = await clientService.getAll();
    return clients.find(c => c.email === email);
  }
};
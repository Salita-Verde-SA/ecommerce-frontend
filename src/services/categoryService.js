import api from '../config/api';

export const categoryService = {
  // READ - Obtener todas las categorías
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // READ - Obtener por ID
  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // CREATE (Admin)
  create: async (categoryData) => {
    const response = await api.post('/categories', {
      name: categoryData.name
    });
    return response.data;
  },

  // UPDATE (Admin)
  update: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, {
      name: categoryData.name
    });
    return response.data;
  },

  // DELETE (Admin)
  delete: async (id) => {
    await api.delete(`/categories/${id}`);
    return true;
  }
};
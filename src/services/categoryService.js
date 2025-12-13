import api from '../config/api';

// Helper para normalizar categorías del backend (mantener id_key y agregar id como alias)
const normalizeCategory = (category) => ({
  id: category.id_key,      // Alias para compatibilidad frontend
  id_key: category.id_key,
  name: category.name
});

export const categoryService = {
  // READ - Obtener todas las categorías
  getAll: async () => {
    const response = await api.get('/categories/');
    return response.data.map(normalizeCategory);
  },

  // READ - Obtener por ID
  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return normalizeCategory(response.data);
  },

  // CREATE (Admin)
  create: async (categoryData) => {
    const payload = {
      name: categoryData.name
    };
    const response = await api.post('/categories/', payload);
    return normalizeCategory(response.data);
  },

  // UPDATE (Admin)
  update: async (id, categoryData) => {
    // El backend espera id_key en el body para PUT
    const payload = {
      id_key: parseInt(id),
      name: categoryData.name
    };
    const response = await api.put(`/categories/${id}`, payload);
    return normalizeCategory(response.data);
  },

  // DELETE (Admin)
  delete: async (id) => {
    await api.delete(`/categories/${id}`);
    return true;
  }
};
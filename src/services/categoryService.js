import api from '../config/api';

// Función auxiliar para normalizar categorías del backend (id_key e id como alias)
const normalizeCategory = (category) => ({
  id: category.id_key,      // Alias para compatibilidad con componentes del frontend
  id_key: category.id_key,
  name: category.name
});

export const categoryService = {
  // Obtención de todas las categorías registradas
  getAll: async () => {
    const response = await api.get('/categories/');
    return response.data.map(normalizeCategory);
  },

  // Obtención de categoría por identificador
  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return normalizeCategory(response.data);
  },

  // Creación de categoría (requiere permisos de administrador)
  create: async (categoryData) => {
    const payload = {
      name: categoryData.name
    };
    const response = await api.post('/categories/', payload);
    return normalizeCategory(response.data);
  },

  // Actualización de categoría (requiere permisos de administrador)
  update: async (id, categoryData) => {
    // El backend requiere id_key en el body para operaciones PUT
    const payload = {
      id_key: parseInt(id),
      name: categoryData.name
    };
    const response = await api.put(`/categories/${id}`, payload);
    return normalizeCategory(response.data);
  },

  // Eliminación de categoría (requiere permisos de administrador)
  delete: async (id) => {
    await api.delete(`/categories/${id}`);
    return true;
  }
};
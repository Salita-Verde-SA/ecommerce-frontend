import api from '../config/api';

// Imagen placeholder cuando el producto no tiene imagen
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80";

// Helper para normalizar productos del backend
const normalizeProduct = (product) => ({
  id: product.id,
  name: product.name,
  description: product.description || '',
  price: parseFloat(product.price),
  stock: product.stock,
  category_id: product.category_id,
  category_name: product.category?.name || 'Sin categoría',
  image_url: DEFAULT_IMAGE, // El backend no maneja imágenes
  rating: product.rating || 4.5 // Rating por defecto si no existe
});

export const productService = {
  // OBTENER TODOS
  getAll: async () => {
    const response = await api.get('/products');
    return response.data.map(normalizeProduct);
  },

  // OBTENER POR ID
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return normalizeProduct(response.data);
  },

  // CREAR PRODUCTO (POST) - Solo Admin
  create: async (productData) => {
    const payload = {
      name: productData.name,
      description: productData.description,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock),
      category_id: parseInt(productData.category_id)
    };
    const response = await api.post('/products', payload);
    return normalizeProduct(response.data);
  },

  // ACTUALIZAR PRODUCTO (PUT) - Solo Admin
  update: async (id, productData) => {
    const payload = {
      name: productData.name,
      description: productData.description,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock),
      category_id: parseInt(productData.category_id)
    };
    const response = await api.put(`/products/${id}`, payload);
    return normalizeProduct(response.data);
  },

  // ELIMINAR PRODUCTO (DELETE) - Solo Admin
  delete: async (id) => {
    await api.delete(`/products/${id}`);
    return true;
  }
};
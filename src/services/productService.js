import api from '../config/api';

// Función auxiliar para normalizar la estructura de productos recibidos del backend
const normalizeProduct = (product, calculatedRating = null) => ({
  id: product.id_key,           // Alias para compatibilidad con componentes del frontend
  id_key: product.id_key,
  name: product.name,
  description: product.description || '', // Valor por defecto para evitar errores en vistas
  price: parseFloat(product.price),
  stock: product.stock,
  category_id: product.category_id,
  
  // El backend envía 'category_name' como campo directo en ProductSchema
  // Se incluye fallback para retrocompatibilidad con estructuras anidadas
  category_name: product.category_name || product.category?.name || 'Sin categoría',
  
  // Prioridad de rating: calculado > backend > valor por defecto (0)
  rating: calculatedRating !== null ? calculatedRating : (product.rating || 0)
});

export const productService = {
  // Obtención de todos los productos con cálculo de rating promedio
  getAll: async () => {
    try {
      // Obtención paralela de productos y reseñas para optimizar rendimiento
      const [productsRes, reviewsRes] = await Promise.all([
        api.get('/products/'),
        api.get('/reviews/')
      ]);

      const products = productsRes.data;
      const reviews = reviewsRes.data;

      // Cálculo del rating promedio para cada producto basado en sus reseñas
      return products.map(product => {
        const productReviews = reviews.filter(r => r.product_id === product.id_key);
        
        let avgRating = 0;
        if (productReviews.length > 0) {
          const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
          avgRating = sum / productReviews.length;
        }

        return normalizeProduct(product, avgRating);
      });
    } catch (error) {
      console.error("Error fetching products with ratings:", error);
      // En caso de error, se retornan productos sin cálculo de rating
      const response = await api.get('/products/');
      return response.data.map(p => normalizeProduct(p));
    }
  },

  // Obtención de un producto específico por identificador
  getById: async (id) => {
    try {
      const [productRes, reviewsRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get('/reviews/')
      ]);

      const product = productRes.data;
      const reviews = reviewsRes.data;

      // Filtrado de reseñas correspondientes al producto consultado
      const productReviews = reviews.filter(r => r.product_id === product.id_key);
      
      let avgRating = 0;
      if (productReviews.length > 0) {
        const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
        avgRating = sum / productReviews.length;
      }

      return normalizeProduct(product, avgRating);
    } catch (error) {
      console.error("Error fetching product detail:", error);
      throw error;
    }
  },

  // Creación de producto (requiere permisos de administrador)
  create: async (productData) => {
    const payload = {
      name: productData.name,
      // Campo description omitido según especificación actual
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock),
      category_id: parseInt(productData.category_id)
    };
    const response = await api.post('/products/', payload);
    return normalizeProduct(response.data, 0); // Producto nuevo se inicializa con rating 0
  },

  // Actualización de producto (requiere permisos de administrador)
  update: async (id, productData) => {
    // El campo id_key no se incluye en el body para evitar conflictos con el backend
    const payload = {
      name: productData.name,
      // Campo description omitido según especificación actual
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock),
      category_id: parseInt(productData.category_id)
    };
    
    const response = await api.put(`/products/${id}`, payload);
    return normalizeProduct(response.data);
  },

  // Eliminación de producto (requiere permisos de administrador)
  delete: async (id) => {
    await api.delete(`/products/${id}`);
    return true;
  }
};
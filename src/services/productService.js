import api from '../config/api';

// Imagen placeholder cuando el producto no tiene imagen
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80";

// Helper para normalizar productos del backend
// CORRECCIÓN: Ahora acepta un 'calculatedRating' opcional para sobrescribir el del backend
const normalizeProduct = (product, calculatedRating = null) => ({
  id: product.id_key,           // Alias para compatibilidad frontend
  id_key: product.id_key,
  name: product.name,
  description: product.description || '', // Mantenemos fallback vacío para evitar errores en vistas
  price: parseFloat(product.price),
  stock: product.stock,
  category_id: product.category_id,
  category_name: product.category?.name || 'Sin categoría',
  image_url: DEFAULT_IMAGE, 
  // Prioridad: Rating calculado > Rating del backend > 0 (si no hay reviews)
  rating: calculatedRating !== null ? calculatedRating : (product.rating || 0)
});

export const productService = {
  // OBTENER TODOS - CORREGIDO: Calcula promedio de estrellas
  getAll: async () => {
    try {
      // Obtenemos productos y reseñas en paralelo para eficiencia
      const [productsRes, reviewsRes] = await Promise.all([
        api.get('/products/'),
        api.get('/reviews/')
      ]);

      const products = productsRes.data;
      const reviews = reviewsRes.data;

      // Mapeamos cada producto calculando su rating real basado en sus reseñas
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
      // Fallback en caso de error: devolver productos sin cálculo de rating
      const response = await api.get('/products/');
      return response.data.map(p => normalizeProduct(p));
    }
  },

  // OBTENER POR ID - CORREGIDO: Calcula promedio de estrellas para el detalle
  getById: async (id) => {
    try {
      const [productRes, reviewsRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get('/reviews/')
      ]);

      const product = productRes.data;
      const reviews = reviewsRes.data;

      // Filtrar reseñas para este producto específico
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

  // CREAR PRODUCTO (POST) - Solo Admin
  create: async (productData) => {
    const payload = {
      name: productData.name,
      // description eliminada
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock),
      category_id: parseInt(productData.category_id)
    };
    const response = await api.post('/products/', payload);
    return normalizeProduct(response.data, 0); // Producto nuevo nace con 0 estrellas
  },

  // ACTUALIZAR PRODUCTO (PUT) - Solo Admin
  update: async (id, productData) => {
    const payload = {
      id_key: parseInt(id),
      name: productData.name,
      // description eliminada
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
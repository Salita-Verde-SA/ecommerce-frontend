import api from '../config/api';

// Función auxiliar para normalizar estructura de reseñas
const normalizeReview = (review) => ({
  id: review.id_key,
  id_key: review.id_key,
  user_id: review.client_id,
  user_name: review.client?.name || 'Usuario',
  product_id: review.product_id,
  rating: review.rating,
  comment: review.comment,
  date: review.date || new Date().toISOString().split('T')[0]
});

export const reviewService = {
  // Obtención de todas las reseñas registradas
  getAll: async () => {
    const response = await api.get('/reviews/');
    return response.data.map(normalizeReview);
  },

  // Obtención de reseñas asociadas a un producto específico
  getByProduct: async (productId) => {
    // El backend no dispone de endpoint específico por producto,
    // por lo que el filtrado se realiza en el cliente
    try {
      const response = await api.get('/reviews/');
      return response.data
        .filter(review => review.product_id === parseInt(productId))
        .map(normalizeReview);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  },

  // Creación de una nueva reseña
  create: async (reviewData) => {
    const payload = {
      product_id: parseInt(reviewData.product_id),
      client_id: parseInt(reviewData.user_id),
      rating: parseFloat(reviewData.rating),
      comment: reviewData.comment || ''
    };
    const response = await api.post('/reviews/', payload);
    return {
      ...normalizeReview(response.data),
      user_name: reviewData.user_name,
      date: new Date().toISOString().split('T')[0]
    };
  },

  // Eliminación de una reseña por identificador
  delete: async (id) => {
    await api.delete(`/reviews/${id}`);
    return true;
  }
};
import api from '../config/api';

export const reviewService = {
  // Obtener todas las reseñas
  getAll: async () => {
    const response = await api.get('/reviews');
    return response.data;
  },

  // Obtener reseñas de un producto específico
  getByProduct: async (productId) => {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data.map(review => ({
      id: review.id,
      user_id: review.client_id,
      user_name: review.client?.name || 'Usuario',
      product_id: review.product_id,
      rating: review.rating,
      comment: review.comment,
      date: review.date || new Date().toISOString().split('T')[0]
    }));
  },

  // Crear una nueva reseña
  create: async (reviewData) => {
    const response = await api.post('/reviews', {
      product_id: parseInt(reviewData.product_id),
      client_id: reviewData.user_id,
      rating: reviewData.rating,
      comment: reviewData.comment
    });
    return {
      ...response.data,
      user_name: reviewData.user_name,
      date: new Date().toISOString().split('T')[0]
    };
  },

  // Eliminar reseña
  delete: async (id) => {
    await api.delete(`/reviews/${id}`);
    return true;
  }
};
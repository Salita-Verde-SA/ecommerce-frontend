import api from '../config/api';

export const orderDetailService = {
  // Obtener todos los detalles
  getAll: async () => {
    const response = await api.get('/order-details');
    return response.data;
  },

  // Obtener items de una orden específica
  getByOrderId: async (orderId) => {
    const response = await api.get(`/order-details/order/${orderId}`);
    return response.data.map(detail => ({
      id: detail.id,
      product_id: detail.product_id,
      product_name: detail.product?.name || 'Producto',
      quantity: detail.quantity,
      price: parseFloat(detail.price),
      subtotal: parseFloat(detail.price) * detail.quantity
    }));
  },

  // Obtener detalle por ID
  getById: async (id) => {
    const response = await api.get(`/order-details/${id}`);
    return response.data;
  }
};
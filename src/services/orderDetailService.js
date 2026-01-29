import api from '../config/api';

export const orderDetailService = {
  // Obtener todos los detalles
  getAll: async () => {
    const response = await api.get('/order_details/');
    return response.data;
  },

  // Obtener detalles por ID de orden
  getByOrderId: async (orderId) => {
    const response = await api.get('/order_details/');
    // Filtrar en frontend por order_id
    return response.data
      .filter(detail => detail.order_id === parseInt(orderId))
      .map(detail => ({
        id: detail.id_key,
        quantity: detail.quantity,
        price: parseFloat(detail.price),
        subtotal: detail.quantity * parseFloat(detail.price),
        order_id: detail.order_id,
        product_id: detail.product_id,
        product_name: detail.product?.name || `Producto #${detail.product_id}`
      }));
  },

  // Crear detalle de orden
  create: async (detailData) => {
    const payload = {
      quantity: parseInt(detailData.quantity),
      price: parseFloat(detailData.price),
      order_id: parseInt(detailData.order_id),
      product_id: parseInt(detailData.product_id)
    };
    const response = await api.post('/order_details/', payload);
    return response.data;
  },

  // Eliminar detalle
  delete: async (id) => {
    await api.delete(`/order_details/${id}`);
    return true;
  }
};
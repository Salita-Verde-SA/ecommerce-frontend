import api from '../config/api';

export const orderDetailService = {
  // Obtener todos los detalles de pedido
  getAll: async () => {
    const response = await api.get('/order_details/');
    return response.data;
  },

  // Obtener detalles por order_id (filtrar en frontend)
  getByOrderId: async (orderId) => {
    const response = await api.get('/order_details/');
    // Filtrar detalles del pedido específico
    return response.data.filter(detail => detail.order_id === orderId);
  },

  // Obtener detalle por ID
  getById: async (id) => {
    const response = await api.get(`/order_details/${id}/`);
    return response.data;
  },

  // Crear detalle de pedido
  create: async (detailData) => {
    const response = await api.post('/order_details/', {
      quantity: parseInt(detailData.quantity),
      price: parseFloat(detailData.price),
      order_id: detailData.order_id,
      product_id: detailData.product_id
    });
    return response.data;
  },

  // Actualizar detalle
  update: async (id, detailData) => {
    const response = await api.put(`/order_details/${id}/`, detailData);
    return response.data;
  },

  // Eliminar detalle
  delete: async (id) => {
    await api.delete(`/order_details/${id}/`);
    return true;
  }
};
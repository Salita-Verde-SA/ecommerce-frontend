import api from '../config/api';

export const orderService = {
  // Obtener todas las órdenes (Admin) o del usuario actual
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  // Obtener pedidos del cliente autenticado
  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data.map(order => ({
      id: order.id,
      date: order.date,
      total: parseFloat(order.total),
      status: order.status,
      details: order.details || []
    }));
  },

  // Obtener orden por ID
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Crear orden
  createOrder: async (orderData) => {
    const payload = {
      client_id: orderData.client_id,
      total: parseFloat(orderData.total),
      status: orderData.status || 'PENDING',
      details: orderData.details.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: parseFloat(item.price)
      }))
    };
    const response = await api.post('/orders', payload);
    return response.data;
  },

  // Actualizar estado de orden (Admin)
  updateStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}`, { status });
    return response.data;
  }
};
import api from '../config/api';

export const orderService = {
  // Obtener todas las órdenes
  getAll: async () => {
    const response = await api.get('/orders/');
    return response.data;
  },

  // Obtener pedidos del cliente autenticado (filtrar en frontend)
  getMyOrders: async (clientId) => {
    const response = await api.get('/orders/');
    // Filtrar órdenes del cliente en el frontend
    return response.data
      .filter(order => order.client_id === clientId)
      .map(order => ({
        id: order.id_key,
        date: order.date,
        total: parseFloat(order.total),
        status: order.status,
        delivery_method: order.delivery_method,
        client_id: order.client_id,
        bill_id: order.bill_id
      }));
  },

  // Obtener orden por ID
  getById: async (id) => {
    const response = await api.get(`/orders/${id}/`);
    return response.data;
  },

  // Crear orden (corregido para coincidir con schema del backend)
  createOrder: async (orderData) => {
    const payload = {
      date: orderData.date || new Date().toISOString(),
      total: parseFloat(orderData.total),
      delivery_method: orderData.delivery_method || 3, // HOME_DELIVERY = 3
      status: orderData.status || 1, // PENDING = 1
      client_id: parseInt(orderData.client_id),
      bill_id: parseInt(orderData.bill_id)
    };
    const response = await api.post('/orders/', payload);
    return response.data;
  },

  // Actualizar estado de orden
  updateStatus: async (id, status) => {
    // Primero obtener la orden completa
    const order = await orderService.getById(id);
    // Actualizar solo el status
    const response = await api.put(`/orders/${id}/`, {
      ...order,
      status: status
    });
    return response.data;
  }
};
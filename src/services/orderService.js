import api from '../config/api';
import { orderDetailService } from './orderDetailService';

export const orderService = {
  // Obtención de todas las órdenes registradas
  getAll: async () => {
    const response = await api.get('/orders/');
    return response.data;
  },

  // Obtención de pedidos del cliente autenticado (filtrado en frontend)
  getMyOrders: async (clientId) => {
    const response = await api.get('/orders/');
    // Filtrado de órdenes por cliente realizado en el frontend
    const filteredOrders = response.data.filter(order => order.client_id === clientId);
    
    // Cargar detalles de cada orden
    const ordersWithDetails = await Promise.all(
      filteredOrders.map(async (order) => {
        const orderId = order.id_key || order.id;
        let details = [];
        try {
          details = await orderDetailService.getByOrderId(orderId);
        } catch (err) {
          console.error(`Error cargando detalles de orden ${orderId}:`, err);
        }
        return {
          id: orderId,
          date: order.date,
          total: parseFloat(order.total),
          status: order.status,
          delivery_method: order.delivery_method,
          client_id: order.client_id,
          bill_id: order.bill_id,
          details: details
        };
      })
    );
    
    return ordersWithDetails;
  },

  // Obtención de orden por identificador
  getById: async (id) => {
    const response = await api.get(`/orders/${id}/`);
    return response.data;
  },

  // Creación de orden según esquema definido por el backend
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

  // Actualización del estado de una orden existente
  updateStatus: async (id, status) => {
    // Se obtiene la orden completa antes de actualizar
    const order = await orderService.getById(id);
    // Actualización exclusiva del campo status
    const response = await api.put(`/orders/${id}/`, {
      ...order,
      status: status
    });
    return response.data;
  }
};
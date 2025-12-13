import api from '../config/api';

export const billService = {
  // Obtener todas las facturas
  getAll: async () => {
    const response = await api.get('/bills/');
    return response.data;
  },

  // Obtener facturas del usuario autenticado (filtrar en frontend)
  getMyBills: async (clientId) => {
    const response = await api.get('/bills/');
    // Filtrar facturas del cliente en el frontend
    // Nota: Necesitaremos relacionar bills con orders para filtrar por client_id
    const orders = await api.get('/orders/');
    const clientOrders = orders.data.filter(order => order.client_id === clientId);
    const clientBillIds = clientOrders.map(order => order.bill_id);
    
    return response.data
      .filter(bill => clientBillIds.includes(bill.id_key))
      .map(bill => ({
        id: bill.id_key,
        bill_number: bill.bill_number,
        date: bill.date,
        total: parseFloat(bill.total),
        payment_type: bill.payment_type,
        discount: bill.discount
      }));
  },

  // Obtener factura por ID
  getBillById: async (id) => {
    const response = await api.get(`/bills/${id}/`);
    return response.data;
  },

  // Crear factura
  create: async (billData) => {
    const response = await api.post('/bills/', billData);
    return response.data;
  }
};
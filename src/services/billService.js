import api from '../config/api';

export const billService = {
  // Obtener todas las facturas
  getAll: async () => {
    const response = await api.get('/bills');
    return response.data;
  },

  // Obtener facturas del usuario autenticado
  getMyBills: async () => {
    const response = await api.get('/bills/my-bills');
    return response.data.map(bill => ({
      id: bill.id,
      bill_number: bill.bill_number,
      date: bill.date,
      total: parseFloat(bill.total),
      payment_type: bill.payment_type,
      client_id: bill.client_id
    }));
  },

  // Obtener factura por ID
  getBillById: async (id) => {
    const response = await api.get(`/bills/${id}`);
    return response.data;
  },

  // Crear factura (generalmente automático al crear orden)
  create: async (billData) => {
    const response = await api.post('/bills', billData);
    return response.data;
  }
};
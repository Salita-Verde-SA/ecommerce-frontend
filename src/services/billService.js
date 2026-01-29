import api from '../config/api';

// Helper para generar número de factura único
const generateBillNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BILL-${year}${month}${day}-${hours}${mins}${secs}-${random}`;
};

// Helper para formatear fecha a ISO 8601 (YYYY-MM-DD)
const formatDate = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Mapeo de payment_type string a integer según el backend
const PAYMENT_TYPE_MAP = {
  'cash': 1,
  'card': 2
};

export const billService = {
  // Obtener todas las facturas
  getAll: async () => {
    const response = await api.get('/bills/');
    return response.data;
  },

  // Obtener facturas del cliente
  getMyBills: async (clientId) => {
    const response = await api.get('/bills/');
    return response.data.map(bill => ({
      id: bill.id_key,
      bill_number: bill.bill_number,
      discount: parseFloat(bill.discount || 0),
      date: bill.date,
      total: parseFloat(bill.total),
      payment_type: bill.payment_type
    }));
  },

  // Obtener factura por ID
  getById: async (id) => {
    const response = await api.get(`/bills/${id}`);
    return response.data;
  },

  // Crear factura - CORREGIDO según schema real del backend
  create: async (billData) => {
    // Convertir payment_type de string a integer si es necesario
    let paymentTypeValue = billData.payment_type;
    if (typeof paymentTypeValue === 'string') {
      paymentTypeValue = PAYMENT_TYPE_MAP[paymentTypeValue.toLowerCase()] || 1;
    }

    const payload = {
      bill_number: billData.bill_number || generateBillNumber(),
      date: formatDate(billData.date),
      total: parseFloat(billData.total || 0),
      discount: parseFloat(billData.discount || 0),
      payment_type: paymentTypeValue,        // INTEGER, no string
      client_id: parseInt(billData.client_id) // REQUERIDO
    };
    
    console.log('Creando factura con payload:', payload);
    
    const response = await api.post('/bills/', payload);
    return response.data;
  },

  // Actualizar factura
  update: async (id, billData) => {
    const response = await api.put(`/bills/${id}`, billData);
    return response.data;
  },

  // Eliminar factura
  delete: async (id) => {
    await api.delete(`/bills/${id}`);
    return true;
  }
};
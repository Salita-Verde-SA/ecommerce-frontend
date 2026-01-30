import api from '../config/api';

// Función auxiliar para generar número de factura único
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

// Función auxiliar para formatear fecha a formato ISO 8601 (YYYY-MM-DD)
const formatDate = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Mapeo de tipo de pago (string a entero) según especificación del backend
const PAYMENT_TYPE_MAP = {
  'cash': 1,
  'card': 2
};

export const billService = {
  // Obtención de todas las facturas registradas
  getAll: async () => {
    const response = await api.get('/bills/');
    return response.data;
  },

  // Obtención de facturas asociadas a un cliente específico
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

  // Obtención de factura por identificador
  getById: async (id) => {
    const response = await api.get(`/bills/${id}`);
    return response.data;
  },

  // Creación de factura según esquema definido por el backend
  create: async (billData) => {
    // Conversión del tipo de pago de cadena a entero si corresponde
    let paymentTypeValue = billData.payment_type;
    if (typeof paymentTypeValue === 'string') {
      paymentTypeValue = PAYMENT_TYPE_MAP[paymentTypeValue.toLowerCase()] || 1;
    }

    const payload = {
      bill_number: billData.bill_number || generateBillNumber(),
      date: formatDate(billData.date),
      total: parseFloat(billData.total || 0),
      discount: parseFloat(billData.discount || 0),
      payment_type: paymentTypeValue,        // Valor entero requerido por el backend
      client_id: parseInt(billData.client_id) // Identificador del cliente (obligatorio)
    };
    
    console.log('Creando factura con payload:', payload);
    
    const response = await api.post('/bills/', payload);
    return response.data;
  },

  // Actualización de datos de una factura existente
  update: async (id, billData) => {
    const response = await api.put(`/bills/${id}`, billData);
    return response.data;
  },

  // Eliminación de una factura por identificador
  delete: async (id) => {
    await api.delete(`/bills/${id}`);
    return true;
  }
};
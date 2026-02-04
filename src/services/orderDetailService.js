import api from '../config/api';

export const orderDetailService = {
  // Obtención de todos los detalles de órdenes
  getAll: async () => {
    const response = await api.get('/order_details/');
    return response.data;
  },

  // Obtención de detalles correspondientes a una orden específica
  getByOrderId: async (orderId) => {
    // Obtener detalles y productos en paralelo
    const [detailsRes, productsRes] = await Promise.all([
      api.get('/order_details/'),
      api.get('/products/')
    ]);
    
    const allDetails = detailsRes.data;
    const allProducts = productsRes.data;
    
    // Crear mapa de productos para búsqueda rápida
    const productMap = {};
    allProducts.forEach(p => {
      productMap[p.id_key] = p.name;
    });
    
    // Filtrado por order_id y enriquecimiento con nombre de producto
    return allDetails
      .filter(detail => detail.order_id === parseInt(orderId))
      .map(detail => ({
        id: detail.id_key,
        quantity: detail.quantity,
        price: parseFloat(detail.price),
        subtotal: detail.quantity * parseFloat(detail.price),
        order_id: detail.order_id,
        product_id: detail.product_id,
        product_name: detail.product?.name || productMap[detail.product_id] || `Producto #${detail.product_id}`
      }));
  },

  // Creación de un nuevo detalle de orden
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

  // Eliminación de un detalle de orden por identificador
  delete: async (id) => {
    await api.delete(`/order_details/${id}`);
    return true;
  }
};
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { healthService } from '../services/healthService';
import { orderService } from '../services/orderService';
import { orderDetailService } from '../services/orderDetailService';
import ProductForm from '../components/admin/ProductForm';
import CategoryForm from '../components/admin/CategoryForm';
import LatencyChart from '../components/admin/LatencyChart';
import ConfirmModal from '../components/ui/ConfirmModal';
import AlertModal from '../components/ui/AlertModal';
import { useLatencyMonitor } from '../hooks/useLatencyMonitor';
import { Package, ShoppingBag, Plus, Edit, Trash2, Search, Home, LogOut, Tag, Eye, X, RefreshCw, AlertCircle, Layers, Cpu } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Hook de monitoreo de latencia
  const { 
    latencyData, 
    currentHealth, 
    isMonitoring, 
    error: latencyError,
    connectionStatus,
    startMonitoring,
    stopMonitoring,
    clearData: clearLatencyData
  } = useLatencyMonitor(2000, 30);

  // Modales de producto
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Modales de categoría
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Modal de confirmación
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'danger' });
  const [confirmLoading, setConfirmLoading] = useState(false);
  
  // Modal de alerta
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  // Modal de orden
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const showAlert = (type, title, message) => {
    setAlertModal({ isOpen: true, type, title, message });
  };

  const showConfirm = (title, message, onConfirm, type = 'danger') => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, type });
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [prod, cat, sys] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        healthService.check()
      ]);
      setProducts(prod);
      setCategories(cat);
      setHealth(sys);
    } catch (e) { 
      console.error(e);
      setError('Error al cargar datos del servidor');
    } finally { 
      setLoading(false); 
    }
  };

  const loadOrders = async () => {
    try {
      const ordersData = await orderService.getAll();
      setOrders(ordersData);
    } catch (e) {
      console.error('Error loading orders:', e);
      setError('Error al cargar órdenes');
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    if (currentHealth) {
      setHealth(currentHealth);
    }
  }, [currentHealth]);

  const handleLogout = () => { logout(); navigate('/'); };
  const handleGoHome = () => { navigate('/'); };

  // ===== PRODUCTOS =====
  const handleCreateProduct = () => { setEditingProduct(null); setIsProductModalOpen(true); };
  const handleEditProduct = (p) => { setEditingProduct(p); setIsProductModalOpen(true); };
  
  const handleDeleteProduct = (product) => {
    showConfirm(
      '¿Eliminar producto?',
      `Estás a punto de eliminar "${product.name}". Esta acción no se puede deshacer.`,
      async () => {
        setConfirmLoading(true);
        try {
          await productService.delete(product.id);
          setProducts(products.filter(p => p.id !== product.id));
          setConfirmModal({ ...confirmModal, isOpen: false });
          showAlert('success', 'Eliminado', 'El producto ha sido eliminado correctamente.');
        } catch (e) {
          setConfirmModal({ ...confirmModal, isOpen: false });
          // Mensaje más específico basado en el código de error
          let errorMessage = 'No se pudo eliminar el producto.';
          if (e.response?.status === 409) {
            errorMessage = 'No se puede eliminar: el producto tiene ventas asociadas. Considera marcarlo como inactivo.';
          } else if (e.response?.data?.detail) {
            errorMessage = typeof e.response.data.detail === 'string' 
              ? e.response.data.detail 
              : errorMessage;
          }
          showAlert('error', 'Error', errorMessage);
        } finally {
          setConfirmLoading(false);
        }
      }
    );
  };

  const handleProductSubmit = async (d) => { 
    try {
      if(editingProduct) { 
        const u = await productService.update(editingProduct.id, d); 
        setProducts(products.map(p => p.id === u.id ? u : p));
        showAlert('success', 'Actualizado', 'El producto ha sido actualizado correctamente.');
      } else { 
        const c = await productService.create(d); 
        setProducts([...products, c]);
        showAlert('success', 'Creado', 'El producto ha sido creado correctamente.');
      } 
      setIsProductModalOpen(false);
    } catch (e) {
      // Mostrar error específico en el modal de alerta
      let errorMessage = 'Error al guardar el producto.';
      if (e.response?.data?.detail) {
        const detail = e.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join('. ');
        }
      }
      showAlert('error', 'Error', errorMessage);
      throw e; // Re-lanzar para que ProductForm maneje el estado
    }
  };
  
  // ===== CATEGORÍAS =====
  const handleCreateCategory = () => { setEditingCategory(null); setIsCategoryModalOpen(true); };
  const handleEditCategory = (cat) => { setEditingCategory(cat); setIsCategoryModalOpen(true); };
  
  const handleDeleteCategory = (category) => {
    showConfirm(
      '¿Eliminar categoría?',
      `Estás a punto de eliminar "${category.name}". No podrás eliminarla si tiene productos asociados.`,
      async () => {
        setConfirmLoading(true);
        try {
          await categoryService.delete(category.id);
          setCategories(categories.filter(c => c.id !== category.id));
          setConfirmModal({ ...confirmModal, isOpen: false });
          showAlert('success', 'Eliminada', 'La categoría ha sido eliminada correctamente.');
        } catch (e) {
          setConfirmModal({ ...confirmModal, isOpen: false });
          let errorMessage = 'No se pudo eliminar la categoría.';
          if (e.response?.status === 409) {
            errorMessage = 'No se puede eliminar: la categoría tiene productos asociados.';
          } else if (e.response?.data?.detail) {
            errorMessage = typeof e.response.data.detail === 'string' 
              ? e.response.data.detail 
              : errorMessage;
          }
          showAlert('error', 'Error', errorMessage);
        } finally {
          setConfirmLoading(false);
        }
      }
    );
  };

  const handleCategorySubmit = async (data) => {
    try {
      if (editingCategory) {
        const updated = await categoryService.update(editingCategory.id, data);
        setCategories(categories.map(c => c.id === updated.id ? updated : c));
        showAlert('success', 'Actualizada', 'La categoría ha sido actualizada correctamente.');
      } else {
        const created = await categoryService.create(data);
        setCategories([...categories, created]);
        showAlert('success', 'Creada', 'La categoría ha sido creada correctamente.');
      }
      setIsCategoryModalOpen(false);
    } catch (e) {
      throw e;
    }
  };

  const handleViewOrder = async (o) => { 
    setSelectedOrder(o); 
    setLoadingDetails(true); 
    try { 
      const d = await orderDetailService.getByOrderId(o.id); 
      setOrderDetails(d); 
    } catch(e) { 
      console.error(e);
      setOrderDetails([]);
    } finally { 
      setLoadingDetails(false); 
    }
  };

  const handleToggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  // Filtrado que incluye búsqueda por nombre y categoría
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category_name && p.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const getHealthColor = () => {
    if (connectionStatus === 'offline' || health?.status === 'offline' || health?.errorType) {
      return 'bg-red-500';
    }
    switch (health?.status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'degraded': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthLabel = () => {
    if (connectionStatus === 'offline' || health?.status === 'offline' || health?.errorType) {
      return 'OFFLINE';
    }
    return health?.status?.toUpperCase() || 'CONECTANDO...';
  };

  const healthColor = getHealthColor();

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === 'completed' || s === 'completado') return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (s === 'shipped' || s === 'enviado') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
  };

  return (
    <div className="min-h-screen bg-background pt-8 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-surface p-6 rounded-2xl shadow-lg border border-ui-border">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/20 rounded-lg">
               <Cpu size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Panel Nexus Hardware</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={`w-2.5 h-2.5 rounded-full ${healthColor} ${connectionStatus !== 'offline' && health?.status !== 'offline' ? 'animate-pulse' : ''}`}></span>
                <p className="text-xs font-medium text-text-secondary">
                  Sistema: {getHealthLabel()}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <button onClick={loadData} className="flex items-center gap-2 text-text-secondary hover:text-primary text-sm font-medium px-3 py-2 rounded-lg hover:bg-background"><RefreshCw size={18}/> Actualizar</button>
            <button onClick={handleGoHome} className="flex items-center gap-2 text-text-secondary hover:text-primary text-sm font-medium px-3 py-2 rounded-lg hover:bg-background"><Home size={18}/> Tienda</button>
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm font-bold border border-red-500/20"><LogOut size={18}/> Salir</button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
            <AlertCircle size={18} />{error}
          </div>
        )}

        <div className="mb-8">
          <LatencyChart
            latencyData={latencyData}
            currentHealth={currentHealth}
            isMonitoring={isMonitoring}
            error={latencyError}
            onToggleMonitoring={handleToggleMonitoring}
            onClear={clearLatencyData}
          />
        </div>

        <div className="flex space-x-1 bg-surface p-1 rounded-xl shadow-sm max-w-lg mb-8 border border-ui-border">
          {['products', 'categories', 'orders'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all capitalize ${activeTab === tab ? 'bg-primary text-black font-bold shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text-primary hover:bg-background'}`}>
              {tab === 'products' && <Package size={18}/>}{tab === 'categories' && <Tag size={18}/>}{tab === 'orders' && <ShoppingBag size={18}/>} {tab}
            </button>
          ))}
        </div>

        {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between mb-6 gap-4">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-2.5 text-text-secondary" size={20} />
                <input type="text" placeholder="Buscar producto o categoría..." className="w-full pl-10 pr-4 py-2.5 border border-ui-border rounded-xl outline-none text-text-primary bg-surface focus:border-primary" onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button onClick={handleCreateProduct} className="bg-primary hover:bg-primary-hover text-black font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20"><Plus size={18}/> Nuevo</button>
            </div>
            
            <div className="bg-surface rounded-2xl shadow-lg overflow-hidden border border-ui-border">
              <table className="w-full text-left">
                <thead className="bg-background/50 border-b border-ui-border">
                  <tr>
                    <th className="p-4 text-text-secondary font-bold text-sm uppercase">Producto</th>
                    <th className="p-4 text-text-secondary font-bold text-sm uppercase">Precio</th>
                    <th className="p-4 text-text-secondary font-bold text-sm uppercase">Stock</th>
                    {/* CORRECCIÓN: Columna de Categoría agregada */}
                    <th className="p-4 text-text-secondary font-bold text-sm uppercase">Categoría</th>
                    <th className="p-4 text-right text-text-secondary font-bold text-sm uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ui-border">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-white/5">
                      <td className="p-4 font-medium text-text-primary">{p.name}</td>
                      <td className="p-4 font-bold text-primary">${p.price}</td>
                      <td className="p-4 text-text-secondary">{p.stock} un.</td>
                      {/* CORRECCIÓN: Celda de Categoría agregada */}
                      <td className="p-4 text-text-secondary">
                        <div className="flex items-center gap-2">
                           <Layers size={14} className="text-text-muted"/>
                           {p.category_name || 'Sin categoría'}
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleEditProduct(p)} className="text-secondary-light hover:bg-secondary-light/20 p-2 rounded-lg"><Edit size={18}/></button>
                        <button onClick={() => handleDeleteProduct(p)} className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ... (Resto del componente sin cambios: Tabs de categorías y órdenes, modales, etc.) ... */}
        {activeTab === 'categories' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">Listado de Categorías</h2>
              <button onClick={handleCreateCategory} className="bg-secondary-DEFAULT hover:bg-secondary-light text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2"><Plus size={18}/> Nueva</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(c => (
                <div key={c.id} className="bg-surface p-5 rounded-xl border border-ui-border flex justify-between items-center group hover:border-primary/50">
                  <span className="font-medium text-text-primary">{c.name}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditCategory(c)} className="text-text-secondary hover:text-primary p-1"><Edit size={16}/></button>
                    <button onClick={() => handleDeleteCategory(c)} className="text-text-secondary hover:text-red-400 p-1"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-surface rounded-2xl shadow-lg overflow-hidden border border-ui-border">
              <table className="w-full text-left">
                <thead className="bg-background/50 border-b border-ui-border">
                  <tr>
                    <th className="p-4 text-text-secondary font-bold text-sm uppercase">ID</th>
                    <th className="p-4 text-text-secondary font-bold text-sm uppercase">Fecha</th>
                    <th className="p-4 text-text-secondary font-bold text-sm uppercase">Total</th>
                    <th className="p-4 text-text-secondary font-bold text-sm uppercase">Estado</th>
                    <th className="p-4 text-right text-text-secondary font-bold text-sm uppercase">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ui-border">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-white/5">
                      <td className="p-4 font-mono text-primary">#{o.id}</td>
                      <td className="p-4 text-text-primary">{o.date}</td>
                      <td className="p-4 font-bold text-text-primary">${parseFloat(o.total).toFixed(2)}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-md text-xs font-bold border ${getStatusStyle(o.status)}`}>{o.status}</span></td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleViewOrder(o)} className="text-primary hover:bg-primary/10 p-2 rounded-lg flex items-center gap-2 ml-auto text-sm font-medium"><Eye size={16}/> Ver</button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan="5" className="p-8 text-center text-text-muted">No hay órdenes registradas</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Modales */}
        <ProductForm isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} onSubmit={handleProductSubmit} initialData={editingProduct} categories={categories} />
        
        <CategoryForm isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onSubmit={handleCategorySubmit} initialData={editingCategory} />
        
        <ConfirmModal 
          isOpen={confirmModal.isOpen} 
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} 
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          loading={confirmLoading}
        />
        
        <AlertModal 
          isOpen={alertModal.isOpen} 
          onClose={() => setAlertModal({ ...alertModal, isOpen: false })} 
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
        />

        {/* Modal de detalles de orden */}
        <AnimatePresence>
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-surface border border-ui-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-ui-border">
                  <h3 className="text-xl font-bold text-text-primary">Orden #{selectedOrder.id}</h3>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-background rounded-full text-text-secondary hover:text-text-primary"><X size={20}/></button>
                </div>
                <div className="p-6">
                  {loadingDetails ? (
                    <p className="text-center text-text-secondary">Cargando...</p> 
                  ) : (
                    <ul className="space-y-3">
                      {orderDetails.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-sm p-3 bg-background rounded-lg border border-ui-border text-text-primary">
                          <span>{item.quantity}x {item.product_name}</span>
                          <span className="font-bold text-primary">${item.subtotal?.toFixed(2)}</span>
                        </li>
                      ))}
                      {orderDetails.length === 0 && <li className="text-center text-text-muted">Sin detalles</li>}
                    </ul>
                  )}
                  <div className="mt-6 flex justify-end pt-4 border-t border-ui-border">
                    <p className="text-lg font-bold text-text-primary">Total: <span className="text-primary">${parseFloat(selectedOrder.total).toFixed(2)}</span></p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
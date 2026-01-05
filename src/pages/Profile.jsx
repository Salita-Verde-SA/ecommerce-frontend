import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { orderService } from '../services/orderService';
import { addressService } from '../services/addressService';
import { billService } from '../services/billService';
import { User, Package, MapPin, LogOut, Clock, CheckCircle, Truck, Trash2, Plus, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AddressForm from '../components/admin/AddressForm';
import ConfirmModal from '../components/ui/ConfirmModal';
import AlertModal from '../components/ui/AlertModal';

const Profile = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modales
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const showAlert = (type, title, message) => {
    setAlertModal({ isOpen: true, type, title, message });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        if (activeTab === 'orders') {
          const data = await orderService.getMyOrders(user.id_key);
          setOrders(data);
        } else if (activeTab === 'addresses') {
          const data = await addressService.getMyAddresses(user.id_key);
          const normalizedAddresses = data.map(addr => ({
            ...addr,
            id: addr.id || addr.id_key
          }));
          setAddresses(normalizedAddresses);
        } else if (activeTab === 'bills') {
          const data = await billService.getMyBills(user.id_key);
          setBills(data);
        }
      } catch (err) { 
        console.error(err);
        setError('Error al cargar los datos. Intente nuevamente.');
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, [activeTab, user.id_key]);

  const handleLogout = () => { 
    logout(); 
    navigate('/'); 
  };

  const handleDeleteAddress = (address) => {
    const addressId = address.id || address.id_key;
    if (!addressId) {
      showAlert('error', 'Error', 'No se pudo identificar la dirección para eliminar.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar dirección?',
      message: `Estás a punto de eliminar la dirección "${address.street}, ${address.city}". Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await addressService.delete(addressId);
          setAddresses(prevAddresses => prevAddresses.filter(a => (a.id || a.id_key) !== addressId));
          setConfirmModal({ ...confirmModal, isOpen: false });
          showAlert('success', 'Eliminada', 'La dirección ha sido eliminada correctamente.');
        } catch (err) {
          console.error(err);
          setConfirmModal({ ...confirmModal, isOpen: false });
          showAlert('error', 'Error', 'No se pudo eliminar la dirección.');
        } finally {
          setConfirmLoading(false);
        }
      }
    });
  };

  const handleAddAddress = () => {
    setIsAddressModalOpen(true);
  };

  const handleAddressSubmit = async (addressData) => {
    try {
      const newAddress = await addressService.create({ 
        street: addressData.street,
        number: addressData.number,
        city: addressData.city,
        client_id: user.id_key
      });
      
      const normalizedNewAddress = {
        ...newAddress,
        id: newAddress.id || newAddress.id_key
      };

      setAddresses([...addresses, normalizedNewAddress]);
      setIsAddressModalOpen(false);
      showAlert('success', 'Creada', 'La dirección ha sido creada correctamente.');
    } catch (err) {
      throw new Error('Error al crear la dirección');
    }
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'completed':
      case 'completado': 
        return <CheckCircle size={16} className="text-green-400" />;
      case 'shipped':
      case 'enviado': 
        return <Truck size={16} className="text-blue-400" />;
      default: 
        return <Clock size={16} className="text-yellow-400" />;
    }
  };

  const getStatusStyle = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'completed':
      case 'completado':
        return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'shipped':
      case 'enviado':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
    }
  };

  const tabClass = (tab) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab ? 'bg-primary text-black font-bold shadow-lg shadow-primary/20' : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface/80 border border-transparent hover:border-ui-border'}`;

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Perfil */}
        <div className="bg-surface rounded-3xl p-8 shadow-lg shadow-black/50 mb-8 flex flex-col md:flex-row items-center gap-6 border border-ui-border">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary text-2xl font-bold border border-primary/30">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-2xl font-bold text-text-primary">{user?.name} {user?.lastname}</h1>
            <p className="text-text-secondary">{user?.email}</p>
            <div className="mt-2 inline-block px-3 py-1 bg-background rounded-full text-xs font-bold text-primary border border-ui-border uppercase tracking-wider">
              {user?.role === 'admin' ? 'Administrador' : 'Cliente Registrado'}
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-colors font-bold border border-red-500/20">
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-2">
            <button onClick={() => setActiveTab('orders')} className={tabClass('orders')}><Package size={20} /> Mis Pedidos</button>
            <button onClick={() => setActiveTab('bills')} className={tabClass('bills')}><FileText size={20} /> Facturas</button>
            <button onClick={() => setActiveTab('addresses')} className={tabClass('addresses')}><MapPin size={20} /> Direcciones</button>
            <button onClick={() => setActiveTab('info')} className={tabClass('info')}><User size={20} /> Mis Datos</button>
          </div>

          <div className="md:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {activeTab === 'orders' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-xl font-bold text-text-primary mb-6">Historial de Compras</h2>
                    {orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="bg-surface p-6 rounded-2xl shadow-sm border border-ui-border hover:border-primary/30 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <span className="text-sm text-text-muted font-mono">Pedido #{order.id}</span>
                                <p className="font-bold text-text-primary">{order.date}</p>
                              </div>
                              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(order.status)}`}>
                                {getStatusIcon(order.status)} {order.status}
                              </div>
                            </div>
                            {order.details && order.details.length > 0 && (
                              <div className="border-t border-ui-border pt-4 mb-4">
                                <p className="text-sm text-text-secondary mb-2">Productos:</p>
                                <ul className="space-y-1">
                                  {order.details.map((detail, idx) => (
                                    <li key={idx} className="text-sm text-text-primary">
                                      {detail.quantity}x {detail.product_name || `Producto #${detail.product_id}`}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div className="border-t border-ui-border pt-4 flex justify-between items-center">
                              <span className="text-sm font-medium text-text-secondary">Total Pagado</span>
                              <span className="text-lg font-bold text-primary">${order.total?.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-surface rounded-2xl border border-dashed border-ui-border">
                        <Package size={48} className="mx-auto text-text-muted mb-4" />
                        <p className="text-text-secondary">No tienes pedidos aún.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'bills' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-xl font-bold text-text-primary mb-6">Mis Facturas</h2>
                    {bills.length > 0 ? (
                      <div className="bg-surface rounded-2xl shadow-sm border border-ui-border overflow-hidden">
                        <table className="w-full text-left">
                          <thead className="bg-background border-b border-ui-border">
                            <tr>
                              <th className="p-4 text-xs font-bold text-text-secondary uppercase">N° Factura</th>
                              <th className="p-4 text-xs font-bold text-text-secondary uppercase">Fecha</th>
                              <th className="p-4 text-xs font-bold text-text-secondary uppercase">Tipo Pago</th>
                              <th className="p-4 text-xs font-bold text-text-secondary uppercase text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-ui-border">
                            {bills.map(bill => (
                              <tr key={bill.id} className="hover:bg-white/5">
                                <td className="p-4 font-mono text-sm font-medium text-primary">{bill.bill_number}</td>
                                <td className="p-4 text-sm text-text-primary">{bill.date}</td>
                                <td className="p-4 text-sm text-text-secondary">{bill.payment_type}</td>
                                <td className="p-4 text-right font-bold text-text-primary">${bill.total?.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-surface rounded-2xl border border-dashed border-ui-border">
                        <FileText size={48} className="mx-auto text-text-muted mb-4" />
                        <p className="text-text-secondary">No tienes facturas aún.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'addresses' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-text-primary">Direcciones</h2>
                      <button onClick={handleAddAddress} className="flex items-center gap-2 text-black bg-primary font-bold hover:bg-primary-hover px-4 py-2 rounded-lg transition-colors">
                        <Plus size={18} /> Nueva
                      </button>
                    </div>
                    {addresses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map(addr => (
                          <div key={addr.id || addr.id_key} className="bg-surface p-5 rounded-xl border border-ui-border relative group">
                            <div className="flex items-start gap-3">
                              <MapPin className="text-primary mt-1" size={20} />
                              <div>
                                <p className="font-bold text-text-primary">{addr.street} {addr.number}</p>
                                <p className="text-sm text-text-secondary">{addr.city}</p>
                              </div>
                            </div>
                            <button onClick={() => handleDeleteAddress(addr)} className="absolute top-4 right-4 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-surface p-12 rounded-2xl text-center border border-ui-border">
                        <MapPin size={48} className="mx-auto text-text-muted mb-4" />
                        <p className="text-text-secondary">No tienes direcciones guardadas.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'info' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface p-8 rounded-2xl shadow-sm border border-ui-border">
                    <h2 className="text-xl font-bold text-text-primary mb-6">Información Personal</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-text-secondary block mb-1">Nombre</label>
                          <input disabled value={user?.name || ''} className="w-full p-3 bg-background rounded-xl border border-ui-border text-text-primary font-medium" />
                        </div>
                        <div>
                          <label className="text-sm text-text-secondary block mb-1">Apellido</label>
                          <input disabled value={user?.lastname || ''} className="w-full p-3 bg-background rounded-xl border border-ui-border text-text-primary font-medium" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-text-secondary block mb-1">Email</label>
                          <input disabled value={user?.email || ''} className="w-full p-3 bg-background rounded-xl border border-ui-border text-text-primary" />
                        </div>
                        <div>
                          <label className="text-sm text-text-secondary block mb-1">Teléfono</label>
                          <input disabled value={user?.telephone || ''} className="w-full p-3 bg-background rounded-xl border border-ui-border text-text-primary" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modales */}
        <AddressForm 
          isOpen={isAddressModalOpen} 
          onClose={() => setIsAddressModalOpen(false)} 
          onSubmit={handleAddressSubmit} 
        />
        
        <ConfirmModal 
          isOpen={confirmModal.isOpen} 
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} 
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          type="danger"
          loading={confirmLoading}
        />
        
        <AlertModal 
          isOpen={alertModal.isOpen} 
          onClose={() => setAlertModal({ ...alertModal, isOpen: false })} 
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
        />
      </div>
    </div>
  );
};

export default Profile;
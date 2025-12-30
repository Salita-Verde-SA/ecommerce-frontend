import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, CreditCard, MapPin, Plus, Check, X, Calendar, Lock, Loader, AlertCircle } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { addressService } from '../services/addressService';
import { orderService } from '../services/orderService';
import AlertModal from '../components/ui/AlertModal';
import { motion, AnimatePresence } from 'framer-motion';

const Checkout = () => {
  const { cart, getTotalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const totalPrice = getTotalPrice();
  const shippingCost = totalPrice > 500 ? 0 : 25;
  const finalTotal = totalPrice + shippingCost;

  // Estados de Dirección
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  // CORRECCIÓN: Eliminados state y zip_code para consistencia con el backend
  const [newAddress, setNewAddress] = useState({ street: '', number: '', city: '' });

  // Estados de Tarjeta
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvc: '' });

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  // Redirección de seguridad
  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    if (cart.length === 0 && !success) navigate('/');
  }, [isAuthenticated, cart, navigate, success]);

  // Cargar Direcciones
  useEffect(() => {
    if (isAuthenticated && user?.id_key) {
      loadAddresses();
    }
  }, [isAuthenticated, user]);

  const loadAddresses = async () => {
    try {
      const data = await addressService.getMyAddresses(user.id_key);
      
      const normalizedAddresses = data.map(addr => ({
        ...addr,
        id: addr.id || addr.id_key 
      }));

      setAddresses(normalizedAddresses);

      if (normalizedAddresses.length > 0) {
        setSelectedAddressId(normalizedAddresses[0].id);
        setIsAddingAddress(false);
      } else {
        setIsAddingAddress(true);
      }
    } catch (error) { 
      console.error("Error cargando direcciones:", error); 
    }
  };

  const handleAddressChange = (e) => setNewAddress({ ...newAddress, [e.target.name]: e.target.value });

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    if (name === 'number') {
      const v = value.replace(/\D/g, '').slice(0, 16);
      const parts = [];
      for (let i = 0; i < v.length; i += 4) parts.push(v.slice(i, i + 4));
      setCardData({ ...cardData, number: parts.join(' ') });
    } else if (name === 'cvc') {
      setCardData({ ...cardData, cvc: value.replace(/\D/g, '').slice(0, 3) });
    } else if (name === 'expiry') {
      let v = value.replace(/\D/g, '').slice(0, 4);
      if (v.length >= 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
      setCardData({ ...cardData, expiry: v });
    } else {
      setCardData({ ...cardData, [name]: value });
    }
  };

  const showAlert = (type, title, message) => setAlertModal({ isOpen: true, type, title, message });

  const handlePayment = async () => {
    let finalAddressId = selectedAddressId;
    setLoading(true);

    try {
      // 1. Procesar Dirección (Nueva o Existente)
      if (isAddingAddress) {
        if (!newAddress.street || !newAddress.city) {
          setLoading(false);
          return showAlert('error', 'Dirección Incompleta', 'Calle y Ciudad son obligatorios.');
        }
        
        const savedAddr = await addressService.create({ ...newAddress, client_id: user.id_key });
        finalAddressId = savedAddr.id || savedAddr.id_key;
        
      } else if (!finalAddressId) {
        setLoading(false);
        return showAlert('warning', 'Falta Dirección', 'Selecciona dónde enviar tu pedido.');
      }

      // 2. Validar Tarjeta
      if (cardData.number.replace(/\s/g, '').length < 16 || cardData.cvc.length < 3 || cardData.expiry.length < 5) {
        setLoading(false);
        return showAlert('error', 'Datos de Pago', 'Revisa los datos de tu tarjeta.');
      }

      // 3. Crear Orden
      const orderPayload = {
        client_id: user.id_key,
        total: finalTotal,
        status: "PENDING",
        payment_type: "CREDIT_CARD",
        address_id: finalAddressId,
        details: cart.map(i => ({ product_id: i.id_key, quantity: i.quantity, price: i.price }))
      };

      await orderService.createOrder(orderPayload);
      
      clearCart();
      setSuccess(true);
    } catch (error) {
      console.error(error);
      showAlert('error', 'Error', 'No se pudo procesar el pedido. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 text-primary border border-primary/50 shadow-[0_0_30px_rgba(204,255,0,0.3)]">
          <CheckCircle size={48} />
        </motion.div>
        <h2 className="text-3xl font-bold text-text-primary mb-2">¡Pago Exitoso!</h2>
        <p className="text-text-secondary mb-8 max-w-md">Tu orden ha sido procesada y se está preparando para el envío.</p>
        <div className="flex gap-4">
          <button onClick={() => navigate('/profile')} className="bg-surface border border-ui-border hover:border-primary text-text-primary px-6 py-3 rounded-xl font-bold transition-all">Ver Pedidos</button>
          <button onClick={() => navigate('/')} className="bg-primary hover:bg-primary-hover text-black px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all">Seguir Comprando</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link to="/cart" className="inline-flex items-center text-text-secondary hover:text-primary transition-colors text-sm font-medium group">
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Volver al Carrito
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-8 tracking-tight">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: FORMULARIOS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. SECCIÓN DIRECCIÓN */}
            <div className="bg-surface rounded-2xl border border-ui-border p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-ui-border pb-4">
                <h3 className="font-bold text-text-primary flex items-center gap-2 text-lg">
                  <MapPin className="text-primary" size={20}/> Dirección de Envío
                </h3>
                {!isAddingAddress && (
                  <button onClick={() => { setIsAddingAddress(true); setSelectedAddressId(null); }} className="text-xs font-bold text-primary hover:underline flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 transition-colors">
                    <Plus size={14}/> Nueva Dirección
                  </button>
                )}
                {isAddingAddress && addresses.length > 0 && (
                  <button onClick={() => { setIsAddingAddress(false); if(addresses.length > 0) setSelectedAddressId(addresses[0].id); }} className="text-xs text-text-secondary hover:text-primary flex items-center gap-1 bg-surface border border-ui-border px-3 py-1.5 rounded-lg transition-colors">
                    <X size={14}/> Cancelar
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* LISTA DE DIRECCIONES */}
                {!isAddingAddress && addresses.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div 
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all relative flex items-start gap-3 group ${
                          selectedAddressId === addr.id 
                            ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/50' 
                            : 'bg-background border-ui-border hover:border-primary/50'
                        }`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                           selectedAddressId === addr.id ? 'border-primary bg-primary' : 'border-ui-border group-hover:border-primary/50'
                        }`}>
                          {selectedAddressId === addr.id && <Check size={12} className="text-black stroke-[3]"/>}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-text-primary">{addr.street} {addr.number}</p>
                          <p className="text-xs text-text-secondary mt-0.5">{addr.city}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* FORMULARIO DE NUEVA DIRECCIÓN */}
                {(isAddingAddress || addresses.length === 0) && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-background/50 p-6 rounded-xl border border-dashed border-ui-border">
                    <div className="flex items-center gap-2 mb-4 text-sm text-primary font-bold">
                       <Plus size={16}/> Ingresa los datos del nuevo destino
                    </div>
                    {/* Campos alineados con backend: Calle, Número, Ciudad */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-xs text-text-secondary uppercase font-bold ml-1 mb-1 block">Calle</label>
                        <input name="street" value={newAddress.street} onChange={handleAddressChange} className="w-full p-3 bg-surface border border-ui-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Ej: Av. Corrientes" />
                      </div>
                      <div>
                        <label className="text-xs text-text-secondary uppercase font-bold ml-1 mb-1 block">Número / Altura</label>
                        <input name="number" value={newAddress.number} onChange={handleAddressChange} className="w-full p-3 bg-surface border border-ui-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="1234" />
                      </div>
                      <div>
                        <label className="text-xs text-text-secondary uppercase font-bold ml-1 mb-1 block">Ciudad</label>
                        <input name="city" value={newAddress.city} onChange={handleAddressChange} className="w-full p-3 bg-surface border border-ui-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Ciudad Autónoma de Buenos Aires" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* 2. SECCIÓN PAGO */}
            <div className="bg-surface rounded-2xl border border-ui-border p-6 shadow-sm">
              <h3 className="font-bold text-text-primary flex items-center gap-2 mb-6 text-lg border-b border-ui-border pb-4">
                <CreditCard className="text-primary" size={20}/> Método de Pago
              </h3>
              <div className="space-y-5 max-w-lg">
                <div className="relative group">
                  <label className="text-xs text-text-secondary uppercase font-bold ml-1 mb-1 block">Número de Tarjeta</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3.5 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                    <input name="number" value={cardData.number} onChange={handleCardChange} maxLength="19" className="w-full pl-10 p-3 bg-background border border-ui-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono tracking-wide transition-all" placeholder="0000 0000 0000 0000" />
                  </div>
                </div>
                
                <div>
                   <label className="text-xs text-text-secondary uppercase font-bold ml-1 mb-1 block">Titular de la Tarjeta</label>
                   <input name="name" value={cardData.name} onChange={handleCardChange} className="w-full p-3 bg-background border border-ui-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Como figura en el plástico" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <label className="text-xs text-text-secondary uppercase font-bold ml-1 mb-1 block">Vencimiento</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3.5 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                      <input name="expiry" value={cardData.expiry} onChange={handleCardChange} maxLength="5" className="w-full pl-10 p-3 bg-background border border-ui-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="MM/YY" />
                    </div>
                  </div>
                  <div className="relative group">
                    <label className="text-xs text-text-secondary uppercase font-bold ml-1 mb-1 block">Código de Seguridad</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                      <input name="cvc" type="password" value={cardData.cvc} onChange={handleCardChange} maxLength="3" className="w-full pl-10 p-3 bg-background border border-ui-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="123" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: RESUMEN Y ACCIÓN */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-2xl shadow-xl shadow-black/5 border border-ui-border p-6 sticky top-24 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20"></div>
               <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">Confirmación</h2>
               
               <div className="mb-6 max-h-48 overflow-y-auto pr-2 space-y-3 border-b border-ui-border pb-6 custom-scrollbar">
                 {cart.map(item => (
                   <div key={item.id} className="flex justify-between items-start text-sm">
                     <div className="flex gap-2">
                        <span className="font-bold text-primary bg-primary/10 w-6 h-6 flex items-center justify-center rounded text-xs">{item.quantity}</span>
                        <span className="text-text-secondary line-clamp-2">{item.name}</span>
                     </div>
                     <span className="font-mono text-text-primary font-medium ml-2">${(item.price * item.quantity).toFixed(2)}</span>
                   </div>
                 ))}
               </div>

               <div className="space-y-3 mb-6 pb-6 border-b border-ui-border">
                  <div className="flex justify-between text-text-secondary text-sm"><span>Subtotal</span> <span className="font-mono">${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between text-text-secondary text-sm">
                    <span>Envío</span> 
                    {shippingCost === 0 ? (
                      <span className="text-primary font-bold text-xs bg-primary/10 px-2 py-0.5 rounded">GRATIS</span>
                    ) : (
                      <span className="font-mono">${shippingCost.toFixed(2)}</span>
                    )}
                  </div>
               </div>
               
               <div className="flex justify-between items-end mb-8">
                  <span className="text-lg font-bold text-text-primary">Total a Pagar</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-primary tracking-tight block">${finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">Impuestos incluidos</span>
                  </div>
               </div>
               
               <button onClick={handlePayment} disabled={loading} className="w-full bg-primary hover:bg-primary-hover text-black py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed group">
                 {loading ? <Loader className="animate-spin" size={24}/> : (
                   <>Confirmar Pago <CheckCircle size={20} className="group-hover:scale-110 transition-transform"/></>
                 )}
               </button>
               
               <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-text-muted opacity-70">
                 <Lock size={10}/> 
                 <span>Transacción encriptada de extremo a extremo</span>
               </div>
            </div>
          </div>
        </div>
      </div>
      <AlertModal isOpen={alertModal.isOpen} onClose={() => setAlertModal({...alertModal, isOpen: false})} title={alertModal.title} message={alertModal.message} type={alertModal.type} />
    </div>
  );
};

export default Checkout;
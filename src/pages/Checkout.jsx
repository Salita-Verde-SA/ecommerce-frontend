import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, CreditCard, MapPin, Plus, Check, X, Calendar, Lock, Loader, AlertCircle } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { addressService } from '../services/addressService';
import { orderService } from '../services/orderService';
import { billService } from '../services/billService';
import { orderDetailService } from '../services/orderDetailService';
import AlertModal from '../components/ui/AlertModal';
import { motion, AnimatePresence } from 'framer-motion';

const Checkout = () => {
  const { cart, getTotalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const totalPrice = getTotalPrice();
  const shippingCost = totalPrice > 20 ? 0 : 5;
  const finalTotal = totalPrice + shippingCost;

  // Estado de direcciones de envío
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  // Campos state y zip_code eliminados por consistencia con el esquema del backend
  const [newAddress, setNewAddress] = useState({ street: '', number: '', city: '' });

  // Estado de datos de tarjeta de pago
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvc: '' });

  // Validación en tiempo real de la tarjeta
  const getCardType = (number) => {
    const digits = number.replace(/\s/g, '');
    if (!digits) return null;
    
    // Visa: comienza con 4
    if (/^4/.test(digits)) return 'visa';
    
    // Mastercard: comienza con 51-55 o 2221-2720
    if (/^5[1-5]/.test(digits) || /^2(2[2-9][1-9]|2[3-9]\d|[3-6]\d{2}|7[01]\d|720)/.test(digits)) return 'mastercard';
    
    return 'unknown';
  };

  const validateExpiry = (expiry) => {
    if (!expiry) return { isValid: null, message: '' };
    
    const parts = expiry.split('/');
    const monthStr = parts[0] || '';
    const yearStr = parts[1] || '';
    
    // Validar mes
    if (monthStr.length >= 1) {
      const monthNum = parseInt(monthStr, 10);
      if (monthStr.length === 2 && (monthNum < 1 || monthNum > 12)) {
        return { isValid: false, message: 'Mes inválido (01-12)' };
      }
      if (monthStr.length === 1 && monthNum > 1 && monthNum !== 0) {
        // Si el primer dígito es > 1, no puede formar un mes válido excepto si es 0X
      }
    }
    
    // Si no hay año todavía
    if (!yearStr) {
      if (monthStr.length === 2) {
        const monthNum = parseInt(monthStr, 10);
        if (monthNum >= 1 && monthNum <= 12) {
          return { isValid: null, message: 'Ingresa el año' };
        }
      }
      return { isValid: null, message: '' };
    }
    
    // Validar año completo
    if (yearStr.length === 2) {
      const month = parseInt(monthStr, 10);
      const year = 2000 + parseInt(yearStr, 10);
      
      if (month < 1 || month > 12) {
        return { isValid: false, message: 'Mes inválido (01-12)' };
      }
      
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      
      if (year < currentYear) {
        return { isValid: false, message: 'Tarjeta vencida' };
      }
      
      if (year === currentYear && month < currentMonth) {
        return { isValid: false, message: 'Tarjeta vencida' };
      }
      
      return { isValid: true, message: `Válida hasta ${monthStr}/${yearStr}` };
    }
    
    return { isValid: null, message: '' };
  };

  const cardType = getCardType(cardData.number);
  const expiryValidation = validateExpiry(cardData.expiry);

  // Estado de interfaz de usuario
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState({ isOpen: false, orderId: null });
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info', onCloseAction: null });
  
  // Flag para evitar redirección durante proceso de compra exitosa
  const [purchaseCompleted, setPurchaseCompleted] = useState(false);

  // Verificación de autenticación y contenido del carrito
  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    // Solo redirigir si el carrito está vacío Y no se ha completado una compra
    if (cart.length === 0 && !successModal.isOpen && !purchaseCompleted) navigate('/');
  }, [isAuthenticated, cart, navigate, successModal.isOpen, purchaseCompleted]);

  // Carga de direcciones del usuario autenticado
  useEffect(() => {
    if (isAuthenticated && user?.id_key) {
      loadAddresses();
    }
  }, [isAuthenticated, user]);

  const loadAddresses = async () => {
    try {
      const data = await addressService.getMyAddresses(user.id_key);
      
      // Normalización de direcciones asegurando la existencia del campo 'id'
      const normalizedAddresses = data.map(addr => {
        const normalizedId = addr.id_key || addr.id;
        return {
          ...addr,
          id: normalizedId,
          id_key: normalizedId
        };
      });

      setAddresses(normalizedAddresses);

      if (normalizedAddresses.length > 0) {
        // Selección automática de la primera dirección disponible
        const firstAddressId = normalizedAddresses[0].id;
        setSelectedAddressId(firstAddressId);
        setIsAddingAddress(false);
      } else {
        // Presentación del formulario si no existen direcciones
        setSelectedAddressId(null);
        setIsAddingAddress(true);
      }
    } catch (error) { 
      console.error("Error cargando direcciones:", error); 
    }
  };

  const handleAddressChange = (e) => setNewAddress({ ...newAddress, [e.target.name]: e.target.value });

  // Guardado de nueva dirección sin proceder al pago
  const handleSaveNewAddress = async () => {
    if (!newAddress.street || !newAddress.city) {
      return showAlert('error', 'Dirección Incompleta', 'Calle y Ciudad son obligatorios.');
    }
    
    setLoading(true);
    try {
      const savedAddr = await addressService.create({ ...newAddress, client_id: user.id_key });
      const newAddrId = savedAddr.id_key || savedAddr.id;
      
      // Recarga de la lista de direcciones
      await loadAddresses();
      
      // Selección de la nueva dirección posterior a la recarga
      setTimeout(() => {
        setSelectedAddressId(newAddrId);
        setIsAddingAddress(false);
      }, 100);
      
      // Limpieza del formulario
      setNewAddress({ street: '', number: '', city: '' });
      
      showAlert('success', '¡Guardada!', 'La dirección ha sido guardada correctamente.');
    } catch (error) {
      console.error(error);
      showAlert('error', 'Error', 'No se pudo guardar la dirección. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

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

  // Validación de fecha de expiración de tarjeta
  const isCardExpired = (expiry) => {
    if (!expiry || expiry.length < 5) return true;
    
    const [monthStr, yearStr] = expiry.split('/');
    const month = parseInt(monthStr, 10);
    const year = parseInt(`20${yearStr}`, 10); // Formato de año asumido: 20XX
    
    if (isNaN(month) || isNaN(year)) return true;
    if (month < 1 || month > 12) return true;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() retorna índice base 0
    
    // Verificación de expiración por año
    if (year < currentYear) return true;
    
    // Verificación de expiración por mes si el año es el actual
    if (year === currentYear && month < currentMonth) return true;
    
    return false;
  };

  const showAlert = (type, title, message, onCloseAction = null) => setAlertModal({ isOpen: true, type, title, message, onCloseAction });

  // Cierre del modal y ejecución de acción posterior opcional
  const handleCloseAlert = () => {
    const action = alertModal.onCloseAction;
    setAlertModal({ ...alertModal, isOpen: false, onCloseAction: null });
    
    // Ejecución de la acción después del cierre si existe
    if (action) {
      action();
    }
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      let finalAddressId = null;

      // 1. Procesamiento de dirección (nueva o existente)
      if (isAddingAddress) {
        // Creación de nueva dirección
        if (!newAddress.street || !newAddress.city) {
          setLoading(false);
          return showAlert('error', 'Dirección Incompleta', 'Calle y Ciudad son obligatorios.');
        }
        
        const savedAddr = await addressService.create({ ...newAddress, client_id: user.id_key });
        finalAddressId = savedAddr.id_key || savedAddr.id;
        
      } else {
        // Utilización de dirección seleccionada existente
        if (!selectedAddressId && addresses.length === 0) {
          setLoading(false);
          return showAlert('warning', 'Falta Dirección', 'Debes agregar una dirección de envío.');
        }
        
        if (!selectedAddressId && addresses.length > 0) {
          finalAddressId = addresses[0].id;
        } else {
          finalAddressId = selectedAddressId;
        }
      }

      // Validación final de dirección
      if (!finalAddressId) {
        setLoading(false);
        return showAlert('warning', 'Falta Dirección', 'Selecciona dónde enviar tu pedido.');
      }

      // 2. Validar Tarjeta - Número y CVC
      if (cardData.number.replace(/\s/g, '').length < 16) {
        setLoading(false);
        return showAlert('error', 'Número de Tarjeta Inválido', 'El número de tarjeta debe tener 16 dígitos.');
      }
      
      if (cardData.cvc.length < 3) {
        setLoading(false);
        return showAlert('error', 'Código de Seguridad Inválido', 'El código de seguridad (CVC) debe tener 3 dígitos.');
      }
      
      if (cardData.expiry.length < 5) {
        setLoading(false);
        return showAlert('error', 'Fecha de Vencimiento Inválida', 'Ingresa la fecha de vencimiento en formato MM/YY.');
      }
      
      // 3. Validación de fecha de expiración de la tarjeta
      if (isCardExpired(cardData.expiry)) {
        setLoading(false);
        return showAlert('error', 'Tarjeta Expirada', 'La tarjeta ingresada está vencida. Por favor usa otra tarjeta.');
      }
      
      // 4. Validación del nombre del titular
      if (!cardData.name || cardData.name.trim().length < 3) {
        setLoading(false);
        return showAlert('error', 'Nombre del Titular', 'Ingresa el nombre del titular de la tarjeta.');
      }

      // 5. Creación de factura (requerida por el esquema de Order)
      const billPayload = {
        total: finalTotal,
        discount: shippingCost === 0 ? 25 : 0,
        payment_type: 'card',
        client_id: user.id_key
      };
      
      let createdBill;
      try {
        createdBill = await billService.create(billPayload);
      } catch (billError) {
        console.error('Error creando factura:', billError);
        console.error('Response data:', billError.response?.data);
        
        let errorMsg = 'Error al crear la factura.';
        if (billError.response?.data?.detail) {
          const detail = billError.response.data.detail;
          if (typeof detail === 'string') {
            errorMsg = detail;
          } else if (Array.isArray(detail)) {
            errorMsg = detail.map(err => {
              const field = err.loc?.join('.') || 'campo';
              return `${field}: ${err.msg}`;
            }).join(' | ');
          }
        }
        throw new Error(errorMsg);
      }
      
      const billId = createdBill.id_key || createdBill.id;

      // 6. Creación de orden con el identificador de factura
      const orderPayload = {
        client_id: parseInt(user.id_key),
        bill_id: parseInt(billId),
        total: parseFloat(finalTotal),
        delivery_method: 3,
        status: 1
      };

      let createdOrder;
      try {
        createdOrder = await orderService.createOrder(orderPayload);
      } catch (orderError) {
        console.error('Error creando orden:', orderError);
        const errorMsg = orderError.response?.data?.detail;
        throw new Error(typeof errorMsg === 'string' ? errorMsg : 'Error al crear la orden.');
      }
      
      const orderId = createdOrder.id_key || createdOrder.id;

      // 7. Creación de detalles de orden para cada producto del carrito
      for (const item of cart) {
        try {
          await orderDetailService.create({
            order_id: parseInt(orderId),
            product_id: parseInt(item.id_key || item.id),
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price)
          });
        } catch (detailError) {
          console.error('Error creando detalle:', detailError);
          const errorMsg = detailError.response?.data?.detail;
          if (typeof errorMsg === 'string' && errorMsg.includes('stock')) {
            throw new Error(`Stock insuficiente para "${item.name}".`);
          }
          throw new Error(typeof errorMsg === 'string' ? errorMsg : `Error al agregar "${item.name}" al pedido.`);
        }
      }
      
      // Marcar compra como completada para evitar redirección automática
      setPurchaseCompleted(true);
      
      // Mostrar modal de éxito
      setSuccessModal({ isOpen: true, orderId: orderId });
      
      // Limpiar carrito después de mostrar el modal
      clearCart();
      
    } catch (error) {
      console.error('Error en checkout:', error);
      
      let errorMessage = error.message || 'No se pudo procesar el pedido. Inténtalo nuevamente.';
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map(err => {
            const field = err.loc?.slice(-1)[0] || 'campo';
            return `${field}: ${err.msg}`;
          }).join('. ');
        }
      }
      
      showAlert('error', 'Error en el Pedido', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* MODAL DE COMPRA EXITOSA */}
      <AnimatePresence>
        {successModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface rounded-3xl p-8 max-w-md w-full text-center border border-ui-border shadow-2xl relative overflow-hidden"
            >
              {/* Línea decorativa superior */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20"></div>
              
              {/* Icono de éxito */}
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary border border-primary/50 shadow-[0_0_30px_rgba(204,255,0,0.3)]"
              >
                <CheckCircle size={40} />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-text-primary mb-2">¡Compra Exitosa!</h2>
              <p className="text-text-secondary mb-2">Tu pedido ha sido procesado correctamente.</p>
              
              {/* Número de orden */}
              <div className="bg-background rounded-xl p-4 mb-6 border border-ui-border">
                <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Número de Pedido</span>
                <span className="text-2xl font-bold text-primary font-mono">#{successModal.orderId}</span>
              </div>
              
              <p className="text-sm text-text-muted mb-6">
                Recibirás un correo electrónico con los detalles del envío.
              </p>
              
              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => { setSuccessModal({ isOpen: false, orderId: null }); navigate('/profile'); }}
                  className="flex-1 bg-surface border border-ui-border hover:border-primary text-text-primary px-5 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  Ver Mis Pedidos
                </button>
                <button 
                  onClick={() => { setSuccessModal({ isOpen: false, orderId: null }); navigate('/'); }}
                  className="flex-1 bg-primary hover:bg-primary-hover text-black px-5 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  Seguir Comprando
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    
                    {/* Botón para guardar la dirección */}
                    <div className="mt-6 flex justify-end gap-3">
                      {addresses.length > 0 && (
                        <button 
                          type="button"
                          onClick={() => { setIsAddingAddress(false); if(addresses.length > 0) setSelectedAddressId(addresses[0].id); }}
                          className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary bg-surface border border-ui-border rounded-xl transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                      <button 
                        type="button"
                        onClick={handleSaveNewAddress}
                        disabled={loading}
                        className="px-6 py-2.5 text-sm font-bold bg-primary hover:bg-primary-hover text-black rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-70"
                      >
                        {loading ? <Loader className="animate-spin" size={16}/> : <><Check size={16}/> Guardar Dirección</>}
                      </button>
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
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-text-secondary uppercase font-bold ml-1">Número de Tarjeta</label>
                    {/* Indicador de tipo de tarjeta */}
                    {cardType && cardData.number.length > 0 && (
                      <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1.5 ${
                        cardType === 'visa' 
                          ? 'bg-[#1a1f71]/10 border border-[#1a1f71]/30' 
                          : cardType === 'mastercard' 
                            ? 'bg-[#eb001b]/10 border border-[#eb001b]/30'
                            : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      }`}>
                        {cardType === 'visa' && (
                          <svg viewBox="0 0 48 16" className="h-4 w-auto">
                            <path fill="#1a1f71" d="M19.5 1.5l-2.3 13h-2.9l2.3-13h2.9zm11.6 8.4l1.5-4.2.9 4.2h-2.4zm3.2 4.6h2.7l-2.4-13h-2.5c-.6 0-1 .3-1.2.8l-4.3 12.2h3l.6-1.7h3.7l.4 1.7zm-8.1-4.2c0-3.4-4.7-3.6-4.7-5.1 0-.5.5-.9 1.4-.9.8 0 1.7.1 2.5.5l.4-2.3c-.8-.3-1.6-.5-2.7-.5-2.8 0-4.8 1.5-4.8 3.7 0 1.6 1.4 2.5 2.5 3 1.1.6 1.5.9 1.5 1.5 0 .8-.9 1.2-1.7 1.2-1 0-2-.3-2.9-.7l-.4 2.3c.9.4 1.9.6 3.1.6 3 0 4.9-1.5 4.9-3.8l-.1.5zM12.3 1.5L7.8 14.5H4.6L2.4 3.9c-.1-.5-.3-.7-.7-.9C1 2.7.1 2.4-.9 2.1l.1-.6h4.8c.6 0 1.2.4 1.3 1.1l1.2 6.3 2.9-7.4h3z"/>
                          </svg>
                        )}
                        {cardType === 'mastercard' && (
                          <svg viewBox="0 0 48 30" className="h-4 w-auto">
                            <circle fill="#eb001b" cx="15" cy="15" r="15"/>
                            <circle fill="#f79e1b" cx="33" cy="15" r="15"/>
                            <path fill="#ff5f00" d="M18 15c0-4.1 1.7-7.9 4.5-10.6C20.2 2.1 17.2 1 14 1 6.8 1 1 7.8 1 16s5.8 15 13 15c3.2 0 6.2-1.1 8.5-3.4C19.7 24.9 18 21.1 18 17v-2z"/>
                          </svg>
                        )}
                        {cardType === 'unknown' && (
                          <><CreditCard size={14} /> Desconocida</>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3.5 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                    <input name="number" value={cardData.number} onChange={handleCardChange} maxLength="19" className="w-full pl-10 p-3 bg-background border border-ui-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono tracking-wide transition-all" placeholder="0000 0000 0000 0000" />
                  </div>
                </div>
                
                <div>
                   <label className="text-xs text-text-secondary uppercase font-bold ml-1 mb-1 block">Titular de la Tarjeta</label>
                   <input name="name" value={cardData.name} onChange={handleCardChange} className="w-full p-3 bg-background border border-ui-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Como figura en el plástico" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative group">
                    <label className="text-xs text-text-secondary uppercase font-bold ml-1 mb-1 block">Vencimiento</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3.5 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                      <input 
                        name="expiry" 
                        value={cardData.expiry} 
                        onChange={handleCardChange} 
                        maxLength="5" 
                        className={`w-full pl-10 p-3 bg-background border rounded-xl text-sm outline-none transition-all ${
                          expiryValidation.isValid === false 
                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                            : expiryValidation.isValid === true 
                              ? 'border-green-500 focus:border-green-500 focus:ring-1 focus:ring-green-500'
                              : 'border-ui-border focus:border-primary focus:ring-1 focus:ring-primary'
                        }`} 
                        placeholder="MM/YY" 
                      />
                    </div>
                    {/* Mensaje de validación de fecha */}
                    {cardData.expiry && expiryValidation.message && (
                      <p className={`text-xs mt-1 ml-1 flex items-center gap-1 ${
                        expiryValidation.isValid === false 
                          ? 'text-red-400' 
                          : expiryValidation.isValid === true 
                            ? 'text-green-400'
                            : 'text-text-muted'
                      }`}>
                        {expiryValidation.isValid === false && <AlertCircle size={12} />}
                        {expiryValidation.isValid === true && <CheckCircle size={12} />}
                        {expiryValidation.message}
                      </p>
                    )}
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
      <AlertModal 
        isOpen={alertModal.isOpen} 
        onClose={handleCloseAlert} 
        title={alertModal.title} 
        message={alertModal.message} 
        type={alertModal.type} 
      />
      </div>
    </>
  );
};

export default Checkout;
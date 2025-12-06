import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { orderService } from '../services/orderService';
import { CheckCircle, CreditCard, MapPin, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const Checkout = () => {
  const { cart, getTotalPrice, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({ expiry: '', cvc: '', number: '' });

  const handleExpiryChange = (e) => { let v = e.target.value.replace(/\D/g, ''); if(v.length>4) v=v.slice(0,4); if(v.length>=3) v=`${v.slice(0,2)}/${v.slice(2)}`; setCardData({...cardData, expiry: v}); };
  const handleCvcChange = (e) => { let v = e.target.value.replace(/\D/g, ''); if(v.length>3) v=v.slice(0,3); setCardData({...cardData, cvc: v}); };
  const handleNumberChange = (e) => { let v = e.target.value.replace(/\D/g, ''); if(v.length>16) v=v.slice(0,16); v=v.replace(/(\d{4})(?=\d)/g, '$1 '); setCardData({...cardData, number: v}); };

  if (cart.length === 0 && step === 1) { setTimeout(() => navigate('/'), 0); return null; }

  const handlePayment = async (e) => {
    e.preventDefault();
    if (cardData.cvc.length < 3) return alert("CVC inválido");
    setLoading(true);
    try {
      await orderService.createOrder({ client_id: user.id, total: getTotalPrice(), status: "PENDING", payment_type: "CREDIT_CARD", details: cart.map(i => ({ product_id: i.id, quantity: i.quantity, price: i.price })) });
      clearCart(); setStep(2);
    } catch (error) { alert("Error al procesar."); } finally { setLoading(false); }
  };

  if (step === 2) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center bg-background">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 text-primary border border-primary/50 shadow-[0_0_30px_rgba(204,255,0,0.3)]">
          <CheckCircle size={48} />
        </motion.div>
        <h2 className="text-3xl font-bold text-text-primary mb-2">¡Pedido Confirmado!</h2>
        <p className="text-text-secondary mb-8 max-w-md">Tu orden ha sido registrada en el sistema.</p>
        <button onClick={() => navigate('/profile')} className="bg-primary hover:bg-primary-hover text-black px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/20">Ver Mis Pedidos</button>
      </div>
    );
  }

  const inputClass = "p-3 border border-ui-border rounded-xl w-full bg-background text-text-primary focus:ring-1 focus:ring-primary outline-none placeholder-text-muted transition-all";

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Finalizar Compra</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface p-8 rounded-2xl shadow-lg border border-ui-border">
            <div className="flex items-center gap-3 mb-6"><MapPin className="text-primary" /><h2 className="text-xl font-bold text-text-primary">Dirección</h2></div>
            <form id="checkout-form" onSubmit={handlePayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4"><input required placeholder="Nombre" className={inputClass} /><input required placeholder="Apellido" className={inputClass} /></div>
              <input required placeholder="Dirección" className={inputClass} />
              <div className="grid grid-cols-2 gap-4"><input required placeholder="Ciudad" className={inputClass} /><input required placeholder="CP" className={inputClass} /></div>
              
              <div className="mt-8 pt-8 border-t border-ui-border">
                <div className="flex items-center gap-3 mb-6"><CreditCard className="text-primary" /><h2 className="text-xl font-bold text-text-primary">Pago</h2></div>
                <input required value={cardData.number} onChange={handleNumberChange} placeholder="Número de Tarjeta" className={`${inputClass} mb-4`} maxLength="19" />
                <div className="grid grid-cols-2 gap-4"><input required value={cardData.expiry} onChange={handleExpiryChange} placeholder="MM/YY" className={inputClass} maxLength="5" /><input required value={cardData.cvc} onChange={handleCvcChange} placeholder="CVC" className={inputClass} maxLength="3" type="password" /></div>
              </div>
            </form>
          </div>

          <div>
             <div className="bg-surface p-8 rounded-2xl shadow-lg border border-ui-border sticky top-24">
                <h2 className="text-xl font-bold text-text-primary mb-6">Tu Pedido</h2>
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm text-text-secondary"><span className="text-text-primary font-medium">{item.quantity}x {item.name}</span><span>${(item.price * item.quantity).toLocaleString()}</span></div>
                  ))}
                </div>
                <div className="border-t border-ui-border pt-4 flex justify-between items-center mb-6"><span className="font-bold text-lg text-text-primary">Total</span><span className="font-bold text-2xl text-primary">${getTotalPrice().toLocaleString()}</span></div>
                {!isAuthenticated ? <div className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 p-4 rounded-xl text-sm mb-4">Debes iniciar sesión.<button onClick={() => navigate('/login')} className="block mt-2 font-bold underline">Login</button></div> : (
                  <button form="checkout-form" type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-hover text-black py-4 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 disabled:opacity-70">{loading ? <Loader className="animate-spin text-black" /> : "Confirmar Pago"}</button>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
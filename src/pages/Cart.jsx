import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ArrowRight, PackageX } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import CartItem from '../components/cart/CartItem';
import { motion } from 'framer-motion';

const Cart = () => {
  const { cart, getTotalPrice, getTotalItems } = useCartStore();
  const navigate = useNavigate();
  const totalPrice = getTotalPrice();
  const shippingCost = totalPrice > 500 ? 0 : 25;
  const finalTotal = totalPrice + shippingCost;

  const handleCheckout = () => navigate('/checkout');

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-background">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 text-text-muted border border-ui-border shadow-inner"
        >
          <PackageX size={40} />
        </motion.div>
        <h2 className="text-2xl font-bold text-text-primary mb-2 tracking-tight">Tu carrito está vacío</h2>
        <p className="text-text-secondary mb-8 text-center max-w-md font-light">
          Parece que aún no has agregado equipamiento a tu inventario.
        </p>
        <Link 
          to="/" 
          className="bg-primary hover:bg-primary-hover text-text-inverse px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 flex items-center gap-2"
        >
          <ShoppingBag size={18} /> Explorar Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8 tracking-tight">
          Tu Carrito <span className="text-primary text-2xl ml-2 font-light">/// {getTotalItems()} items</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.map((item) => <CartItem key={item.id} item={item} />)}
            </div>
            <Link to="/" className="inline-flex items-center text-text-secondary hover:text-primary font-medium mt-8 transition-colors group">
              <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Continuar comprando
            </Link>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-surface rounded-2xl shadow-xl shadow-black/5 border border-ui-border p-6 lg:sticky lg:top-24 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20"></div>
              
              <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                Resumen de Orden
              </h2>
              
              <div className="space-y-4 mb-6 pb-6 border-b border-ui-border">
                <div className="flex justify-between text-text-secondary text-sm">
                  <span>Subtotal</span>
                  <span className="font-mono">${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-text-secondary text-sm">
                  <span>Envío estimado</span>
                  {shippingCost === 0 ? (
                    <span className="text-primary font-bold text-xs bg-primary/10 px-2 py-0.5 rounded">GRATIS</span>
                  ) : (
                    <span className="font-mono">${shippingCost.toFixed(2)}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-lg font-bold text-text-primary">Total</span>
                <div className="text-right">
                  <span className="text-3xl font-bold text-primary tracking-tight block">
                    ${finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">Impuestos incluidos</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout} 
                className="w-full bg-primary hover:bg-primary-hover text-text-inverse py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center justify-center gap-2 active:scale-95 group"
              >
                Proceder al Pago <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
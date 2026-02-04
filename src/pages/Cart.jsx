import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ArrowRight, Package, Tag } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const totalPrice = getTotalPrice();
  const shippingCost = totalPrice >= 20 ? 0 : 5;
  const finalTotal = totalPrice + shippingCost;

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 border border-ui-border">
            <ShoppingBag size={40} className="text-text-muted" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-3">Tu carrito está vacío</h2>
          <p className="text-text-secondary mb-8 max-w-md">
            Explora nuestro catálogo y encuentra los mejores productos tecnológicos.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-text-inverse font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-primary/20"
          >
            <ArrowLeft size={20} />
            Ir al Catálogo
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado de la página */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">
              Carrito de Compras
            </h1>
            <p className="text-text-secondary mt-1">
              {cart.length} {cart.length === 1 ? 'producto' : 'productos'} en tu carrito
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 border border-red-500/20"
          >
            <Trash2 size={16} />
            Vaciar carrito
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Listado de productos del carrito */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-surface rounded-2xl border border-ui-border p-5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex gap-5">
                    {/* Representación visual del producto */}
                    <div className="w-24 h-24 bg-gradient-to-br from-background to-primary/5 rounded-xl flex items-center justify-center border border-ui-border shrink-0">
                      <Package size={36} className="text-primary" />
                    </div>

                    {/* Información del producto */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mb-2">
                            <Tag size={8} /> {item.category_name || 'Producto'}
                          </span>
                          <h3 className="font-bold text-text-primary text-lg leading-tight truncate">
                            {item.name}
                          </h3>
                          <p className="text-primary font-bold text-xl mt-1">
                            ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Controles de cantidad y cálculo de subtotal */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-ui-border border-dashed">
                        <div className="flex items-center bg-background rounded-lg border border-ui-border">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-9 h-9 flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface rounded-l-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-bold text-text-primary tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-9 h-9 flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface rounded-r-lg transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-xs text-text-muted block">Subtotal</span>
                          <span className="font-bold text-text-primary text-lg">
                            ${(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Panel de resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-2xl border border-ui-border p-6 sticky top-24 shadow-xl shadow-black/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20"></div>
              
              <h2 className="text-xl font-bold text-text-primary mb-6">Resumen del Pedido</h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-ui-border">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal ({cart.reduce((acc, item) => acc + item.quantity, 0)} {cart.reduce((acc, item) => acc + item.quantity, 0) === 1 ? 'item' : 'items'})</span>
                  <span className="font-mono text-text-primary">${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Envío</span>
                  {shippingCost === 0 ? (
                    <span className="text-primary font-bold text-xs bg-primary/10 px-2 py-0.5 rounded">GRATIS</span>
                  ) : (
                    <span className="font-mono text-text-primary">${shippingCost.toFixed(2)}</span>
                  )}
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-text-muted bg-background p-3 rounded-lg border border-ui-border">
                    💡 Agrega ${(20 - totalPrice).toFixed(2)} más para obtener envío gratis
                  </p>
                )}
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-lg font-bold text-text-primary">Total</span>
                <div className="text-right">
                  <span className="text-3xl font-bold text-primary block">
                    ${finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">
                    Impuestos incluidos
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-primary hover:bg-primary-hover text-text-inverse py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 group"
              >
                {isAuthenticated ? 'Proceder al Pago' : 'Iniciar Sesión'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                to="/"
                className="block text-center mt-4 text-sm text-text-secondary hover:text-primary transition-colors"
              >
                ← Continuar comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
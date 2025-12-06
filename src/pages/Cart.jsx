import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import CartItem from '../components/cart/CartItem';

const Cart = () => {
  const { cart, getTotalPrice, getTotalItems } = useCartStore();
  const navigate = useNavigate();
  const totalPrice = getTotalPrice();
  const shippingCost = totalPrice > 500 ? 0 : 25;
  const finalTotal = totalPrice + shippingCost;

  const handleCheckout = () => navigate('/checkout');

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-background">
        <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 text-text-muted border border-ui-border">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Tu carrito está vacío</h2>
        <p className="text-text-secondary mb-8 text-center max-w-md">
          Explora nuestro catálogo cyber-future y encuentra la mejor tecnología.
        </p>
        <Link to="/" className="bg-primary hover:bg-primary-hover text-black px-8 py-3 rounded-full font-bold transition-colors shadow-lg shadow-primary/20">
          Ir al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Tu Carrito <span className="text-primary">({getTotalItems()} items)</span></h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => <CartItem key={item.id} item={item} />)}
            <Link to="/" className="inline-flex items-center text-primary font-bold mt-6 hover:underline">
              <ArrowLeft size={18} className="mr-2" /> Continuar comprando
            </Link>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-surface rounded-2xl shadow-lg border border-ui-border p-6 lg:sticky lg:top-24">
              <h2 className="text-xl font-bold text-text-primary mb-6">Resumen</h2>
              
              <div className="space-y-4 mb-6 pb-6 border-b border-ui-border">
                <div className="flex justify-between text-text-secondary"><span>Subtotal</span><span>${totalPrice.toLocaleString()}</span></div>
                <div className="flex justify-between text-text-secondary"><span>Envío</span>{shippingCost === 0 ? <span className="text-primary font-bold">Gratis</span> : <span>${shippingCost}</span>}</div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold text-text-primary">Total</span>
                <span className="text-2xl font-bold text-primary text-shadow-glow">${finalTotal.toLocaleString()}</span>
              </div>

              <button onClick={handleCheckout} className="w-full bg-primary hover:bg-primary-hover text-black py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02]">
                Proceder al Pago <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
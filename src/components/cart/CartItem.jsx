import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '../../store/useCartStore';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCartStore();

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-surface rounded-2xl border border-ui-border shadow-sm mb-4"
    >
      <div className="w-24 h-24 bg-background rounded-xl p-2 flex-shrink-0 border border-ui-border">
        <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
      </div>

      <div className="flex-grow text-center sm:text-left">
        <h3 className="font-bold text-text-primary text-lg">{item.name}</h3>
        <p className="text-text-secondary text-sm">{item.category_name}</p>
        <div className="mt-1 font-bold text-primary text-xl">${item.price}</div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center bg-background rounded-lg border border-ui-border">
          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="p-2 text-text-primary hover:text-primary disabled:opacity-30 transition-colors"><Minus size={16} /></button>
          <span className="w-8 text-center font-bold text-text-primary text-sm">{item.quantity}</span>
          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock} className="p-2 text-text-primary hover:text-primary disabled:opacity-30 transition-colors"><Plus size={16} /></button>
        </div>

        <button onClick={() => removeFromCart(item.id)} className="text-text-muted hover:text-red-400 transition-colors p-2"><Trash2 size={20} /></button>
      </div>
    </motion.div>
  );
};

export default CartItem;
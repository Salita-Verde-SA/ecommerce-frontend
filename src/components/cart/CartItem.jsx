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
      className="group relative flex flex-col sm:flex-row items-center gap-6 p-4 bg-surface rounded-2xl border border-ui-border shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 mb-4 overflow-hidden"
    >
      {/* Línea decorativa superior (Efecto Cyber) */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 z-10"></div>

      <div className="w-20 h-20 bg-background rounded-xl p-2 flex-shrink-0 border border-ui-border flex items-center justify-center">
        <img 
          src={item.image_url} 
          alt={item.name} 
          className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" 
        />
      </div>

      <div className="flex-grow text-center sm:text-left">
        <h3 className="font-bold text-text-primary text-base line-clamp-1 group-hover:text-primary transition-colors">
          {item.name}
        </h3>
        <p className="text-text-secondary text-xs mb-1">{item.category_name}</p>
        <div className="font-bold text-primary text-lg">
          ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div className="flex items-center gap-6 relative z-10">
        <div className="flex items-center bg-background rounded-lg border border-ui-border shadow-inner">
          <button 
            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
            disabled={item.quantity <= 1} 
            className="p-2 text-text-secondary hover:text-primary disabled:opacity-30 transition-colors hover:bg-surface rounded-l-lg"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center font-bold text-text-primary text-sm tabular-nums">
            {item.quantity}
          </span>
          <button 
            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
            disabled={item.quantity >= item.stock} 
            className="p-2 text-text-secondary hover:text-primary disabled:opacity-30 transition-colors hover:bg-surface rounded-r-lg"
          >
            <Plus size={14} />
          </button>
        </div>

        <button 
          onClick={() => removeFromCart(item.id)} 
          className="text-text-muted hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-all"
          title="Eliminar producto"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default CartItem;
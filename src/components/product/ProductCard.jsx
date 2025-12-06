import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Plus, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '../../store/useCartStore';

const ProductCard = ({ product }) => {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      // CORREGIDO: border-ui-border
      className="group bg-surface rounded-3xl overflow-hidden border border-ui-border shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 flex flex-col h-full relative backdrop-blur-sm"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left z-20"></div>

      <div className="relative aspect-[4/3] overflow-hidden bg-background p-4">
        <img src={product.image_url} alt={product.name} className="w-full h-full object-contain object-center group-hover:scale-110 transition-transform duration-700 mix-blend-luminosity group-hover:mix-blend-normal opacity-90 group-hover:opacity-100"/>
        
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-primary shadow-sm border border-ui-border flex items-center gap-1.5">
          <Zap size={12} className="text-primary"/> {product.category_name}
        </div>

        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <Link to={`/product/${product.id}`} className="bg-primary text-text-inverse px-8 py-3 rounded-full font-bold transform translate-y-8 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary/90 hover:scale-105 shadow-lg shadow-primary/30">
            Ver Detalles
          </Link>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow relative">
        {/* CORREGIDO: border-ui-border */}
        <div className="absolute top-0 left-6 right-6 h-px bg-ui-border"></div>
        
        <div className="flex justify-between items-start mb-3 pt-2">
          <h3 className="font-bold text-xl text-text-primary line-clamp-1 group-hover:text-primary transition-colors tracking-tight">{product.name}</h3>
          <div className="flex items-center gap-1 bg-background px-2.5 py-1 rounded-md border border-ui-border">
            <Star size={14} className="fill-primary text-primary" />
            <span className="text-xs font-bold text-text-secondary">{product.rating}</span>
          </div>
        </div>

        <p className="text-text-secondary text-sm line-clamp-2 mb-6 flex-grow font-light">{product.description}</p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Precio</span>
            <span className="text-2xl font-extrabold text-primary tracking-tight drop-shadow-[0_0_8px_rgba(0,229,255,0.3)]">${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          <button onClick={() => addToCart(product)} className="flex items-center gap-2 bg-surface border border-primary/30 text-primary hover:bg-primary hover:text-text-inverse px-5 py-3 rounded-xl transition-all active:scale-95 shadow-sm font-bold group/btn overflow-hidden relative">
            <span className="relative z-10 flex items-center gap-2"><Plus size={18} /> Añadir</span>
            <div className="absolute inset-0 bg-primary translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 z-0"></div>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
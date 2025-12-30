import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '../../store/useCartStore';

const ProductCard = ({ product }) => {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group bg-surface rounded-2xl overflow-hidden border border-ui-border shadow-md hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full relative backdrop-blur-sm"
    >
      {/* Línea decorativa superior más sutil */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 z-20"></div>

      <div className="relative aspect-[4/3] overflow-hidden bg-background p-4">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal opacity-90 group-hover:opacity-100"
        />
        
        <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold text-primary shadow-sm border border-ui-border flex items-center gap-1">
          <Zap size={10} className="text-primary"/> {product.category_name}
        </div>

        {/* Hover overlay refinado */}
        <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
          <Link 
            to={`/product/${product.id}`} 
            className="bg-surface/90 text-text-primary border border-ui-border px-5 py-2 rounded-full font-semibold text-xs transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary hover:text-black hover:border-primary shadow-lg"
          >
            Ver Detalles
          </Link>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow relative">
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-ui-border to-transparent"></div>
        
        <div className="flex justify-between items-start mb-2 pt-2 gap-2">
          <h3 className="font-bold text-base text-text-primary line-clamp-1 group-hover:text-primary transition-colors tracking-tight leading-tight">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 bg-background/50 px-1.5 py-0.5 rounded border border-ui-border shrink-0">
            <Star size={10} className="fill-primary text-primary" />
            {/* CORRECCIÓN: Se agrega .toFixed(1) para redondear la calificación a 1 decimal */}
            <span className="text-[10px] font-bold text-text-secondary">
              {Number(product.rating).toFixed(1)}
            </span>
          </div>
        </div>

        <p className="text-text-secondary text-xs line-clamp-2 mb-4 flex-grow font-light leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-dashed border-ui-border/50">
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">Precio</span>
            <span className="text-lg font-bold text-primary tracking-tight">
              ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button 
            onClick={() => addToCart(product)} 
            className="flex items-center gap-1.5 bg-surface border border-primary/20 text-primary hover:bg-primary hover:text-black hover:border-primary px-3 py-1.5 rounded-lg transition-all active:scale-95 shadow-sm font-semibold text-xs group/btn relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-1">
              <Plus size={14} /> 
              <span>Agregar</span>
            </span>
            <div className="absolute inset-0 bg-primary translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 z-0"></div>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
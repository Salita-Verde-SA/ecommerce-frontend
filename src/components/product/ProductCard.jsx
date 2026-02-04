import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Zap, Package, ArrowRight } from 'lucide-react';
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
      {/* Línea decorativa superior */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 z-20"></div>

      {/* Header con categoría e icono decorativo */}
      <div className="relative bg-gradient-to-br from-background via-background to-primary/5 p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-surface/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold text-primary shadow-sm border border-ui-border flex items-center gap-1">
            <Zap size={10} className="text-primary"/> {product.category_name}
          </div>
          <div className="flex items-center gap-1 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded-md border border-ui-border">
            <Star size={12} className="fill-primary text-primary" />
            <span className="text-[11px] font-bold text-text-secondary">
              {Number(product.rating).toFixed(1)}
            </span>
          </div>
        </div>
        
        {/* Icono central decorativo */}
        <div className="flex justify-center py-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
            <Package size={32} className="text-primary" />
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-grow relative">
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-ui-border to-transparent"></div>
        
        <div className="pt-2 mb-3">
          <h3 className="font-bold text-base text-text-primary line-clamp-2 group-hover:text-primary transition-colors tracking-tight leading-tight min-h-[2.5rem]">
            {product.name}
          </h3>
        </div>

        <p className="text-text-secondary text-xs line-clamp-2 mb-4 flex-grow font-light leading-relaxed min-h-[2rem]">
          {product.description || 'Producto de alta calidad disponible en TechStore.'}
        </p>

        {/* Stock indicator */}
        <div className="mb-4">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
            product.stock > 10 
              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
              : product.stock > 0 
                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {product.stock > 10 ? 'En stock' : product.stock > 0 ? `Solo ${product.stock} disponibles` : 'Agotado'}
          </span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-dashed border-ui-border/50">
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">Precio</span>
            <span className="text-xl font-bold text-primary tracking-tight">
              ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex gap-2">
            <Link 
              to={`/product/${product.id}`}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-1 bg-background border border-ui-border text-text-secondary hover:text-primary hover:border-primary/50 px-3 py-1.5 rounded-lg transition-all text-xs font-medium"
            >
              Ver <ArrowRight size={12} />
            </Link>
            <button 
              onClick={() => addToCart(product)} 
              disabled={product.stock === 0}
              className="flex items-center gap-1 bg-primary text-black hover:bg-primary-hover px-3 py-1.5 rounded-lg transition-all active:scale-95 shadow-sm font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
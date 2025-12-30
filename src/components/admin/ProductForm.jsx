import React, { useState, useEffect } from 'react';
import { X, Save, Loader, Box, Tag, DollarSign, Layers, Edit, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductForm = ({ isOpen, onClose, onSubmit, initialData = null, categories = [] }) => {
  const [formData, setFormData] = useState({
    name: '', price: '', stock: '', category_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price || '',
        stock: initialData.stock || '',
        category_id: String(initialData.category_id || '')
      });
    } else {
      setFormData({
        name: '', price: '', stock: '', 
        category_id: categories.length > 0 ? String(categories[0].id) : ''
      });
    }
    setError('');
  }, [initialData, isOpen, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category_id: parseInt(formData.category_id)
      };

      // Validaciones
      if (!payload.name) throw new Error('El nombre es requerido');
      if (payload.price <= 0 || isNaN(payload.price)) throw new Error('El precio debe ser mayor a 0');
      if (payload.stock < 0 || isNaN(payload.stock)) throw new Error('El stock no puede ser negativo');
      if (!payload.category_id || isNaN(payload.category_id)) throw new Error('Debe seleccionar una categoría');

      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full p-3 pl-10 border border-ui-border rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text-primary placeholder-text-muted transition-all shadow-sm";
  const labelClasses = "block text-sm font-medium mb-2 text-text-secondary uppercase tracking-wider";
  const iconClasses = "absolute left-3 top-[38px] text-text-secondary pointer-events-none";

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-surface rounded-3xl shadow-2xl shadow-primary/10 w-full max-w-2xl overflow-hidden border border-ui-border">
          
          <div className="flex justify-between items-center p-6 border-b border-ui-border bg-background/50">
            <div>
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                {initialData ? <Edit size={20} className="text-primary"/> : <Plus size={20} className="text-primary"/>}
                {initialData ? 'Editar Producto' : 'Nuevo Item de Catálogo'}
              </h2>
              <p className="text-sm text-text-secondary mt-1">Ingresa los detalles técnicos del producto.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-background rounded-full text-text-secondary hover:text-text-primary transition-colors"><X size={24} /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="col-span-2 relative group">
                <label className={labelClasses}>Nombre del Producto</label>
                <Box size={18} className={iconClasses} />
                <input 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className={inputClasses} 
                  placeholder="Ej: Laptop Gamer X1" 
                />
              </div>
              
              <div className="relative group">
                <label className={labelClasses}>Precio (USD)</label>
                <DollarSign size={18} className={iconClasses} />
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  min="0.01" 
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: e.target.value})} 
                  className={inputClasses} 
                  placeholder="0.00" 
                />
              </div>
              
              <div className="relative group">
                <label className={labelClasses}>Stock Disponible</label>
                <Layers size={18} className={iconClasses} />
                <input 
                  required 
                  type="number" 
                  min="0" 
                  value={formData.stock} 
                  onChange={(e) => setFormData({...formData, stock: e.target.value})} 
                  className={inputClasses} 
                  placeholder="0" 
                />
              </div>
              
              <div className="col-span-2 relative group">
                <label className={labelClasses}>Categoría</label>
                <Tag size={18} className={iconClasses} />
                <select 
                  required 
                  value={formData.category_id} 
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})} 
                  className={`${inputClasses} appearance-none cursor-pointer`}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={String(cat.id)} className="bg-surface text-text-primary">{cat.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Sección de Descripción eliminada tal como se solicitó */}
            </div>
            
            <div className="flex justify-end gap-4 pt-6 border-t border-ui-border bg-background/30 -mx-8 -mb-8 p-8">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-3 rounded-xl text-text-secondary font-medium hover:bg-background hover:text-text-primary transition-all border border-transparent hover:border-ui-border"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="px-8 py-3 rounded-xl bg-primary text-black font-bold disabled:opacity-70 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95"
              >
                {loading ? <Loader className="animate-spin" size={20}/> : <><Save size={20} /> Guardar</>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductForm;
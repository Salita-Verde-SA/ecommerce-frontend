import React, { useState, useEffect } from 'react';
import { X, Save, Loader, Tag, Edit, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
    } else {
      setName('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ name: name.trim() });
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar la categoría');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95 }} 
          className="bg-surface rounded-2xl shadow-2xl shadow-primary/10 w-full max-w-md overflow-hidden border border-ui-border"
        >
          <div className="flex justify-between items-center p-6 border-b border-ui-border bg-background/50">
            <div>
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                {initialData ? <Edit size={20} className="text-primary"/> : <Plus size={20} className="text-primary"/>}
                {initialData ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                {initialData ? 'Modifica el nombre de la categoría.' : 'Ingresa el nombre de la nueva categoría.'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-background rounded-full text-text-secondary hover:text-text-primary transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="relative">
              <label className="block text-sm font-medium mb-2 text-text-secondary uppercase tracking-wider">
                Nombre de la Categoría
              </label>
              <Tag size={18} className="absolute left-3 top-[42px] text-text-secondary pointer-events-none" />
              <input 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full p-3 pl-10 border border-ui-border rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text-primary placeholder-text-muted transition-all shadow-sm" 
                placeholder="Ej: Electrónicos, Ropa, Hogar..." 
                autoFocus
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 px-4 py-3 rounded-xl text-text-secondary font-medium hover:bg-background hover:text-text-primary transition-all border border-ui-border"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="flex-1 px-4 py-3 rounded-xl bg-primary text-black font-bold disabled:opacity-70 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary-hover"
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

export default CategoryForm;

import React, { useState, useEffect } from 'react';
import { X, Save, Loader, MapPin, Edit, Plus, Building, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddressForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    street: '',
    number: '',
    city: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        street: initialData.street || '',
        number: initialData.number || '',
        city: initialData.city || ''
      });
    } else {
      setFormData({ street: '', number: '', city: '' });
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.street.trim()) {
      setError('La calle es requerida');
      return;
    }
    if (!formData.city.trim()) {
      setError('La ciudad es requerida');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        street: formData.street.trim(),
        number: formData.number.trim(),
        city: formData.city.trim()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar la dirección');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full p-3 pl-10 border border-ui-border rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text-primary placeholder-text-muted transition-all shadow-sm";

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
                {initialData ? 'Editar Dirección' : 'Nueva Dirección'}
              </h2>
              <p className="text-sm text-text-secondary mt-1">Ingresa los datos de la dirección de entrega.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-background rounded-full text-text-secondary hover:text-text-primary transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="relative">
              <label className="block text-sm font-medium mb-2 text-text-secondary uppercase tracking-wider">
                Calle
              </label>
              <MapPin size={18} className="absolute left-3 top-[42px] text-text-secondary pointer-events-none" />
              <input 
                required 
                value={formData.street} 
                onChange={(e) => setFormData({...formData, street: e.target.value})} 
                className={inputClasses}
                placeholder="Ej: Av. Reforma" 
                autoFocus
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium mb-2 text-text-secondary uppercase tracking-wider">
                Número
              </label>
              <Hash size={18} className="absolute left-3 top-[42px] text-text-secondary pointer-events-none" />
              <input 
                value={formData.number} 
                onChange={(e) => setFormData({...formData, number: e.target.value})} 
                className={inputClasses}
                placeholder="Ej: 123, 45-A, S/N" 
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium mb-2 text-text-secondary uppercase tracking-wider">
                Ciudad
              </label>
              <Building size={18} className="absolute left-3 top-[42px] text-text-secondary pointer-events-none" />
              <input 
                required 
                value={formData.city} 
                onChange={(e) => setFormData({...formData, city: e.target.value})} 
                className={inputClasses}
                placeholder="Ej: Ciudad de México" 
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

export default AddressForm;

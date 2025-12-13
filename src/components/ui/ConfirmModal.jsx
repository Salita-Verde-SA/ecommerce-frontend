import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Trash2, AlertCircle } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = '¿Estás seguro?', 
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger', // 'danger' | 'warning' | 'info'
  loading = false
}) => {
  if (!isOpen) return null;

  const iconMap = {
    danger: <Trash2 size={24} className="text-red-400" />,
    warning: <AlertTriangle size={24} className="text-yellow-400" />,
    info: <AlertCircle size={24} className="text-blue-400" />
  };

  const buttonStyles = {
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-black',
    info: 'bg-blue-500 hover:bg-blue-600 text-white'
  };

  const iconBgStyles = {
    danger: 'bg-red-500/10 border-red-500/20',
    warning: 'bg-yellow-500/10 border-yellow-500/20',
    info: 'bg-blue-500/10 border-blue-500/20'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95 }} 
          className="bg-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-ui-border"
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl border ${iconBgStyles[type]}`}>
                {iconMap[type]}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
                <p className="text-text-secondary text-sm">{message}</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-1 hover:bg-background rounded-lg text-text-secondary hover:text-text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex gap-3 p-6 pt-0">
            <button 
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl text-text-secondary font-medium hover:bg-background hover:text-text-primary transition-all border border-ui-border"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${buttonStyles[type]} disabled:opacity-50`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                confirmText
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const AlertModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message,
  type = 'info' // 'success' | 'error' | 'warning' | 'info'
}) => {
  if (!isOpen) return null;

  const config = {
    success: {
      icon: <CheckCircle size={24} />,
      iconBg: 'bg-green-500/10 border-green-500/20 text-green-400',
      title: title || 'Éxito'
    },
    error: {
      icon: <AlertCircle size={24} />,
      iconBg: 'bg-red-500/10 border-red-500/20 text-red-400',
      title: title || 'Error'
    },
    warning: {
      icon: <AlertTriangle size={24} />,
      iconBg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
      title: title || 'Advertencia'
    },
    info: {
      icon: <Info size={24} />,
      iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      title: title || 'Información'
    }
  };

  const current = config[type];

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
              <div className={`p-3 rounded-xl border ${current.iconBg}`}>
                {current.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-text-primary mb-2">{current.title}</h3>
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
          
          <div className="p-6 pt-0">
            <button 
              onClick={onClose}
              className="w-full px-4 py-3 rounded-xl bg-primary text-black font-bold hover:bg-primary-hover transition-all"
            >
              Aceptar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AlertModal;

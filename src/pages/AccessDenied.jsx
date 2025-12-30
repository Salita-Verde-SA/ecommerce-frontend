import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShieldX, Lock } from 'lucide-react';

const AccessDenied = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-yellow-500/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-primary/10 rounded-full blur-[150px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10 max-w-lg"
      >
        {/* Icono */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-500/10 rounded-full border border-yellow-500/20">
            <ShieldX size={48} className="text-yellow-400" />
          </div>
        </motion.div>

        {/* Código */}
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-7xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-primary to-yellow-500 bg-300% animate-gradient mb-4"
        >
          403
        </motion.h1>

        {/* Mensaje */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4 flex items-center justify-center gap-2">
            <Lock size={24} className="text-yellow-400" />
            Acceso Restringido
          </h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            No tienes los permisos necesarios para acceder a esta sección.
            <br className="hidden md:block" />
            Esta área está reservada para administradores del sistema.
          </p>
        </motion.div>

        {/* Botón */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link 
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-text-inverse font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-105"
          >
            <Home size={20} />
            Volver al Inicio
          </Link>
        </motion.div>

        {/* Código decorativo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 font-mono text-xs text-text-muted"
        >
          <code className="bg-surface/50 px-3 py-2 rounded-lg border border-ui-border">
            ACCESS::DENIED::ADMIN_REQUIRED
          </code>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AccessDenied;

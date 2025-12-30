import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-5"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10 max-w-lg"
      >
        {/* Icono de error */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500/10 rounded-full border border-red-500/20 mb-4">
            <AlertTriangle size={48} className="text-red-400" />
          </div>
        </motion.div>

        {/* Código de error */}
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-primary to-red-500 bg-300% animate-gradient mb-4"
        >
          404
        </motion.h1>

        {/* Mensaje de error */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
            Señal Perdida
          </h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            La página que buscas no existe en nuestra red. 
            <br className="hidden md:block" />
            Puede que haya sido movida o eliminada del sistema.
          </p>
        </motion.div>

        {/* Botones de acción */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link 
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-text-inverse font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-105"
          >
            <Home size={20} />
            Ir al Inicio
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 bg-surface hover:bg-background text-text-primary font-medium px-6 py-3 rounded-xl transition-all border border-ui-border hover:border-primary/50"
          >
            <ArrowLeft size={20} />
            Volver Atrás
          </button>
        </motion.div>

        {/* Código decorativo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 font-mono text-xs text-text-muted"
        >
          <code className="bg-surface/50 px-3 py-2 rounded-lg border border-ui-border">
            ERROR::ROUTE_NOT_FOUND::0x404
          </code>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;

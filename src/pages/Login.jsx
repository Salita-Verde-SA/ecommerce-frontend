import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader, Phone, AlertCircle, User } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { clientService } from '../services/clientService';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({ 
    email: '', name: '', lastname: '', telephone: '' 
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        // LOGIN - Buscar cliente por email
        const client = await clientService.findByEmail(formData.email);
        
        if (!client) {
          setError('Email no registrado en el sistema');
          return;
        }
        
        // Guardar datos del cliente en el store
        setAuth(client);
        
        // Redirigir según email (simulación de roles)
        if (client.email?.includes('admin')) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        // REGISTRO - Crear nuevo cliente
        const newClient = await clientService.create({ 
          email: formData.email, 
          name: formData.name,
          lastname: formData.lastname,
          telephone: formData.telephone
        });
        
        // Registro exitoso - auto login
        setSuccess('¡Registro exitoso! Redirigiendo...');
        setTimeout(() => {
          setAuth(newClient);
          navigate('/');
        }, 1500);
      }
    } catch (err) {
      console.error('Error:', err);
      
      let message = 'Error de conexión con el servidor';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData.detail === 'string') {
          message = errorData.detail;
        } else if (errorData.message) {
          message = errorData.message;
        }
      }
      
      // Traducir mensajes comunes
      if (message.includes('already registered') || message.includes('already exists')) {
        message = 'Este email ya está registrado';
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 py-3 bg-background border border-ui-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary placeholder-text-muted transition-all";
  const iconClass = "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary";

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-background py-12 px-4 relative overflow-hidden">
      {/* Efecto de fondo sutil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-md w-full space-y-8 bg-surface p-10 rounded-3xl shadow-2xl shadow-black/50 border border-ui-border relative z-10"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-primary tracking-tight">
            {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {isLogin ? 'Ingresa con tu email registrado' : 'Regístrate con tu email'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm">
            <AlertCircle size={18} />
            {success}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className={iconClass}><User size={18} /></div>
                  <input 
                    name="name" 
                    required 
                    value={formData.name} 
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="Nombre" 
                  />
                </div>
                <div className="relative">
                  <div className={iconClass}><User size={18} /></div>
                  <input 
                    name="lastname" 
                    required 
                    value={formData.lastname} 
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="Apellido" 
                  />
                </div>
              </div>
              <div className="relative">
                <div className={iconClass}><Phone size={18} /></div>
                <input 
                  name="telephone" 
                  value={formData.telephone} 
                  onChange={handleChange} 
                  className={inputClass} 
                  placeholder="Teléfono (opcional)" 
                />
              </div>
            </>
          )}
          
          <div className="relative">
            <div className={iconClass}><Mail size={18} /></div>
            <input 
              name="email" 
              type="email" 
              required 
              value={formData.email} 
              onChange={handleChange} 
              className={inputClass} 
              placeholder="Email" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full flex justify-center py-3.5 px-4 rounded-xl text-text-inverse bg-primary hover:bg-primary-hover font-bold transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading ? <Loader className="animate-spin text-black" /> : (isLogin ? 'Ingresar' : 'Registrarse')}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-ui-border">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }} 
            className="text-sm text-primary hover:text-primary-hover hover:underline font-medium transition-colors"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
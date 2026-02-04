import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader, Phone, AlertCircle, User, Cpu, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { clientService } from '../services/clientService';

// Validación de teléfono según backend: ^\+?[1-9]\d{6,19}$
// - min_length: 7, max_length: 20
// - Puede empezar opcionalmente con +
// - El primer dígito numérico debe ser 1-9 (NO puede empezar con 0)
// - Total: 7-20 dígitos (sin contar el +)
const PHONE_REGEX = /^\+?[1-9]\d{6,19}$/;

const validatePhone = (phone) => {
  if (!phone) return { isValid: true, message: '' }; // Teléfono es opcional
  
  // Remover el + para validar los dígitos
  const hasPlus = phone.startsWith('+');
  const digits = hasPlus ? phone.slice(1) : phone;
  
  // Verificar que después del + solo haya números
  if (!/^\d*$/.test(digits)) {
    return { isValid: false, message: 'Use solo números (puede incluir + al inicio)' };
  }
  
  // Si solo tiene el +, pedir que ingrese números
  if (hasPlus && digits.length === 0) {
    return { isValid: false, message: 'Ingrese los dígitos después del +' };
  }
  
  // El primer dígito no puede ser 0
  if (digits.length > 0 && digits.startsWith('0')) {
    return { isValid: false, message: 'El número no debe empezar con 0' };
  }
  
  if (digits.length < 7) {
    return { isValid: false, message: `Mínimo 7 dígitos (faltan ${7 - digits.length})` };
  }
  
  if (digits.length > 20) {
    return { isValid: false, message: 'Máximo 20 dígitos' };
  }
  
  return { isValid: true, message: '' };
};

const getPhoneSuggestions = (phone) => {
  if (!phone) return [];
  
  const suggestions = [];
  const hasPlus = phone.startsWith('+');
  const digits = hasPlus ? phone.slice(1) : phone;
  
  // Advertencia si el primer dígito es 0
  if (digits.length > 0 && digits.startsWith('0')) {
    suggestions.push({ text: 'El primer dígito no puede ser 0', type: 'warning' });
    return suggestions;
  }
  
  // Mostrar progreso de longitud
  if (digits.length > 0 && digits.length < 7) {
    suggestions.push({ text: `Mínimo 7 dígitos (faltan ${7 - digits.length})`, type: 'info' });
  } else if (digits.length >= 7 && digits.length <= 20) {
    suggestions.push({ text: '✓ Formato válido', type: 'success' });
  }
  
  return suggestions;
};

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({ 
    email: '', name: '', lastname: '', telephone: '' 
  });

  // Validación del teléfono en tiempo real
  const phoneValidation = useMemo(() => validatePhone(formData.telephone), [formData.telephone]);
  const phoneSuggestions = useMemo(() => getPhoneSuggestions(formData.telephone), [formData.telephone]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Campo de teléfono: se permite + al inicio y luego solo números
    if (name === 'telephone') {
      // Permitir + solo al inicio, luego solo dígitos
      let sanitized = '';
      for (let i = 0; i < value.length; i++) {
        const char = value[i];
        if (i === 0 && char === '+') {
          sanitized += char;
        } else if (/\d/.test(char)) {
          sanitized += char;
        }
      }
      setFormData({...formData, [name]: sanitized});
      setPhoneTouched(true);
    } else {
      setFormData({...formData, [name]: value});
    }
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
        // Proceso de inicio de sesión: búsqueda de cliente por email
        const client = await clientService.findByEmail(formData.email);
        
        if (!client) {
          setError('Email no registrado en el sistema');
          return;
        }
        
        // Almacenamiento de datos del cliente en el store de autenticación
        setAuth(client);
        
        // Redirección basada en el email (simulación de sistema de roles)
        if (client.email?.includes('admin')) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        // Validación del número de teléfono antes del envío
        if (formData.telephone && !phoneValidation.isValid) {
          setError('Por favor corrija el número de teléfono antes de continuar');
          return;
        }
        
        // Proceso de registro: creación de nuevo cliente
        const newClient = await clientService.create({ 
          email: formData.email, 
          name: formData.name,
          lastname: formData.lastname,
          telephone: formData.telephone || undefined
        });
        
        // Registro completado: inicio de sesión automático
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
      
      // Traducción de mensajes de error comunes
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
      {/* Efecto visual de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-md w-full space-y-8 bg-surface p-10 rounded-3xl shadow-2xl shadow-black/50 border border-ui-border relative z-10"
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
             <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
               <Cpu size={32} className="text-primary" />
             </div>
          </div>
          <h2 className="text-3xl font-bold text-text-primary tracking-tight">
             Nexus Hardware
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {isLogin ? 'Ingresa con tu email registrado' : 'Regístrate para continuar'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className={`${inputClass} ${
                    phoneTouched && formData.telephone && !phoneValidation.isValid 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : phoneTouched && formData.telephone && phoneValidation.isValid 
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                        : ''
                  }`}
                  placeholder="+1234567890" 
                />
                {/* Icono de validación */}
                {phoneTouched && formData.telephone && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {phoneValidation.isValid ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : (
                      <XCircle size={18} className="text-red-500" />
                    )}
                  </div>
                )}
              </div>
              
              {/* Sugerencias y validación del teléfono */}
              {phoneTouched && (
                <div className="space-y-1 -mt-2 mb-2">
                  {/* Error de validación */}
                  {!phoneValidation.isValid && formData.telephone && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <XCircle size={12} />
                      {phoneValidation.message}
                    </p>
                  )}
                  
                  {/* Sugerencias contextuales */}
                  {phoneSuggestions.map((suggestion, index) => (
                    <p 
                      key={index} 
                      className={`text-xs flex items-center gap-1 ${
                        suggestion.type === 'success' ? 'text-green-400' :
                        suggestion.type === 'warning' ? 'text-yellow-400' :
                        'text-text-secondary'
                      }`}
                    >
                      {suggestion.type === 'success' && <CheckCircle size={12} />}
                      {suggestion.text}
                    </p>
                  ))}
                  
                  {/* Formato esperado */}
                  {formData.telephone.length === 0 && (
                    <p className="text-xs text-text-muted">
                      7-20 dígitos, puede incluir + al inicio
                    </p>
                  )}
                </div>
              )}
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
            disabled={loading || (!isLogin && formData.telephone && !phoneValidation.isValid)} 
            className="w-full flex justify-center py-3.5 px-4 rounded-xl text-text-inverse bg-primary hover:bg-primary-hover font-bold transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading ? <Loader className="animate-spin text-black" /> : (isLogin ? 'Ingresar' : 'Registrarse')}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-ui-border">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); setPhoneTouched(false); }} 
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
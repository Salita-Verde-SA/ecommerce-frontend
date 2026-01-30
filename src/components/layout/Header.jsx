import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, ChevronRight, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const cartItems = useCartStore(state => state.cart);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const { user, isAuthenticated, logout, isAdmin } = useAuthStore();
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleCartClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/cart');
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  // Mapeo de etiquetas de navegación con sus identificadores de sección
  const navLinks = [
    { name: 'Inicio', id: 'inicio' },
    { name: 'Categorías', id: 'categorias' },
    { name: 'Productos', id: 'productos' }
  ];

  const handleNavigation = (sectionId) => {
    setIsMenuOpen(false); // Cierre del menú móvil si está abierto
    
    // Navegación a la página principal si no se encuentra en ella
    if (location.pathname !== '/') {
      navigate('/');
      // Tiempo de espera para permitir la carga del DOM
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } else {
      // Desplazamiento directo si ya se encuentra en la página principal
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowSearch(false);
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-ui-border transition-all duration-300 shadow-lg shadow-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logotipo de la aplicación */}
            <Link 
              to="/" 
              onClick={() => { setSearchTerm(''); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
              className="flex-shrink-0 flex items-center gap-2 group"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
                <Cpu size={20} className="text-text-inverse" />
              </div>
              <span className="font-bold text-xl tracking-tight text-text-primary">Nexus Hardware</span>
            </Link>

            {/* Navegación principal para escritorio */}
            <nav className="hidden md:flex space-x-8">
              {navLinks.map((item) => (
                <button 
                  key={item.name}
                  onClick={() => handleNavigation(item.id)} 
                  className="text-text-secondary hover:text-primary font-medium transition-colors text-sm tracking-wide relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </button>
              ))}
            </nav>

            {/* DESKTOP ICONS */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="relative flex items-center">
                <AnimatePresence>
                  {showSearch && (
                    <motion.form 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 220, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      onSubmit={handleSearchSubmit}
                      className="absolute right-10"
                    >
                      <input
                        autoFocus
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-4 py-2 rounded-full border border-ui-border bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm text-text-primary placeholder-text-muted shadow-sm"
                      />
                    </motion.form>
                  )}
                </AnimatePresence>
                <button 
                  onClick={() => setShowSearch(!showSearch)} 
                  className={`transition-colors p-2 rounded-full hover:bg-primary/10 ${showSearch ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}
                >
                  <Search size={20} />
                </button>
              </div>
              
              <button onClick={handleCartClick} className="relative text-text-secondary hover:text-primary transition-colors p-2 hover:bg-primary/10 rounded-full">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-text-inverse text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm shadow-primary/50">
                    {cartCount}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  {isAdmin && (
                     <Link to="/admin" className="text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-lg hover:bg-primary hover:text-text-inverse transition-all shadow-sm shadow-primary/10 border border-primary/20">
                       Panel
                     </Link>
                  )}
                  <Link to="/profile" className="flex items-center gap-2 hover:bg-surface p-1.5 pr-3 rounded-lg transition-colors group border border-transparent hover:border-ui-border">
                    <div className="w-9 h-9 bg-surface border border-ui-border rounded-full flex items-center justify-center text-sm font-bold text-primary group-hover:bg-primary group-hover:text-text-inverse transition-all shadow-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  </Link>
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-text-primary bg-surface hover:bg-primary/10 border border-ui-border px-4 py-2 rounded-lg transition-all hover:border-primary/30 hover:text-primary">
                  <User size={18} />
                  <span>Ingresar</span>
                </Link>
              )}
            </div>

            {/* MOBILE TOGGLE */}
            <div className="md:hidden flex items-center gap-4">
              <button onClick={handleCartClick} className="relative text-text-secondary hover:text-primary transition-colors">
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-text-inverse text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-text-primary hover:text-primary p-1">
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-16 left-0 w-full bg-surface border-b border-ui-border md:hidden overflow-hidden shadow-2xl z-40"
          >
            <div className="px-4 py-6 space-y-4">
               {/* Mobile Search */}
               <form onSubmit={handleSearchSubmit} className="relative mb-6">
                 <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-ui-border bg-background focus:ring-1 focus:ring-primary outline-none text-text-primary"
                  />
                  <button type="submit" className="absolute right-3 top-3 text-text-secondary"><Search size={20}/></button>
               </form>

              {/* Mobile Navigation Links */}
              {navLinks.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.id)}
                  className="block w-full text-left px-4 py-3 text-lg font-medium text-text-primary hover:bg-background rounded-xl transition-colors border-l-2 border-transparent hover:border-primary"
                >
                  <div className="flex justify-between items-center">
                    {item.name}
                    <ChevronRight size={16} className="text-text-secondary"/>
                  </div>
                </button>
              ))}

              <div className="h-px bg-ui-border my-4"></div>

              {/* Mobile Auth */}
              {isAuthenticated ? (
                <div className="space-y-3">
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block w-full text-center px-4 py-3 bg-primary/10 text-primary font-bold rounded-xl border border-primary/20">
                      Panel de Administrador
                    </Link>
                  )}
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-text-primary hover:bg-background rounded-xl">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-black font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">Mi Perfil</span>
                  </Link>
                  <button onClick={() => { setIsMenuOpen(false); handleLogout(); }} className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium">
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-primary text-black font-bold py-3 rounded-xl shadow-lg shadow-primary/20"
                >
                  <User size={20} /> Iniciar Sesión
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
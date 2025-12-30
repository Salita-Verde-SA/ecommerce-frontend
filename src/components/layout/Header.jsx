import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const cartItems = useCartStore(state => state.cart);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  // CORRECCIÓN: Extraemos 'isAdmin' directamente del store, ya que useAuthStore ya lo calculó al hacer login.
  // La lógica anterior (user?.role === 'admin') fallaba porque el objeto user del backend no trae el campo 'role'.
  const { user, isAuthenticated, logout, isAdmin } = useAuthStore();
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (sectionId) => {
    setIsMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
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
    <header className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-ui-border transition-all duration-300 shadow-lg shadow-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" onClick={() => { setSearchTerm(''); window.scrollTo(0,0); }} className="flex-shrink-0 flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
              <span className="text-text-inverse font-bold text-xl">T</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-text-primary">TechStore</span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            {['Inicio', 'Categorías', 'Productos'].map((item) => (
              <button 
                key={item}
                onClick={() => handleNavigation(item.toLowerCase())} 
                className="text-text-secondary hover:text-primary font-medium transition-colors text-sm tracking-wide"
              >
                {item}
              </button>
            ))}
          </nav>

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
            
            <Link to="/cart" className="relative text-text-secondary hover:text-primary transition-colors p-2 hover:bg-primary/10 rounded-full">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-text-inverse text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm shadow-primary/50">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {/* Botón de Panel de Administración condicional */}
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

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-text-primary hover:text-primary p-2">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
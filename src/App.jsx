import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { useAuthStore } from './store/useAuthStore';

// Páginas
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AccessDenied from './pages/AccessDenied';

// Ruta protegida para administradores - redirecciona a /403 si no tiene permisos
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/403" replace />;

  return children;
};

// Ruta protegida para usuarios autenticados - redirecciona a /login si no está autenticado
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          
          {/* Rutas de Error */}
          <Route path="/404" element={<NotFound />} />
          <Route path="/403" element={<AccessDenied />} />
          
          {/* Rutas Protegidas (Requieren Login) */}
          <Route 
            path="/checkout" 
            element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />

          {/* Rutas de Administrador */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          
          {/* Ruta catch-all para 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
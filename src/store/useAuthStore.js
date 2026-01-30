import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,

      // Inicio de sesión simplificado - almacena datos del cliente
      login: (userData) => {
        // Determinación del rol de administrador basado en el email
        // Nota: El backend no implementa roles, esta lógica es exclusiva de la UI
        const isAdmin = userData.email?.includes('admin');
        
        set({ 
          user: userData, 
          isAuthenticated: true,
          isAdmin 
        });
      },

      // Actualización de datos del usuario autenticado
      updateUser: (userData) => {
        const currentState = get();
        set({
          user: { ...currentState.user, ...userData }
        });
      },

      // Cierre de sesión y limpieza de estado
      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isAdmin: false 
        });
      },
    }),
    {
      name: 'techstore-auth-storage',
    }
  )
);
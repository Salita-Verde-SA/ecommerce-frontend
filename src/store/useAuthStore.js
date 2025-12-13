import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,

      // "Login" simplificado - solo almacena datos del cliente
      login: (userData) => {
        // Determinar si es admin basado en email o algún otro criterio
        // Nota: El backend NO tiene roles, esto es solo para UI
        const isAdmin = userData.email?.includes('admin');
        
        set({ 
          user: userData, 
          isAuthenticated: true,
          isAdmin 
        });
      },

      updateUser: (userData) => {
        const currentState = get();
        set({
          user: { ...currentState.user, ...userData }
        });
      },

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
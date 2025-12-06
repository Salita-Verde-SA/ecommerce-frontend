import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,

      login: (userData, token) => {
        // El backend envía el rol como 'admin' o 'client'
        const isAdmin = userData.role === 'admin';
        
        set({ 
          user: userData, 
          token, 
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
          token: null, 
          isAuthenticated: false, 
          isAdmin: false 
        });
      },

      getToken: () => get().token,
    }),
    {
      name: 'techstore-auth-storage',
    }
  )
);
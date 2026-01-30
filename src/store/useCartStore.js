import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      // Adición de producto al carrito con cantidad especificada
      addToCart: (product, quantity = 1) => {
        const { cart } = get();
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
          set({
            cart: cart.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ cart: [...cart, { ...product, quantity }] });
        }
      },

      // Eliminación de producto del carrito por identificador
      removeFromCart: (productId) => {
        set({ cart: get().cart.filter(item => item.id !== productId) });
      },

      // Actualización de cantidad de un producto en el carrito
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        set({
          cart: get().cart.map(item =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
      },

      // Vaciado completo del carrito
      clearCart: () => set({ cart: [] }),

      // Métodos de cálculo auxiliares
      getTotalItems: () => get().cart.reduce((acc, item) => acc + item.quantity, 0),
      getTotalPrice: () => get().cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
    }),
    {
      name: 'techstore-cart-storage', // Clave de almacenamiento en localStorage
    }
  )
);
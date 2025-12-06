/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PALETA "CYBER FUTURE" (Verde Lemon, Negro Profundo, Azul)
        primary: {
          DEFAULT: '#CCFF00', // Verde Neón Principal
          hover: '#B2E600',
          foreground: '#000000'
        },
        secondary: {
          DEFAULT: '#2563EB', // Azul Eléctrico
          light: '#60A5FA',
        },
        background: '#020617', // Negro Azulado (Fondo de toda la web)
        surface: '#0F172A',    // Gris oscuro (Tarjetas)
        
        // Aquí definimos la clase que está dando error:
        'ui-border': '#1E293B', 
        
        text: {
          primary: '#F8FAFC',   // Blanco
          secondary: '#94A3B8', // Gris
          muted: '#475569',
          inverse: '#020617'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
      },
    },
  },
  plugins: [],
}
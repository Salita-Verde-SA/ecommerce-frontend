// Configuración global para Jest

// Mock para import.meta.env (Vite)
global.importMetaEnv = {
  VITE_API_URL: 'http://localhost:8000'
};

// Silenciar console.error en tests (opcional)
// global.console.error = jest.fn();

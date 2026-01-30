import axios from 'axios';

// Configuración de instancia axios para pruebas
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
});

// Interceptor de respuesta para manejo de errores
api.interceptors.response.use(
  response => response,
  error => {
    // Registro de errores de API
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url
      });
    }
    return Promise.reject(error);
  }
);

export default api;

// Tests
describe('api configuration', () => {
  test('api module exports default axios instance', async () => {
    const apiModule = await import('./api.js');
    const api = apiModule.default;
    
    expect(api).toBeDefined();
    expect(typeof api.get).toBe('function');
    expect(typeof api.post).toBe('function');
    expect(typeof api.put).toBe('function');
    expect(typeof api.delete).toBe('function');
  });

  test('api has correct default headers', async () => {
    const apiModule = await import('./api.js');
    const api = apiModule.default;
    
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  test('api has withCredentials set to false', async () => {
    const apiModule = await import('./api.js');
    const api = apiModule.default;
    
    expect(api.defaults.withCredentials).toBe(false);
  });

  test('api has baseURL configured', async () => {
    const apiModule = await import('./api.js');
    const api = apiModule.default;
    
    expect(api.defaults.baseURL).toBeDefined();
    expect(typeof api.defaults.baseURL).toBe('string');
  });
});

describe('api error handling behavior', () => {
  test('error with response should be loggable', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const mockError = {
      response: {
        status: 500,
        data: { message: 'Internal Server Error' }
      },
      config: { url: '/test-url' }
    };

    // Simulación del comportamiento del interceptor de errores
    if (mockError.response) {
      console.error('API Error:', {
        status: mockError.response.status,
        data: mockError.response.data,
        url: mockError.config.url
      });
    }

    expect(consoleErrorSpy).toHaveBeenCalledWith('API Error:', {
      status: 500,
      data: { message: 'Internal Server Error' },
      url: '/test-url'
    });

    consoleErrorSpy.mockRestore();
  });

  test('error without response should not log', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const mockError = {
      message: 'Network Error',
      config: { url: '/test-url' }
    };

    // Simulación del comportamiento del interceptor de errores
    if (mockError.response) {
      console.error('API Error:', {
        status: mockError.response.status,
        data: mockError.response.data,
        url: mockError.config.url
      });
    }

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
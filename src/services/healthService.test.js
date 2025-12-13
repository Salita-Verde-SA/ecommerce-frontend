// javascript
// File: frontend/src/services/healthService.test.js

describe('healthService', () => {
  test('healthService module exports check function', async () => {
    const module = await import('./healthService.js');
    
    expect(module.healthService).toBeDefined();
    expect(typeof module.healthService.check).toBe('function');
  });
});

describe('healthService.check behavior', () => {
  let api;
  let healthService;
  let mockGet;

  beforeEach(async () => {
    // Importar módulos frescos
    const apiModule = await import('../config/api.js');
    api = apiModule.default;
    
    // Guardar referencia original y crear mock
    mockGet = jest.fn();
    api.get = mockGet;
    
    // Importar healthService
    const hsModule = await import('./healthService.js');
    healthService = hsModule.healthService;
  });

  test('calls api.get with correct endpoint', async () => {
    const fakeData = { status: 'healthy', uptime: 12345 };
    mockGet.mockResolvedValue({ data: fakeData });

    const result = await healthService.check();

    expect(mockGet).toHaveBeenCalledWith('/health_check/');
    expect(result).toEqual(fakeData);
  });

  test('returns response data on success', async () => {
    const fakeData = { status: 'healthy', checks: { database: 'up' } };
    mockGet.mockResolvedValue({ data: fakeData });

    const result = await healthService.check();

    expect(result).toEqual(fakeData);
  });

  test('propagates errors on failure', async () => {
    const mockError = new Error('Network failure');
    mockGet.mockRejectedValue(mockError);

    await expect(healthService.check()).rejects.toThrow('Network failure');
  });

  test('handles empty response data', async () => {
    mockGet.mockResolvedValue({ data: {} });

    const result = await healthService.check();

    expect(result).toEqual({});
  });

  test('handles null response data', async () => {
    mockGet.mockResolvedValue({ data: null });

    const result = await healthService.check();

    expect(result).toBeNull();
  });

  test('handles degraded status response', async () => {
    const fakeData = { status: 'degraded', uptime: 0, services: [] };
    mockGet.mockResolvedValue({ data: fakeData });

    const result = await healthService.check();

    expect(result.status).toBe('degraded');
  });

  test('is called only once per invocation', async () => {
    mockGet.mockResolvedValue({ data: { status: 'ok' } });

    await healthService.check();

    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  test('propagates timeout errors', async () => {
    const timeoutError = new Error('timeout of 5000ms exceeded');
    timeoutError.code = 'ECONNABORTED';
    mockGet.mockRejectedValue(timeoutError);

    await expect(healthService.check()).rejects.toThrow('timeout of 5000ms exceeded');
  });

  test('propagates server errors with status', async () => {
    const serverError = new Error('Request failed with status code 500');
    serverError.response = { status: 500, data: { message: 'Internal Server Error' } };
    mockGet.mockRejectedValue(serverError);

    await expect(healthService.check()).rejects.toThrow('Request failed with status code 500');
  });
});
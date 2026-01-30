import { useState, useEffect, useCallback, useRef } from 'react';
import { healthService } from '../services/healthService';

/**
 * Hook para monitoreo de latencia del servidor en tiempo real.
 * Detecta errores de conexión, CORS y otros problemas de red.
 * 
 * Obtiene datos del endpoint /health_check que retorna:
 * - checks.database.latency_ms: Latencia de la base de datos
 * - status: Estado general (healthy, warning, degraded, critical)
 * 
 * @param {number} interval - Intervalo de actualización en milisegundos (valor por defecto: 5000)
 * @param {number} maxDataPoints - Número máximo de puntos de datos a mantener (valor por defecto: 30)
 * @returns {Object} Estado y funciones de control del monitoreo
 */
export const useLatencyMonitor = (interval = 5000, maxDataPoints = 30) => {
  const [latencyData, setLatencyData] = useState([]);
  const [currentHealth, setCurrentHealth] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // Estados: 'online', 'offline', 'error', 'connecting'
  const intervalRef = useRef(null);
  const consecutiveErrorsRef = useRef(0);

  const fetchLatency = useCallback(async () => {
    const timestamp = new Date();
    const timeLabel = timestamp.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });

    try {
      const startTime = performance.now();
      const health = await healthService.check();
      const endTime = performance.now();
      const apiLatency = endTime - startTime;

      // Registro de conexión exitosa
      consecutiveErrorsRef.current = 0;
      setConnectionStatus('online');
      setCurrentHealth(health);
      setError(null);

      const dbLatency = health?.checks?.database?.latency_ms ?? null;
      
      const newDataPoint = {
        time: timeLabel,
        timestamp: timestamp.getTime(),
        dbLatency: dbLatency,
        apiLatency: Math.round(apiLatency),
        status: health?.status || 'unknown',
        poolUtilization: health?.checks?.db_pool?.utilization_percent ?? 0,
        redisStatus: health?.checks?.redis?.status === 'up' ? 1 : 0
      };

      setLatencyData(prevData => {
        const updatedData = [...prevData, newDataPoint];
        if (updatedData.length > maxDataPoints) {
          return updatedData.slice(-maxDataPoints);
        }
        return updatedData;
      });

    } catch (err) {
      console.error('Error fetching health check:', err);
      consecutiveErrorsRef.current += 1;

      // Clasificación del tipo de error para manejo apropiado
      let errorType = 'error';
      let errorMessage = 'Error de conexión con el servidor';

      if (err.message?.includes('Network Error') || err.code === 'ERR_NETWORK') {
        errorType = 'offline';
        errorMessage = 'No se puede conectar con el servidor. Verifique que la API esté ejecutándose.';
      } else if (err.message?.includes('CORS') || err.message?.includes('cross-origin')) {
        errorType = 'cors';
        errorMessage = 'Error de CORS. La API no permite peticiones desde este origen.';
      } else if (err.code === 'ECONNREFUSED' || err.message?.includes('refused')) {
        errorType = 'offline';
        errorMessage = 'Conexión rechazada. El servidor no está disponible.';
      } else if (err.response?.status === 429) {
        errorType = 'rate_limited';
        errorMessage = 'Límite de peticiones excedido. Esperando...';
      } else if (err.response?.status >= 500) {
        errorType = 'server_error';
        errorMessage = `Error del servidor (${err.response.status})`;
      }

      setConnectionStatus(errorType === 'offline' || errorType === 'cors' ? 'offline' : 'error');
      setError(errorMessage);
      
      // Actualización del estado de salud para reflejar el error detectado
      setCurrentHealth({
        status: errorType === 'rate_limited' ? 'warning' : 'offline',
        error: errorMessage,
        errorType: errorType,
        checks: {
          database: { status: 'unknown' },
          redis: { status: 'unknown' }
        }
      });
      
      // Agregación de punto de datos con estado de error
      setLatencyData(prevData => {
        const updatedData = [...prevData, {
          time: timeLabel,
          timestamp: timestamp.getTime(),
          dbLatency: null,
          apiLatency: null,
          status: 'error',
          poolUtilization: 0,
          redisStatus: 0,
          error: errorType
        }];
        if (updatedData.length > maxDataPoints) {
          return updatedData.slice(-maxDataPoints);
        }
        return updatedData;
      });
    }
  }, [maxDataPoints]);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const clearData = useCallback(() => {
    setLatencyData([]);
  }, []);

  useEffect(() => {
    if (isMonitoring) {
      fetchLatency();
    }

    if (isMonitoring) {
      intervalRef.current = setInterval(fetchLatency, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isMonitoring, interval, fetchLatency]);

  return {
    latencyData,
    currentHealth,
    isMonitoring,
    error,
    connectionStatus,
    startMonitoring,
    stopMonitoring,
    clearData,
    refetch: fetchLatency
  };
};

export default useLatencyMonitor;

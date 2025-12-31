import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import { Activity, Pause, Play, Trash2, AlertTriangle, CheckCircle, AlertCircle, WifiOff, ServerOff } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Componente de gráfico de latencia en tiempo real.
 * Muestra la latencia de la base de datos obtenida del endpoint /health_check
 * 
 * Umbrales según documentación del backend:
 * - Healthy: < 100ms (verde)
 * - Warning: 100-500ms (amarillo)
 * - Critical: > 500ms (rojo)
 */
const LatencyChart = ({ 
  latencyData, 
  currentHealth, 
  isMonitoring, 
  error,
  onToggleMonitoring, 
  onClear 
}) => {
  // Umbrales definidos en el backend (controllers/health_check.py)
  const THRESHOLDS = {
    warning: 100,  // ms
    critical: 500  // ms
  };

  // Determinar si el sistema está offline
  const isOffline = currentHealth?.status === 'offline' || 
                    currentHealth?.errorType === 'offline' || 
                    currentHealth?.errorType === 'cors';

  // Obtener último valor de latencia
  const lastLatency = latencyData.length > 0 
    ? latencyData[latencyData.length - 1]?.dbLatency 
    : null;

  // Calcular estadísticas
  const validLatencies = latencyData
    .filter(d => d.dbLatency !== null)
    .map(d => d.dbLatency);
  
  const avgLatency = validLatencies.length > 0 
    ? (validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length).toFixed(2)
    : '--';
  
  const maxLatency = validLatencies.length > 0 
    ? Math.max(...validLatencies).toFixed(2)
    : '--';
  
  const minLatency = validLatencies.length > 0 
    ? Math.min(...validLatencies).toFixed(2)
    : '--';

  // Determinar color y texto según estado
  const getStatusInfo = () => {
    if (error || isOffline) {
      return {
        color: 'text-red-400',
        bgColor: 'bg-red-500/10 border-red-500/30',
        label: 'OFFLINE',
        icon: <WifiOff className="text-red-400" size={20} />
      };
    }
    
    const status = currentHealth?.status;
    switch (status) {
      case 'healthy':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-500/10 border-green-500/30',
          label: 'HEALTHY',
          icon: <CheckCircle className="text-green-400" size={20} />
        };
      case 'warning':
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10 border-yellow-500/30',
          label: 'WARNING',
          icon: <AlertTriangle className="text-yellow-400" size={20} />
        };
      case 'degraded':
        return {
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/10 border-orange-500/30',
          label: 'DEGRADED',
          icon: <AlertTriangle className="text-orange-400" size={20} />
        };
      case 'critical':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-500/10 border-red-500/30',
          label: 'CRITICAL',
          icon: <AlertCircle className="text-red-400" size={20} />
        };
      default:
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/10 border-gray-500/30',
          label: 'UNKNOWN',
          icon: <Activity className="text-gray-400" size={20} />
        };
    }
  };

  const statusInfo = getStatusInfo();

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const hasError = data.error || data.dbLatency === null;
      
      return (
        <div className="bg-surface border border-ui-border rounded-lg p-3 shadow-xl">
          <p className="text-text-secondary text-xs mb-1">{label}</p>
          {hasError ? (
            <p className="text-red-400 font-bold">Sin conexión</p>
          ) : (
            <>
              <p className="text-text-primary font-bold">
                Latencia DB: {data.dbLatency?.toFixed(2)} ms
              </p>
              <p className="text-text-secondary text-xs mt-1">
                Estado: <span className={statusInfo.color}>{data.status?.toUpperCase()}</span>
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-2xl border border-ui-border p-6 shadow-lg"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isOffline ? 'bg-red-500/10' : 'bg-primary/10'}`}>
            {isOffline ? <ServerOff className="text-red-400" size={24} /> : <Activity className="text-primary" size={24} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Latencia del Servidor</h3>
            <p className="text-sm text-text-secondary">
              {isOffline ? 'Sin conexión con el servidor' : 'Monitoreo en tiempo real'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Estado actual */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${statusInfo.bgColor}`}>
            {statusInfo.icon}
            <span className={`text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          
          {/* Controles */}
          <button
            onClick={onToggleMonitoring}
            className={`p-2 rounded-lg transition-colors ${
              isMonitoring 
                ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' 
                : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
            }`}
            title={isMonitoring ? 'Pausar monitoreo' : 'Reanudar monitoreo'}
          >
            {isMonitoring ? <Pause size={18} /> : <Play size={18} />}
          </button>
          
          <button
            onClick={onClear}
            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
            title="Limpiar datos"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Mensaje de error si existe */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="text-red-400 flex-shrink-0" size={18} />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-background rounded-xl p-4 border border-ui-border">
          <p className="text-xs text-text-secondary mb-1">Actual</p>
          <p className={`text-2xl font-bold ${
            isOffline ? 'text-red-400' :
            lastLatency === null ? 'text-gray-400' :
            lastLatency > THRESHOLDS.critical ? 'text-red-400' :
            lastLatency > THRESHOLDS.warning ? 'text-yellow-400' :
            'text-green-400'
          }`}>
            {isOffline ? '—' : (lastLatency !== null ? `${lastLatency.toFixed(1)}` : '--')}
            {!isOffline && <span className="text-sm font-normal text-text-secondary ml-1">ms</span>}
          </p>
        </div>
        
        <div className="bg-background rounded-xl p-4 border border-ui-border">
          <p className="text-xs text-text-secondary mb-1">Promedio</p>
          <p className="text-2xl font-bold text-primary">
            {avgLatency}
            <span className="text-sm font-normal text-text-secondary ml-1">ms</span>
          </p>
        </div>
        
        <div className="bg-background rounded-xl p-4 border border-ui-border">
          <p className="text-xs text-text-secondary mb-1">Mínimo</p>
          <p className="text-2xl font-bold text-green-400">
            {minLatency}
            <span className="text-sm font-normal text-text-secondary ml-1">ms</span>
          </p>
        </div>
        
        <div className="bg-background rounded-xl p-4 border border-ui-border">
          <p className="text-xs text-text-secondary mb-1">Máximo</p>
          <p className="text-2xl font-bold text-orange-400">
            {maxLatency}
            <span className="text-sm font-normal text-text-secondary ml-1">ms</span>
          </p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-64">
        {latencyData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-muted">
            <div className="text-center">
              {isOffline ? (
                <>
                  <WifiOff className="mx-auto mb-2 text-red-400" size={48} />
                  <p className="text-red-400">Sin conexión con el servidor</p>
                  <p className="text-xs mt-1">Verifique que la API esté ejecutándose</p>
                </>
              ) : (
                <>
                  <Activity className="mx-auto mb-2 opacity-50" size={48} />
                  <p>Esperando datos de latencia...</p>
                  <p className="text-xs mt-1">El gráfico se actualizará automáticamente</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={latencyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255,255,255,0.05)" 
                vertical={false}
              />
              
              <XAxis 
                dataKey="time" 
                tick={{ fill: '#6b7280', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
                domain={[0, 'auto']}
                label={{ 
                  value: 'ms', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: '#6b7280', fontSize: 10 }
                }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Líneas de umbral */}
              <ReferenceLine 
                y={THRESHOLDS.warning} 
                stroke="#eab308" 
                strokeDasharray="5 5" 
                strokeOpacity={0.5}
              />
              
              <ReferenceLine 
                y={THRESHOLDS.critical} 
                stroke="#ef4444" 
                strokeDasharray="5 5" 
                strokeOpacity={0.5}
              />
              
              {/* Área bajo la curva */}
              <Area
                type="monotone"
                dataKey="dbLatency"
                stroke="transparent"
                fill="url(#latencyGradient)"
              />
              
              {/* Línea principal */}
              <Line
                type="monotone"
                dataKey="dbLatency"
                stroke="#4ade80"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#4ade80', stroke: '#fff', strokeWidth: 2 }}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer con información adicional */}
      <div className="mt-4 pt-4 border-t border-ui-border flex justify-between items-center text-xs text-text-secondary">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            Healthy (&lt;100ms)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            Warning (100-500ms)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            Critical (&gt;500ms)
          </span>
        </div>
        <span>
          {latencyData.length} puntos | DB Pool: {currentHealth?.checks?.db_pool?.utilization_percent?.toFixed(1) || '--'}%
        </span>
      </div>
    </motion.div>
  );
};

export default LatencyChart;

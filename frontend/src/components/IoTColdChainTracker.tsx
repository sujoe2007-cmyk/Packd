import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Thermometer, 
  Droplets, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  RefreshCw,
  Activity,
  Truck
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

import { api } from '../lib/api';

export const IoTColdChainTracker: React.FC = () => {
  const [commodity, setCommodity] = useState<string>('Alphonso Mango');
  const [idealTemp, setIdealTemp] = useState<number>(12.0);
  const [baselineDays, setBaselineDays] = useState<number>(21.0);
  const [simulateSpike, setSimulateSpike] = useState<boolean>(true);
  const [iotData, setIotData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    // Generate synthetic 24-hour sensor log
    const logs = [];
    for (let h = 1; h <= 24; h++) {
      let t = idealTemp + (Math.random() * 1.5 - 0.75);
      if (simulateSpike && h >= 10 && h <= 16) {
        // Temperature breach incident (Reefer compressor failure)
        t = idealTemp + 8.5 + (Math.random() * 2.0);
      }
      logs.push({
        timestamp_hour: h,
        temperature_c: Math.round(t * 10) / 10,
        relative_humidity_pct: Math.round(88 + Math.random() * 5),
        vibration_g: 0.4
      });
    }

    try {
      const result = await api.syncIoTLogs({
        commodity_name: commodity,
        baseline_shelf_life_days: baselineDays,
        ideal_storage_temp_c: idealTemp,
        actual_logs: logs
      });
      setIotData({ ...result, time_series: logs });
    } catch (err) {
      console.error('Error fetching IoT analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [commodity, idealTemp, simulateSpike]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Real-Time Cold Chain IoT Telemetry & Dynamic Shelf-Life</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              IoT Reefer Logger & Thermal Stress Engine
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Captures live temperature data from reefer truck sensors. Dynamically recalculates remaining shelf-life when temperature abuse breaches optimal thresholds.
            </p>
          </div>

          <button
            onClick={fetchAnalysis}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Simulate Live Ping</span>
          </button>
        </div>
      </div>

      {/* Controls & Simulator Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <label className="text-xs text-slate-400 font-semibold block">Target Commodity</label>
          <select
            value={commodity}
            onChange={(e) => {
              const val = e.target.value;
              setCommodity(val);
              setIdealTemp(val.includes('Mango') ? 12.0 : (val.includes('Paneer') ? 4.0 : 0.5));
              setBaselineDays(val.includes('Mango') ? 21.0 : (val.includes('Paneer') ? 6.0 : 4.0));
            }}
            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
          >
            <option value="Alphonso Mango">🥭 Alphonso Mango (Ideal 12°C)</option>
            <option value="Fresh Paneer">🧀 Fresh Paneer (Ideal 4°C)</option>
            <option value="Fresh Chicken Breast">🍗 Fresh Chicken (Ideal 0°C)</option>
          </select>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <label className="text-xs text-slate-400 font-semibold block">Ideal Target Cold Chain</label>
          <span className="text-lg font-mono font-bold text-emerald-400">{idealTemp}°C ± 1.5°C</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-200 font-semibold block">Simulate Temperature Breach</span>
            <span className="text-[10px] text-slate-400">Hours 10–16 reefer compressor trip</span>
          </div>
          <button
            onClick={() => setSimulateSpike(!simulateSpike)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              simulateSpike ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {simulateSpike ? 'SPIKE ON (+9°C)' : 'STABLE TEMP'}
          </button>
        </div>
      </div>

      {/* IoT Metric Cards */}
      {iotData && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 block">Cold Chain Integrity Status</span>
            <span className={`text-xs font-bold px-2 py-1 rounded inline-block ${
              iotData.status === 'OPTIMAL_COLD_CHAIN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {iotData.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 block">Peak Temp Breach</span>
            <span className="text-xl font-mono font-black text-rose-400">{iotData.max_temperature_observed_c}°C</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 block">Adjusted Remaining Shelf-Life</span>
            <span className="text-xl font-mono font-black text-brand-400">
              {iotData.adjusted_remaining_shelf_life_days} Days
            </span>
            <span className="text-[10px] text-slate-500 block">Original: {iotData.original_shelf_life_days} Days</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 block">Batch Quality Health</span>
            <span className="text-xl font-mono font-black text-cyan-400">{iotData.current_health_score}%</span>
          </div>
        </div>
      )}

      {/* IoT Time-Series Chart */}
      {iotData && iotData.time_series && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Reefer Compartment Temperature Telemetry (24-Hour Stream)</h3>
            <span className="text-xs text-slate-400 font-mono">Sensor ID: IoT-REEFER-0941</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={iotData.time_series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp_hour" stroke="#64748b" label={{ value: 'Transit Hours', position: 'insideBottomRight', offset: -5, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" domain={[0, 30]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }} />
                <ReferenceLine y={idealTemp} stroke="#10b981" strokeDasharray="4 4" label={{ value: `Target ${idealTemp}°C`, fill: '#10b981', fontSize: 10 }} />
                <Line type="monotone" dataKey="temperature_c" name="Temp °C" stroke="#f43f5e" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300">
            <strong>Diagnostic Recommendation:</strong> {iotData.recommendation}
          </div>
        </div>
      )}
    </div>
  );
};

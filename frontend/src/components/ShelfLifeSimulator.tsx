import React, { useState, useEffect } from 'react';
import { 
  Timer, 
  Thermometer, 
  Droplets, 
  Flame, 
  TrendingDown, 
  ShieldAlert, 
  RefreshCw, 
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { SimulationResult, RecommendationResult } from '../types';
import { api } from '../lib/api';

interface ShelfLifeSimulatorProps {
  currentRecommendation?: RecommendationResult | null;
}

export const ShelfLifeSimulator: React.FC<ShelfLifeSimulatorProps> = ({ currentRecommendation }) => {
  const [commodityName, setCommodityName] = useState<string>(
    currentRecommendation ? currentRecommendation.commodity_name : 'Crispy Potato Wafers'
  );
  const [temperature, setTemperature] = useState<number>(
    currentRecommendation?.primary_material_code?.includes('PERF') ? 4.0 : 25.0
  );
  const [humidity, setHumidity] = useState<number>(65.0);
  const [durationDays, setDurationDays] = useState<number>(90);
  const [customOtr, setCustomOtr] = useState<number>(currentRecommendation?.target_otr || 15.0);
  const [customWvtr, setCustomWvtr] = useState<number>(currentRecommendation?.target_wvtr || 1.2);
  const [isMapActive, setIsMapActive] = useState<boolean>(currentRecommendation?.is_map_recommended || false);
  
  const [simulationData, setSimulationData] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      const res = await api.runSimulation({
        recommendation_id: currentRecommendation?.id,
        commodity_name: commodityName,
        storage_temperature_c: temperature,
        relative_humidity_pct: humidity,
        duration_days: durationDays,
        custom_otr: customOtr,
        custom_wvtr: customWvtr,
        is_map_applied: isMapActive
      });
      setSimulationData(res);
    } catch (err) {
      console.error('Error running simulation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [temperature, humidity, isMapActive, durationDays]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Simulator Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Timer className="w-3.5 h-3.5 text-indigo-400" />
              <span>Arrhenius & Moisture Sorption Isotherm Simulator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Dynamic Shelf-Life & Temperature Abuse Engine
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Simulates daily kinetic deterioration of food quality, lipid rancidity, and moisture diffusion under baseline vs abused environmental conditions.
            </p>
          </div>

          <button
            onClick={runSimulation}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
            <span>Re-Calculate Kinetics</span>
          </button>
        </div>
      </div>

      {/* Control Sliders & Conditions Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Temperature Slider */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Thermometer className="w-4 h-4 text-rose-400" />
              <span>Ambient Temp</span>
            </span>
            <span className={`text-sm font-mono font-bold ${temperature > 30 ? 'text-rose-400' : 'text-brand-400'}`}>
              {temperature}°C
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="45"
            step="1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-brand-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0°C (Chilled)</span>
            <span>25°C (Standard)</span>
            <span>45°C (Extreme Abuse)</span>
          </div>
        </div>

        {/* Humidity Slider */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Droplets className="w-4 h-4 text-sky-400" />
              <span>Relative Humidity</span>
            </span>
            <span className={`text-sm font-mono font-bold ${humidity > 80 ? 'text-sky-300' : 'text-sky-400'}`}>
              {humidity}% RH
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="95"
            step="5"
            value={humidity}
            onChange={(e) => setHumidity(parseFloat(e.target.value))}
            className="w-full accent-sky-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>20% (Dry)</span>
            <span>65% (Moderate)</span>
            <span>95% (Tropical)</span>
          </div>
        </div>

        {/* Duration Slider */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Timer className="w-4 h-4 text-purple-400" />
              <span>Simulation Horizon</span>
            </span>
            <span className="text-sm font-mono font-bold text-purple-400">{durationDays} Days</span>
          </div>
          <input
            type="range"
            min="10"
            max="365"
            step="5"
            value={durationDays}
            onChange={(e) => setDurationDays(parseInt(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>10 Days</span>
            <span>180 Days</span>
            <span>365 Days</span>
          </div>
        </div>

        {/* MAP Gas Active Toggle */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-1">MAP Atmosphere</span>
            <span className="text-[11px] text-slate-400">Nitrogen / CO₂ Gas Flushing</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setIsMapActive(!isMapActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                isMapActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isMapActive ? 'ACTIVE FLUSH' : 'AIR HEADSPACE'}
            </button>
            <span className="text-[11px] font-mono text-slate-400">
              {isMapActive ? '3% O₂' : '20.9% O₂'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Degradation Timeline Chart */}
      {simulationData && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Quality Retention Curve over Storage Horizon</h3>
              <p className="text-xs text-slate-400">{simulationData.summary_insight}</p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="text-slate-300">Composite Quality</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                <span className="text-slate-300">Moisture (%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="text-slate-300">Oxidation Index</span>
              </div>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simulationData.timeline_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Storage Days', position: 'insideBottomRight', offset: -5, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }} />
                <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Commercial Spoilage Limit', fill: '#ef4444', fontSize: 10 }} />
                <Line type="monotone" dataKey="quality_score" name="Quality Score" stroke="#10b981" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="moisture_content_pct" name="Moisture %" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="lipid_oxidation_index" name="Oxidation Index" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Spoilage & Critical Milestones */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block">Predicted Spoilage Threshold</span>
              <span className={`text-xl font-mono font-black ${simulationData.spoilage_day ? 'text-amber-400' : 'text-emerald-400'}`}>
                {simulationData.spoilage_day ? `Day ${simulationData.spoilage_day}` : `>${durationDays} Days (Stable)`}
              </span>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block">Primary Quality Bottleneck</span>
              <span className="text-sm font-bold text-white block mt-1">{simulationData.limiting_factor}</span>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block">End-of-Run Quality Index</span>
              <span className={`text-xl font-mono font-black ${simulationData.final_quality_score < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {simulationData.final_quality_score}/100
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

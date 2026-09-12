import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  Leaf, 
  Timer, 
  Sparkles, 
  ArrowLeft, 
  QrCode, 
  TrendingUp, 
  Activity, 
  Wind, 
  FileText, 
  IndianRupee,
  Share2,
  Printer,
  Info,
  Box,
  Languages
} from 'lucide-react';
import { RecommendationResult } from '../types';
import { Pouch3DViewer } from './Pouch3DViewer';
import { LanguageVoiceAssistant } from './LanguageVoiceAssistant';
import { TechnicalDataSheetPDF } from './TechnicalDataSheetPDF';

interface RecommendationResultViewProps {
  result: RecommendationResult;
  onBackToForm: () => void;
  onRunSimulation: () => void;
  onCreatePassport: () => void;
}

export const RecommendationResultView: React.FC<RecommendationResultViewProps> = ({
  result,
  onBackToForm,
  onRunSimulation,
  onCreatePassport,
}) => {
  const [showTdsView, setShowTdsView] = useState<boolean>(false);

  if (showTdsView) {
    return <TechnicalDataSheetPDF recommendation={result} onBack={() => setShowTdsView(false)} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={onBackToForm}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Adjust Input Parameters</span>
        </button>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={onRunSimulation}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition"
          >
            <Timer className="w-4 h-4" />
            <span>Simulate Shelf-Life Dynamics</span>
          </button>

          <button
            onClick={() => setShowTdsView(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs transition"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Technical Spec Sheet (TDS)</span>
          </button>
        </div>
      </div>

      {/* Primary Recommendation Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-brand-950/40 border border-brand-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40 text-[11px] font-extrabold uppercase tracking-wide">
                Optimal Packaging Match
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-semibold">
                {result.recommended_structure_type.replace(/_/g, ' ')}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                {result.recyclability_grade}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {result.primary_material_name}
            </h1>

            <p className="text-sm text-slate-300 max-w-3xl">
              Engineered for <span className="text-white font-bold">{result.commodity_name}</span> with physics-calculated barrier thresholds to achieve <span className="text-brand-400 font-bold">{result.predicted_shelf_life_days} days</span> of stable commercial shelf life ({result.shelf_life_gain_multiplier}x extension over unpackaged baseline).
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 min-w-[280px]">
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block">Total Gauge</span>
              <span className="text-xl font-mono font-black text-white">{result.recommended_total_thickness_um} µm</span>
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block">Eco Sustainability</span>
              <span className="text-xl font-mono font-black text-emerald-400">{result.sustainability_score}/100</span>
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block">Carbon / 1k Packs</span>
              <span className="text-xl font-mono font-black text-cyan-400">{result.carbon_footprint_per_1000_packs_kg} kg</span>
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block">Est. Cost / 1k</span>
              <span className="text-xl font-mono font-black text-amber-400">₹{result.cost_estimate_per_1000_packs_inr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Multilayer Laminate Explorer & Critical Barrier Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Multilayer Laminate Structure (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-brand-400" />
              <h3 className="text-base font-bold text-white">Multilayer Laminate Cross-Section</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">{result.laminate_layers.length} Functional Layers</span>
          </div>

          {/* Interactive Layer Visualizer */}
          <div className="space-y-3">
            {result.laminate_layers.map((layer, idx) => {
              const bgColors = [
                'bg-gradient-to-r from-sky-500/20 to-sky-600/10 border-sky-500/40 text-sky-300',
                'bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-amber-500/40 text-amber-300',
                'bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border-emerald-500/40 text-emerald-300',
                'bg-gradient-to-r from-purple-500/20 to-purple-600/10 border-purple-500/40 text-purple-300',
              ];
              const colorClass = bgColors[idx % bgColors.length];

              return (
                <div
                  key={layer.layer_number}
                  className={`p-4 rounded-xl border ${colorClass} transition-all hover:scale-[1.01]`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center font-mono font-bold text-xs text-white">
                        {layer.layer_number}
                      </span>
                      <span className="font-bold text-sm text-white">{layer.material_name}</span>
                    </div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-950/80 text-white border border-slate-800">
                      {layer.thickness_um} µm
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 pl-8 space-y-1">
                    <p className="font-medium text-slate-200">Role: <span className="font-normal text-slate-300">{layer.role}</span></p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{layer.barrier_contribution}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Micro-Perforation Produce Banner if present */}
          {result.micro_perforation_spec && result.micro_perforation_spec.is_required && (
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-2">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
                <Wind className="w-4 h-4" />
                <span>Laser Micro-Perforation Respiration Specification</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block">Holes per Pack</span>
                  <span className="font-mono font-bold text-white">{result.micro_perforation_spec.pores_per_package} pores</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Pore Diameter</span>
                  <span className="font-mono font-bold text-white">{result.micro_perforation_spec.pore_diameter_um} µm</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Pore Area</span>
                  <span className="font-mono font-bold text-white">{result.micro_perforation_spec.total_open_area_mm2} mm²</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Density</span>
                  <span className="font-mono font-bold text-white">{result.micro_perforation_spec.perforation_density_pores_m2} /m²</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Barrier Targets & MAP Flush (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Barrier Properties Table */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Target Barrier Specifications</h3>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-300 block">Oxygen Transmission (OTR)</span>
                  <span className="text-[10px] text-slate-500">ASTM D3985 @ 23°C, 0% RH</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-emerald-400">≤ {result.target_otr}</span>
                  <span className="text-[10px] text-slate-400 block">cc / m² · day · atm</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-300 block">Water Vapor Transmission (WVTR)</span>
                  <span className="text-[10px] text-slate-500">ASTM E96 @ 38°C, 90% RH</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-sky-400">≤ {result.target_wvtr}</span>
                  <span className="text-[10px] text-slate-400 block">g / m² · day</span>
                </div>
              </div>

              {result.target_co2tr && (
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-300 block">Carbon Dioxide Rate (CO2TR)</span>
                    <span className="text-[10px] text-slate-500">ASTM F2476</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-purple-400">~ {result.target_co2tr}</span>
                    <span className="text-[10px] text-slate-400 block">cc / m² · day · atm</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MAP Gas Flushing Blueprint */}
          {result.is_map_recommended && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Wind className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Modified Atmosphere (MAP) Flush</h3>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 block">Nitrogen (N₂)</span>
                  <span className="text-lg font-mono font-black text-cyan-400">{result.map_gas_n2_pct || 0}%</span>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 block">Carbon Dioxide (CO₂)</span>
                  <span className="text-lg font-mono font-black text-purple-400">{result.map_gas_co2_pct || 0}%</span>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 block">Oxygen (O₂)</span>
                  <span className="text-lg font-mono font-black text-emerald-400">{result.map_gas_o2_pct || 0}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Action: Digital QR Passport */}
          <div className="glass-panel p-6 rounded-2xl border border-brand-500/30 bg-gradient-to-br from-slate-900 via-brand-950/20 to-slate-900 space-y-3">
            <div className="flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-brand-400" />
              <h3 className="text-sm font-bold text-white">Issue Digital Product Passport</h3>
            </div>
            <p className="text-xs text-slate-300">
              Generate a cryptographic QR batch certificate and verifiable traceability record for regulatory FSSAI compliance.
            </p>
            <button
              onClick={onCreatePassport}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs shadow-lg shadow-brand-500/20 transition"
            >
              <QrCode className="w-4 h-4" />
              <span>Generate Batch Passport & QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive 3D Pouch & Laminate Visualizer */}
      <Pouch3DViewer recommendation={result} />

      {/* Multilingual Voice Assistant */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <LanguageVoiceAssistant currentRecommendation={result} />
      </div>

      {/* Alternative Packaging Recommendations Matrix */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Strategic Alternative Formulations</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {result.alternative_options.map((alt, idx) => (
            <div
              key={idx}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-brand-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-brand-400 uppercase tracking-wide">{alt.tier_name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">{alt.thickness_um} µm</span>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug">{alt.structure_name}</h4>
                <p className="text-xs text-slate-400">{alt.highlight}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Eco Score</span>
                  <span className="font-mono font-bold text-emerald-400">{alt.sustainability_score}/100</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Est. Cost / 1k</span>
                  <span className="font-mono font-bold text-amber-400">₹{alt.cost_1000_inr}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Notes & Compliance Guidelines */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-bold text-white">Engineering Notes & Food Safety Compliance</h3>
        </div>
        <ul className="space-y-2 text-xs text-slate-300">
          {result.technical_notes.map((note, i) => (
            <li key={i} className="flex items-start space-x-2">
              <span className="text-brand-400 font-bold mt-0.5">•</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

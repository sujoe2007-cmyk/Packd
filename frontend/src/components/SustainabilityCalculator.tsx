import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  Trees, 
  Recycle, 
  Factory, 
  IndianRupee, 
  Scale, 
  ShieldCheck, 
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { api } from '../lib/api';

export const SustainabilityCalculator: React.FC = () => {
  const [annualUnits, setAnnualUnits] = useState<number>(500000); // 500,000 packs/year
  const [materialCode, setMaterialCode] = useState<string>('BOPP-PE-60');
  const [thicknessUm, setThicknessUm] = useState<number>(60.0);
  const [surfaceAreaCm2, setSurfaceAreaCm2] = useState<number>(400.0);
  const [isBio, setIsBio] = useState<boolean>(false);
  const [recyclingCode, setRecyclingCode] = useState<number>(4);

  const [calcData, setCalcData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const calculate = async () => {
    setIsLoading(true);
    try {
      const res = await api.calculateSustainability({
        material_code: materialCode,
        total_thickness_um: thicknessUm,
        surface_area_cm2: surfaceAreaCm2,
        annual_pack_volume: annualUnits,
        is_biodegradable: isBio,
        is_recyclable: !isBio,
        recycling_code: recyclingCode
      });
      setCalcData(res);
    } catch (err) {
      console.error('Error calculating sustainability:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [annualUnits, materialCode, thicknessUm, surfaceAreaCm2, isBio, recyclingCode]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-3">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>Plastic Waste Management (PWM) & EPR Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Sustainability & Life Cycle Assessment (LCA)
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Calculates enterprise plastic waste tonnage, Extended Producer Responsibility (EPR) recycling targets, carbon offsets, and material economics.
          </p>
        </div>
      </div>

      {/* Input Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <label className="block text-xs font-semibold text-slate-300">Annual Production Volume</label>
          <input
            type="number"
            step="50000"
            min="1000"
            value={annualUnits}
            onChange={(e) => setAnnualUnits(parseInt(e.target.value) || 10000)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:border-brand-400 focus:outline-none"
          />
          <span className="text-[10px] text-slate-500 block">Packs / Pouches per year</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <label className="block text-xs font-semibold text-slate-300">Polymer Classification</label>
          <select
            value={materialCode}
            onChange={(e) => {
              const val = e.target.value;
              setMaterialCode(val);
              setIsBio(val.includes('BIO') || val.includes('PLA'));
            }}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-brand-400 focus:outline-none"
          >
            <option value="BOPP-PE-60">Mono-Polyolefin Duplex (BOPP/PE 60µm)</option>
            <option value="MET-BOPP-70">Metallized Barrier Triplex (70µm)</option>
            <option value="PET-ALU-PE-71">Aluminum Foil Triplex (71µm)</option>
            <option value="BIO-TRIPLE-80">100% Compostable Bio-Laminate (80µm)</option>
          </select>
          <span className="text-[10px] text-slate-500 block">Material Laminate Profile</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <label className="block text-xs font-semibold text-slate-300">Film Thickness (µm)</label>
          <input
            type="number"
            min="20"
            max="200"
            value={thicknessUm}
            onChange={(e) => setThicknessUm(parseFloat(e.target.value) || 50)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:border-brand-400 focus:outline-none"
          />
          <span className="text-[10px] text-slate-500 block">Gauge in microns</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <label className="block text-xs font-semibold text-slate-300">Pouch Area (cm²)</label>
          <input
            type="number"
            min="50"
            max="2000"
            value={surfaceAreaCm2}
            onChange={(e) => setSurfaceAreaCm2(parseFloat(e.target.value) || 400)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:border-brand-400 focus:outline-none"
          />
          <span className="text-[10px] text-slate-500 block">Total surface area</span>
        </div>
      </div>

      {/* Computed Results Dashboard */}
      {calcData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Annual Plastic Tonnage */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Annual Material Tonnage</span>
              <Scale className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-mono font-black text-white">
              {calcData.annual_projection.annual_plastic_tonnage_mt} MT
            </div>
            <span className="text-[11px] text-slate-400 block">
              Weight per pouch: <span className="font-mono font-bold text-slate-200">{calcData.per_pack_metrics.weight_per_pack_grams}g</span>
            </span>
          </div>

          {/* Card 2: Carbon Footprint */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Annual Carbon Emissions</span>
              <Factory className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-mono font-black text-cyan-400">
              {calcData.annual_projection.annual_carbon_footprint_mt_co2} MT CO₂
            </div>
            <span className="text-[11px] text-slate-400 block">
              Trees equivalent to offset: <span className="font-mono font-bold text-emerald-400">{calcData.annual_projection.greenhouse_gas_equivalent_trees_saved} trees</span>
            </span>
          </div>

          {/* Card 3: EPR Recycling Obligation */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">EPR Recycling Target</span>
              <Recycle className="w-4 h-4 text-brand-400" />
            </div>
            <div className="text-2xl font-mono font-black text-brand-400">
              {calcData.annual_projection.epr_recycling_target_pct}%
            </div>
            <span className="text-[11px] text-slate-400 block">
              Obligation: <span className="font-mono font-bold text-slate-200">{calcData.annual_projection.epr_recycling_obligation_kg} kg</span>
            </span>
          </div>

          {/* Card 4: Annual Material Spend */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Annual Packaging Budget</span>
              <IndianRupee className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-mono font-black text-amber-400">
              ₹{(calcData.annual_projection.annual_material_spend_inr / 100000).toFixed(2)} Lakhs
            </div>
            <span className="text-[11px] text-slate-400 block font-mono">
              ₹{calcData.per_pack_metrics.cost_estimate_per_1000_packs_inr} per 1k units
            </span>
          </div>
        </div>
      )}

      {/* Compliance Framework Box */}
      {calcData && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-brand-400" />
            <h3 className="text-sm font-bold text-white">Regulatory PWM Classification & Circular Economy Pathway</h3>
          </div>
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <p>
              <strong className="text-white">MoEFCC PWM Category:</strong> {calcData.annual_projection.pwm_category}
            </p>
            <p>
              <strong className="text-white">EPR Compliance Note:</strong> Flexible multilayer packaging (MLP) without mono-polymer composition requires 100% EPR end-of-life collection certificates or transition to biodegradable biopolymer substitutes (Category IV).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

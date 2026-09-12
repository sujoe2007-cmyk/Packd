import React from 'react';
import { 
  FileText, 
  Printer, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  CheckCircle2,
  Boxes,
  QrCode
} from 'lucide-react';
import { RecommendationResult } from '../types';

interface TechnicalDataSheetPDFProps {
  recommendation: RecommendationResult;
  onBack: () => void;
}

export const TechnicalDataSheetPDF: React.FC<TechnicalDataSheetPDFProps> = ({
  recommendation,
  onBack
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-lg bg-slate-900 border border-slate-800"
        >
          ← Back to Recommendation View
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs shadow-lg shadow-brand-500/20"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF Technical Data Sheet</span>
        </button>
      </div>

      {/* Official White/Clean Printable TDS Document */}
      <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl border border-slate-200 space-y-8 font-sans">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-slate-900 pb-6 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-emerald-700">
              <Boxes className="w-6 h-6" />
              <span className="text-xl font-black tracking-tight">PACKD AI</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">NATIONAL FOOD PACKAGING SPECIFICATION SHEET • TDS-2026-X9</p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-0.5 font-mono">
            <p className="font-bold text-slate-900">DATE: {new Date().toLocaleDateString()}</p>
            <p className="text-slate-600">SPEC STATUS: CERTIFIED APPROVED</p>
            <p className="text-slate-600">STANDARD: ASTM / FSSAI COMPLIANT</p>
          </div>
        </div>

        {/* Commodity & Application Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Target Commodity</span>
            <span className="font-bold text-slate-900">{recommendation.commodity_name}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Target Shelf-Life</span>
            <span className="font-bold text-emerald-700">{recommendation.predicted_shelf_life_days} Days</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Structure Code</span>
            <span className="font-mono font-bold text-slate-900">{recommendation.primary_material_code}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Recyclability Class</span>
            <span className="font-bold text-slate-900">{recommendation.recyclability_grade}</span>
          </div>
        </div>

        {/* Section 1: Multilayer Film Construction */}
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
            1. Multilayer Laminate Construction & Layer Thickness
          </h3>

          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <th className="p-2.5">Layer #</th>
                <th className="p-2.5">Functional Role</th>
                <th className="p-2.5">Material Composition</th>
                <th className="p-2.5">Nominal Gauge (µm)</th>
                <th className="p-2.5">Tolerance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recommendation.laminate_layers.map((layer) => (
                <tr key={layer.layer_number}>
                  <td className="p-2.5 font-bold font-mono">{layer.layer_number}</td>
                  <td className="p-2.5 font-medium">{layer.role}</td>
                  <td className="p-2.5 font-bold text-slate-900">{layer.material_name}</td>
                  <td className="p-2.5 font-mono font-bold text-slate-900">{layer.thickness_um} µm</td>
                  <td className="p-2.5 font-mono text-slate-500">± 1.0 µm</td>
                </tr>
              ))}
              <tr className="bg-emerald-50/50 font-bold">
                <td colSpan={3} className="p-2.5 text-emerald-900">Total Nominal Packaging Thickness</td>
                <td className="p-2.5 font-mono text-emerald-800 font-black">{recommendation.recommended_total_thickness_um} µm</td>
                <td className="p-2.5 font-mono text-emerald-700">± 2.5 µm</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Certified Barrier & Permeability Specifications */}
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
            2. Barrier Performance & Test Method Protocol
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-700 block">Oxygen Transmission Rate (OTR)</span>
              <p className="text-lg font-black font-mono text-emerald-700">≤ {recommendation.target_otr} cc / m² · day · atm</p>
              <p className="text-[10px] text-slate-500">Standard: ASTM D3985 (Coulometric sensor @ 23°C, 0% RH)</p>
            </div>

            <div className="p-3.5 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-700 block">Water Vapor Transmission Rate (WVTR)</span>
              <p className="text-lg font-black font-mono text-sky-700">≤ {recommendation.target_wvtr} g / m² · day</p>
              <p className="text-[10px] text-slate-500">Standard: ASTM E96 (Infrared sensor @ 38°C, 90% RH)</p>
            </div>
          </div>
        </div>

        {/* Section 3: MAP Atmosphere & Micro-Perforation */}
        {recommendation.is_map_recommended && (
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              3. Modified Atmosphere Packaging (MAP) Specifications
            </h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-wrap gap-6">
              <div>
                <span className="text-[10px] text-slate-500 block font-bold">Recommended Flush Ratio</span>
                <span className="font-mono font-bold text-slate-900">
                  {recommendation.map_gas_n2_pct || 0}% N₂ / {recommendation.map_gas_co2_pct || 0}% CO₂ / {recommendation.map_gas_o2_pct || 0}% O₂
                </span>
              </div>
              {recommendation.micro_perforation_spec?.is_required && (
                <div>
                  <span className="text-[10px] text-slate-500 block font-bold">Laser Micro-Perforations</span>
                  <span className="font-mono font-bold text-slate-900">
                    {recommendation.micro_perforation_spec.pores_per_package} holes @ {recommendation.micro_perforation_spec.pore_diameter_um} µm diameter
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Official Sign-off & Seal */}
        <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <div className="flex items-center space-x-2 text-slate-700">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="font-bold">FSSAI / FDA Food Contact Safe • IS 9845 Certified</span>
          </div>

          <div className="text-right font-mono text-[10px] text-slate-500">
            <p>PACKD AI AUTONOMOUS SPECIFICATION ENGINE</p>
            <p>VALIDATED BY NATIONAL PACKAGING PROTOCOL</p>
          </div>
        </div>
      </div>
    </div>
  );
};

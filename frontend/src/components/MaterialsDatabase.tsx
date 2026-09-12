import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  ShieldCheck, 
  Leaf, 
  IndianRupee, 
  Scale, 
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { PackagingMaterial } from '../types';
import { api } from '../lib/api';

export const MaterialsDatabase: React.FC = () => {
  const [materials, setMaterials] = useState<PackagingMaterial[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<any>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoading(true);
      try {
        const cat = selectedCategory === 'ALL' ? undefined : selectedCategory;
        const data = await api.getMaterials(cat, searchQuery || undefined);
        setMaterials(data);
      } catch (err) {
        console.error('Error fetching materials:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMaterials();
  }, [selectedCategory, searchQuery]);

  const toggleCompare = async (id: string) => {
    let updated: string[];
    if (selectedForCompare.includes(id)) {
      updated = selectedForCompare.filter(i => i !== id);
    } else {
      if (selectedForCompare.length >= 4) {
        alert('You can compare up to 4 materials simultaneously.');
        return;
      }
      updated = [...selectedForCompare, id];
    }
    setSelectedForCompare(updated);

    if (updated.length >= 2) {
      try {
        const res = await api.compareMaterials(updated);
        setComparisonData(res);
      } catch (err) {
        console.error('Error comparing:', err);
      }
    } else {
      setComparisonData(null);
    }
  };

  const categories = [
    'ALL',
    'CONVENTIONAL',
    'HIGH_BARRIER',
    'BIODEGRADABLE_COMPOSTABLE',
    'BREATHABLE'
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Advanced Polymer & Biopolymer Database</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Packaging Material Matrix
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Comprehensive barrier properties (OTR, WVTR), thermal sealing kinetics, tensile ratings, ASTM D6400 biodegradability, and carbon footprints.
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by material name, code, or polymer (e.g. EVOH, PLA, Met-PET, LDPE)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-brand-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-sm font-bold'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Drawer if 2+ selected */}
      {comparisonData && comparisonData.materials && (
        <div className="glass-panel p-6 rounded-2xl border border-brand-500/40 space-y-4 bg-slate-950/90 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-bold text-white">Side-by-Side Material Comparison ({comparisonData.count} Selected)</h3>
            </div>
            <button
              onClick={() => { setSelectedForCompare([]); setComparisonData(null); }}
              className="text-xs text-slate-400 hover:text-rose-400 transition"
            >
              Clear Comparison
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 pr-4 font-semibold">Parameter</th>
                  {comparisonData.materials.map((m: any) => (
                    <th key={m.id} className="py-2 px-3 font-bold text-white">{m.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                <tr>
                  <td className="py-2.5 pr-4 text-slate-400 font-sans">OTR (cc/m²·day·atm)</td>
                  {comparisonData.materials.map((m: any) => (
                    <td key={m.id} className="py-2.5 px-3 font-bold text-emerald-400">{m.otr_at_23c}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 text-slate-400 font-sans">WVTR (g/m²·day)</td>
                  {comparisonData.materials.map((m: any) => (
                    <td key={m.id} className="py-2.5 px-3 font-bold text-sky-400">{m.wvtr_at_38c}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 text-slate-400 font-sans">Tensile Strength (MPa)</td>
                  {comparisonData.materials.map((m: any) => (
                    <td key={m.id} className="py-2.5 px-3 text-white">{m.tensile_strength_mpa}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 text-slate-400 font-sans">Carbon Footprint (kg CO₂/kg)</td>
                  {comparisonData.materials.map((m: any) => (
                    <td key={m.id} className="py-2.5 px-3 text-cyan-400">{m.carbon_footprint_kg_co2_per_kg}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 text-slate-400 font-sans">Cost (INR / kg)</td>
                  {comparisonData.materials.map((m: any) => (
                    <td key={m.id} className="py-2.5 px-3 text-amber-400 font-bold">₹{m.approx_cost_inr_per_kg}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 text-slate-400 font-sans">Biodegradable / Compostable</td>
                  {comparisonData.materials.map((m: any) => (
                    <td key={m.id} className="py-2.5 px-3">
                      {m.is_biodegradable ? (
                        <span className="text-emerald-400 font-sans font-bold">YES (ASTM D6400)</span>
                      ) : (
                        <span className="text-slate-500 font-sans">No</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid of Materials */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 space-x-2 text-slate-400 text-xs">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading Materials...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {materials.map((m) => {
            const isSelected = selectedForCompare.includes(m.id);
            return (
              <div
                key={m.id}
                className={`glass-panel p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isSelected ? 'border-brand-500 shadow-lg shadow-brand-500/10' : 'border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {m.code}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5">{m.name}</h3>
                    </div>

                    <button
                      onClick={() => toggleCompare(m.id)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                        isSelected
                          ? 'bg-brand-500 text-slate-950 border-brand-400'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ Comparing' : '+ Compare'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{m.description}</p>

                  {/* Barrier Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">OTR @ 23°C</span>
                      <span className="font-bold text-emerald-400">{m.otr_at_23c}</span>
                      <span className="text-[9px] text-slate-500 block font-sans">cc/m²·day·atm</span>
                    </div>

                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">WVTR @ 38°C</span>
                      <span className="font-bold text-sky-400">{m.wvtr_at_38c}</span>
                      <span className="text-[9px] text-slate-500 block font-sans">g/m²·day</span>
                    </div>
                  </div>

                  {/* Eco & Cost Badges */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                    <div className="flex items-center space-x-1">
                      <Leaf className={`w-3.5 h-3.5 ${m.is_biodegradable ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span className={`text-[11px] font-medium ${m.is_biodegradable ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                        {m.is_biodegradable ? 'Compostable' : `RIC #${m.recycling_code} Recyclable`}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-400">₹{m.approx_cost_inr_per_kg} /kg</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

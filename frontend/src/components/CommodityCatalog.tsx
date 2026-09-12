import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Droplets, 
  Flame, 
  Wind, 
  Thermometer, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Tag
} from 'lucide-react';
import { FoodCommodity } from '../types';
import { api } from '../lib/api';

interface CommodityCatalogProps {
  onSelectCommodity: (commodity: FoodCommodity) => void;
}

export const CommodityCatalog: React.FC<CommodityCatalogProps> = ({ onSelectCommodity }) => {
  const [commodities, setCommodities] = useState<FoodCommodity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCommodities = async () => {
      setIsLoading(true);
      try {
        const cat = selectedCategory === 'ALL' ? undefined : selectedCategory;
        const data = await api.getCommodities(cat, searchQuery || undefined);
        setCommodities(data);
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommodities();
  }, [selectedCategory, searchQuery]);

  const categories = [
    'ALL',
    'Fresh Produce',
    'Snacks & Ready-To-Eat',
    'Dairy',
    'Meat & Poultry',
    'Bakery & Confectionery',
    'Grains & Cereals',
    'Beverages'
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>National Food Commodity Database</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Pre-Calibrated Food Commodities
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Curated biological and chemical property repository across 50+ horticultural and processed food matrices. Click any food to formulate optimal packaging.
            </p>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col md:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by food name (e.g. Mango, Paneer, Rice, Cashew, Strawberry)..."
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
                    ? 'bg-brand-500 text-slate-950 shadow-sm font-bold'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Food Commodity Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 space-x-2 text-slate-400 text-xs">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading Food Database...</span>
        </div>
      ) : commodities.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-2">
          <p className="text-sm font-bold text-slate-300">No matching food commodities found</p>
          <p className="text-xs text-slate-500">Try adjusting your search query or switch categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {commodities.map((item) => (
            <div
              key={item.id}
              className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{item.name}</h3>
                  </div>

                  {item.is_respiring && (
                    <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      <Wind className="w-3 h-3" />
                      <span>Respiring</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item.description || 'Pre-calibrated food matrix with laboratory-tested barrier sensitivities.'}
                </p>

                {/* Key Biochemical Parameters Matrix */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="bg-slate-900/90 p-2 rounded-lg text-center border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Moisture</span>
                    <span className="text-xs font-mono font-bold text-sky-400">{item.moisture_content}%</span>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-lg text-center border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Fat/Oil</span>
                    <span className="text-xs font-mono font-bold text-amber-400">{item.fat_content}%</span>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-lg text-center border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Water Act.</span>
                    <span className="text-xs font-mono font-bold text-brand-400">{item.water_activity} a_w</span>
                  </div>
                </div>

                {/* Degradation Mechanisms Tags */}
                {item.degradation_mechanisms && item.degradation_mechanisms.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.degradation_mechanisms.map((mech, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {mech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 1-Click Formulate Button */}
              <button
                onClick={() => onSelectCommodity(item)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-brand-500 hover:text-slate-950 text-slate-200 border border-slate-700 hover:border-brand-400 text-xs font-bold flex items-center justify-center space-x-2 transition-all group"
              >
                <span>Formulate Packaging</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

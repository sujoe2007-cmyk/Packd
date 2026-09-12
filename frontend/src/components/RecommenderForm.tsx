import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Flame, 
  Droplets, 
  Thermometer, 
  Truck, 
  Scale, 
  Leaf, 
  ArrowRight,
  RefreshCw,
  Camera,
  Languages,
  Layers,
  Compass,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { FoodCommodity, RecommendationResult } from '../types';
import { api } from '../lib/api';
import { LanguageVoiceAssistant } from './LanguageVoiceAssistant';

interface RecommenderFormProps {
  onRecommendationGenerated: (result: RecommendationResult) => void;
  preselectedCommodity?: FoodCommodity | null;
  onOpenScanner?: () => void;
}

export const RecommenderForm: React.FC<RecommenderFormProps> = ({ 
  onRecommendationGenerated,
  preselectedCommodity,
  onOpenScanner
}) => {
  const [commodities, setCommodities] = useState<FoodCommodity[]>([]);
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>('');
  const [isLoadingCommodities, setIsLoadingCommodities] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [aiWizardOpen, setAiWizardOpen] = useState<boolean>(false);
  const [voiceAssistantOpen, setVoiceAssistantOpen] = useState<boolean>(false);
  const [aiPromptName, setAiPromptName] = useState<string>('');
  const [aiPromptCategory, setAiPromptCategory] = useState<string>('Snacks & Ready-To-Eat');
  const [isEstimating, setIsEstimating] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    commodity_id: '',
    commodity_name: 'Crispy Potato Wafers',
    category: 'Snacks & Ready-To-Eat',
    moisture_content: 2.0,
    fat_content: 34.0,
    ph: 6.0,
    water_activity: 0.18,
    is_respiring: false,
    respiration_rate_o2: 0.0,
    respiration_rate_co2: 0.0,
    desired_shelf_life_days: 180,
    storage_type: 'AMBIENT',
    storage_temperature_c: 25.0,
    storage_relative_humidity_pct: 65.0,
    transportation_stress: 'MEDIUM',
    package_weight_grams: 100.0,
    package_surface_area_cm2: 400.0,
    headspace_volume_cm3: 150.0,
    eco_priority: 'BALANCED'
  });

  useEffect(() => {
    const fetchCommodities = async () => {
      try {
        const data = await api.getCommodities();
        setCommodities(data);
        if (data.length > 0) {
          const defaultItem = data.find(c => c.name.includes('Chips') || c.name.includes('Potato')) || data[0];
          applyCommodityPreset(defaultItem);
        }
      } catch (err) {
        console.error('Error fetching commodities:', err);
      } finally {
        setIsLoadingCommodities(false);
      }
    };
    fetchCommodities();
  }, []);

  useEffect(() => {
    if (preselectedCommodity) {
      applyCommodityPreset(preselectedCommodity);
    }
  }, [preselectedCommodity]);

  const applyCommodityPreset = (item: FoodCommodity) => {
    setSelectedCommodityId(item.id);
    setFormData(prev => ({
      ...prev,
      commodity_id: item.id,
      commodity_name: item.name,
      category: item.category,
      moisture_content: item.moisture_content,
      fat_content: item.fat_content,
      ph: item.ph,
      water_activity: item.water_activity,
      is_respiring: item.is_respiring,
      respiration_rate_o2: item.respiration_rate_o2,
      respiration_rate_co2: item.respiration_rate_co2,
      desired_shelf_life_days: item.baseline_shelf_life_ambient_days ? Math.min(365, item.baseline_shelf_life_ambient_days * 3) : 90,
      storage_temperature_c: item.optimal_temp_min !== undefined ? (item.optimal_temp_min + item.optimal_temp_max) / 2 : 25.0,
      storage_relative_humidity_pct: item.optimal_rh_min !== undefined ? (item.optimal_rh_min + item.optimal_rh_max) / 2 : 65.0,
    }));
  };

  const handleAiEstimate = async () => {
    if (!aiPromptName) return;
    setIsEstimating(true);
    try {
      const estimated = await api.estimateFoodProperties({
        name: aiPromptName,
        category: aiPromptCategory
      });
      setFormData(prev => ({
        ...prev,
        commodity_name: estimated.name || aiPromptName,
        category: estimated.category || aiPromptCategory,
        moisture_content: estimated.moisture_content,
        fat_content: estimated.fat_content,
        ph: estimated.ph,
        water_activity: estimated.water_activity,
        is_respiring: estimated.is_respiring,
        respiration_rate_o2: estimated.respiration_rate_o2 || 0.0,
        desired_shelf_life_days: estimated.baseline_shelf_life_ambient_days ? estimated.baseline_shelf_life_ambient_days * 2 : 90
      }));
      setAiWizardOpen(false);
    } catch (err) {
      console.error('Error estimating properties:', err);
      alert('Could not estimate properties. Please ensure backend is running.');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await api.generateRecommendation(formData);
      onRecommendationGenerated(result);
    } catch (err) {
      console.error('Error generating recommendation:', err);
      alert('Failed to compute recommendation. Please ensure the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Sleek Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-emerald-950/40 border border-slate-800/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Physics-Informed Formulation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Intelligent Packaging Formulator
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Computes exact multi-layer laminate gauges, barrier thresholds (OTR/WVTR), respiration micro-perforations, and compliance rules in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenScanner && (
              <button
                type="button"
                onClick={onOpenScanner}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 hover:text-sky-200 font-semibold text-xs transition-all shadow-sm"
              >
                <Camera className="w-4 h-4 text-sky-400" />
                <span>AI Vision Scan</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setAiWizardOpen(!aiWizardOpen)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 font-semibold text-xs transition-all shadow-sm"
            >
              <Wand2 className="w-4 h-4 text-emerald-400" />
              <span>Custom Food AI</span>
            </button>

            <button
              type="button"
              onClick={() => setVoiceAssistantOpen(!voiceAssistantOpen)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 hover:text-white font-semibold text-xs transition-all"
            >
              <Languages className="w-4 h-4 text-amber-400" />
              <span>Voice Assist</span>
            </button>
          </div>
        </div>

        {/* Voice Assistant Panel Dropdown */}
        {voiceAssistantOpen && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 animate-fadeIn">
            <LanguageVoiceAssistant />
          </div>
        )}

        {/* AI Custom Food Estimator Dropdown */}
        {aiWizardOpen && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/70 p-4 rounded-2xl border border-emerald-500/20 animate-fadeIn">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Custom Food Name</label>
              <input
                type="text"
                placeholder="e.g. Jackfruit Crisps, Gond Ladoo"
                value={aiPromptName}
                onChange={(e) => setAiPromptName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={aiPromptCategory}
                onChange={(e) => setAiPromptCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none"
              >
                <option value="Fresh Produce">Fresh Produce (Fruits / Veg)</option>
                <option value="Snacks & Ready-To-Eat">Snacks & Ready-To-Eat</option>
                <option value="Dairy">Dairy & Cheese</option>
                <option value="Meat & Poultry">Meat, Poultry & Seafood</option>
                <option value="Bakery & Confectionery">Bakery & Confectionery</option>
                <option value="Grains & Cereals">Grains & Cereals</option>
                <option value="Beverages">Beverages & Coffee</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAiEstimate}
                disabled={isEstimating || !aiPromptName}
                className="w-full py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20"
              >
                {isEstimating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                <span>Auto-Infer Parameters</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Commodity Selection & Biochemical Profile */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl space-y-6 border border-slate-800/90">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Food Commodity & Biochemical Profile</h3>
                <p className="text-xs text-slate-400">Select calibrated food matrix or enter custom properties</p>
              </div>
            </div>

            {/* Quick Preset Selector */}
            <div className="w-full sm:w-72">
              <select
                value={selectedCommodityId}
                onChange={(e) => {
                  const found = commodities.find(c => c.id === e.target.value);
                  if (found) applyCommodityPreset(found);
                }}
                className="w-full text-xs bg-slate-900 border border-slate-700/90 rounded-xl px-3.5 py-2 text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
              >
                <option value="">-- Choose Commodity Preset --</option>
                {commodities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Commodity Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Commodity Name</label>
              <input
                type="text"
                value={formData.commodity_name}
                onChange={(e) => setFormData({ ...formData, commodity_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-medium text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-medium text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
              >
                <option value="Fresh Produce">Fresh Produce (Fruits / Veg)</option>
                <option value="Snacks & Ready-To-Eat">Snacks & Ready-To-Eat</option>
                <option value="Dairy">Dairy & Cheese</option>
                <option value="Meat & Poultry">Meat & Poultry</option>
                <option value="Bakery & Confectionery">Bakery & Confectionery</option>
                <option value="Grains & Cereals">Grains & Cereals</option>
                <option value="Beverages">Beverages & Coffee</option>
                <option value="Oils & Fats">Oils & Fats</option>
              </select>
            </div>

            {/* Moisture Content % */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center space-x-1">
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                  <span>Moisture Content</span>
                </span>
                <span className="text-emerald-400 font-mono font-bold text-xs">{formData.moisture_content}%</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.moisture_content}
                onChange={(e) => setFormData({ ...formData, moisture_content: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-medium text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
              />
            </div>

            {/* Fat / Oil % */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fat / Oil Content</span>
                </span>
                <span className="text-amber-400 font-mono font-bold text-xs">{formData.fat_content}%</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.fat_content}
                onChange={(e) => setFormData({ ...formData, fat_content: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-medium text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
              />
            </div>

            {/* Water Activity aw */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Water Activity (a_w)</label>
              <input
                type="number"
                step="0.01"
                min="0.05"
                max="1.0"
                value={formData.water_activity}
                onChange={(e) => setFormData({ ...formData, water_activity: parseFloat(e.target.value) || 0.85 })}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-medium text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
              />
            </div>

            {/* pH */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">pH Level</label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="14.0"
                value={formData.ph}
                onChange={(e) => setFormData({ ...formData, ph: parseFloat(e.target.value) || 6.0 })}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-medium text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
              />
            </div>

            {/* Produce Respiration Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Produce Respiration</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${formData.is_respiring ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                  {formData.is_respiring ? 'ACTIVE' : 'NONE'}
                </span>
              </div>
              <div className="flex items-center space-x-2.5 pt-1.5">
                <input
                  type="checkbox"
                  id="resp_check"
                  checked={formData.is_respiring}
                  onChange={(e) => setFormData({ ...formData, is_respiring: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <label htmlFor="resp_check" className="text-xs text-slate-300 cursor-pointer select-none">
                  Living / Respiring Fruit / Veg
                </label>
              </div>
            </div>

            {/* Respiration Rate RO2 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                R_O2 (mg/kg·h at 20°C)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                disabled={!formData.is_respiring}
                value={formData.respiration_rate_o2}
                onChange={(e) => setFormData({ ...formData, respiration_rate_o2: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-medium text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all disabled:opacity-30"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Storage Environment, Package Sizing & Target */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl space-y-6 border border-slate-800/90">
          <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Storage Environment & Package Dimensions</h3>
              <p className="text-xs text-slate-400">Specify shelf-life goal, ambient temperatures, and geometry</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Desired Shelf Life */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Target Shelf Life</span>
                <span className="text-emerald-400 font-mono font-bold">{formData.desired_shelf_life_days} Days</span>
              </div>
              <input
                type="number"
                min="1"
                max="1000"
                value={formData.desired_shelf_life_days}
                onChange={(e) => setFormData({ ...formData, desired_shelf_life_days: parseInt(e.target.value) || 30 })}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-medium text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
              />
            </div>

            {/* Storage Mode */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Storage Mode</label>
              <select
                value={formData.storage_type}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    storage_type: val,
                    storage_temperature_c: val === 'FROZEN' ? -18.0 : (val === 'CHILLED' ? 4.0 : 25.0)
                  });
                }}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-medium text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
              >
                <option value="AMBIENT">Ambient (18°C - 35°C)</option>
                <option value="CHILLED">Chilled / Refrigerated (0°C - 8°C)</option>
                <option value="FROZEN">Frozen (-18°C)</option>
              </select>
            </div>

            {/* Storage Temp °C */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center space-x-1">
                  <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                  <span>Storage Temp</span>
                </span>
                <span className="text-rose-400 font-mono font-bold">{formData.storage_temperature_c}°C</span>
              </div>
              <input
                type="number"
                step="0.5"
                value={formData.storage_temperature_c}
                onChange={(e) => setFormData({ ...formData, storage_temperature_c: parseFloat(e.target.value) || 25 })}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-medium text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
              />
            </div>

            {/* Storage RH % */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Relative Humidity</span>
                <span className="text-sky-400 font-mono font-bold">{formData.storage_relative_humidity_pct}% RH</span>
              </div>
              <input
                type="number"
                min="10"
                max="100"
                value={formData.storage_relative_humidity_pct}
                onChange={(e) => setFormData({ ...formData, storage_relative_humidity_pct: parseFloat(e.target.value) || 65 })}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-medium text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
              />
            </div>

            {/* Package Weight */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <Scale className="w-3.5 h-3.5 text-indigo-400" />
                <span>Unit Weight (g)</span>
              </label>
              <input
                type="number"
                min="5"
                value={formData.package_weight_grams}
                onChange={(e) => setFormData({ ...formData, package_weight_grams: parseFloat(e.target.value) || 100 })}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-medium text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
              />
            </div>

            {/* Surface Area */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Surface Area (cm²)</label>
              <input
                type="number"
                min="20"
                value={formData.package_surface_area_cm2}
                onChange={(e) => setFormData({ ...formData, package_surface_area_cm2: parseFloat(e.target.value) || 400 })}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-medium text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
              />
            </div>

            {/* Logistics Stress */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Logistics Road Stress</span>
              </label>
              <select
                value={formData.transportation_stress}
                onChange={(e) => setFormData({ ...formData, transportation_stress: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-medium text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
              >
                <option value="LOW">Low (Urban Local Distribution)</option>
                <option value="MEDIUM">Medium (National Highway Freight)</option>
                <option value="HIGH">High (Rural / Rough Terrain / Vibration)</option>
              </select>
            </div>

            {/* Strategic Priority */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>Strategic Priority</span>
              </label>
              <select
                value={formData.eco_priority}
                onChange={(e) => setFormData({ ...formData, eco_priority: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-medium text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
              >
                <option value="BALANCED">Balanced (Barrier + Cost + Eco)</option>
                <option value="MAX_SUSTAINABILITY">100% Compostable / Bio-based</option>
                <option value="MAXIMUM_BARRIER">Maximum Barrier (Export Grade)</option>
                <option value="LOWEST_COST">Lowest Unit Packaging Cost</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                <span>Computing Physics & Laminate Synthesis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                <span>Generate Physics Formulation</span>
                <ArrowRight className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

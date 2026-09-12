import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Flame, 
  Droplets, 
  Wind, 
  Thermometer, 
  Truck, 
  Scale, 
  ShieldCheck, 
  Leaf, 
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Sliders,
  Check,
  Camera,
  Languages
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
          // Default to potato chips or first item
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
      desired_shelf_life_days: item.baseline_shelf_life_ambient_days ? Math.round(item.baseline_shelf_life_ambient_days * 3) : 30,
      storage_temperature_c: item.category === 'Fresh Produce' ? 4.0 : (item.category === 'Dairy' ? 4.0 : 25.0),
      storage_type: item.category === 'Fresh Produce' || item.category === 'Dairy' || item.category === 'Meat & Poultry' ? 'CHILLED' : 'AMBIENT',
      storage_relative_humidity_pct: item.optimal_rh_min || 65.0,
    }));
  };

  const handleAiEstimate = async () => {
    if (!aiPromptName) return;
    setIsEstimating(true);
    try {
      const estimated = await api.estimateFoodProperties({
        name: aiPromptName,
        category: aiPromptCategory,
      });
      setSelectedCommodityId('custom');
      setFormData(prev => ({
        ...prev,
        commodity_id: '',
        commodity_name: estimated.name,
        category: estimated.category,
        moisture_content: estimated.moisture_content,
        fat_content: estimated.fat_content,
        ph: estimated.ph,
        water_activity: estimated.water_activity,
        is_respiring: estimated.is_respiring,
        respiration_rate_o2: estimated.respiration_rate_o2,
        respiration_rate_co2: estimated.respiration_rate_co2,
        storage_temperature_c: estimated.optimal_temp_min || 20.0,
        storage_relative_humidity_pct: estimated.optimal_rh_min || 60.0
      }));
      setAiWizardOpen(false);
    } catch (err) {
      console.error('Error estimating properties:', err);
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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-950/80 via-slate-900 to-slate-950 border border-brand-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Physics-Informed Barrier & MAP Recommendation Model</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Intelligent Packaging Formulator
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Synthesizes multilayer films, computes critical barrier limits (OTR, WVTR, CO2TR), sizes respiration micro-perforations, and validates Plastic Waste Management (PWM) compliance in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenScanner && (
              <button
                type="button"
                onClick={onOpenScanner}
                className="flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition-all transform hover:scale-[1.02]"
              >
                <Camera className="w-4 h-4" />
                <span>AI Vision Scanner</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setAiWizardOpen(!aiWizardOpen)}
              className="flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-brand-600 hover:from-emerald-400 hover:to-brand-500 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 transition-all transform hover:scale-[1.02]"
            >
              <Wand2 className="w-4 h-4" />
              <span>AI Custom Food Wizard</span>
            </button>

            <button
              type="button"
              onClick={() => setVoiceAssistantOpen(!voiceAssistantOpen)}
              className="flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-brand-400 text-slate-200 hover:text-white font-bold text-xs transition-all"
            >
              <Languages className="w-4 h-4 text-brand-400" />
              <span>Voice Assistant</span>
            </button>
          </div>
        </div>

        {/* Multilingual Voice Assistant Panel */}
        {voiceAssistantOpen && (
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <LanguageVoiceAssistant />
          </div>
        )}

        {/* AI Custom Food Estimator Dropdown Modal */}
        {aiWizardOpen && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/90 p-4 rounded-xl border border-brand-500/30">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Custom Food Commodity Name</label>
              <input
                type="text"
                placeholder="e.g. Jackfruit Crisps, Gond Ladoo"
                value={aiPromptName}
                onChange={(e) => setAiPromptName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-brand-400 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Broad Category</label>
              <select
                value={aiPromptCategory}
                onChange={(e) => setAiPromptCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-brand-400 focus:outline-none"
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
            <div className="sm:col-span-1 flex items-end">
              <button
                type="button"
                onClick={handleAiEstimate}
                disabled={isEstimating || !aiPromptName}
                className="w-full py-2.5 px-4 rounded-lg bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isEstimating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                <span>Auto-Infer Parameters</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Food Preset & Biochemical Characteristics */}
        <div className="glass-panel p-6 rounded-2xl space-y-6 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Food Commodity & Biochemical Profile</h3>
                <p className="text-xs text-slate-400">Select from pre-validated food presets or customize parameters</p>
              </div>
            </div>

            {/* Quick Preset Selector */}
            <div className="w-64">
              <select
                value={selectedCommodityId}
                onChange={(e) => {
                  const found = commodities.find(c => c.id === e.target.value);
                  if (found) applyCommodityPreset(found);
                }}
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-brand-400 focus:outline-none"
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
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Commodity Name</span>
              </label>
              <input
                type="text"
                value={formData.commodity_name}
                onChange={(e) => setFormData({ ...formData, commodity_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs font-medium text-white focus:border-brand-400 focus:outline-none"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs font-medium text-white focus:border-brand-400 focus:outline-none"
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
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                  <span>Moisture Content (%)</span>
                </span>
                <span className="text-brand-400 font-mono font-bold">{formData.moisture_content}%</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.moisture_content}
                onChange={(e) => setFormData({ ...formData, moisture_content: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs font-medium text-white focus:border-brand-400 focus:outline-none"
              />
            </div>

            {/* Fat / Oil % */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fat / Oil Content (%)</span>
                </span>
                <span className="text-brand-400 font-mono font-bold">{formData.fat_content}%</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.fat_content}
                onChange={(e) => setFormData({ ...formData, fat_content: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs font-medium text-white focus:border-brand-400 focus:outline-none"
              />
            </div>

            {/* Water Activity aw */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Water Activity (a_w)</label>
              <input
                type="number"
                step="0.01"
                min="0.05"
                max="1.0"
                value={formData.water_activity}
                onChange={(e) => setFormData({ ...formData, water_activity: parseFloat(e.target.value) || 0.85 })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs font-medium text-white focus:border-brand-400 focus:outline-none"
              />
            </div>

            {/* pH */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">pH Level</label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="14.0"
                value={formData.ph}
                onChange={(e) => setFormData({ ...formData, ph: parseFloat(e.target.value) || 6.0 })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs font-medium text-white focus:border-brand-400 focus:outline-none"
              />
            </div>

            {/* Respiration Toggle & Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Produce Respiration</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${formData.is_respiring ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  {formData.is_respiring ? 'ACTIVE' : 'NONE'}
                </span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="resp_check"
                  checked={formData.is_respiring}
                  onChange={(e) => setFormData({ ...formData, is_respiring: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-400 bg-slate-900 border-slate-700"
                />
                <label htmlFor="resp_check" className="text-xs text-slate-300 cursor-pointer">
                  Living/Respiring Fruit/Veg
                </label>
              </div>
            </div>

            {/* Respiration Rate RO2 */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                R_O2 (mg/kg·h at 20°C)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                disabled={!formData.is_respiring}
                value={formData.respiration_rate_o2}
                onChange={(e) => setFormData({ ...formData, respiration_rate_o2: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs font-medium text-white focus:border-brand-400 focus:outline-none disabled:opacity-40"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Storage Environment, Logistics & Packaging Dimensions */}
        <div className="glass-panel p-6 rounded-2xl space-y-6 border border-slate-800">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Storage Environment & Package Sizing</h3>
              <p className="text-xs text-slate-400">Specify target storage temperature, shelf-life objective, and container geometry</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Desired Shelf Life */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Target Shelf Life (Days)</span>
                <span className="text-brand-400 font-mono font-bold">{formData.desired_shelf_life_days} d</span>
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={formData.desired_shelf_life_days}
                onChange={(e) => setFormData({ ...formData, desired_shelf_life_days: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs font-medium text-white focus:border-brand-400 focus:outline-none"
              />
            </div>

            {/* Storage Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Storage Mode</label>
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
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs font-medium text-white focus:border-brand-400 focus:outline-none"
              >
                <option value="AMBIENT">Ambient (18°C - 35°C)</option>
                <option value="CHILLED">Chilled / Refrigerated (0°C - 8°C)</option>
                <option value="FROZEN">Frozen (-18°C)</option>
              </select>
            </div>

            {/* Storage Temp °C */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                  <span>Storage Temp (°C)</span>
                </span>
                <span className="text-brand-400 font-mono font-bold">{formData.storage_temperature_c}°C</span>
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.storage_temperature_c}
                onChange={(e) => setFormData({ ...formData, storage_temperature_c: parseFloat(e.target.value) || 25 })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs font-medium text-white focus:border-brand-400 focus:outline-none"
              />
            </div>

            {/* Storage RH % */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Relative Humidity (% RH)</span>
                <span className="text-brand-400 font-mono font-bold">{formData.storage_relative_humidity_pct}%</span>
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={formData.storage_relative_humidity_pct}
                onChange={(e) => setFormData({ ...formData, storage_relative_humidity_pct: parseFloat(e.target.value) || 65 })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs font-medium text-white focus:border-brand-400 focus:outline-none"
              />
            </div>

            {/* Package Net Weight */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                <Scale className="w-3.5 h-3.5 text-indigo-400" />
                <span>Unit Weight (Grams)</span>
              </label>
              <input
                type="number"
                min="5"
                value={formData.package_weight_grams}
                onChange={(e) => setFormData({ ...formData, package_weight_grams: parseFloat(e.target.value) || 100 })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs font-medium text-white focus:border-brand-400 focus:outline-none"
              />
            </div>

            {/* Surface Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pouch Surface Area (cm²)</label>
              <input
                type="number"
                min="20"
                value={formData.package_surface_area_cm2}
                onChange={(e) => setFormData({ ...formData, package_surface_area_cm2: parseFloat(e.target.value) || 400 })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs font-medium text-white focus:border-brand-400 focus:outline-none"
              />
            </div>

            {/* Logistics Vibration Stress */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Logistics Road Stress</span>
              </label>
              <select
                value={formData.transportation_stress}
                onChange={(e) => setFormData({ ...formData, transportation_stress: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs font-medium text-white focus:border-brand-400 focus:outline-none"
              >
                <option value="LOW">Low (Urban Local Distribution)</option>
                <option value="MEDIUM">Medium (National Highway Freight)</option>
                <option value="HIGH">High (Rural / Rough Terrain / Vibration)</option>
              </select>
            </div>

            {/* Strategic Optimization Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>Strategic Priority</span>
              </label>
              <select
                value={formData.eco_priority}
                onChange={(e) => setFormData({ ...formData, eco_priority: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs font-medium text-white focus:border-brand-400 focus:outline-none"
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
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 via-emerald-400 to-teal-400 hover:from-brand-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center space-x-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Computing Physics & Laminate Synthesis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Physics & AI Recommendation</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

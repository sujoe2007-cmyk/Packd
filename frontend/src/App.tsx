import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { RecommenderForm } from './components/RecommenderForm';
import { RecommendationResultView } from './components/RecommendationResultView';
import { ShelfLifeSimulator } from './components/ShelfLifeSimulator';
import { CommodityCatalog } from './components/CommodityCatalog';
import { MaterialsDatabase } from './components/MaterialsDatabase';
import { SustainabilityCalculator } from './components/SustainabilityCalculator';
import { PassportsList } from './components/PassportsList';
import { ProduceScanner } from './components/ProduceScanner';
import { IoTColdChainTracker } from './components/IoTColdChainTracker';
import { TraceabilityPassportModal } from './components/TraceabilityPassportModal';
import { FoodCommodity, RecommendationResult } from './types';
import { Boxes, ShieldCheck, Heart, Sparkles, Database, FileText, Cpu } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('recommender');
  const [currentRecommendation, setCurrentRecommendation] = useState<RecommendationResult | null>(null);
  const [preselectedCommodity, setPreselectedCommodity] = useState<FoodCommodity | null>(null);
  const [isPassportModalOpen, setIsPassportModalOpen] = useState<boolean>(false);

  const handleRecommendationGenerated = (result: RecommendationResult) => {
    setCurrentRecommendation(result);
  };

  const handleSelectCommodityFromCatalog = (commodity: FoodCommodity) => {
    setPreselectedCommodity(commodity);
    setCurrentRecommendation(null);
    setActiveTab('recommender');
  };

  const handleApplyScanToForm = (scanData: any) => {
    const customCommodity: FoodCommodity = {
      id: 'scanned-item-' + Date.now(),
      name: scanData.detected_food_name,
      category: scanData.category,
      moisture_content: scanData.estimated_moisture_pct,
      fat_content: scanData.estimated_fat_pct,
      ph: scanData.estimated_ph,
      water_activity: scanData.estimated_moisture_pct > 50 ? 0.95 : 0.25,
      is_respiring: scanData.estimated_respiration_rate_o2 > 0,
      respiration_rate_o2: scanData.estimated_respiration_rate_o2,
      respiration_rate_co2: scanData.estimated_respiration_rate_o2 * 1.15,
      respiration_quotient: 1.1,
      respiration_class: scanData.ripeness_stage,
      oxygen_sensitivity: scanData.estimated_fat_pct > 10 ? 'HIGH' : 'MEDIUM',
      moisture_sensitivity: 'HIGH',
      light_sensitivity: 'MEDIUM',
      ethylene_sensitivity: 'HIGH',
      optimal_temp_min: 4.0,
      optimal_temp_max: 12.0,
      optimal_rh_min: 85.0,
      optimal_rh_max: 95.0,
      baseline_shelf_life_ambient_days: scanData.recommended_shelf_life_days,
      baseline_shelf_life_refrigerated_days: scanData.recommended_shelf_life_days * 3,
      degradation_mechanisms: scanData.visual_insights || []
    };
    setPreselectedCommodity(customCommodity);
    setCurrentRecommendation(null);
    setActiveTab('recommender');
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
      {/* Ambient background glow meshes */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-emerald-500/8 rounded-full blur-[140px] transform -translate-y-1/2"></div>
        <div className="absolute top-1/3 right-10 w-[500px] h-[400px] bg-sky-500/6 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-10 left-10 w-[550px] h-[350px] bg-indigo-500/6 rounded-full blur-[150px]"></div>
        <div className="absolute inset-0 blueprint-grid opacity-60"></div>
      </div>

      {/* Top Navigation */}
      <div className="relative z-50">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all">
        {activeTab === 'recommender' && (
          currentRecommendation ? (
            <RecommendationResultView
              result={currentRecommendation}
              onBackToForm={() => setCurrentRecommendation(null)}
              onRunSimulation={() => setActiveTab('simulator')}
              onCreatePassport={() => setIsPassportModalOpen(true)}
            />
          ) : (
            <RecommenderForm
              onRecommendationGenerated={handleRecommendationGenerated}
              preselectedCommodity={preselectedCommodity}
              onOpenScanner={() => setActiveTab('scanner')}
            />
          )
        )}

        {activeTab === 'scanner' && (
          <ProduceScanner onApplyScanToForm={handleApplyScanToForm} />
        )}

        {activeTab === 'simulator' && (
          <ShelfLifeSimulator currentRecommendation={currentRecommendation} />
        )}

        {activeTab === 'iot-tracker' && (
          <IoTColdChainTracker />
        )}

        {activeTab === 'commodities' && (
          <CommodityCatalog onSelectCommodity={handleSelectCommodityFromCatalog} />
        )}

        {activeTab === 'materials' && (
          <MaterialsDatabase />
        )}

        {activeTab === 'sustainability' && (
          <SustainabilityCalculator />
        )}

        {activeTab === 'passports' && (
          <PassportsList />
        )}
      </main>

      {/* Digital Passport Modal */}
      {isPassportModalOpen && currentRecommendation && (
        <TraceabilityPassportModal
          recommendation={currentRecommendation}
          onClose={() => setIsPassportModalOpen(false)}
        />
      )}

      {/* Enterprise Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md mt-16 py-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shadow-sm">
              <Boxes className="w-4 h-4" />
            </div>
            <span>
              <strong className="text-white font-semibold">PACKD AI</strong> — Smart India Hackathon (SIH 2026) Flagship Architecture
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ASTM D3985 / ASTM E96 Calibrated</span>
            </span>
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>Arrhenius & Michaelis-Menten Engine</span>
            </span>
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>MoEFCC EPR Compliant</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

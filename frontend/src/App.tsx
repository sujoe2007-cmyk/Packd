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
import { Boxes, ShieldCheck, Heart, Sparkles, Database, FileText } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <footer className="border-t border-slate-900 bg-slate-950/80 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
              <Boxes className="w-3.5 h-3.5" />
            </div>
            <span>
              <strong className="text-slate-300">PACKD AI</strong> — Smart India Hackathon (SIH 2026) Flagship
            </span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Physics-Informed Barrier Engine</span>
            </span>
            <span>•</span>
            <span>ASTM D3985 / ASTM E96 Calibrated</span>
            <span>•</span>
            <span>MoEFCC PWM Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

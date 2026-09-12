import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Building, 
  MapPin, 
  Calendar, 
  Package, 
  Download, 
  RefreshCw,
  Printer
} from 'lucide-react';
import { RecommendationResult, TraceabilityPassport } from '../types';
import { api } from '../lib/api';

interface TraceabilityPassportModalProps {
  recommendation: RecommendationResult;
  onClose: () => void;
}

export const TraceabilityPassportModal: React.FC<TraceabilityPassportModalProps> = ({
  recommendation,
  onClose
}) => {
  const [batchLot, setBatchLot] = useState<string>(`LOT-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [manufacturer, setManufacturer] = useState<string>('AgroPack Industries Ltd');
  const [facility, setFacility] = useState<string>('Pune Food Processing Park, Maharashtra');
  const [shelfLifeDays, setShelfLifeDays] = useState<number>(Math.round(recommendation.predicted_shelf_life_days));
  
  const [passport, setPassport] = useState<TraceabilityPassport | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await api.createPassport({
        recommendation_id: recommendation.id,
        batch_lot_number: batchLot,
        manufacturer_name: manufacturer,
        facility_location: facility,
        shelf_life_days_granted: shelfLifeDays
      });
      setPassport(res);
    } catch (err) {
      console.error('Error generating passport:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    handleGenerate();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-brand-500/40 p-6 sm:p-8 space-y-6 bg-slate-950 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold">
            <QrCode className="w-3.5 h-3.5 text-brand-400" />
            <span>Digital Product Passport (DPP) Standard</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Packaging Compliance & Traceability Certificate
          </h2>
        </div>

        {/* Passport Card View */}
        {passport ? (
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-6 shadow-inner">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-6">
              <div className="space-y-2 text-center sm:text-left">
                <div className="flex items-center space-x-2 justify-center sm:justify-start">
                  <ShieldCheck className="w-5 h-5 text-brand-400" />
                  <span className="font-mono font-bold text-sm text-brand-400">{passport.passport_code}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                    VERIFIED
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{passport.commodity_name}</h3>
                <p className="text-xs text-slate-400 font-mono">Batch Lot: {passport.batch_lot_number}</p>
              </div>

              {/* QR Code Graphic */}
              <div className="p-2.5 bg-white rounded-xl shadow-lg flex flex-col items-center">
                <img
                  src={passport.qr_code_data_url}
                  alt="Traceability QR Code"
                  className="w-32 h-32 object-contain"
                />
                <span className="text-[9px] text-slate-800 font-bold font-mono mt-1">SCAN TO VERIFY</span>
              </div>
            </div>

            {/* Passport Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 block">Packaging Specification</span>
                <span className="font-bold text-slate-200">{passport.packaging_structure}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">Certified Shelf-Life Window</span>
                <span className="font-bold text-brand-400">
                  {new Date(passport.pack_date).toLocaleDateString()} → {new Date(passport.expiry_date).toLocaleDateString()}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">Manufacturer & Facility</span>
                <span className="text-slate-200">
                  {passport.manufacturer_info.name} ({passport.manufacturer_info.facility})
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">Headspace Atmosphere</span>
                <span className="text-cyan-400 font-medium">{passport.map_gas_flush}</span>
              </div>
            </div>

            {/* Certifications Bar */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2">
              {passport.compliance_certifications.map((cert, i) => (
                <span key={i} className="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  ✓ {cert}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 space-x-2 text-slate-400 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Generating Cryptographic Passport...</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Certificate</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

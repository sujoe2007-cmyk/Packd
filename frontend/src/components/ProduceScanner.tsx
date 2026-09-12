import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Eye,
  Sliders,
  ScanLine
} from 'lucide-react';
import { RecommendationResult } from '../types';
import { api } from '../lib/api';

interface ProduceScannerProps {
  onApplyScanToForm: (scanData: any) => void;
}

export const ProduceScanner: React.FC<ProduceScannerProps> = ({ onApplyScanToForm }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [foodHint, setFoodHint] = useState<string>('Alphonso Mango');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!imageFile) {
      alert('Please upload or take a photo of the food commodity first.');
      return;
    }

    setIsScanning(true);
    const formData = new FormData();
    formData.append('file', imageFile);
    if (foodHint) formData.append('food_hint', foodHint);

    try {
      const data = await api.scanProduceImage(formData);
      setScanResult(data);
    } catch (err) {
      console.error('Error in visual scan:', err);
      alert('Failed to analyze image. Please ensure backend is active.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleLoadDemoImage = async (type: 'mango' | 'tomato' | 'strawberry' | 'chips') => {
    setFoodHint(
      type === 'mango' ? 'Alphonso Mango' : 
      type === 'tomato' ? 'Fresh Tomato' : 
      type === 'strawberry' ? 'Fresh Strawberries' : 'Potato Crisps / Chips'
    );
    
    // Generate simple synthetic canvas graphic to send as image
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d')!;
    if (type === 'mango') {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(60, 60, 50, 0, Math.PI * 2); ctx.fill();
    } else if (type === 'tomato') {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(60, 60, 50, 0, Math.PI * 2); ctx.fill();
    } else if (type === 'strawberry') {
      ctx.fillStyle = '#e11d48';
      ctx.beginPath(); ctx.arc(60, 60, 45, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(20, 20, 80, 80);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${type}_sample.png`, { type: 'image/png' });
        setImageFile(file);
        setSelectedImage(canvas.toDataURL());
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/90 space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-semibold">
          <ScanLine className="w-3.5 h-3.5 text-sky-400" />
          <span>Computer Vision & Spectral Ripeness Model</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          AI Visual Food & Produce Quality Scanner
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Upload or photograph fresh fruits, vegetables, or packaged goods. Computer vision analyzes chromatic ripeness, surface defects, and auto-calculates dynamic respiration rates (R_O2).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload & Preview (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800/90 space-y-4 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Capture or Upload Produce</span>
              <span className="text-[10px] text-slate-400 font-mono">JPG, PNG</span>
            </div>

            {/* Dropzone / Preview */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full h-56 rounded-2xl border-2 border-dashed border-slate-700/80 hover:border-emerald-400 bg-slate-900/60 flex flex-col items-center justify-center cursor-pointer transition overflow-hidden group shadow-inner"
            >
              {selectedImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={selectedImage}
                    alt="Upload preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="w-full h-1 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-pulse"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-4 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-300">Click to upload or take a photo</p>
                  <p className="text-[10px] text-slate-500">Camera capture supported on mobile</p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Quick Food Preset Buttons */}
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block mb-2">Quick Demo Samples:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadDemoImage('mango')}
                  className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-[11px] font-medium text-amber-300 border border-slate-800/80 hover:border-amber-500/30 text-left truncate transition-all shadow-sm"
                >
                  🥭 Alphonso Mango
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadDemoImage('strawberry')}
                  className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-[11px] font-medium text-rose-300 border border-slate-800/80 hover:border-rose-500/30 text-left truncate transition-all shadow-sm"
                >
                  🍓 Strawberries
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadDemoImage('tomato')}
                  className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-[11px] font-medium text-red-300 border border-slate-800/80 hover:border-red-500/30 text-left truncate transition-all shadow-sm"
                >
                  🍅 Fresh Tomato
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadDemoImage('chips')}
                  className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-[11px] font-medium text-yellow-300 border border-slate-800/80 hover:border-yellow-500/30 text-left truncate transition-all shadow-sm"
                >
                  🥔 Potato Crisps
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning || !imageFile}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 via-emerald-400 to-teal-400 hover:from-sky-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/20 disabled:opacity-50 transition-all transform hover:scale-[1.01]"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Running Spectral Decomposition...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>Analyze Produce Quality & Ripeness</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Computer Vision Results & Inferred Parameters (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800/90 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">AI Vision Analysis & Inferred Parameters</h3>
            </div>
            {scanResult && (
              <span className="text-[11px] font-mono text-emerald-400 font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Confidence: {scanResult.confidence_score}%
              </span>
            )}
          </div>

          {scanResult ? (
            <div className="space-y-4 animate-fadeIn">
              {/* Primary Detected Produce Box */}
              <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Identified Commodity</span>
                  <h4 className="text-lg font-black text-white">{scanResult.detected_food_name}</h4>
                  <span className="text-xs text-slate-400">{scanResult.category}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-[9px] text-slate-400 block font-semibold">Ripeness</span>
                    <span className="text-xs font-mono font-bold text-amber-400">{scanResult.ripeness_stage}</span>
                  </div>
                  <div className="bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-[9px] text-slate-400 block font-semibold">Defect</span>
                    <span className="text-xs font-mono font-bold text-rose-400">{scanResult.surface_defect_pct}%</span>
                  </div>
                </div>
              </div>

              {/* Inferred Parameters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800/90 shadow-sm">
                  <span className="text-[10px] text-slate-400 block font-sans">Moisture</span>
                  <span className="text-sm font-bold text-sky-400">{scanResult.estimated_moisture_pct}%</span>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800/90 shadow-sm">
                  <span className="text-[10px] text-slate-400 block font-sans">Fat/Oil</span>
                  <span className="text-sm font-bold text-amber-400">{scanResult.estimated_fat_pct}%</span>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800/90 shadow-sm">
                  <span className="text-[10px] text-slate-400 block font-sans">pH</span>
                  <span className="text-sm font-bold text-purple-400">{scanResult.estimated_ph}</span>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800/90 shadow-sm">
                  <span className="text-[10px] text-slate-400 block font-sans">Respiration R_O2</span>
                  <span className="text-sm font-bold text-emerald-400">{scanResult.estimated_respiration_rate_o2}</span>
                  <span className="text-[8px] text-slate-500 font-sans block">mg/kg·h</span>
                </div>
              </div>

              {/* Visual Insights List */}
              <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/90">
                <span className="text-[11px] font-bold text-white block mb-1">Diagnostic Insights:</span>
                {scanResult.visual_insights.map((insight: string, idx: number) => (
                  <p key={idx} className="text-[11px] text-slate-300 flex items-start space-x-2">
                    <span className="text-sky-400 font-bold">•</span>
                    <span>{insight}</span>
                  </p>
                ))}
              </div>

              {/* Action: Send to Recommendation Form */}
              <button
                onClick={() => onApplyScanToForm(scanResult)}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.01] shadow-lg shadow-emerald-500/20"
              >
                <span>Apply Inferred Parameters to Packaging Formulator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
              <ScanLine className="w-10 h-10 text-slate-700 animate-pulse" />
              <p className="text-xs">Upload or pick a sample produce image to view visual AI inference.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

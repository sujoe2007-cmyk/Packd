import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Layers, 
  RotateCw, 
  Eye, 
  Maximize2, 
  ShieldCheck, 
  Sparkles,
  Wind
} from 'lucide-react';
import { RecommendationResult } from '../types';

interface Pouch3DViewerProps {
  recommendation: RecommendationResult;
}

export const Pouch3DViewer: React.FC<Pouch3DViewerProps> = ({ recommendation }) => {
  const [pouchType, setPouchType] = useState<'STAND_UP' | 'PILLOW' | 'VACUUM_TRAY' | 'CLAMSHELL'>('STAND_UP');
  const [peelLayer, setPeelLayer] = useState<number>(0); // 0 = all layers, 1 = peel outer, 2 = peel barrier, 3 = only sealant
  const [rotationAngle, setRotationAngle] = useState<number>(15);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas dimensions
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const rad = (rotationAngle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    ctx.save();
    ctx.translate(w / 2, h / 2);

    // Draw 3D Pouch geometry based on type
    if (pouchType === 'STAND_UP') {
      // Stand-up Doypack with Bottom Gusset
      const pw = 140 * cos;
      const ph = 190;
      const depth = 35 * sin;

      // 1. Bottom Gusset Shadow
      ctx.beginPath();
      ctx.ellipse(0, ph / 2 + 10, Math.abs(pw) * 0.9, 18, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fill();

      // 2. Main Pouch Body (Layer color based on peeling)
      const grad = ctx.createLinearGradient(-pw, -ph / 2, pw, ph / 2);
      if (peelLayer === 0) {
        grad.addColorStop(0, '#10b981');
        grad.addColorStop(0.5, '#059669');
        grad.addColorStop(1, '#047857');
      } else if (peelLayer === 1) {
        grad.addColorStop(0, '#94a3b8'); // Metallized / Foil layer
        grad.addColorStop(0.5, '#cbd5e1');
        grad.addColorStop(1, '#64748b');
      } else {
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.7)'); // Sealant inner
        grad.addColorStop(1, 'rgba(14, 165, 233, 0.9)');
      }

      ctx.beginPath();
      ctx.moveTo(-pw + depth, -ph / 2);
      ctx.lineTo(pw + depth, -ph / 2);
      ctx.lineTo(pw, ph / 2);
      ctx.quadraticCurveTo(0, ph / 2 + 25, -pw, ph / 2);
      ctx.closePath();

      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Top Heat Seal Bar
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(-pw + depth, -ph / 2, pw * 2, 18);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.strokeRect(-pw + depth, -ph / 2, pw * 2, 18);

      // Laser Micro-perforations if produce
      if (recommendation.micro_perforation_spec?.is_required) {
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.arc(-25 + (i % 3) * 25, -20 + Math.floor(i / 3) * 35, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Brand Label overlay
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(recommendation.commodity_name, depth, 0);

      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(`${recommendation.recommended_total_thickness_um} µm • ${recommendation.primary_material_code}`, depth, 18);

    } else if (pouchType === 'PILLOW') {
      // Standard 3-side seal pillow pouch
      const pw = 150 * cos;
      const ph = 170;

      const grad = ctx.createLinearGradient(-pw, -ph / 2, pw, ph / 2);
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(0.5, '#d97706');
      grad.addColorStop(1, '#b45309');

      ctx.beginPath();
      ctx.roundRect(-pw, -ph / 2, pw * 2, ph, 12);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.stroke();

      // Center Pillow Cushion Reflection
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.abs(pw) * 0.7, ph * 0.35, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fill();

      // Top & Bottom Seals
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(-pw, -ph / 2, pw * 2, 14);
      ctx.fillRect(-pw, ph / 2 - 14, pw * 2, 14);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(recommendation.commodity_name, 0, 5);

    } else {
      // Vacuum Skin Tray / Clamshell
      const tw = 160 * cos;
      const th = 110;

      ctx.beginPath();
      ctx.roundRect(-tw, -th / 2, tw * 2, th, 8);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Transparent Film Dome
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.abs(tw) * 0.85, th * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('MAP HERMETIC TRAY', 0, 0);
    }

    ctx.restore();
  }, [pouchType, peelLayer, rotationAngle, recommendation]);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 animate-fadeIn">
      {/* 3D Visualizer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Box className="w-5 h-5 text-brand-400" />
          <div>
            <h3 className="text-base font-bold text-white">Interactive 3D Packaging Structure Visualizer</h3>
            <p className="text-xs text-slate-400">Interactive 3D geometry with dynamic layer peeling and micro-hole inspection</p>
          </div>
        </div>

        {/* Pouch Style Selector */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {(['STAND_UP', 'PILLOW', 'VACUUM_TRAY'] as const).map((style) => (
            <button
              key={style}
              onClick={() => setPouchType(style)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                pouchType === style
                  ? 'bg-brand-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {style === 'STAND_UP' ? 'Stand-up Doypack' : style === 'PILLOW' ? 'Pillow Pouch' : 'MAP Skin Tray'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 3D Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950/90 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center relative shadow-inner">
          <canvas
            ref={canvasRef}
            width={380}
            height={320}
            className="w-full max-w-[380px] h-[320px]"
          />

          {/* Rotation Control Slider */}
          <div className="w-full max-w-xs flex items-center space-x-3 pt-4">
            <RotateCw className="w-4 h-4 text-slate-500" />
            <input
              type="range"
              min="-60"
              max="60"
              value={rotationAngle}
              onChange={(e) => setRotationAngle(parseInt(e.target.value))}
              className="w-full accent-brand-500 cursor-pointer"
            />
            <span className="text-[10px] font-mono text-slate-400">{rotationAngle}°</span>
          </div>
        </div>

        {/* Interactive Layer Peel Control (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-brand-400" />
              <span>Laminate Layer Inspection (3D Peeler)</span>
            </span>
            <p className="text-[11px] text-slate-400">Click to peel outer layers and inspect inner barrier core:</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setPeelLayer(0)}
              className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition ${
                peelLayer === 0
                  ? 'bg-brand-500/20 border-brand-500 text-brand-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>1. Complete Multilayer Laminate</span>
                <span className="font-mono text-[10px]">{recommendation.recommended_total_thickness_um} µm</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">All functional layers combined</span>
            </button>

            <button
              onClick={() => setPeelLayer(1)}
              className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition ${
                peelLayer === 1
                  ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>2. Peel Outer Face → Barrier Core</span>
                <span className="font-mono text-[10px]">Met-PET / AluFoil / EVOH</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Impermeable gas & moisture barrier core</span>
            </button>

            <button
              onClick={() => setPeelLayer(2)}
              className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition ${
                peelLayer === 2
                  ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>3. Peel Core → Inner Sealant Film</span>
                <span className="font-mono text-[10px]">mLLDPE / PBAT-TPS</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Food-contact seal and hot-tack layer</span>
            </button>
          </div>

          {/* Quick Specs Callout */}
          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Pouch Structure:</span>
              <span className="font-bold text-white">{recommendation.recommended_structure_type.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Calculated OTR:</span>
              <span className="font-mono font-bold text-emerald-400">≤ {recommendation.target_otr} cc</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Calculated WVTR:</span>
              <span className="font-mono font-bold text-sky-400">≤ {recommendation.target_wvtr} g</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

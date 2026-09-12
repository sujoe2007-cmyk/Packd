import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  FlaskConical, 
  Activity, 
  Database, 
  Leaf, 
  QrCode, 
  AlertCircle,
  ScanLine,
  Radio,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/health', { method: 'GET' });
        if (res.ok) setBackendStatus('online');
        else setBackendStatus('offline');
      } catch {
        setBackendStatus('offline');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'recommender', label: 'Formulator', icon: FlaskConical },
    { id: 'scanner', label: 'AI Vision', icon: ScanLine },
    { id: 'simulator', label: 'Degradation', icon: Activity },
    { id: 'iot-tracker', label: 'Cold Chain', icon: Radio },
    { id: 'commodities', label: 'Commodities', icon: Database },
    { id: 'materials', label: 'Polymers', icon: Layers },
    { id: 'sustainability', label: 'EPR / PWM', icon: Leaf },
    { id: 'passports', label: 'Passports', icon: QrCode },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Technical Identity */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group select-none" 
            onClick={() => setActiveTab('recommender')}
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-slate-900 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-300">
              <Layers className="w-5 h-5 text-emerald-400 transition-transform group-hover:scale-110" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-black text-white tracking-tight flex items-center gap-1.5 font-sans">
                  PACKD <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-semibold">AI v2.6</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Intelligent Food Packaging Engine
              </p>
            </div>
          </div>

          {/* Clean Segmented Tab Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800/90 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Engine Calibration Status */}
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono shadow-sm">
              <span className="text-slate-500 hidden sm:inline font-sans">Engine:</span>
              {backendStatus === 'online' ? (
                <span className="flex items-center text-emerald-400 font-semibold space-x-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>ONLINE</span>
                </span>
              ) : backendStatus === 'checking' ? (
                <span className="text-amber-400 font-medium animate-pulse">CONNECTING...</span>
              ) : (
                <span className="flex items-center text-rose-400 font-medium space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>OFFLINE</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Navigation */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 space-x-1.5 border-t border-slate-800/80 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 bg-slate-900/70 hover:text-white border border-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

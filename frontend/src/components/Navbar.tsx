import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  FlaskConical, 
  Activity, 
  Database, 
  Leaf, 
  QrCode, 
  CheckCircle2, 
  AlertCircle,
  Binary,
  Microscope,
  FileCode2,
  ScanLine,
  Radio
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
    { id: 'recommender', label: 'Formulator', description: 'Multilayer Synthesis', icon: FlaskConical },
    { id: 'scanner', label: 'AI Vision Scanner', description: 'Ripeness & Respiration', icon: ScanLine },
    { id: 'simulator', label: 'Degradation Kinetics', description: 'Arrhenius Dynamics', icon: Activity },
    { id: 'iot-tracker', label: 'IoT Cold Chain', description: 'Live Telemetry', icon: Radio },
    { id: 'commodities', label: 'Food Registry', description: '50+ Commodities', icon: Database },
    { id: 'materials', label: 'Polymer Matrix', description: 'Barrier Database', icon: Layers },
    { id: 'sustainability', label: 'EPR & PWM', description: 'Plastic Waste Rules', icon: Leaf },
    { id: 'passports', label: 'Certificates', description: 'Digital DPP Passports', icon: QrCode },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-lab-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Technical Identity */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => setActiveTab('recommender')}
          >
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/50 transition shadow-subtle">
              <Layers className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  PACKD <span className="text-xs px-1.5 py-0.5 rounded font-mono bg-slate-800 text-slate-300 border border-slate-700">v2.6</span>
                </span>
                <span className="hidden lg:inline-flex text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                  ASTM D3985 / E96
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal hidden sm:block">
                Food Packaging Barrier Modeling & Shelf-Life Engine
              </p>
            </div>
          </div>

          {/* Precision Tab Navigation */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Engine Calibration Status */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono">
              <span className="text-slate-400 hidden sm:inline">Kernel:</span>
              {backendStatus === 'online' ? (
                <span className="flex items-center text-emerald-400 font-semibold space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>ONLINE</span>
                </span>
              ) : backendStatus === 'checking' ? (
                <span className="text-amber-400">CONNECTING...</span>
              ) : (
                <span className="flex items-center text-rose-400 font-medium space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>DISCONNECTED</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1.5 border-t border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 bg-slate-900/60'
                }`}
              >
                <Icon className="w-3 h-3 text-slate-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};


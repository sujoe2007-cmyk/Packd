import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  Printer
} from 'lucide-react';
import { TraceabilityPassport } from '../types';
import { api } from '../lib/api';

export const PassportsList: React.FC = () => {
  const [passports, setPassports] = useState<TraceabilityPassport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchPassports = async () => {
    setIsLoading(true);
    try {
      const data = await api.listPassports();
      setPassports(data);
    } catch (err) {
      console.error('Error fetching passports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPassports();
  }, []);

  const filtered = passports.filter(p => 
    p.passport_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.commodity_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.batch_lot_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/90 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <QrCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>Digital Product Passports & Traceability Registry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Issued Packaging Passports
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Cryptographically timestamped technical certificates with verified shelf-life windows, material barrier compositions, and FSSAI compliance.
            </p>
          </div>

          <button
            onClick={fetchPassports}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Registry</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by passport code, commodity name, or batch lot..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
          />
        </div>
      </div>

      {/* Grid of Passports */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 space-x-2 text-slate-400 text-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Loading Registered Passports...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800/90 space-y-2">
          <p className="text-sm font-bold text-slate-200">No passports found in registry</p>
          <p className="text-xs text-slate-500">Generate a packaging recommendation to issue your first Digital Product Passport.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="glass-card p-5 rounded-3xl border border-slate-800/90 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="font-mono font-bold text-xs text-emerald-400">{p.passport_code}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1 tracking-tight">{p.commodity_name}</h3>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    VERIFIED
                  </span>
                </div>

                <div className="flex items-center space-x-4 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800/90 shadow-inner">
                  <img
                    src={p.qr_code_data_url}
                    alt="QR Code"
                    className="w-16 h-16 bg-white p-1 rounded-xl flex-shrink-0"
                  />
                  <div className="text-xs space-y-1">
                    <p className="text-[10px] text-slate-400 font-mono">Lot: {p.batch_lot_number}</p>
                    <p className="text-[11px] font-bold text-slate-200">
                      Exp: {new Date(p.expiry_date).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{p.packaging_structure}</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                  <span>{p.manufacturer_info.name}</span>
                  <span className="text-cyan-400 font-medium">{p.map_gas_flush ? 'MAP Flushed' : 'Hermetic'}</span>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-700/80 flex items-center justify-center space-x-2 transition-all shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print QR Certificate</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

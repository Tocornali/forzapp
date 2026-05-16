import React from 'react';
import { Flame, Heart, Car as CarIcon, Sparkles, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: 'explore' | 'garage';
  setActiveTab: (tab: 'explore' | 'garage') => void;
  totalCars: number;
  garageCount: number;
  onReloadJson: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  totalCars,
  garageCount,
  onReloadJson
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 via-amber-500 to-yellow-500 p-0.5 shadow-lg shadow-rose-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Flame className="h-5 w-5 text-rose-500 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
              FORZA<span className="text-rose-500">CHECK</span>
            </h1>
            <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" /> Colección & Inventario ({totalCars} vehículos)
            </p>
          </div>
        </div>

        {/* Navigation Tabs & Actions */}
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/50 p-1 shadow-inner">
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-2 rounded-full px-5 py-1.5 text-sm font-medium transition-all duration-300 ${
                activeTab === 'explore'
                  ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md shadow-rose-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <CarIcon className="h-4 w-4" />
              <span>Explorar Catálogo</span>
            </button>

            <button
              onClick={() => setActiveTab('garage')}
              className={`flex items-center gap-2 rounded-full px-5 py-1.5 text-sm font-medium transition-all duration-300 ${
                activeTab === 'garage'
                  ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md shadow-rose-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Heart className="h-4 w-4" />
              <span>Mi Garaje</span>
              {garageCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-[11px] font-bold text-rose-400 border border-rose-500/30">
                  {garageCount}
                </span>
              )}
            </button>
          </nav>

          {/* Reload JSON Button */}
          <button
            onClick={onReloadJson}
            className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-all shadow-sm active:scale-95"
            title="Recargar datos desde el archivo JSON externo"
          >
            <RefreshCw className="h-3.5 w-3.5 text-amber-400 animate-spin-hover" />
            <span className="hidden sm:inline">Recargar JSON</span>
          </button>
        </div>
      </div>
    </header>
  );
};

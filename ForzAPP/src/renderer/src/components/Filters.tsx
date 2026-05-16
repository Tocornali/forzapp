import React from 'react';
import { Search, RotateCcw, ArrowUpDown, CheckCircle2, PlayCircle, Filter, Flag } from 'lucide-react';

interface FiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCarType: string;
  setSelectedCarType: (t: string) => void;
  selectedRaceType: string;
  setSelectedRaceType: (t: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  carTypes: string[];
  resetFilters: () => void;
  filterOwned: string;
  setFilterOwned: (val: string) => void;
  filterUsed: string;
  setFilterUsed: (val: string) => void;
}

export const Filters: React.FC<FiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCarType,
  setSelectedCarType,
  selectedRaceType,
  setSelectedRaceType,
  sortBy,
  setSortBy,
  carTypes,
  resetFilters,
  filterOwned,
  setFilterOwned,
  filterUsed,
  setFilterUsed
}) => {
  return (
    <div className="w-full border-b border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md shadow-lg">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Top bar: Search & Sort & Reset */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por marca o modelo..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-400 shadow-inner focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 shadow-inner w-full sm:w-auto">
              <ArrowUpDown className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-sm font-medium text-white focus:outline-none w-full sm:w-auto cursor-pointer"
              >
                <option value="manuf-asc" className="bg-slate-900 text-white">Marca: A - Z</option>
                <option value="manuf-desc" className="bg-slate-900 text-white">Marca: Z - A</option>
                <option value="year-desc" className="bg-slate-900 text-white">Año: Más Recientes</option>
                <option value="year-asc" className="bg-slate-900 text-white">Año: Más Antiguos</option>
              </select>
            </div>

            <button
              onClick={resetFilters}
              className="cursor-pointer flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all w-full sm:w-auto shadow-sm active:scale-95"
              title="Restablecer filtros"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="sm:hidden">Limpiar Filtros</span>
            </button>
          </div>
        </div>

        {/* Bottom bar: Ownership, Usage, Car Type & Race Type Filters */}
        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-800/80">
          {/* Filter Owned */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-emerald-400 shrink-0">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Compra:</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-700/60 flex-wrap">
              <button
                onClick={() => setFilterOwned('all')}
                className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  filterOwned === 'all'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterOwned('owned')}
                className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  filterOwned === 'owned'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Comprados
              </button>
              <button
                onClick={() => setFilterOwned('not_owned')}
                className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  filterOwned === 'not_owned'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Faltantes
              </button>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 hidden md:block"></div>

          {/* Filter Used */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-cyan-400 shrink-0">
              <PlayCircle className="h-4 w-4" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Uso:</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-700/60 flex-wrap">
              <button
                onClick={() => setFilterUsed('all')}
                className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  filterUsed === 'all'
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterUsed('used')}
                className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  filterUsed === 'used'
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Usados
              </button>
              <button
                onClick={() => setFilterUsed('not_used')}
                className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  filterUsed === 'not_used'
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Sin Usar
              </button>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 hidden lg:block"></div>

          {/* Race Type */}
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Flag className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">Carrera:</span>
            <select
              value={selectedRaceType}
              onChange={(e) => setSelectedRaceType(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs font-medium text-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-white">Todas las carreras</option>
              <option value="Callejera" className="bg-slate-900 text-white">Callejera</option>
              <option value="Road" className="bg-slate-900 text-white">Road</option>
              <option value="Rally" className="bg-slate-900 text-white">Rally</option>
              <option value="Off Road" className="bg-slate-900 text-white">Off Road</option>
              <option value="Sin Asignar" className="bg-slate-900 text-white">Sin Asignar</option>
            </select>
          </div>

          {/* Car Type */}
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">Tipo:</span>
            <select
              value={selectedCarType}
              onChange={(e) => setSelectedCarType(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs font-medium text-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-white">Todos los tipos</option>
              {carTypes.map((type) => (
                <option key={type} value={type} className="bg-slate-900 text-white">
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

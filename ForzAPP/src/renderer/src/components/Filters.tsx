import React from 'react'
import {
  Search,
  RotateCcw,
  ArrowUpDown,
  CheckCircle2,
  PlayCircle,
  Filter,
  Flag,
  Wrench,
  Shuffle
} from 'lucide-react'
import { Language, translations } from '../translations'

interface FiltersProps {
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedCarType: string
  setSelectedCarType: (t: string) => void
  selectedRaceType: string
  setSelectedRaceType: (t: string) => void
  sortBy: string
  setSortBy: (s: string) => void
  carTypes: string[]
  resetFilters: () => void
  filterOwned: string
  setFilterOwned: (val: string) => void
  filterUsed: string
  setFilterUsed: (val: string) => void
  filterRepair: string
  setFilterRepair: (val: string) => void
  onPickRandom: () => void
  isRandomDisabled: boolean
  language: Language
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
  setFilterUsed,
  filterRepair,
  setFilterRepair,
  onPickRandom,
  isRandomDisabled,
  language
}): React.JSX.Element => {
  const t = translations[language]

  return (
    <div className="w-full border-b border-brand-dark-border bg-brand-dark-card/85 p-4 backdrop-blur-md shadow-lg">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Top bar: Search & Sort & Reset */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t['Filters.searchPlaceholder']}
              className="w-full rounded-xl border border-brand-dark-border bg-brand-dark-input/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-400 shadow-inner focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 rounded-xl border border-brand-dark-border bg-brand-dark-input/60 px-3 py-2 shadow-inner w-full sm:w-auto">
              <ArrowUpDown className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-sm font-medium text-white focus:outline-none w-full sm:w-auto cursor-pointer"
              >
                <option value="manuf-asc" className="bg-brand-dark-deep text-white">
                  {t['Filters.sort.manufAsc']}
                </option>
                <option value="manuf-desc" className="bg-brand-dark-deep text-white">
                  {t['Filters.sort.manufDesc']}
                </option>
                <option value="year-desc" className="bg-brand-dark-deep text-white">
                  {t['Filters.sort.yearDesc']}
                </option>
                <option value="year-asc" className="bg-brand-dark-deep text-white">
                  {t['Filters.sort.yearAsc']}
                </option>
                <option value="class-desc" className="bg-brand-dark-deep text-white">
                  {t['Filters.sort.classDesc']}
                </option>
                <option value="class-asc" className="bg-brand-dark-deep text-white">
                  {t['Filters.sort.classAsc']}
                </option>
                <option value="race-asc" className="bg-brand-dark-deep text-white">
                  {t['Filters.sort.raceAsc']}
                </option>
                <option value="race-desc" className="bg-brand-dark-deep text-white">
                  {t['Filters.sort.raceDesc']}
                </option>
                <option value="races-desc" className="bg-brand-dark-deep text-white">
                  {t['Filters.sort.racesDesc']}
                </option>
                <option value="races-asc" className="bg-brand-dark-deep text-white">
                  {t['Filters.sort.racesAsc']}
                </option>
              </select>
            </div>

            <button
              onClick={onPickRandom}
              disabled={isRandomDisabled}
              className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all w-full sm:w-auto shadow-sm active:scale-95 ${
                isRandomDisabled
                  ? 'border-brand-dark-border bg-brand-dark-card/40 text-slate-650 cursor-not-allowed'
                  : 'cursor-pointer border-brand-primary/30 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary hover:text-white border-brand-primary'
              }`}
              title={t['Filters.randomTitle']}
            >
              <Shuffle
                className={`h-4 w-4 ${isRandomDisabled ? 'text-slate-600' : 'text-brand-primary'}`}
              />
              <span>{t['Filters.random']}</span>
            </button>

            <button
              onClick={resetFilters}
              className="cursor-pointer flex items-center justify-center gap-2 rounded-xl border border-brand-dark-border bg-brand-dark-card/85 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-brand-dark-hover/50 hover:text-white transition-all w-full sm:w-auto shadow-sm active:scale-95"
              title={t['Filters.clearFilters']}
            >
              <RotateCcw className="h-4 w-4" />
              <span className="sm:hidden">{t['Filters.clearFilters']}</span>
            </button>
          </div>
        </div>

        {/* Bottom bar: Ownership, Usage, Car Type & Race Type Filters */}
        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-brand-dark-border">
          {/* Filter Owned */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-emerald-400 shrink-0">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {t['Filters.purchase']}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-brand-dark-input/80 p-1 rounded-xl border border-brand-dark-border flex-wrap">
              <button
                onClick={() => setFilterOwned('all')}
                className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  filterOwned === 'all'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-brand-dark-hover/50'
                }`}
              >
                {t['Filters.all']}
              </button>
              <button
                onClick={() => setFilterOwned('owned')}
                className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  filterOwned === 'owned'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-brand-dark-hover/50'
                }`}
              >
                {t['Filters.owned']}
              </button>
              <button
                onClick={() => setFilterOwned('not_owned')}
                className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  filterOwned === 'not_owned'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-brand-dark-hover/50'
                }`}
              >
                {t['Filters.missing']}
              </button>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-brand-dark-border hidden md:block"></div>

          {/* Filter Used */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-cyan-400 shrink-0">
              <PlayCircle className="h-4 w-4" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {t['Filters.usage']}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-brand-dark-input/80 p-1 rounded-xl border border-brand-dark-border flex-wrap">
              <button
                onClick={() => setFilterUsed('all')}
                className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  filterUsed === 'all'
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-brand-dark-hover/50'
                }`}
              >
                {t['Filters.all']}
              </button>
              <button
                onClick={() => setFilterUsed('used')}
                className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  filterUsed === 'used'
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-brand-dark-hover/50'
                }`}
              >
                {t['Filters.used']}
              </button>
              <button
                onClick={() => setFilterUsed('not_used')}
                className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  filterUsed === 'not_used'
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-brand-dark-hover/50'
                }`}
              >
                {t['Filters.unused']}
              </button>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-brand-dark-border hidden lg:block"></div>

          {/* Filter Repair */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-amber-400 shrink-0">
              <Wrench className="h-4 w-4" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {t['Filters.status']}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-brand-dark-input/80 p-1 rounded-xl border border-brand-dark-border flex-wrap">
              <button
                onClick={() => setFilterRepair('all')}
                className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  filterRepair === 'all'
                    ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-brand-dark-hover/50'
                }`}
              >
                {t['Filters.all']}
              </button>
              <button
                onClick={() => setFilterRepair('repair')}
                className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  filterRepair === 'repair'
                    ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-brand-dark-hover/50'
                }`}
              >
                {t['Filters.needsRepair']}
              </button>
              <button
                onClick={() => setFilterRepair('not_repair')}
                className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  filterRepair === 'not_repair'
                    ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-brand-dark-hover/50'
                }`}
              >
                {t['Filters.healthy']}
              </button>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-brand-dark-border hidden xl:block"></div>

          {/* Race Type */}
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Flag className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              {t['Filters.race']}
            </span>
            <select
              value={selectedRaceType}
              onChange={(e) => setSelectedRaceType(e.target.value)}
              className="w-full rounded-lg border border-brand-dark-border bg-brand-dark-input px-3 py-1 text-xs font-medium text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
            >
              <option value="" className="bg-brand-dark-deep text-white">
                {t['Filters.allRaces']}
              </option>
              <option value="Callejera" className="bg-brand-dark-deep text-white">
                {language === 'es' ? 'Callejera' : 'Street'}
              </option>
              <option value="Road" className="bg-brand-dark-deep text-white">
                Road
              </option>
              <option value="Rally" className="bg-brand-dark-deep text-white">
                Rally
              </option>
              <option value="Off Road" className="bg-brand-dark-deep text-white">
                Off Road
              </option>
              <option value="Sin Asignar" className="bg-brand-dark-deep text-white">
                {language === 'es' ? 'Sin Asignar' : 'Unassigned'}
              </option>
            </select>
          </div>

          {/* Car Type */}
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              {t['Filters.type']}
            </span>
            <select
              value={selectedCarType}
              onChange={(e) => setSelectedCarType(e.target.value)}
              className="w-full rounded-lg border border-brand-dark-border bg-brand-dark-input px-3 py-1 text-xs font-medium text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
            >
              <option value="" className="bg-brand-dark-deep text-white">
                {t['Filters.allTypes']}
              </option>
              {carTypes.map((type) => (
                <option key={type} value={type} className="bg-brand-dark-deep text-white">
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

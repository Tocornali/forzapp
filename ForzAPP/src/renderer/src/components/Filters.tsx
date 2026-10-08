import React, { useState } from 'react'
import {
  Search,
  RotateCcw,
  ArrowUpDown,
  CheckCircle2,
  PlayCircle,
  Filter,
  Flag,
  Shuffle,
  Heart,
  Gauge,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Wrench
} from 'lucide-react'
import { Language, translations } from '../translations'

interface FiltersProps {
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedCarClass: string
  setSelectedCarClass: (c: string) => void
  carClasses: string[]
  selectedRaceType: string
  setSelectedRaceType: (t: string) => void
  filterFavorites: boolean
  setFilterFavorites: (fav: boolean | ((prev: boolean) => boolean)) => void
  filterOwned: string
  setFilterOwned: (val: string) => void
  filterUsed: string
  setFilterUsed: (val: string) => void
  filterRepair: string
  setFilterRepair: (val: string) => void
  selectedCarType: string
  setSelectedCarType: (t: string) => void
  carTypes: string[]
  sortBy: string
  setSortBy: (s: string) => void
  resetFilters: () => void
  onPickRandom: () => void
  isRandomDisabled: boolean
  language: Language
}

export const Filters: React.FC<FiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCarClass,
  setSelectedCarClass,
  carClasses,
  selectedRaceType,
  setSelectedRaceType,
  filterFavorites,
  setFilterFavorites,
  filterOwned,
  setFilterOwned,
  filterUsed,
  setFilterUsed,
  filterRepair,
  setFilterRepair,
  selectedCarType,
  setSelectedCarType,
  carTypes,
  sortBy,
  setSortBy,
  resetFilters,
  onPickRandom,
  isRandomDisabled,
  language
}): React.JSX.Element => {
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false)
  const t = translations[language]

  // Count active secondary filters to highlight the toggle badge
  const secondaryFiltersActiveCount =
    (filterUsed !== 'all' ? 1 : 0) +
    (filterRepair !== 'all' ? 1 : 0) +
    (selectedCarType !== '' ? 1 : 0)

  // Check if any filters are active compared to default state
  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCarClass !== '' ||
    selectedRaceType !== '' ||
    filterFavorites ||
    filterOwned !== 'all' ||
    filterUsed !== 'all' ||
    filterRepair !== 'all' ||
    selectedCarType !== '' ||
    sortBy !== 'manuf-asc'

  return (
    <div className="w-full border-b border-brand-dark-border bg-brand-dark-card px-4 py-3 shadow-md">
      <div className="mx-auto max-w-7xl space-y-3">
        {/* Main Toolbar Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t['Filters.searchPlaceholder']}
              className="w-full rounded-xl border border-brand-dark-border bg-brand-dark-input/70 py-2 pl-9 pr-8 text-xs sm:text-sm text-white placeholder-slate-400 shadow-inner focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Borrar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Ownership Filter (Segmented Pills) */}
          <div className="flex items-center gap-1 rounded-xl border border-brand-dark-border bg-brand-dark-input/60 p-1 shadow-inner">
            <button
              onClick={() => setFilterOwned('all')}
              className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                filterOwned === 'all'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-brand-dark-hover/50'
              }`}
            >
              {t['Filters.all']}
            </button>
            <button
              onClick={() => setFilterOwned('owned')}
              className={`cursor-pointer flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                filterOwned === 'owned'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-emerald-400 hover:bg-brand-dark-hover/50'
              }`}
              title={t['Filters.owned']}
            >
              <CheckCircle2 className="h-3 w-3" />
              <span>{t['Filters.owned']}</span>
            </button>
            <button
              onClick={() => setFilterOwned('not_owned')}
              className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                filterOwned === 'not_owned'
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                  : 'text-slate-400 hover:text-amber-400 hover:bg-brand-dark-hover/50'
              }`}
              title={t['Filters.missing']}
            >
              {t['Filters.missing']}
            </button>
          </div>

          {/* Car Class Dropdown */}
          <div
            className={`flex items-center gap-1.5 rounded-xl border bg-brand-dark-input/60 px-2.5 py-1.5 shadow-inner transition-colors ${
              selectedCarClass !== ''
                ? 'border-amber-500/50 bg-amber-500/10'
                : 'border-brand-dark-border'
            }`}
          >
            <Gauge
              className={`h-3.5 w-3.5 shrink-0 ${
                selectedCarClass !== '' ? 'text-amber-400' : 'text-slate-400'
              }`}
            />
            <select
              value={selectedCarClass}
              onChange={(e) => setSelectedCarClass(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-brand-dark-deep text-white">
                {t['Filters.allClasses']}
              </option>
              {carClasses.map((cls) => (
                <option key={cls} value={cls} className="bg-brand-dark-deep text-white">
                  Clase {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Race Type Dropdown */}
          <div
            className={`flex items-center gap-1.5 rounded-xl border bg-brand-dark-input/60 px-2.5 py-1.5 shadow-inner transition-colors ${
              selectedRaceType !== ''
                ? 'border-brand-primary/50 bg-brand-primary/10'
                : 'border-brand-dark-border'
            }`}
          >
            <Flag
              className={`h-3.5 w-3.5 shrink-0 ${
                selectedRaceType !== '' ? 'text-brand-primary' : 'text-slate-400'
              }`}
            />
            <select
              value={selectedRaceType}
              onChange={(e) => setSelectedRaceType(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
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
              <option value="Drag" className="bg-brand-dark-deep text-white">
                Drag
              </option>
              <option value="Drift" className="bg-brand-dark-deep text-white">
                Drift
              </option>
              <option value="Sin Asignar" className="bg-brand-dark-deep text-white">
                {language === 'es' ? 'Sin Asignar' : 'Unassigned'}
              </option>
            </select>
          </div>

          {/* Favorites Toggle Button */}
          <button
            onClick={() => setFilterFavorites((prev) => !prev)}
            className={`cursor-pointer flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all active:scale-95 shadow-sm ${
              filterFavorites
                ? 'border-rose-500 bg-rose-500/20 text-rose-400 shadow-rose-500/20'
                : 'border-brand-dark-border bg-brand-dark-input/60 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-brand-dark-hover/50'
            }`}
            title={t['Filters.onlyFavorites']}
          >
            <Heart
              className={`h-3.5 w-3.5 ${filterFavorites ? 'fill-rose-500 text-rose-500' : ''}`}
            />
            <span className="hidden sm:inline">{t['Filters.favorites']}</span>
          </button>

          {/* Divider */}
          <div className="h-5 w-px bg-brand-dark-border hidden md:block" />

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 rounded-xl border border-brand-dark-border bg-brand-dark-input/60 px-2.5 py-1.5 shadow-inner">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value="manuf-asc" className="bg-brand-dark-deep text-white">
                {t['Filters.sort.manufAsc']}
              </option>
              <option value="manuf-desc" className="bg-brand-dark-deep text-white">
                {t['Filters.sort.manufDesc']}
              </option>
              <option value="class-desc" className="bg-brand-dark-deep text-white">
                {t['Filters.sort.classDesc']}
              </option>
              <option value="class-asc" className="bg-brand-dark-deep text-white">
                {t['Filters.sort.classAsc']}
              </option>
              <option value="year-desc" className="bg-brand-dark-deep text-white">
                {t['Filters.sort.yearDesc']}
              </option>
              <option value="year-asc" className="bg-brand-dark-deep text-white">
                {t['Filters.sort.yearAsc']}
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

          {/* Randomizer Button */}
          <button
            onClick={onPickRandom}
            disabled={isRandomDisabled}
            className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shadow-sm active:scale-95 ${
              isRandomDisabled
                ? 'border-brand-dark-border bg-brand-dark-card/40 text-slate-650 cursor-not-allowed'
                : 'cursor-pointer border-brand-primary/40 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary hover:text-white'
            }`}
            title={t['Filters.randomTitle']}
          >
            <Shuffle
              className={`h-3.5 w-3.5 ${isRandomDisabled ? 'text-slate-600' : 'text-brand-primary'}`}
            />
            <span className="hidden sm:inline">{t['Filters.random']}</span>
          </button>

          {/* More Filters Toggle */}
          <button
            onClick={() => setIsMoreFiltersOpen((prev) => !prev)}
            className={`cursor-pointer flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 shadow-sm ${
              isMoreFiltersOpen || secondaryFiltersActiveCount > 0
                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                : 'border-brand-dark-border bg-brand-dark-input/60 text-slate-300 hover:text-white hover:bg-brand-dark-hover/50'
            }`}
            title={t['Filters.moreFilters']}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden md:inline">
              {isMoreFiltersOpen ? t['Filters.lessFilters'] : t['Filters.moreFilters']}
            </span>
            {secondaryFiltersActiveCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-extrabold text-brand-dark-deep">
                {secondaryFiltersActiveCount}
              </span>
            )}
            {isMoreFiltersOpen ? (
              <ChevronUp className="h-3 w-3 text-slate-400" />
            ) : (
              <ChevronDown className="h-3 w-3 text-slate-400" />
            )}
          </button>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="cursor-pointer flex items-center justify-center gap-1.5 rounded-xl border border-brand-dark-border bg-brand-dark-input/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 transition-all shadow-sm active:scale-95 ml-auto"
              title={t['Filters.clearFilters']}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">{t['Filters.clearFilters']}</span>
            </button>
          )}
        </div>

        {/* Collapsible Secondary Filters Row */}
        {isMoreFiltersOpen && (
          <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-brand-dark-border/60 animate-fadeIn">
            {/* Filter Car Type */}
            <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-sm">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                {t['Filters.type']}
              </span>
              <select
                value={selectedCarType}
                onChange={(e) => setSelectedCarType(e.target.value)}
                className="w-full rounded-lg border border-brand-dark-border bg-brand-dark-input px-3 py-1.5 text-xs font-medium text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
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

            {/* Filter Usage */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-cyan-400 shrink-0">
                <PlayCircle className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {t['Filters.usage']}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-brand-dark-input/80 p-1 rounded-xl border border-brand-dark-border">
                <button
                  onClick={() => setFilterUsed('all')}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    filterUsed === 'all'
                      ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-brand-dark-hover/50'
                  }`}
                >
                  {t['Filters.all']}
                </button>
                <button
                  onClick={() => setFilterUsed('used')}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    filterUsed === 'used'
                      ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-brand-dark-hover/50'
                  }`}
                >
                  {t['Filters.used']}
                </button>
                <button
                  onClick={() => setFilterUsed('not_used')}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    filterUsed === 'not_used'
                      ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-brand-dark-hover/50'
                  }`}
                >
                  {t['Filters.unused']}
                </button>
              </div>
            </div>

            {/* Filter Repair / Status */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-amber-400 shrink-0">
                <Wrench className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {t['Filters.status']}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-brand-dark-input/80 p-1 rounded-xl border border-brand-dark-border">
                <button
                  onClick={() => setFilterRepair('all')}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    filterRepair === 'all'
                      ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-brand-dark-hover/50'
                  }`}
                >
                  {t['Filters.all']}
                </button>
                <button
                  onClick={() => setFilterRepair('repair')}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    filterRepair === 'repair'
                      ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-brand-dark-hover/50'
                  }`}
                >
                  {t['Filters.needsRepair']}
                </button>
                <button
                  onClick={() => setFilterRepair('not_repair')}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    filterRepair === 'not_repair'
                      ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-brand-dark-hover/50'
                  }`}
                >
                  {t['Filters.healthy']}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

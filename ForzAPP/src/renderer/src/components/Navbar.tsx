import React from 'react'
import { Flame, Heart, Car as CarIcon, Sparkles, X, Plus, RefreshCw, History, Cloud } from 'lucide-react'
import { Language, translations } from '../translations'

interface NavbarProps {
  activeTab: 'explore' | 'garage'
  setActiveTab: (tab: 'explore' | 'garage') => void
  totalCars: number
  garageCount: number
  onClearAllOwned: () => void
  onAddCar: () => void
  onSyncCatalog: () => void
  onOpenCloudSync: () => void
  onOpenChangelog: () => void
  language: Language
  toggleLanguage: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  totalCars,
  garageCount,
  onClearAllOwned,
  onAddCar,
  onSyncCatalog,
  onOpenCloudSync,
  onOpenChangelog,
  language,
  toggleLanguage
}): React.JSX.Element => {
  const t = translations[language]

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-brand-dark-border bg-brand-dark-deep shadow-md"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 py-2 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:py-0">
          {/* Top Row on mobile / Left section on desktop */}
          <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 shrink-0">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary via-emerald-500 to-yellow-500 p-0.5 shadow-lg shadow-brand-primary/20 shrink-0">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-brand-dark-deep">
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-brand-primary animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 leading-none">
                  FORZA<span className="text-brand-primary">CHECK</span>
                </h1>
                <p className="hidden xl:flex text-xs font-medium text-slate-400 items-center gap-1 mt-0.5">
                  <Sparkles className="h-3 w-3 text-amber-400" /> {t['Navbar.subtitle']} ({totalCars}{' '}
                  {t['Navbar.vehicles']})
                </p>
              </div>
            </div>

            {/* Mobile Actions Cluster (visible only on mobile <640px) */}
            <div className="flex items-center gap-1 sm:hidden">
              {/* Cloud Sync Button */}
              <button
                onClick={onOpenCloudSync}
                className="relative flex h-8 w-8 items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 active:scale-95 cursor-pointer"
                title={language === 'es' ? 'Sincronización en la Nube' : 'Cloud Sync'}
              >
                <Cloud className="h-4 w-4 text-cyan-400" />
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-cyan-400 ring-2 ring-brand-dark-deep" />
              </button>

              {/* Sync Catalog Button */}
              <button
                onClick={onSyncCatalog}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-dark-border bg-brand-dark-card/85 text-slate-300 active:scale-95 cursor-pointer"
                title={t['Navbar.syncTitle']}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>

              {/* Changelog Button */}
              <button
                onClick={onOpenChangelog}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-dark-border bg-brand-dark-card/85 text-slate-300 active:scale-95 cursor-pointer"
                title={t['Navbar.changelogTitle']}
              >
                <History className="h-3.5 w-3.5" />
              </button>

              {/* Add Car Button */}
              <button
                onClick={onAddCar}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-primary bg-brand-primary/20 text-brand-primary-light active:scale-95 cursor-pointer"
                title={t['Navbar.addCarTitle']}
              >
                <Plus className="h-4 w-4 text-brand-primary" />
              </button>

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-0.5 rounded-full border border-brand-dark-border bg-brand-dark-card px-2 py-1 text-[11px] font-bold text-slate-300 active:scale-95 cursor-pointer"
                title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
              >
                <span
                  className={language === 'es' ? 'text-brand-primary font-extrabold' : 'text-slate-400'}
                >
                  ES
                </span>
                <span className="text-slate-600">/</span>
                <span
                  className={language === 'en' ? 'text-brand-primary font-extrabold' : 'text-slate-400'}
                >
                  EN
                </span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs (full width on mobile, centered/shrink-0 on desktop) */}
          <nav className="flex items-center justify-center gap-1 rounded-full border border-brand-dark-border bg-brand-dark-card/50 p-1 shadow-inner w-full sm:w-auto shrink-0">
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-gradient-to-r from-brand-primary-hover to-brand-primary text-white shadow-md shadow-brand-primary/20 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-brand-dark-hover/50'
              }`}
            >
              <CarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{t['Navbar.explore']}</span>
            </button>

            <button
              onClick={() => setActiveTab('garage')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer ${
                activeTab === 'garage'
                  ? 'bg-gradient-to-r from-brand-primary-hover to-brand-primary text-white shadow-md shadow-brand-primary/20 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-brand-dark-hover/50'
              }`}
            >
              <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{t['Navbar.garage']}</span>
              {garageCount > 0 && (
                <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-brand-dark-deep text-[10px] sm:text-[11px] font-bold text-brand-primary-light border border-brand-primary/30">
                  {garageCount}
                </span>
              )}
            </button>
          </nav>

          {/* Desktop-only Actions Group (hidden on mobile, visible on sm:) */}
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Utilities Toolbar Pill */}
            <div className="flex items-center gap-0.5 sm:gap-1 rounded-full border border-brand-dark-border bg-brand-dark-card/60 p-0.5 sm:p-1">
              {/* Sync Catalog Button */}
              <button
                onClick={onSyncCatalog}
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-slate-300 hover:bg-brand-primary/15 hover:text-brand-primary transition-all active:scale-95 cursor-pointer"
                title={t['Navbar.syncTitle']}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>

              {/* Cloud Sync Button */}
              <button
                onClick={onOpenCloudSync}
                className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition-all active:scale-95 cursor-pointer"
                title={language === 'es' ? 'Sincronización en la Nube (PC / Celular)' : 'Cloud Synchronization (PC / Mobile)'}
              >
                <Cloud className="h-3.5 w-3.5 text-cyan-400" />
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-cyan-400 ring-2 ring-brand-dark-deep" />
              </button>

              {/* Changelog Button */}
              <button
                onClick={onOpenChangelog}
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-slate-300 hover:bg-brand-primary/15 hover:text-brand-primary transition-all active:scale-95 cursor-pointer"
                title={t['Navbar.changelogTitle']}
              >
                <History className="h-3.5 w-3.5" />
              </button>

              {/* Clear All Owned Button */}
              <button
                onClick={onClearAllOwned}
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-slate-300 hover:bg-rose-500/20 hover:text-rose-400 transition-all active:scale-95 cursor-pointer"
                title={t['Navbar.uncheckAllTitle']}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-0.5 sm:gap-1 rounded-full border border-brand-dark-border bg-brand-dark-card/85 px-2 py-1 sm:px-2.5 sm:py-1 text-xs font-bold text-slate-300 hover:bg-brand-dark-hover/50 hover:text-white transition-all active:scale-95 cursor-pointer"
              title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              <span
                className={language === 'es' ? 'text-brand-primary font-extrabold' : 'text-slate-400'}
              >
                ES
              </span>
              <span className="text-slate-600">/</span>
              <span
                className={language === 'en' ? 'text-brand-primary font-extrabold' : 'text-slate-400'}
              >
                EN
              </span>
            </button>

            {/* Add Car Button */}
            <button
              onClick={onAddCar}
              className="flex items-center gap-1.5 rounded-full border border-brand-primary bg-brand-primary/15 px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-xs font-bold text-brand-primary-light hover:bg-brand-primary hover:text-white hover:border-brand-primary-hover transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
              title={t['Navbar.addCarTitle']}
            >
              <Plus className="h-3.5 w-3.5 text-brand-primary" />
              <span className="hidden xl:inline">{t['Navbar.addCar']}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

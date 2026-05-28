import React from 'react'
import { Flame, Heart, Car as CarIcon, Sparkles, X, Plus } from 'lucide-react'
import { Language, translations } from '../translations'

interface NavbarProps {
  activeTab: 'explore' | 'garage'
  setActiveTab: (tab: 'explore' | 'garage') => void
  totalCars: number
  garageCount: number
  onClearAllOwned: () => void
  onAddCar: () => void
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
  language,
  toggleLanguage
}): React.JSX.Element => {
  const t = translations[language]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-dark-border bg-brand-dark-deep/80 backdrop-blur-xl shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary via-emerald-500 to-yellow-500 p-0.5 shadow-lg shadow-brand-primary/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-brand-dark-deep">
              <Flame className="h-5 w-5 text-brand-primary animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
              FORZA<span className="text-brand-primary">CHECK</span>
            </h1>
            <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" /> {t['Navbar.subtitle']} ({totalCars}{' '}
              {t['Navbar.vehicles']})
            </p>
          </div>
        </div>

        {/* Navigation Tabs & Actions */}
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1 rounded-full border border-brand-dark-border bg-brand-dark-card/50 p-1 shadow-inner">
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-2 rounded-full px-5 py-1.5 text-sm font-medium transition-all duration-300 ${
                activeTab === 'explore'
                  ? 'bg-gradient-to-r from-brand-primary-hover to-brand-primary text-white shadow-md shadow-brand-primary/20 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-brand-dark-hover/50'
              }`}
            >
              <CarIcon className="h-4 w-4" />
              <span>{t['Navbar.explore']}</span>
            </button>

            <button
              onClick={() => setActiveTab('garage')}
              className={`flex items-center gap-2 rounded-full px-5 py-1.5 text-sm font-medium transition-all duration-300 ${
                activeTab === 'garage'
                  ? 'bg-gradient-to-r from-brand-primary-hover to-brand-primary text-white shadow-md shadow-brand-primary/20 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-brand-dark-hover/50'
              }`}
            >
              <Heart className="h-4 w-4" />
              <span>{t['Navbar.garage']}</span>
              {garageCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-dark-deep text-[11px] font-bold text-brand-primary-light border border-brand-primary/30">
                  {garageCount}
                </span>
              )}
            </button>
          </nav>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 rounded-full border border-brand-dark-border bg-brand-dark-card/85 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-brand-dark-hover/50 hover:text-white transition-all active:scale-95 cursor-pointer"
            title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          >
            <span
              className={language === 'es' ? 'text-brand-primary font-extrabold' : 'text-slate-400'}
            >
              ES
            </span>
            <span className="text-slate-650">/</span>
            <span
              className={language === 'en' ? 'text-brand-primary font-extrabold' : 'text-slate-400'}
            >
              EN
            </span>
          </button>

          {/* Clear All Owned Button */}
          <button
            onClick={onClearAllOwned}
            className="flex items-center gap-1.5 rounded-full border border-brand-dark-border bg-brand-dark-card/85 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-brand-primary/10 hover:text-brand-primary hover:border-brand-primary/45 transition-all shadow-sm active:scale-95 cursor-pointer"
            title={t['Navbar.uncheckAllTitle']}
          >
            <X className="h-3.5 w-3.5 text-brand-primary" />
            <span className="hidden sm:inline">{t['Navbar.uncheckAll']}</span>
          </button>

          {/* Add Car Button */}
          <button
            onClick={onAddCar}
            className="flex items-center gap-1.5 rounded-full border border-brand-primary bg-brand-primary/10 px-4 py-2 text-xs font-bold text-brand-primary-light hover:bg-brand-primary hover:text-white hover:border-brand-primary-hover transition-all shadow-sm active:scale-95 cursor-pointer"
            title={t['Navbar.addCarTitle']}
          >
            <Plus className="h-3.5 w-3.5 text-brand-primary" />
            <span className="hidden sm:inline">{t['Navbar.addCar']}</span>
          </button>
        </div>
      </div>
    </header>
  )
}

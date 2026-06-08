import React from 'react'
import { X, Calendar, Trash2, Trophy, AlertCircle } from 'lucide-react'
import { Language, translations } from '../translations'

export interface ChangelogCar {
  Brand: string
  Model: string
  Year: number | string
  Class: string
  PI: number | string
  source: string
}

export interface ChangelogEntry {
  date: string
  cars: ChangelogCar[]
}

interface ChangelogModalProps {
  isOpen: boolean
  onClose: () => void
  language: Language
  changelog: ChangelogEntry[]
  onClearHistory: () => void
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({
  isOpen,
  onClose,
  language,
  changelog,
  onClearHistory
}) => {
  const t = translations[language]

  if (!isOpen) return null

  const formatDate = (isoString: string): string => {
    try {
      const date = new Date(isoString)
      return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return isoString
    }
  }

  const getClassBadgeStyle = (cls: string) => {
    switch (cls.toUpperCase().trim()) {
      case 'D':
        return 'bg-cyan-500 text-slate-950 shadow-cyan-500/20'
      case 'C':
        return 'bg-yellow-500 text-slate-950 shadow-yellow-500/20'
      case 'B':
        return 'bg-orange-500 text-slate-950 shadow-orange-500/20'
      case 'A':
        return 'bg-red-600 text-white shadow-red-600/20'
      case 'S1':
        return 'bg-purple-600 text-white shadow-purple-600/20'
      case 'S2':
        return 'bg-blue-600 text-white shadow-blue-600/20'
      case 'R':
        return 'bg-rose-600 text-white shadow-rose-600/20'
      case 'X':
        return 'bg-emerald-600 text-white shadow-emerald-600/20'
      default:
        return 'bg-slate-600 text-white shadow-slate-600/20'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-brand-dark-border bg-brand-dark-card p-6 shadow-2xl animate-scaleUp max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-brand-dark-border">
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-primary" />
            <span>{t['ChangelogModal.title']}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-dark-hover hover:text-white transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {changelog.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-dark-deep border border-brand-dark-border mb-4">
                <AlertCircle className="h-8 w-8 text-brand-primary/60" />
              </div>
              <h3 className="text-base font-bold text-white">{t['ChangelogModal.empty']}</h3>
              <p className="mt-1 text-sm text-slate-400 max-w-sm">
                {t['ChangelogModal.emptyDesc']}
              </p>
            </div>
          ) : (
            changelog.map((entry, entryIdx) => (
              <div key={entryIdx} className="space-y-3">
                {/* Date Header */}
                <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider bg-brand-dark-deep/40 p-2 rounded-lg border border-brand-dark-border/40">
                  <Calendar className="h-3.5 w-3.5 text-brand-primary-light" />
                  <span>{formatDate(entry.date)}</span>
                  <span className="ml-auto bg-brand-primary/10 border border-brand-primary/20 text-brand-primary-light px-2 py-0.5 rounded-full text-[10px]">
                    {entry.cars.length} {entry.cars.length === 1 ? 'vehículo' : 'vehículos'}
                  </span>
                </div>

                {/* Cars Grid / List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {entry.cars.map((car, carIdx) => (
                    <div
                      key={carIdx}
                      className="flex items-center justify-between p-3 rounded-xl bg-brand-dark-deep/30 border border-brand-dark-border/60 hover:border-brand-dark-hover transition-all"
                    >
                      <div className="flex flex-col min-w-0 pr-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                          {car.Brand}
                        </span>
                        <span className="text-xs font-extrabold text-white truncate">
                          {car.Model}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Año: <span className="font-semibold text-slate-350">{car.Year}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Class */}
                        <div
                          className={`flex items-center gap-0.5 rounded-lg px-2 py-0.5 font-black text-[9px] shadow-sm ${getClassBadgeStyle(car.Class)}`}
                        >
                          <Trophy className="h-2.5 w-2.5 shrink-0" />
                          <span>
                            {car.Class} {car.PI}
                          </span>
                        </div>
                        {/* Source */}
                        <div className="flex items-center rounded-lg px-1.5 py-0.5 border border-slate-700/40 bg-slate-800/30 text-[9px] font-bold text-slate-400 max-w-[80px] truncate">
                          <span>{car.source || 'General'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-brand-dark-border mt-auto">
          {changelog.length > 0 ? (
            <button
              type="button"
              onClick={onClearHistory}
              className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer active:scale-95"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t['ChangelogModal.clear']}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-primary-hover to-brand-primary px-6 py-2 text-xs font-bold text-white shadow-md shadow-brand-primary/20 hover:from-brand-primary hover:to-brand-primary-light transition-all cursor-pointer active:scale-95"
          >
            {t['ChangelogModal.close']}
          </button>
        </div>
      </div>
    </div>
  )
}

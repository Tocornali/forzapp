import React from 'react'
import { X, RefreshCw, CheckCircle2, AlertTriangle, Sparkles, Trophy, Flag } from 'lucide-react'
import { Language, translations } from '../translations'

interface SyncModalProps {
  isOpen: boolean
  onClose: () => void
  language: Language
  status: 'idle' | 'checking' | 'success' | 'error'
  newCars: any[]
  errorMessage?: string
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  language,
  status,
  newCars,
  errorMessage
}) => {
  const t = translations[language]

  if (!isOpen) return null

  const renderContent = () => {
    switch (status) {
      case 'checking':
        return (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary mb-5">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight mb-2">
              {t['SyncModal.checking']}
            </h2>
            <p className="text-sm text-slate-400 max-w-sm">
              {t['SyncModal.checkingDesc']}
            </p>
          </div>
        )
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 mb-5">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight mb-2">
              {t['SyncModal.error']}
            </h2>
            <p className="text-sm text-slate-400 max-w-sm">
              {t['SyncModal.errorDesc'].replace('{error}', errorMessage || '')}
            </p>
          </div>
        )
      case 'success':
        if (newCars.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-5">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight mb-2">
                {t['SyncModal.noUpdates']}
              </h2>
              <p className="text-sm text-slate-400 max-w-sm">
                {t['SyncModal.noUpdatesDesc']}
              </p>
            </div>
          )
        } else {
          return (
            <div className="flex flex-col items-stretch py-4">
              <div className="flex flex-col items-center justify-center text-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/15 border border-brand-primary/30 text-brand-primary mb-4 shadow-lg shadow-brand-primary/10">
                  <Sparkles className="h-8 w-8 animate-pulse text-brand-primary-light" />
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight mb-2">
                  {t['SyncModal.updatesFound']}
                </h2>
                <p className="text-sm text-slate-400 max-w-md">
                  {t['SyncModal.updatesFoundDesc'].replace('{count}', String(newCars.length))}
                </p>
              </div>

              {/* Scrollable list of new cars */}
              <div className="max-h-[300px] overflow-y-auto pr-1 border border-brand-dark-border rounded-xl bg-brand-dark-deep/50 p-3 space-y-2.5">
                {newCars.map((car, index) => {
                  const yearMatch = (car['point2580/4160'] || '').trim().match(/^(\d{4})\b/)
                  const year = yearMatch ? yearMatch[1] : ''
                  const model = year ? car['point2580/4160'].substring(5) : car['point2580/4160']
                  const carClass = (car.Class || '').split(' ')[0] || 'D'
                  const carPI = (car.Class || '').split(' ')[1] || '100'

                  const getClassBadgeStyle = (cls: string) => {
                    switch (cls) {
                      case 'D': return 'bg-cyan-500 text-slate-950 shadow-cyan-500/20'
                      case 'C': return 'bg-yellow-500 text-slate-950 shadow-yellow-500/20'
                      case 'B': return 'bg-orange-500 text-slate-950 shadow-orange-500/20'
                      case 'A': return 'bg-red-600 text-white shadow-red-600/20'
                      case 'S1': return 'bg-purple-600 text-white shadow-purple-600/20'
                      case 'S2': return 'bg-blue-600 text-white shadow-blue-600/20'
                      case 'X': return 'bg-emerald-600 text-white shadow-emerald-600/20'
                      default: return 'bg-slate-600 text-white shadow-slate-600/20'
                    }
                  }

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-brand-dark-card border border-brand-dark-border/80 hover:border-brand-dark-hover transition-all"
                    >
                      <div className="flex flex-col min-w-0 pr-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                          {car.Brand}
                        </span>
                        <span className="text-sm font-extrabold text-white truncate">
                          {model}
                        </span>
                        <span className="text-xs text-slate-400">
                          Año: <span className="font-semibold text-slate-355">{year || car.Year || 'N/A'}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className={`flex items-center gap-1 rounded-lg px-2 py-0.5 font-black text-[10px] shadow-sm ${getClassBadgeStyle(carClass)}`}>
                          <Trophy className="h-3 w-3 shrink-0" />
                          <span>{carClass} {carPI}</span>
                        </div>
                        <div className="flex items-center rounded-lg px-2 py-0.5 border border-slate-700/50 bg-slate-800/40 text-[10px] font-bold text-slate-400">
                          <Flag className="h-2.5 w-2.5 shrink-0 mr-1 text-slate-500" />
                          <span>{car.source || 'General'}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        }
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={status === 'checking' ? undefined : onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-brand-dark-border bg-brand-dark-card p-6 shadow-2xl animate-scaleUp">
        {status !== 'checking' && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-brand-dark-hover hover:text-white transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {renderContent()}

        {/* Action Button */}
        {status !== 'checking' && (
          <div className="flex justify-end pt-4 mt-4 border-t border-brand-dark-border">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-primary-hover to-brand-primary px-6 py-2 text-xs font-bold text-white shadow-md shadow-brand-primary/20 hover:from-brand-primary hover:to-brand-primary-light transition-all cursor-pointer active:scale-95"
            >
              {t['SyncModal.close']}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

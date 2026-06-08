import React, { useState, useEffect } from 'react'
import {
  Heart,
  CheckCircle2,
  PlayCircle,
  Car as CarIcon,
  Trophy,
  Edit2,
  Check,
  X,
  Flag,
  Wrench,
  Pencil,
  Trash2
} from 'lucide-react'
import { Car } from '../types'
import { Language, translations } from '../translations'

interface CarCardProps {
  car: Car
  isFavorite: boolean
  toggleFavorite: (car: Car) => void
  isOwned: boolean
  toggleOwned: (car: Car) => void
  isUsed: boolean
  toggleUsed: (car: Car) => void
  needsRepair: boolean
  toggleRepair: (car: Car) => void
  onUpdatePerformance: (car: Car, newClass: string, newPI: number, newRaceType: string) => void
  onUpdateRaces?: (car: Car, count: number) => void
  onEdit?: (car: Car) => void
  onDelete?: (car: Car) => void
  language: Language
}

const getClassBadge = (carClass: string): { bg: string; glow: string } => {
  switch (carClass) {
    case 'D':
      return { bg: 'bg-cyan-500 text-slate-950', glow: 'shadow-cyan-500/20' }
    case 'C':
      return { bg: 'bg-yellow-500 text-slate-950', glow: 'shadow-yellow-500/20' }
    case 'B':
      return { bg: 'bg-orange-500 text-slate-950', glow: 'shadow-orange-500/20' }
    case 'A':
      return { bg: 'bg-red-600 text-white', glow: 'shadow-red-600/20' }
    case 'S1':
      return { bg: 'bg-purple-600 text-white', glow: 'shadow-purple-600/20' }
    case 'S2':
      return { bg: 'bg-blue-600 text-white', glow: 'shadow-blue-600/20' }
    case 'R':
      return { bg: 'bg-rose-600 text-white', glow: 'shadow-rose-600/20' }
    case 'X':
      return { bg: 'bg-emerald-600 text-white', glow: 'shadow-emerald-600/20' }
    default:
      return { bg: 'bg-slate-600 text-white', glow: 'shadow-slate-600/20' }
  }
}

const getRaceTypeBadge = (type?: string): { bg: string; label: string } => {
  switch (type) {
    case 'Road':
      return { bg: 'bg-sky-500/20 text-sky-400 border-sky-500/30', label: 'Road' }
    case 'Callejera':
      return { bg: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Callejera' }
    case 'Rally':
      return { bg: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Rally' }
    case 'Off Road':
      return { bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Off Road' }
    case 'Drag':
      return { bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30', label: 'Drag' }
    case 'Drift':
      return { bg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Drift' }
    default:
      return {
        bg: 'bg-slate-800/40 text-slate-500 border-slate-700/50',
        label: 'Sin Carrera Asignada'
      }
  }
}

export const CarCard: React.FC<CarCardProps> = ({
  car,
  isFavorite,
  toggleFavorite,
  isOwned,
  toggleOwned,
  isUsed,
  toggleUsed,
  needsRepair,
  toggleRepair,
  onUpdatePerformance,
  onUpdateRaces,
  onEdit,
  onDelete,
  language
}): React.JSX.Element => {
  const t = translations[language]
  const classStyle = getClassBadge(car.CarClass)

  const getTranslatedRaceType = (type?: string): string => {
    switch (type) {
      case 'Road':
        return 'Road'
      case 'Callejera':
        return language === 'es' ? 'Callejera' : 'Street'
      case 'Rally':
        return 'Rally'
      case 'Off Road':
        return 'Off Road'
      case 'Drag':
        return 'Drag'
      case 'Drift':
        return 'Drift'
      default:
        return t['CarCard.noRace']
    }
  }

  const raceBadge = getRaceTypeBadge(car.RaceType)

  // Inline editing state for CarClass & RaceType
  const [isEditingPerf, setIsEditingPerf] = useState(false)
  const [editCarClass, setEditCarClass] = useState<string>(car.CarClass || 'D')
  const [editRaceType, setEditRaceType] = useState<string>(car.RaceType || '')

  // Sincronizar el estado de edición si cambian las props externas
  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setEditCarClass(car.CarClass || 'D')
    setEditRaceType(car.RaceType || '')
  }, [car.CarClass, car.RaceType])

  const editClassBadgeStyle = getClassBadge(editCarClass)

  const handleSavePerf = (): void => {
    onUpdatePerformance(car, editCarClass, car.PI || 0, editRaceType)
    setIsEditingPerf(false)
  }

  const handleCancelPerf = (): void => {
    setEditCarClass(car.CarClass || 'D')
    setEditRaceType(car.RaceType || '')
    setIsEditingPerf(false)
  }

  const handleIncrementRaces = (): void => {
    if (onUpdateRaces) {
      onUpdateRaces(car, (car.RacesCount || 0) + 1)
    }
  }

  const handleDecrementRaces = (): void => {
    if (onUpdateRaces && (car.RacesCount || 0) > 0) {
      onUpdateRaces(car, (car.RacesCount || 0) - 1)
    }
  }

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-dark-border bg-gradient-to-b from-brand-dark-card/90 to-brand-dark-deep/95 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-dark-hover hover:shadow-xl hover:shadow-brand-primary/5">
      {/* Header Area */}
      <div className="flex items-start justify-between gap-2 pr-20">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider break-words">
            {car.Manufacturer}
          </h3>
          <h2 className="text-lg font-extrabold text-white tracking-tight group-hover:text-brand-primary-light transition-colors mt-0.5 break-words">
            {car.Model}
          </h2>
          <div className="text-sm font-normal text-slate-400 mt-1">
            {t['CarCard.year']} <span className="font-semibold text-slate-300">{car.Year}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-400">
            <CarIcon className="h-3.5 w-3.5 text-brand-primary shrink-0" />
            <span className="break-words">{car.CarType || t['CarCard.general']}</span>
          </div>
        </div>
      </div>

      {/* Absolute top right action buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
        <button
          onClick={() => toggleRepair(car)}
          className={`cursor-pointer active:scale-95 hover:scale-[1.05] flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 shrink-0 ${
            needsRepair
              ? 'border-amber-500 bg-amber-500/20 text-amber-400 shadow-sm shadow-amber-500/20 hover:bg-amber-500/30'
              : 'border-brand-dark-border bg-brand-dark-card/50 text-slate-400 hover:border-brand-dark-hover hover:text-white hover:bg-brand-dark-hover'
          }`}
          title={needsRepair ? t['CarCard.removeRepair'] : t['CarCard.markRepair']}
        >
          <Wrench className="h-4 w-4" />
        </button>

        <button
          onClick={() => toggleFavorite(car)}
          className={`cursor-pointer active:scale-95 hover:scale-[1.05] flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 shrink-0 ${
            isFavorite
              ? 'border-brand-primary bg-brand-primary/20 text-brand-primary shadow-sm shadow-brand-primary/20 hover:bg-brand-primary/30'
              : 'border-brand-dark-border bg-brand-dark-card/50 text-slate-400 hover:border-brand-dark-hover hover:text-white hover:bg-brand-dark-hover'
          }`}
          title={isFavorite ? t['CarCard.removeFav'] : t['CarCard.addFav']}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Interactive Performance & Race Type Block */}
      <div className="mt-4 pt-3 border-t border-brand-dark-border">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            {t['CarCard.performanceConfig']}
          </span>
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(car)}
                className="cursor-pointer text-slate-500 hover:text-amber-400 p-1 rounded hover:bg-brand-dark-hover transition-colors"
                title={t['CarCard.edit']}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(car)}
                className="cursor-pointer text-slate-500 hover:text-red-500 p-1 rounded hover:bg-brand-dark-hover transition-colors"
                title={t['CarCard.delete']}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {isEditingPerf ? (
          <div className="flex flex-col gap-2 bg-brand-dark-deep p-2.5 rounded-xl border border-brand-primary/50 shadow-inner animate-fadeIn">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center h-7 w-8 rounded-lg ${editClassBadgeStyle.bg} font-black text-xs shadow-md ${editClassBadgeStyle.glow} transition-colors duration-300 shrink-0`}
              >
                {editCarClass}
              </div>

              <select
                value={editCarClass}
                onChange={(e) => setEditCarClass(e.target.value)}
                className="w-full bg-brand-dark-input text-white text-xs font-bold rounded-lg px-2 py-1 border border-brand-dark-border focus:outline-none focus:border-brand-primary cursor-pointer"
              >
                <option value="X">X</option>
                <option value="R">R</option>
                <option value="S2">S2</option>
                <option value="S1">S1</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>

              <div className="flex items-center gap-1 ml-auto shrink-0">
                <button
                  onClick={handleSavePerf}
                  className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-sm active:scale-95"
                  title={t['CarCard.save']}
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCancelPerf}
                  className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg bg-brand-dark-card text-slate-400 hover:bg-brand-dark-hover hover:text-white transition-all border border-brand-dark-border active:scale-95"
                  title={t['CarCard.cancel']}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-brand-dark-border">
              <Flag className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <select
                value={editRaceType}
                onChange={(e) => setEditRaceType(e.target.value)}
                className="w-full bg-brand-dark-input text-white text-xs font-medium rounded-lg px-2 py-1 border border-brand-dark-border focus:outline-none focus:border-brand-primary cursor-pointer"
              >
                <option value="">{t['CarCard.noRace']}</option>
                <option value="Callejera">{language === 'es' ? 'Callejera' : 'Street'}</option>
                <option value="Road">Road</option>
                <option value="Rally">Rally</option>
                <option value="Off Road">Off Road</option>
                <option value="Drag">Drag</option>
                <option value="Drift">Drift</option>
              </select>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingPerf(true)}
            className="group/perf cursor-pointer flex items-center justify-between bg-brand-dark-input/80 hover:bg-brand-dark-hover/60 p-2.5 rounded-xl border border-brand-dark-border hover:border-brand-dark-hover transition-all shadow-sm"
            title={t['CarCard.editTooltip']}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 ${classStyle.bg} font-black text-xs shadow-md ${classStyle.glow} transition-colors duration-300`}
              >
                <Trophy className="h-3.5 w-3.5 shrink-0" />
                <span>{car.CarClass || 'N/A'}</span>
              </div>

              <div
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 border text-xs font-bold ${raceBadge.bg}`}
              >
                <Flag className="h-3 w-3 shrink-0" />
                <span>{getTranslatedRaceType(car.RaceType)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-500 group-hover/perf:text-amber-400 transition-colors text-xs font-semibold px-1 shrink-0 ml-2">
              <Edit2 className="h-3.5 w-3.5" />
            </div>
          </div>
        )}
      </div>

      {/* Race Counter Row */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-brand-dark-border">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 selection:bg-transparent">
          <Flag className="h-3.5 w-3.5 text-amber-500 shrink-0" /> {t['CarCard.racesDisputed']}
        </span>
        <div className="flex items-center gap-1.5 bg-brand-dark-input/80 border border-brand-dark-border rounded-xl px-2 py-0.5 shadow-inner">
          <button
            onClick={handleDecrementRaces}
            className="cursor-pointer font-extrabold text-slate-400 hover:text-white hover:bg-brand-dark-hover/50 px-2 py-0.5 rounded-lg transition-all text-xs shrink-0 active:scale-90"
            title={t['CarCard.decrementRaces']}
          >
            -
          </button>
          <span className="text-xs font-black text-brand-primary-light min-w-[20px] text-center selection:bg-transparent">
            {car.RacesCount || 0}
          </span>
          <button
            onClick={handleIncrementRaces}
            className="cursor-pointer font-extrabold text-slate-400 hover:text-white hover:bg-brand-dark-hover/50 px-2 py-0.5 rounded-lg transition-all text-xs shrink-0 active:scale-90"
            title={t['CarCard.incrementRaces']}
          >
            +
          </button>
        </div>
      </div>

      {/* Status Toggles: Comprado & Usado */}
      <div className="grid grid-cols-2 gap-2.5 mt-4 pt-4 border-t border-brand-dark-border">
        <button
          onClick={() => toggleOwned(car)}
          className={`cursor-pointer flex items-center justify-center gap-2 rounded-xl border py-2 px-3 text-xs transition-all duration-200 active:scale-95 shadow-sm ${
            isOwned
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 font-bold shadow-emerald-500/10 hover:bg-emerald-500/30 hover:border-emerald-400 hover:shadow-emerald-500/20 hover:scale-[1.02]'
              : 'bg-brand-dark-card/50 border-brand-dark-border text-slate-400 hover:bg-brand-dark-hover hover:text-slate-200 hover:border-brand-dark-hover hover:scale-[1.02] font-medium'
          }`}
          title={isOwned ? t['CarCard.removeOwned'] : t['CarCard.markOwned']}
        >
          <CheckCircle2
            className={`h-4 w-4 shrink-0 ${isOwned ? 'text-emerald-400 fill-emerald-500/20' : 'text-slate-500'}`}
          />
          <span className="truncate">{isOwned ? t['CarCard.owned'] : t['CarCard.notOwned']}</span>
        </button>

        <button
          onClick={() => toggleUsed(car)}
          className={`cursor-pointer flex items-center justify-center gap-2 rounded-xl border py-2 px-3 text-xs transition-all duration-200 active:scale-95 shadow-sm ${
            isUsed
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 font-bold shadow-cyan-500/10 hover:bg-cyan-500/30 hover:border-cyan-400 hover:shadow-cyan-500/20 hover:scale-[1.02]'
              : 'bg-brand-dark-card/50 border-brand-dark-border text-slate-400 hover:bg-brand-dark-hover hover:text-slate-200 hover:border-brand-dark-hover hover:scale-[1.02] font-medium'
          }`}
          title={isUsed ? t['CarCard.removeUsed'] : t['CarCard.markUsed']}
        >
          <PlayCircle
            className={`h-4 w-4 shrink-0 ${isUsed ? 'text-cyan-400 fill-cyan-500/20' : 'text-slate-500'}`}
          />
          <span className="truncate">{isUsed ? t['CarCard.used'] : t['CarCard.unused']}</span>
        </button>
      </div>
    </div>
  )
}

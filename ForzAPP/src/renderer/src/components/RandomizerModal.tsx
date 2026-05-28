import React, { useState, useMemo } from 'react'
import { X, Shuffle, Trophy, Flag, Filter, Sparkles, RotateCcw, AlertCircle } from 'lucide-react'
import { Car } from '../types'
import { CarCard } from './CarCard'
import { Language, translations } from '../translations'

interface RandomizerModalProps {
  isOpen: boolean
  onClose: () => void
  allCars: Car[]
  ownedCars: string[]
  usedCars: string[]
  repairCars: string[]
  garageList: Car[]
  carTypes: string[]
  // Initial default values from main screen filters
  defaultClass?: string
  defaultRaceType?: string
  defaultCarType?: string
  defaultOwned?: string
  defaultUsed?: string
  defaultRepair?: string
  // Action Handlers for CarCard
  toggleFavorite: (car: Car) => void
  toggleOwned: (car: Car) => void
  toggleUsed: (car: Car) => void
  toggleRepair: (car: Car) => void
  onUpdatePerformance: (car: Car, newClass: string, newPI: number, newRaceType: string) => void
  onUpdateRaces: (car: Car, count: number) => void
  onEdit: (car: Car) => void
  onDelete: (car: Car) => void
  language: Language
}

export const RandomizerModal: React.FC<RandomizerModalProps> = ({
  isOpen,
  onClose,
  allCars,
  ownedCars,
  usedCars,
  repairCars,
  garageList,
  carTypes,
  defaultClass = '',
  defaultRaceType = '',
  defaultCarType = '',
  defaultOwned = 'all',
  defaultUsed = 'all',
  defaultRepair = 'all',
  toggleFavorite,
  toggleOwned,
  toggleUsed,
  toggleRepair,
  onUpdatePerformance,
  onUpdateRaces,
  onEdit,
  onDelete,
  language
}): React.JSX.Element | null => {
  // Configured randomizer parameters
  const [selectedClass, setSelectedClass] = useState(defaultClass)
  const [selectedRaceType, setSelectedRaceType] = useState(defaultRaceType)
  const [selectedCarType, setSelectedCarType] = useState(defaultCarType)
  const [selectedOwned, setSelectedOwned] = useState(defaultOwned)
  const [selectedUsed, setSelectedUsed] = useState(defaultUsed)
  const [selectedRepair, setSelectedRepair] = useState(defaultRepair)

  // Randomized car result
  const [pickedCar, setPickedCar] = useState<Car | null>(null)
  // Spin animation state for the shuffle icon
  const [isShuffling, setIsShuffling] = useState(false)
  const t = translations[language]

  // Reset/sync state when the modal opens
  // Reset filters inside the modal
  const handleResetFilters = (): void => {
    setSelectedClass('')
    setSelectedRaceType('')
    setSelectedCarType('')
    setSelectedOwned('all')
    setSelectedUsed('all')
    setSelectedRepair('all')
  }

  // Filter cars based on chosen parameters inside the modal
  const matchingCars = useMemo(() => {
    return allCars.filter((car) => {
      const carKey = `${car.Manufacturer}-${car.Model}-${car.Year}`

      // Class match (check if car.CarClass is defined and matches)
      if (selectedClass !== '') {
        if (
          !car.CarClass ||
          car.CarClass.toUpperCase().trim() !== selectedClass.toUpperCase().trim()
        ) {
          return false
        }
      }

      // RaceType match
      if (selectedRaceType !== '') {
        if (selectedRaceType === 'Sin Asignar') {
          if (car.RaceType && car.RaceType !== '') return false
        } else {
          if (car.RaceType !== selectedRaceType) return false
        }
      }

      // CarType match
      if (selectedCarType !== '' && car.CarType !== selectedCarType) return false

      // Owned match
      const isOwned = ownedCars.includes(carKey)
      if (selectedOwned === 'owned' && !isOwned) return false
      if (selectedOwned === 'not_owned' && isOwned) return false

      // Used match
      const isUsed = usedCars.includes(carKey)
      if (selectedUsed === 'used' && !isUsed) return false
      if (selectedUsed === 'not_used' && isUsed) return false

      // Repair match
      const isRepair = repairCars.includes(carKey)
      if (selectedRepair === 'repair' && !isRepair) return false
      if (selectedRepair === 'not_repair' && isRepair) return false

      return true
    })
  }, [
    allCars,
    selectedClass,
    selectedRaceType,
    selectedCarType,
    selectedOwned,
    selectedUsed,
    selectedRepair,
    ownedCars,
    usedCars,
    repairCars
  ])

  // Pick a random car from matching set
  const handleShuffle = (): void => {
    if (matchingCars.length === 0) {
      setPickedCar(null)
      return
    }

    setIsShuffling(true)

    // Select random car
    const randomIndex = Math.floor(Math.random() * matchingCars.length)
    const newPickedCar = matchingCars[randomIndex]

    // Fast timer to show shuffle animation feel
    setTimeout(() => {
      setPickedCar(newPickedCar)
      setIsShuffling(false)
    }, 400)
  }

  // Update pickedCar in memory if its stats change externally (e.g. from the CarCard interaction)
  const currentPickedCar = useMemo(() => {
    if (!pickedCar) return null
    return (
      allCars.find(
        (c) =>
          c.Manufacturer === pickedCar.Manufacturer &&
          c.Model === pickedCar.Model &&
          c.Year === pickedCar.Year
      ) || pickedCar
    )
  }, [pickedCar, allCars])

  if (!isOpen) return null

  // Class button list helpers
  const classesList = ['D', 'C', 'B', 'A', 'S1', 'S2', 'R', 'X']

  const getClassColor = (carClass: string): string => {
    switch (carClass) {
      case 'D':
        return 'border-cyan-500/30 hover:border-cyan-500/60 active:bg-cyan-500/20 text-cyan-400'
      case 'C':
        return 'border-yellow-500/30 hover:border-yellow-500/60 active:bg-yellow-500/20 text-yellow-400'
      case 'B':
        return 'border-orange-500/30 hover:border-orange-500/60 active:bg-orange-500/20 text-orange-400'
      case 'A':
        return 'border-red-600/30 hover:border-red-600/60 active:bg-red-600/20 text-red-500'
      case 'S1':
        return 'border-purple-600/30 hover:border-purple-600/60 active:bg-purple-600/20 text-purple-400'
      case 'S2':
        return 'border-blue-600/30 hover:border-blue-600/60 active:bg-blue-600/20 text-blue-400'
      case 'X':
        return 'border-emerald-600/30 hover:border-emerald-600/60 active:bg-emerald-600/20 text-emerald-400'
      default:
        return 'border-slate-700 hover:border-slate-500 text-slate-400'
    }
  }

  const getActiveClassStyle = (carClass: string): string => {
    switch (carClass) {
      case 'D':
        return 'bg-cyan-500 text-slate-950 font-black ring-2 ring-cyan-500/40 border-cyan-500 shadow-md shadow-cyan-500/20'
      case 'C':
        return 'bg-yellow-500 text-slate-950 font-black ring-2 ring-yellow-500/40 border-yellow-500 shadow-md shadow-yellow-500/20'
      case 'B':
        return 'bg-orange-500 text-slate-950 font-black ring-2 ring-orange-500/40 border-orange-500 shadow-md shadow-orange-500/20'
      case 'A':
        return 'bg-red-600 text-white font-black ring-2 ring-red-600/40 border-red-600 shadow-md shadow-red-600/20'
      case 'S1':
        return 'bg-purple-600 text-white font-black ring-2 ring-purple-600/40 border-purple-600 shadow-md shadow-purple-600/20'
      case 'S2':
        return 'bg-blue-600 text-white font-black ring-2 ring-blue-600/40 border-blue-600 shadow-md shadow-blue-600/20'
      case 'X':
        return 'bg-emerald-600 text-white font-black ring-2 ring-emerald-600/40 border-emerald-600 shadow-md shadow-emerald-600/20'
      default:
        return 'bg-slate-700 text-white border-slate-600'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-6 overflow-y-auto my-8 max-h-[100vh] animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-brand-dark-card border border-brand-dark-border rounded-3xl p-6 md:p-8 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-dark-border">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-brand-primary animate-pulse" />
            <span>{t['Randomizer.title']}</span>
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetFilters}
              className="cursor-pointer text-slate-400 hover:text-white hover:bg-brand-dark-hover p-2 rounded-xl transition-all active:scale-95 text-xs font-semibold flex items-center gap-1.5 border border-brand-dark-border"
              title={t['Filters.clearFilters']}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t['Filters.clearFilters']}</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-brand-dark-hover/50 hover:bg-brand-dark-hover p-2 rounded-full transition-all active:scale-90 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Filter Settings */}
          <div className="space-y-6 bg-brand-dark-deep/40 border border-brand-dark-border p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">
              {t['Randomizer.preferences']}
            </h3>

            {/* Car Class Filter */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-brand-primary-light" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t['Randomizer.carClass']}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedClass('')}
                  className={`cursor-pointer rounded-xl px-3 py-2 text-xs font-bold transition-all border ${
                    selectedClass === ''
                      ? 'bg-brand-dark-hover border-brand-dark-border text-white shadow-inner'
                      : 'bg-brand-dark-deep/50 text-slate-400 border-brand-dark-border hover:border-brand-primary/40 hover:text-white'
                  }`}
                >
                  {t['Randomizer.any']}
                </button>
                {classesList.map((cls) => {
                  const isSel = selectedClass === cls
                  return (
                    <button
                      key={cls}
                      onClick={() => setSelectedClass(cls)}
                      className={`cursor-pointer rounded-xl h-8 w-10 text-xs font-black transition-all border flex items-center justify-center ${
                        isSel
                          ? getActiveClassStyle(cls)
                          : `bg-brand-dark-deep/50 ${getClassColor(cls)}`
                      }`}
                    >
                      {cls}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Race Type Filter */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flag className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t['Randomizer.raceType']}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedRaceType('')}
                  className={`cursor-pointer rounded-xl px-3.5 py-2 text-xs font-bold transition-all border ${
                    selectedRaceType === ''
                      ? 'bg-brand-dark-hover border-brand-dark-border text-white shadow-inner'
                      : 'bg-brand-dark-deep/50 text-slate-400 border-brand-dark-border hover:border-brand-primary/40 hover:text-white'
                  }`}
                >
                  {t['Randomizer.any']}
                </button>
                {['Callejera', 'Road', 'Rally', 'Off Road', 'Sin Asignar'].map((race) => {
                  const isSel = selectedRaceType === race
                  const label =
                    race === 'Callejera'
                      ? language === 'es'
                        ? 'Callejera'
                        : 'Street'
                      : race === 'Sin Asignar'
                        ? language === 'es'
                          ? 'Sin Asignar'
                          : 'Unassigned'
                        : race
                  return (
                    <button
                      key={race}
                      onClick={() => setSelectedRaceType(race)}
                      className={`cursor-pointer rounded-xl px-3.5 py-2 text-xs font-bold transition-all border ${
                        isSel
                          ? 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-600/20'
                          : 'bg-brand-dark-deep/50 text-slate-400 border-brand-dark-border hover:border-brand-primary/40 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Car Type Dropdown */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t['Randomizer.carType']}
                </span>
              </div>
              <select
                value={selectedCarType}
                onChange={(e) => setSelectedCarType(e.target.value)}
                className="w-full rounded-xl border border-brand-dark-border bg-brand-dark-input px-3 py-2.5 text-xs font-semibold text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
              >
                <option value="" className="bg-brand-dark-deep text-slate-400">
                  {t['Filters.allTypes']}
                </option>
                {carTypes.map((type) => (
                  <option key={type} value={type} className="bg-brand-dark-deep text-white">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional Status Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Ownership */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t['Randomizer.ownership']}
                </span>
                <select
                  value={selectedOwned}
                  onChange={(e) => setSelectedOwned(e.target.value)}
                  className="w-full rounded-lg border border-brand-dark-border bg-brand-dark-input px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-primary cursor-pointer"
                >
                  <option value="all">{t['Filters.all']}</option>
                  <option value="owned">{t['Filters.owned']}</option>
                  <option value="not_owned">{t['Filters.missing']}</option>
                </select>
              </div>

              {/* Usage */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t['Randomizer.usage']}
                </span>
                <select
                  value={selectedUsed}
                  onChange={(e) => setSelectedUsed(e.target.value)}
                  className="w-full rounded-lg border border-brand-dark-border bg-brand-dark-input px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-primary cursor-pointer"
                >
                  <option value="all">{t['Filters.all']}</option>
                  <option value="used">{t['Filters.used']}</option>
                  <option value="not_used">{t['Filters.unused']}</option>
                </select>
              </div>

              {/* Repair */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t['Randomizer.status']}
                </span>
                <select
                  value={selectedRepair}
                  onChange={(e) => setSelectedRepair(e.target.value)}
                  className="w-full rounded-lg border border-brand-dark-border bg-brand-dark-input px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-primary cursor-pointer"
                >
                  <option value="all">{t['Filters.all']}</option>
                  <option value="repair">{t['Filters.needsRepair']}</option>
                  <option value="not_repair">{t['Filters.healthy']}</option>
                </select>
              </div>
            </div>

            {/* Summary statistics and Primary Shuffle Action */}
            <div className="pt-4 border-t border-brand-dark-border space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
                <span>{t['Randomizer.matching']}</span>
                <span className="text-white font-bold text-sm bg-brand-dark-deep px-2.5 py-0.5 rounded-lg border border-brand-dark-border">
                  {matchingCars.length}
                </span>
              </div>

              <button
                onClick={handleShuffle}
                disabled={matchingCars.length === 0 || isShuffling}
                className={`w-full cursor-pointer py-3.5 bg-gradient-to-r from-brand-primary-hover to-brand-primary hover:from-brand-primary hover:to-brand-primary-light text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all duration-300 shadow-lg shadow-brand-primary/10 flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-95 disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-650 disabled:border-slate-800/50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none`}
              >
                <Shuffle className={`h-4.5 w-4.5 ${isShuffling ? 'animate-spin' : ''}`} />
                <span>{isShuffling ? t['Randomizer.shuffling'] : t['Randomizer.btnShuffle']}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Display Result */}
          <div className="flex flex-col items-center justify-center min-h-[380px] border border-dashed border-brand-dark-border rounded-2xl p-6 bg-brand-dark-deep/30 relative">
            {isShuffling ? (
              <div className="flex flex-col items-center justify-center space-y-3 animate-pulse">
                <Shuffle className="h-10 w-10 text-brand-primary animate-spin duration-700" />
                <p className="text-sm font-bold text-slate-400">
                  {language === 'es' ? 'Buscando en el garaje...' : 'Searching garage...'}
                </p>
              </div>
            ) : currentPickedCar ? (
              <div className="w-full max-w-sm animate-scaleUp">
                <div className="text-center mb-3">
                  <span className="text-[10px] bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-extrabold px-3 py-1 rounded-full tracking-wider uppercase inline-flex items-center gap-1 shadow-sm">
                    <Sparkles className="h-3 w-3 animate-bounce" /> {t['Randomizer.chosen']}
                  </span>
                </div>
                <CarCard
                  car={currentPickedCar}
                  isFavorite={garageList.some(
                    (item) =>
                      item.Manufacturer === currentPickedCar.Manufacturer &&
                      item.Model === currentPickedCar.Model &&
                      item.Year === currentPickedCar.Year
                  )}
                  toggleFavorite={toggleFavorite}
                  isOwned={ownedCars.includes(
                    `${currentPickedCar.Manufacturer}-${currentPickedCar.Model}-${currentPickedCar.Year}`
                  )}
                  toggleOwned={toggleOwned}
                  isUsed={usedCars.includes(
                    `${currentPickedCar.Manufacturer}-${currentPickedCar.Model}-${currentPickedCar.Year}`
                  )}
                  toggleUsed={toggleUsed}
                  needsRepair={repairCars.includes(
                    `${currentPickedCar.Manufacturer}-${currentPickedCar.Model}-${currentPickedCar.Year}`
                  )}
                  toggleRepair={toggleRepair}
                  onUpdatePerformance={onUpdatePerformance}
                  onUpdateRaces={onUpdateRaces}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  language={language}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center text-center p-6 space-y-4">
                {matchingCars.length === 0 ? (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                      <AlertCircle className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">{t['Randomizer.noMatches']}</h4>
                      <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                        {t['Randomizer.noMatchesDesc']}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary animate-pulse">
                      <Shuffle className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">{t['Randomizer.ready']}</h4>
                      <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                        {t['Randomizer.readyDesc'].replace('{count}', String(matchingCars.length))}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

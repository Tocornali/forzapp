import React, { useState, useMemo } from 'react'
import { Heart } from 'lucide-react'
import { Car } from '../types'
import { CarCard } from './CarCard'
import { Pagination } from './Pagination'
import { Language, translations } from '../translations'

interface GarageViewProps {
  garageList: Car[]
  toggleFavorite: (car: Car) => void
  ownedCars: string[]
  toggleOwned: (car: Car) => void
  usedCars: string[]
  toggleUsed: (car: Car) => void
  repairCars: string[]
  toggleRepair: (car: Car) => void
  onUpdatePerformance: (car: Car, newClass: string, newPI: number, newRaceType: string) => void
  onUpdateRaces?: (car: Car, count: number) => void
  onEdit?: (car: Car) => void
  onDelete?: (car: Car) => void
  language: Language
}

export const GarageView: React.FC<GarageViewProps> = ({
  garageList,
  toggleFavorite,
  ownedCars,
  toggleOwned,
  usedCars,
  toggleUsed,
  repairCars,
  toggleRepair,
  onUpdatePerformance,
  onUpdateRaces,
  onEdit,
  onDelete,
  language
}): React.JSX.Element => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const t = translations[language]

  const totalPages = Math.ceil(garageList.length / itemsPerPage) || 1
  const activePage = Math.max(1, Math.min(currentPage, totalPages))

  const displayedGarage = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage
    return garageList.slice(start, start + itemsPerPage)
  }, [garageList, activePage])

  if (garageList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-brand-dark-border bg-brand-dark-card/50 shadow-inner mb-4 animate-bounce">
          <Heart className="h-10 w-10 text-brand-primary" />
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">{t['Garage.empty']}</h3>
        <p className="mt-2 text-sm text-slate-400 max-w-md">{t['Garage.emptyDesc']}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-brand-dark-border pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Heart className="h-5 w-5 text-brand-primary fill-brand-primary/20" />{' '}
            {t['Garage.title']}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t['Garage.subtitle'].replace('{count}', String(garageList.length))}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedGarage.map((car) => {
          const carKey = `${car.Manufacturer}-${car.Model}-${car.Year}`
          const isOwned = ownedCars.includes(carKey)
          const isUsed = usedCars.includes(carKey)
          const isRepair = repairCars.includes(carKey)

          return (
            <CarCard
              key={carKey}
              car={car}
              isFavorite={true}
              toggleFavorite={toggleFavorite}
              isOwned={isOwned}
              toggleOwned={toggleOwned}
              isUsed={isUsed}
              toggleUsed={toggleUsed}
              needsRepair={isRepair}
              toggleRepair={toggleRepair}
              onUpdatePerformance={onUpdatePerformance}
              onUpdateRaces={onUpdateRaces}
              onEdit={onEdit}
              onDelete={onDelete}
              language={language}
            />
          )
        })}
      </div>

      <Pagination
        currentPage={activePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={garageList.length}
        itemsPerPage={itemsPerPage}
      />
    </div>
  )
}

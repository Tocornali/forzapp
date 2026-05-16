import React from 'react';
import { Heart } from 'lucide-react';
import { Car } from '../types';
import { CarCard } from './CarCard';

interface GarageViewProps {
  garageList: Car[];
  toggleFavorite: (car: Car) => void;
  ownedCars: string[];
  toggleOwned: (car: Car) => void;
  usedCars: string[];
  toggleUsed: (car: Car) => void;
  onUpdatePerformance: (car: Car, newClass: string, newPI: number, newRaceType: string) => void;
}

export const GarageView: React.FC<GarageViewProps> = ({
  garageList,
  toggleFavorite,
  ownedCars,
  toggleOwned,
  usedCars,
  toggleUsed,
  onUpdatePerformance
}) => {
  if (garageList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/50 shadow-inner mb-4 animate-bounce">
          <Heart className="h-10 w-10 text-rose-500" />
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">Tu Garaje está vacío</h3>
        <p className="mt-2 text-sm text-slate-400 max-w-md">
          Explora el catálogo de Forza Horizon y haz clic en el ícono de corazón de tus autos favoritos para guardarlos en tu garaje personalizado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500 fill-rose-500" /> Mi Garaje Personal
          </h2>
          <p className="text-xs text-slate-400 mt-1">Tienes {garageList.length} vehículo(s) guardado(s) en tu colección</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {garageList.map((car) => {
          const carKey = `${car.Manufacturer}-${car.Model}-${car.Year}`;
          const isOwned = ownedCars.includes(carKey);
          const isUsed = usedCars.includes(carKey);

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
              onUpdatePerformance={onUpdatePerformance}
            />
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Heart, CheckCircle2, PlayCircle, Car as CarIcon, Trophy, Edit2, Check, X, Flag } from 'lucide-react';
import { Car } from '../types';

interface CarCardProps {
  car: Car;
  isFavorite: boolean;
  toggleFavorite: (car: Car) => void;
  isOwned: boolean;
  toggleOwned: (car: Car) => void;
  isUsed: boolean;
  toggleUsed: (car: Car) => void;
  onUpdatePerformance: (car: Car, newClass: string, newPI: number, newRaceType: string) => void;
}

const getClassBadge = (carClass: string) => {
  switch (carClass) {
    case 'D': return { bg: 'bg-cyan-500 text-slate-950', glow: 'shadow-cyan-500/20' };
    case 'C': return { bg: 'bg-yellow-500 text-slate-950', glow: 'shadow-yellow-500/20' };
    case 'B': return { bg: 'bg-orange-500 text-slate-950', glow: 'shadow-orange-500/20' };
    case 'A': return { bg: 'bg-red-600 text-white', glow: 'shadow-red-600/20' };
    case 'S1': return { bg: 'bg-purple-600 text-white', glow: 'shadow-purple-600/20' };
    case 'S2': return { bg: 'bg-blue-600 text-white', glow: 'shadow-blue-600/20' };
    case 'X': return { bg: 'bg-emerald-600 text-white', glow: 'shadow-emerald-600/20' };
    default: return { bg: 'bg-slate-600 text-white', glow: 'shadow-slate-600/20' };
  }
};

const getRaceTypeBadge = (type?: string) => {
  switch (type) {
    case 'Road': return { bg: 'bg-sky-500/20 text-sky-400 border-sky-500/30', label: 'Road' };
    case 'Callejera': return { bg: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Callejera' };
    case 'Rally': return { bg: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Rally' };
    case 'Off Road': return { bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Off Road' };
    default: return { bg: 'bg-slate-800/40 text-slate-500 border-slate-700/50', label: 'Sin Carrera Asignada' };
  }
};

// Cálculo oficial de Clase en función del Índice de Rendimiento (PI) de Forza Horizon
const getCalculatedClass = (pi: number): string => {
  if (pi >= 999) return 'X';
  if (pi >= 901) return 'S2';
  if (pi >= 801) return 'S1';
  if (pi >= 701) return 'A';
  if (pi >= 601) return 'B';
  if (pi >= 501) return 'C';
  return 'D';
};

export const CarCard: React.FC<CarCardProps> = ({
  car,
  isFavorite,
  toggleFavorite,
  isOwned,
  toggleOwned,
  isUsed,
  toggleUsed,
  onUpdatePerformance
}) => {
  const classStyle = getClassBadge(car.CarClass);
  const raceBadge = getRaceTypeBadge(car.RaceType);

  // Inline editing state for PI & RaceType
  const [isEditingPerf, setIsEditingPerf] = useState(false);
  const [editPI, setEditPI] = useState<number>(car.PI || 500);
  const [editRaceType, setEditRaceType] = useState<string>(car.RaceType || '');

  // Sincronizar el estado de edición si cambian las props externas
  useEffect(() => {
    setEditPI(car.PI || 500);
    setEditRaceType(car.RaceType || '');
  }, [car.PI, car.RaceType]);

  // Clase calculada en tiempo real mientras el usuario escribe
  const currentEditClass = getCalculatedClass(editPI);
  const editClassBadgeStyle = getClassBadge(currentEditClass);

  const handleSavePerf = () => {
    onUpdatePerformance(car, currentEditClass, Number(editPI), editRaceType);
    setIsEditingPerf(false);
  };

  const handleCancelPerf = () => {
    setEditPI(car.PI || 500);
    setEditRaceType(car.RaceType || '');
    setIsEditingPerf(false);
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl hover:shadow-rose-500/5">
      {/* Header Area */}
      <div className="flex items-start justify-between gap-2 pr-10">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
            {car.Manufacturer}
          </h3>
          <h2 className="text-lg font-extrabold text-white tracking-tight line-clamp-1 group-hover:text-rose-400 transition-colors mt-0.5">
            {car.Model} <span className="text-sm font-normal text-slate-400">({car.Year})</span>
          </h2>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-400">
            <CarIcon className="h-3.5 w-3.5 text-rose-500 shrink-0" />
            <span className="truncate">{car.CarType || 'General'}</span>
          </div>
        </div>
      </div>

      {/* Absolute top right favorite button */}
      <button
        onClick={() => toggleFavorite(car)}
        className={`absolute top-4 right-4 cursor-pointer active:scale-95 hover:scale-[1.05] flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 shrink-0 ${
          isFavorite
            ? 'border-rose-500 bg-rose-500/20 text-rose-500 shadow-sm shadow-rose-500/20 hover:bg-rose-500/30'
            : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-white hover:bg-slate-800'
        }`}
        title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      >
        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      {/* Interactive Performance & Race Type Block */}
      <div className="mt-4 pt-3 border-t border-slate-800/60">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
          Configuración & Rendimiento
        </span>

        {isEditingPerf ? (
          <div className="flex flex-col gap-2 bg-slate-950 p-2.5 rounded-xl border border-rose-500/50 shadow-inner animate-fadeIn">
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center h-7 w-8 rounded-lg ${editClassBadgeStyle.bg} font-black text-xs shadow-md ${editClassBadgeStyle.glow} transition-colors duration-300`}>
                {currentEditClass}
              </div>

              <input
                type="number"
                value={editPI}
                onChange={(e) => setEditPI(Number(e.target.value))}
                className="bg-slate-900 text-white text-xs font-bold rounded-lg px-2 py-1 w-16 border border-slate-700 focus:outline-none focus:border-rose-500 text-center"
                min="100"
                max="999"
                placeholder="PI"
                autoFocus
              />

              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={handleSavePerf}
                  className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-sm active:scale-95"
                  title="Guardar"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCancelPerf}
                  className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all border border-slate-700 active:scale-95"
                  title="Cancelar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
              <Flag className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <select
                value={editRaceType}
                onChange={(e) => setEditRaceType(e.target.value)}
                className="w-full bg-slate-900 text-white text-xs font-medium rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="">Sin Carrera Asignada</option>
                <option value="Callejera">Callejera</option>
                <option value="Road">Road</option>
                <option value="Rally">Rally</option>
                <option value="Off Road">Off Road</option>
              </select>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingPerf(true)}
            className="group/perf cursor-pointer flex items-center justify-between bg-slate-950/60 hover:bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all shadow-sm"
            title="Haz clic para editar el índice de rendimiento y tipo de carrera"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 ${classStyle.bg} font-black text-xs shadow-md ${classStyle.glow} transition-colors duration-300`}>
                <Trophy className="h-3.5 w-3.5 shrink-0" />
                <span>{car.CarClass || 'N/A'} {car.PI || 0}</span>
              </div>

              <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 border text-xs font-bold ${raceBadge.bg}`}>
                <Flag className="h-3 w-3 shrink-0" />
                <span>{raceBadge.label}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-500 group-hover/perf:text-amber-400 transition-colors text-xs font-semibold px-1 shrink-0 ml-2">
              <Edit2 className="h-3.5 w-3.5" />
            </div>
          </div>
        )}
      </div>

      {/* Status Toggles: Comprado & Usado */}
      <div className="grid grid-cols-2 gap-2.5 mt-4 pt-4 border-t border-slate-800/80">
        <button
          onClick={() => toggleOwned(car)}
          className={`cursor-pointer flex items-center justify-center gap-2 rounded-xl border py-2 px-3 text-xs transition-all duration-200 active:scale-95 shadow-sm ${
            isOwned
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 font-bold shadow-emerald-500/10 hover:bg-emerald-500/30 hover:border-emerald-400 hover:shadow-emerald-500/20 hover:scale-[1.02]'
              : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 hover:border-slate-600 hover:scale-[1.02] font-medium'
          }`}
          title={isOwned ? 'Marcar como No Comprado' : 'Marcar como Comprado'}
        >
          <CheckCircle2 className={`h-4 w-4 shrink-0 ${isOwned ? 'text-emerald-400 fill-emerald-500/20' : 'text-slate-500'}`} />
          <span className="truncate">{isOwned ? 'Comprado' : 'Sin Comprar'}</span>
        </button>

        <button
          onClick={() => toggleUsed(car)}
          className={`cursor-pointer flex items-center justify-center gap-2 rounded-xl border py-2 px-3 text-xs transition-all duration-200 active:scale-95 shadow-sm ${
            isUsed
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 font-bold shadow-cyan-500/10 hover:bg-cyan-500/30 hover:border-cyan-400 hover:shadow-cyan-500/20 hover:scale-[1.02]'
              : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 hover:border-slate-600 hover:scale-[1.02] font-medium'
          }`}
          title={isUsed ? 'Marcar como No Usado' : 'Marcar como Usado'}
        >
          <PlayCircle className={`h-4 w-4 shrink-0 ${isUsed ? 'text-cyan-400 fill-cyan-500/20' : 'text-slate-500'}`} />
          <span className="truncate">{isUsed ? 'Usado' : 'Sin Usar'}</span>
        </button>
      </div>
    </div>
  );
};

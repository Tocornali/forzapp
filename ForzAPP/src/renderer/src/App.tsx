import React, { useState, useEffect, useMemo } from 'react';
import forzaDataRaw from './assets/ForzaAPIJSON.json';
import { Car } from './types';
import { Navbar } from './components/Navbar';
import { Filters } from './components/Filters';
import { CarCard } from './components/CarCard';
import { GarageView } from './components/GarageView';
import { Car as CarIcon, AlertCircle } from 'lucide-react';

export default function App(): React.JSX.Element {
  // Mapeo inicial desde el JSON estático
  const initialCars: Car[] = useMemo(() => {
    return (forzaDataRaw as any[]).map((item) => ({
      Manufacturer: item.Manufacturer || 'Desconocido',
      Model: item.Model || 'Sin Modelo',
      Year: item.Year || 0,
      CarType: item.CarType || 'General',
      CarClass: item.CarClass || '',
      PI: item.PI || 0,
      RaceType: item.RaceType || ''
    }));
  }, []);

  // Estado de Rendimiento Personalizado guardado en localStorage
  const [customPerformance, setCustomPerformance] = useState<Record<string, { CarClass: string; PI: number; RaceType?: string }>>(() => {
    try {
      const saved = localStorage.getItem('forza_custom_perf');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Estado principal de la lista de vehículos
  const [allCars, setAllCars] = useState<Car[]>(() => {
    // Aplicar las modificaciones de rendimiento guardadas en localStorage al iniciar
    return initialCars.map((car) => {
      const carKey = `${car.Manufacturer}-${car.Model}-${car.Year}`;
      if (customPerformance[carKey]) {
        return {
          ...car,
          CarClass: customPerformance[carKey].CarClass,
          PI: customPerformance[carKey].PI,
          RaceType: customPerformance[carKey].RaceType !== undefined ? customPerformance[carKey].RaceType : car.RaceType
        };
      }
      return car;
    });
  });

  // Guardar rendimiento personalizado en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('forza_custom_perf', JSON.stringify(customPerformance));
    } catch (e) {
      console.error('Failed saving custom performance to localStorage', e);
    }
  }, [customPerformance]);

  // Función para actualizar y persistir el rendimiento de un vehículo
  const handleUpdatePerformance = async (car: Car, newClass: string, newPI: number, newRaceType: string) => {
    const carKey = `${car.Manufacturer}-${car.Model}-${car.Year}`;

    // 1. Guardar en localStorage
    const updatedCustom = {
      ...customPerformance,
      [carKey]: { CarClass: newClass, PI: newPI, RaceType: newRaceType }
    };
    setCustomPerformance(updatedCustom);

    // 2. Actualizar estado actual en memoria
    const updatedAllCars = allCars.map((item) => {
      if (`${item.Manufacturer}-${item.Model}-${item.Year}` === carKey) {
        return { ...item, CarClass: newClass, PI: newPI, RaceType: newRaceType };
      }
      return item;
    });
    setAllCars(updatedAllCars);

    // 3. Actualizar también la lista del garaje si el auto está ahí
    setGarageList((prev) =>
      prev.map((item) => {
        if (`${item.Manufacturer}-${item.Model}-${item.Year}` === carKey) {
          return { ...item, CarClass: newClass, PI: newPI, RaceType: newRaceType };
        }
        return item;
      })
    );

    // 4. Intentar guardar en el archivo JSON físico del disco mediante IPC
    if (window.electron && window.electron.ipcRenderer) {
      try {
        await window.electron.ipcRenderer.invoke('save-forza-data', updatedAllCars);
      } catch (err) {
        console.error('Error al intentar guardar en el archivo JSON físico', err);
      }
    }
  };

  // Función para recargar los datos desde el archivo externo en disco
  const handleReloadJson = async () => {
    try {
      if (window.electron && window.electron.ipcRenderer) {
        const diskData = await window.electron.ipcRenderer.invoke('get-forza-data');
        if (diskData && Array.isArray(diskData) && diskData.length > 0) {
          const mapped = diskData.map((item) => {
            const carKey = `${item.Manufacturer || 'Desconocido'}-${item.Model || 'Sin Modelo'}-${item.Year || 0}`;
            // Priorizar siempre las modificaciones locales si existen
            const cClass = customPerformance[carKey] ? customPerformance[carKey].CarClass : item.CarClass || '';
            const cPI = customPerformance[carKey] ? customPerformance[carKey].PI : item.PI || 0;
            const cRace = customPerformance[carKey] && customPerformance[carKey].RaceType !== undefined ? customPerformance[carKey].RaceType : item.RaceType || '';

            return {
              Manufacturer: item.Manufacturer || 'Desconocido',
              Model: item.Model || 'Sin Modelo',
              Year: item.Year || 0,
              CarType: item.CarType || 'General',
              CarClass: cClass,
              PI: cPI,
              RaceType: cRace
            };
          });
          setAllCars(mapped);
          alert(`¡JSON recargado exitosamente desde el disco! (${mapped.length} vehículos cargados)`);
        } else {
          alert('No se pudo encontrar o leer el archivo externo ForzaAPIJSON.json en la raíz del proyecto.');
        }
      } else {
        alert('La recarga desde disco solo está disponible en el entorno nativo de Electron.');
      }
    } catch (e) {
      console.error('Error al recargar JSON', e);
      alert('Hubo un error al intentar recargar el archivo JSON externo.');
    }
  };

  // Cargar automáticamente desde el disco al iniciar la aplicación si está disponible
  useEffect(() => {
    const fetchDisk = async () => {
      try {
        if (window.electron && window.electron.ipcRenderer) {
          const diskData = await window.electron.ipcRenderer.invoke('get-forza-data');
          if (diskData && Array.isArray(diskData) && diskData.length > 0) {
            const mapped = diskData.map((item) => {
              const carKey = `${item.Manufacturer || 'Desconocido'}-${item.Model || 'Sin Modelo'}-${item.Year || 0}`;
              const cClass = customPerformance[carKey] ? customPerformance[carKey].CarClass : item.CarClass || '';
              const cPI = customPerformance[carKey] ? customPerformance[carKey].PI : item.PI || 0;
              const cRace = customPerformance[carKey] && customPerformance[carKey].RaceType !== undefined ? customPerformance[carKey].RaceType : item.RaceType || '';

              return {
                Manufacturer: item.Manufacturer || 'Desconocido',
                Model: item.Model || 'Sin Modelo',
                Year: item.Year || 0,
                CarType: item.CarType || 'General',
                CarClass: cClass,
                PI: cPI,
                RaceType: cRace
              };
            });
            setAllCars(mapped);
          }
        }
      } catch (e) {
        console.error('Failed auto-fetching disk JSON on mount', e);
      }
    };
    fetchDisk();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Tabs: explore, garage
  const [activeTab, setActiveTab] = useState<'explore' | 'garage'>('explore');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCarType, setSelectedCarType] = useState('');
  const [selectedRaceType, setSelectedRaceType] = useState('');
  const [sortBy, setSortBy] = useState('manuf-asc');

  // Ownership & Usage filter states
  const [filterOwned, setFilterOwned] = useState('all'); // 'all' | 'owned' | 'not_owned'
  const [filterUsed, setFilterUsed] = useState('all');   // 'all' | 'used' | 'not_used'

  // Garage (Favorites) stored in localStorage
  const [garageList, setGarageList] = useState<Car[]>(() => {
    try {
      const saved = localStorage.getItem('forza_garage');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Owned Cars stored in localStorage (array of "Manufacturer-Model-Year" keys)
  const [ownedCars, setOwnedCars] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('forza_owned');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Used Cars stored in localStorage (array of "Manufacturer-Model-Year" keys)
  const [usedCars, setUsedCars] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('forza_used');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save states to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('forza_garage', JSON.stringify(garageList));
    } catch (e) {
      console.error('Failed to save garage to localStorage', e);
    }
  }, [garageList]);

  useEffect(() => {
    try {
      localStorage.setItem('forza_owned', JSON.stringify(ownedCars));
    } catch (e) {
      console.error('Failed to save ownedCars to localStorage', e);
    }
  }, [ownedCars]);

  useEffect(() => {
    try {
      localStorage.setItem('forza_used', JSON.stringify(usedCars));
    } catch (e) {
      console.error('Failed to save usedCars to localStorage', e);
    }
  }, [usedCars]);

  // Extract unique car types for filter dropdown
  const carTypesList = useMemo(() => {
    const types = new Set<string>();
    allCars.forEach((car) => {
      if (car.CarType) types.add(car.CarType);
    });
    return Array.from(types).sort();
  }, [allCars]);

  // Toggle Favorite
  const toggleFavorite = (car: Car) => {
    setGarageList((prev) => {
      const exists = prev.some(
        (item) => item.Manufacturer === car.Manufacturer && item.Model === car.Model && item.Year === car.Year
      );
      if (exists) {
        return prev.filter(
          (item) => !(item.Manufacturer === car.Manufacturer && item.Model === car.Model && item.Year === car.Year)
        );
      } else {
        return [...prev, car];
      }
    });
  };

  // Toggle Owned
  const toggleOwned = (car: Car) => {
    const carKey = `${car.Manufacturer}-${car.Model}-${car.Year}`;
    setOwnedCars((prev) => {
      if (prev.includes(carKey)) {
        return prev.filter((k) => k !== carKey);
      } else {
        return [...prev, carKey];
      }
    });
  };

  // Toggle Used
  const toggleUsed = (car: Car) => {
    const carKey = `${car.Manufacturer}-${car.Model}-${car.Year}`;
    setUsedCars((prev) => {
      if (prev.includes(carKey)) {
        return prev.filter((k) => k !== carKey);
      } else {
        return [...prev, carKey];
      }
    });
  };

  // Reset Filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCarType('');
    setSelectedRaceType('');
    setSortBy('manuf-asc');
    setFilterOwned('all');
    setFilterUsed('all');
  };

  // Filtered & Sorted Cars for Explore View
  const filteredCars = useMemo(() => {
    return allCars.filter((car) => {
      const carKey = `${car.Manufacturer}-${car.Model}-${car.Year}`;

      // Search query match (Manufacturer, Model)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const manuf = car.Manufacturer ? String(car.Manufacturer).toLowerCase() : '';
        const model = car.Model ? String(car.Model).toLowerCase() : '';
        if (!manuf.includes(query) && !model.includes(query)) return false;
      }

      // CarType match
      if (selectedCarType !== '' && car.CarType !== selectedCarType) return false;

      // RaceType match
      if (selectedRaceType !== '') {
        if (selectedRaceType === 'Sin Asignar') {
          if (car.RaceType && car.RaceType !== '') return false;
        } else {
          if (car.RaceType !== selectedRaceType) return false;
        }
      }

      // Owned match
      if (filterOwned === 'owned' && !ownedCars.includes(carKey)) return false;
      if (filterOwned === 'not_owned' && ownedCars.includes(carKey)) return false;

      // Used match
      if (filterUsed === 'used' && !usedCars.includes(carKey)) return false;
      if (filterUsed === 'not_used' && usedCars.includes(carKey)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'year-desc') return (b.Year || 0) - (a.Year || 0);
      if (sortBy === 'year-asc') return (a.Year || 0) - (b.Year || 0);
      if (sortBy === 'manuf-asc') return String(a.Manufacturer || '').localeCompare(String(b.Manufacturer || ''));
      if (sortBy === 'manuf-desc') return String(b.Manufacturer || '').localeCompare(String(a.Manufacturer || ''));
      return 0;
    });
  }, [allCars, searchQuery, selectedCarType, selectedRaceType, sortBy, filterOwned, filterUsed, ownedCars, usedCars]);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f1f5f9] flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalCars={allCars.length}
        garageCount={garageList.length}
        onReloadJson={handleReloadJson}
      />

      {/* Filters Bar (Only visible in Explore tab) */}
      {activeTab === 'explore' && (
        <Filters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCarType={selectedCarType}
          setSelectedCarType={setSelectedCarType}
          selectedRaceType={selectedRaceType}
          setSelectedRaceType={setSelectedRaceType}
          sortBy={sortBy}
          setSortBy={setSortBy}
          carTypes={carTypesList}
          resetFilters={resetFilters}
          filterOwned={filterOwned}
          setFilterOwned={setFilterOwned}
          filterUsed={filterUsed}
          setFilterUsed={setFilterUsed}
        />
      )}

      {/* Main Content Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'explore' && (
          <div>
            {/* Results count & Quick summary */}
            <div className="flex items-center justify-between mb-6 border-b border-slate-800/60 pb-3">
              <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <CarIcon className="h-5 w-5 text-rose-500" /> Catálogo de Vehículos
              </h2>
              <span className="text-xs font-semibold text-slate-400">
                Mostrando <strong className="text-white">{filteredCars.length}</strong> de {allCars.length} vehículos
              </span>
            </div>

            {filteredCars.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 mb-4">
                  <AlertCircle className="h-8 w-8 text-rose-500" />
                </div>
                <h3 className="text-base font-bold text-white">No se encontraron vehículos</h3>
                <p className="mt-1 text-sm text-slate-400 max-w-sm">
                  No hay autos que coincidan con los filtros seleccionados. Intenta cambiar tu búsqueda o limpiar los filtros.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-6 rounded-xl bg-slate-800 border border-slate-700 px-5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm"
                >
                  Limpiar todos los filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCars.map((car) => {
                  const carKey = `${car.Manufacturer}-${car.Model}-${car.Year}`;
                  const isFav = garageList.some(
                    (item) => item.Manufacturer === car.Manufacturer && item.Model === car.Model && item.Year === car.Year
                  );
                  const isOwned = ownedCars.includes(carKey);
                  const isUsed = usedCars.includes(carKey);

                  return (
                    <CarCard
                      key={carKey}
                      car={car}
                      isFavorite={isFav}
                      toggleFavorite={toggleFavorite}
                      isOwned={isOwned}
                      toggleOwned={toggleOwned}
                      isUsed={isUsed}
                      toggleUsed={toggleUsed}
                      onUpdatePerformance={handleUpdatePerformance}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'garage' && (
          <GarageView
            garageList={garageList}
            toggleFavorite={toggleFavorite}
            ownedCars={ownedCars}
            toggleOwned={toggleOwned}
            usedCars={usedCars}
            toggleUsed={toggleUsed}
            onUpdatePerformance={handleUpdatePerformance}
          />
        )}
      </main>
    </div>
  );
}

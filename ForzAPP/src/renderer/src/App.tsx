import React, { useState, useEffect, useMemo } from 'react'
import forzaDataRaw from './assets/FH6Cars.json'
import { Car } from './types'
import { Navbar } from './components/Navbar'
import { Filters } from './components/Filters'
import { CarCard } from './components/CarCard'
import { GarageView } from './components/GarageView'
import { CarModal } from './components/CarModal'
import { Pagination } from './components/Pagination'
import { RandomizerModal } from './components/RandomizerModal'
import { Car as CarIcon, AlertCircle } from 'lucide-react'
import { Language, translations } from './translations'
import { ConfirmationModal } from './components/ConfirmationModal'
import { TitleBar } from './components/TitleBar'

// Helper to map FH6RawItem to Car structure
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRawToCar(item: any): Car {
  if (item.Manufacturer && item.Model) {
    return {
      Manufacturer: item.Manufacturer,
      Model: item.Model,
      Year: Number(item.Year) || 0,
      CarType: item.CarType || 'General',
      CarClass: item.CarClass || '',
      PI: Number(item.PI) || 0,
      RaceType: item.RaceType || '',
      NeedsRepair: !!item.NeedsRepair,
      RacesCount: Number(item.RacesCount) || 0,
      originalRaw: item
    }
  }

  const brand = item.Brand || 'Desconocido'

  // Parse point2580/4160: e.g. "1968 595 Esseesse"
  const pointField = item['point2580/4160'] || ''
  const match = pointField.trim().match(/^(\d{4})\s+(.*)$/)
  const year = match ? parseInt(match[1], 10) : 0
  const model = match ? match[2].trim() : pointField.trim() || 'Sin Modelo'

  // Parse Class: e.g. "D 100"
  const classField = item.Class || ''
  const classParts = classField.trim().split(/\s+/)
  let carClass = ''
  let pi = 0
  if (classParts.length >= 2) {
    carClass = classParts[0]
    const parsedPi = parseInt(classParts[1], 10)
    pi = isNaN(parsedPi) ? 0 : parsedPi
  } else if (classParts.length === 1 && classParts[0]) {
    const parsedPi = parseInt(classParts[0], 10)
    if (!isNaN(parsedPi)) {
      pi = parsedPi
    } else {
      carClass = classParts[0]
    }
  }

  const carType = item.source || 'General'

  return {
    Manufacturer: brand,
    Model: model,
    Year: year,
    CarType: carType,
    CarClass: carClass,
    PI: pi,
    RaceType: item.RaceType || '',
    NeedsRepair: !!item.NeedsRepair,
    RacesCount: Number(item.RacesCount) || 0,
    originalRaw: item
  }
}

// Helper to map Car back to FH6RawItem format, preserving original fields
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCarToRaw(car: Car, ownedCarsSet: Set<string>): any {
  const original = car.originalRaw || {}
  const carKey = `${car.Manufacturer}-${car.Model}-${car.Year}`
  const isOwned = ownedCarsSet.has(carKey)

  if (original.Manufacturer) {
    return {
      ...original,
      CarClass: car.CarClass,
      PI: car.PI,
      RaceType: car.RaceType,
      NeedsRepair: car.NeedsRepair,
      RacesCount: car.RacesCount || 0
    }
  }

  return {
    ...original,
    Brand: car.Manufacturer,
    'point2580/4160': `${car.Year} ${car.Model}`,
    Class: `${car.CarClass} ${car.PI}`,
    source: car.CarType !== 'General' ? car.CarType : original.source || 'autoshow, wheel',
    'Is own?': isOwned ? 'TRUE' : 'FALSE',
    NeedsRepair: car.NeedsRepair,
    RaceType: car.RaceType,
    RacesCount: car.RacesCount || 0
  }
}

const CLASS_ORDER: Record<string, number> = {
  D: 1,
  C: 2,
  B: 3,
  A: 4,
  S1: 5,
  S2: 6,
  R: 7,
  X: 8
}

function getCarClassRank(carClass: string): number {
  if (!carClass) return 0
  return CLASS_ORDER[carClass.toUpperCase().trim()] || 0
}

export default function App(): React.JSX.Element {
  // Language state
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('forza_lang')
    return saved === 'en' || saved === 'es' ? saved : 'es'
  })

  const toggleLanguage = (): void => {
    const nextLang: Language = language === 'es' ? 'en' : 'es'
    setLanguage(nextLang)
    localStorage.setItem('forza_lang', nextLang)
  }

  const t = translations[language]

  // Mapeo inicial desde el JSON estático
  const initialCars: Car[] = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (forzaDataRaw as any[]).map((item) => mapRawToCar(item))
  }, [])

  // Modal states for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | undefined>(undefined)

  // Estado de Rendimiento Personalizado guardado en localStorage
  const [customPerformance, setCustomPerformance] = useState<
    Record<string, { CarClass: string; PI: number; RaceType?: string }>
  >(() => {
    try {
      const saved = localStorage.getItem('forza_custom_perf')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // Estado de Carreras Personalizado guardado en localStorage
  const [racesCount, setRacesCount] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('forza_races_count')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // Estado principal de la lista de vehículos
  const [allCars, setAllCars] = useState<Car[]>(() => {
    // Aplicar las modificaciones de rendimiento y carreras guardadas en localStorage al iniciar
    return initialCars.map((car) => {
      const carKey = `${car.Manufacturer}-${car.Model}-${car.Year}`
      const updatedCar = { ...car }
      if (customPerformance[carKey]) {
        updatedCar.CarClass = customPerformance[carKey].CarClass
        updatedCar.PI = customPerformance[carKey].PI
        if (customPerformance[carKey].RaceType !== undefined) {
          updatedCar.RaceType = customPerformance[carKey].RaceType
        }
      }
      if (racesCount[carKey] !== undefined) {
        updatedCar.RacesCount = racesCount[carKey]
      }
      return updatedCar
    })
  })

  // Tabs: explore, garage
  const [activeTab, setActiveTab] = useState<'explore' | 'garage'>('explore')

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCarType, setSelectedCarType] = useState('')
  const [selectedRaceType, setSelectedRaceType] = useState('')
  const [sortBy, setSortBy] = useState('manuf-asc')

  // Ownership & Usage filter states
  const [filterOwned, setFilterOwned] = useState('all') // 'all' | 'owned' | 'not_owned'
  const [filterUsed, setFilterUsed] = useState('all') // 'all' | 'used' | 'not_used'
  const [filterRepair, setFilterRepair] = useState('all') // 'all' | 'repair' | 'not_repair'

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Garage (Favorites) stored in localStorage
  const [garageList, setGarageList] = useState<Car[]>(() => {
    try {
      const saved = localStorage.getItem('forza_garage')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Owned Cars stored in localStorage (array of "Manufacturer-Model-Year" keys)
  const [ownedCars, setOwnedCars] = useState<string[]>(() => {
    let savedList: string[] = []
    try {
      const saved = localStorage.getItem('forza_owned')
      if (saved) {
        savedList = JSON.parse(saved)
      }
    } catch (e) {
      console.warn('Failed to parse owned cars', e)
    }

    const initialOwned: string[] = [...savedList]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(forzaDataRaw as unknown[]).forEach((item: any) => {
      if (item['Is own?'] === 'TRUE') {
        const mapped = mapRawToCar(item)
        const carKey = `${mapped.Manufacturer}-${mapped.Model}-${mapped.Year}`
        if (!initialOwned.includes(carKey)) {
          initialOwned.push(carKey)
        }
      }
    })
    return initialOwned
  })

  // Used Cars stored in localStorage (array of "Manufacturer-Model-Year" keys)
  const [usedCars, setUsedCars] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('forza_used')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Repair Cars stored in localStorage (array of "Manufacturer-Model-Year" keys)
  const [repairCars, setRepairCars] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('forza_repair')
      if (saved) {
        return JSON.parse(saved)
      }
      return initialCars
        .filter((c) => c.NeedsRepair)
        .map((c) => `${c.Manufacturer}-${c.Model}-${c.Year}`)
    } catch {
      return []
    }
  })

  // Randomizer Modal State
  const [isRandomizerModalOpen, setIsRandomizerModalOpen] = useState(false)

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })

  // Guardar rendimiento personalizado en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('forza_custom_perf', JSON.stringify(customPerformance))
    } catch (e) {
      console.error('Failed saving custom performance to localStorage', e)
    }
  }, [customPerformance])

  // Guardar carreras personalizadas en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('forza_races_count', JSON.stringify(racesCount))
    } catch (e) {
      console.error('Failed saving races count to localStorage', e)
    }
  }, [racesCount])

  // Función para actualizar y persistir el rendimiento de un vehículo
  const handleUpdatePerformance = async (
    car: Car,
    newClass: string,
    newPI: number,
    newRaceType: string
  ): Promise<void> => {
    const carKey = `${car.Manufacturer}-${car.Model}-${car.Year}`

    // 1. Guardar en localStorage
    const updatedCustom = {
      ...customPerformance,
      [carKey]: { CarClass: newClass, PI: newPI, RaceType: newRaceType }
    }
    setCustomPerformance(updatedCustom)

    // 2. Actualizar estado actual en memoria
    const updatedAllCars = allCars.map((item) => {
      if (`${item.Manufacturer}-${item.Model}-${item.Year}` === carKey) {
        return { ...item, CarClass: newClass, PI: newPI, RaceType: newRaceType }
      }
      return item
    })
    setAllCars(updatedAllCars)

    // 3. Actualizar también la lista del garaje si el auto está ahí
    setGarageList((prev) =>
      prev.map((item) => {
        if (`${item.Manufacturer}-${item.Model}-${item.Year}` === carKey) {
          return { ...item, CarClass: newClass, PI: newPI, RaceType: newRaceType }
        }
        return item
      })
    )

    // 4. Intentar guardar en el archivo JSON físico del disco mediante IPC
    if (window.electron && window.electron.ipcRenderer) {
      try {
        const ownedSet = new Set(ownedCars)
        const mappedData = updatedAllCars.map((c) => mapCarToRaw(c, ownedSet))
        await window.electron.ipcRenderer.invoke('save-forza-data', mappedData)
      } catch (err) {
        console.error('Error al intentar guardar en el archivo JSON físico', err)
      }
    }
  }

  // Función para actualizar y persistir el contador de carreras de un vehículo
  const handleUpdateRaces = async (car: Car, count: number): Promise<void> => {
    const carKey = `${car.Manufacturer}-${car.Model}-${car.Year}`

    // 1. Guardar en localStorage
    const updatedRaces = {
      ...racesCount,
      [carKey]: count
    }
    setRacesCount(updatedRaces)

    // 2. Actualizar estado actual en memoria
    const updatedAllCars = allCars.map((item) => {
      if (`${item.Manufacturer}-${item.Model}-${item.Year}` === carKey) {
        return { ...item, RacesCount: count }
      }
      return item
    })
    setAllCars(updatedAllCars)

    // 3. Actualizar también la lista del garaje si el auto está ahí
    setGarageList((prev) =>
      prev.map((item) => {
        if (`${item.Manufacturer}-${item.Model}-${item.Year}` === carKey) {
          return { ...item, RacesCount: count }
        }
        return item
      })
    )

    // 4. Intentar guardar en el archivo JSON físico del disco mediante IPC
    if (window.electron && window.electron.ipcRenderer) {
      try {
        const ownedSet = new Set(ownedCars)
        const mappedData = updatedAllCars.map((c) => mapCarToRaw(c, ownedSet))
        await window.electron.ipcRenderer.invoke('save-forza-data', mappedData)
      } catch (err) {
        console.error('Error al intentar guardar en el archivo JSON físico', err)
      }
    }
  }

  // Cargar automáticamente desde el disco al iniciar la aplicación si está disponible
  useEffect(() => {
    const fetchDisk = async (): Promise<void> => {
      try {
        if (window.electron && window.electron.ipcRenderer) {
          const diskData = await window.electron.ipcRenderer.invoke('get-forza-data')
          if (diskData && Array.isArray(diskData) && diskData.length > 0) {
            const mapped = diskData.map((item) => {
              const parsedCar = mapRawToCar(item)
              const carKey = `${parsedCar.Manufacturer}-${parsedCar.Model}-${parsedCar.Year}`
              const cClass = customPerformance[carKey]
                ? customPerformance[carKey].CarClass
                : parsedCar.CarClass || ''
              const cPI = customPerformance[carKey]
                ? customPerformance[carKey].PI
                : parsedCar.PI || 0
              const cRace =
                customPerformance[carKey] && customPerformance[carKey].RaceType !== undefined
                  ? customPerformance[carKey].RaceType
                  : parsedCar.RaceType || ''
              const cRaces =
                racesCount[carKey] !== undefined ? racesCount[carKey] : parsedCar.RacesCount || 0

              return {
                ...parsedCar,
                CarClass: cClass,
                PI: cPI,
                RaceType: cRace,
                RacesCount: cRaces
              }
            })
            setAllCars(mapped)

            const diskRepairKeys = mapped
              .filter((car) => car.NeedsRepair)
              .map((car) => `${car.Manufacturer}-${car.Model}-${car.Year}`)
            setRepairCars((prev) => Array.from(new Set([...prev, ...diskRepairKeys])))

            const diskOwnedKeys = diskData
              .filter((item) => item['Is own?'] === 'TRUE' || item.isOwned)
              .map((item) => {
                const mappedCar = mapRawToCar(item)
                return `${mappedCar.Manufacturer}-${mappedCar.Model}-${mappedCar.Year}`
              })
            setOwnedCars((prev) => Array.from(new Set([...prev, ...diskOwnedKeys])))
          }
        }
      } catch (e) {
        console.error('Failed auto-fetching disk JSON on mount', e)
      }
    }
    fetchDisk()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for background database sync updates and refresh UI dynamically
  useEffect(() => {
    if (window.electron && window.electron.ipcRenderer) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleDataUpdated = (_event: any, updatedData: any[]): void => {
        console.log('Received updated database from background sync')
        if (updatedData && Array.isArray(updatedData)) {
          const mapped = updatedData.map((item) => {
            const parsedCar = mapRawToCar(item)
            const carKey = `${parsedCar.Manufacturer}-${parsedCar.Model}-${parsedCar.Year}`
            const cClass = customPerformance[carKey]
              ? customPerformance[carKey].CarClass
              : parsedCar.CarClass || ''
            const cPI = customPerformance[carKey] ? customPerformance[carKey].PI : parsedCar.PI || 0
            const cRace =
              customPerformance[carKey] && customPerformance[carKey].RaceType !== undefined
                ? customPerformance[carKey].RaceType
                : parsedCar.RaceType || ''
            const cRaces =
              racesCount[carKey] !== undefined ? racesCount[carKey] : parsedCar.RacesCount || 0

            return {
              ...parsedCar,
              CarClass: cClass,
              PI: cPI,
              RaceType: cRace,
              RacesCount: cRaces
            }
          })
          setAllCars(mapped)

          const diskRepairKeys = mapped
            .filter((car) => car.NeedsRepair)
            .map((car) => `${car.Manufacturer}-${car.Model}-${car.Year}`)
          setRepairCars((prev) => Array.from(new Set([...prev, ...diskRepairKeys])))

          const diskOwnedKeys = updatedData
            .filter((item) => item['Is own?'] === 'TRUE' || item.isOwned)
            .map((item) => {
              const mappedCar = mapRawToCar(item)
              return `${mappedCar.Manufacturer}-${mappedCar.Model}-${mappedCar.Year}`
            })
          setOwnedCars((prev) => Array.from(new Set([...prev, ...diskOwnedKeys])))
        }
      }

      window.electron.ipcRenderer.on('forza-data-updated', handleDataUpdated)
      return (): void => {
        window.electron.ipcRenderer.removeAllListeners('forza-data-updated')
      }
    }
    return undefined
  }, [customPerformance, racesCount])

  // Reset to page 1 when search query or filters change
  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setCurrentPage(1)
  }, [
    searchQuery,
    selectedCarType,
    selectedRaceType,
    sortBy,
    filterOwned,
    filterUsed,
    filterRepair
  ])

  // Save states to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('forza_garage', JSON.stringify(garageList))
    } catch (e) {
      console.error('Failed to save garage to localStorage', e)
    }
  }, [garageList])

  useEffect(() => {
    try {
      localStorage.setItem('forza_owned', JSON.stringify(ownedCars))
    } catch (e) {
      console.error('Failed to save ownedCars to localStorage', e)
    }
  }, [ownedCars])

  useEffect(() => {
    try {
      localStorage.setItem('forza_used', JSON.stringify(usedCars))
    } catch (e) {
      console.error('Failed to save usedCars to localStorage', e)
    }
  }, [usedCars])

  useEffect(() => {
    try {
      localStorage.setItem('forza_repair', JSON.stringify(repairCars))
    } catch (e) {
      console.error('Failed to save repairCars to localStorage', e)
    }
  }, [repairCars])

  // Extract unique car types for filter dropdown
  const carTypesList = useMemo(() => {
    const types = new Set<string>()
    allCars.forEach((car) => {
      if (car.CarType) types.add(car.CarType)
    })
    return Array.from(types).sort()
  }, [allCars])

  // Toggle Favorite
  const toggleFavorite = (car: Car): void => {
    setGarageList((prev) => {
      const exists = prev.some(
        (item) =>
          item.Manufacturer === car.Manufacturer &&
          item.Model === car.Model &&
          item.Year === car.Year
      )
      if (exists) {
        return prev.filter(
          (item) =>
            !(
              item.Manufacturer === car.Manufacturer &&
              item.Model === car.Model &&
              item.Year === car.Year
            )
        )
      } else {
        return [...prev, car]
      }
    })
  }

  // Toggle Owned
  const toggleOwned = async (car: Car): Promise<void> => {
    const carKey = `${car.Manufacturer}-${car.Model}-${car.Year}`
    let updatedOwned: string[]
    const isNowOwned = !ownedCars.includes(carKey)

    if (isNowOwned) {
      updatedOwned = [...ownedCars, carKey]
    } else {
      updatedOwned = ownedCars.filter((k) => k !== carKey)
    }
    setOwnedCars(updatedOwned)

    if (window.electron && window.electron.ipcRenderer) {
      try {
        const ownedSet = new Set(updatedOwned)
        const mappedData = allCars.map((c) => mapCarToRaw(c, ownedSet))
        await window.electron.ipcRenderer.invoke('save-forza-data', mappedData)
      } catch (err) {
        console.error('Error al intentar guardar en el archivo JSON físico', err)
      }
    }
  }

  // Clear All Owned Cars
  const handleClearAllOwned = (): void => {
    setConfirmModal({
      isOpen: true,
      title: language === 'es' ? 'Desmarcar Todos' : 'Uncheck All',
      message: t['Confirm.clearAllOwned'],
      onConfirm: async () => {
        setOwnedCars([])
        localStorage.removeItem('forza_owned')

        if (window.electron && window.electron.ipcRenderer) {
          try {
            const ownedSet = new Set<string>()
            const mappedData = allCars.map((c) => mapCarToRaw(c, ownedSet))
            await window.electron.ipcRenderer.invoke('save-forza-data', mappedData)
            alert(t['Alert.clearAllOwnedSuccess'])
          } catch (err) {
            console.error('Error al intentar guardar en el archivo JSON físico', err)
            alert(t['Alert.clearAllOwnedError'])
          }
        } else {
          alert(t['Alert.clearAllOwnedSuccessAppOnly'])
        }
      }
    })
  }

  const handleOpenAddModal = (): void => {
    setEditingCar(undefined)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (car: Car): void => {
    setEditingCar(car)
    setIsModalOpen(true)
  }

  const handleSaveCar = async (carData: {
    Manufacturer: string
    Model: string
    Year: number
    CarClass: string
    PI: number
    CarType: string
    Price: string | number
    isOwned: boolean
  }): Promise<void> => {
    let updatedCars: Car[]
    const originalKey = editingCar
      ? `${editingCar.Manufacturer}-${editingCar.Model}-${editingCar.Year}`
      : null
    const newKey = `${carData.Manufacturer}-${carData.Model}-${carData.Year}`

    // Manage ownedCars list state
    let updatedOwned = [...ownedCars]
    if (carData.isOwned) {
      if (!updatedOwned.includes(newKey)) {
        updatedOwned.push(newKey)
      }
      if (originalKey && originalKey !== newKey) {
        updatedOwned = updatedOwned.filter((k) => k !== originalKey)
      }
    } else {
      updatedOwned = updatedOwned.filter((k) => k !== newKey && k !== originalKey)
    }
    setOwnedCars(updatedOwned)

    if (editingCar) {
      // Edit existing car
      updatedCars = allCars.map((c) => {
        if (`${c.Manufacturer}-${c.Model}-${c.Year}` === originalKey) {
          const originalRaw = c.originalRaw || {}
          return {
            ...c,
            Manufacturer: carData.Manufacturer,
            Model: carData.Model,
            Year: carData.Year,
            CarClass: carData.CarClass,
            PI: carData.PI,
            CarType: carData.CarType,
            originalRaw: {
              ...originalRaw,
              Brand: carData.Manufacturer,
              'point2580/4160': `${carData.Year} ${carData.Model}`,
              Class: `${carData.CarClass} ${carData.PI}`,
              source: carData.CarType,
              Price: carData.Price,
              'Is own?': carData.isOwned ? 'TRUE' : 'FALSE'
            }
          }
        }
        return c
      })

      // If edited car is in favorite garageList, update it as well
      setGarageList((prev) =>
        prev.map((c) => {
          if (`${c.Manufacturer}-${c.Model}-${c.Year}` === originalKey) {
            return {
              ...c,
              Manufacturer: carData.Manufacturer,
              Model: carData.Model,
              Year: carData.Year,
              CarClass: carData.CarClass,
              PI: carData.PI,
              CarType: carData.CarType
            }
          }
          return c
        })
      )
    } else {
      // Add new car
      const newCar: Car = {
        Manufacturer: carData.Manufacturer,
        Model: carData.Model,
        Year: carData.Year,
        CarType: carData.CarType,
        CarClass: carData.CarClass,
        PI: carData.PI,
        RaceType: '',
        NeedsRepair: false,
        originalRaw: {
          '1': 2, // Default index
          '': '',
          Brand: carData.Manufacturer,
          'collect point': 5,
          'point2580/4160': `${carData.Year} ${carData.Model}`,
          Class: `${carData.CarClass} ${carData.PI}`,
          __1: '',
          source: carData.CarType,
          Price: carData.Price,
          'Is own?': carData.isOwned ? 'TRUE' : 'FALSE',
          '326/605': ''
        }
      }
      updatedCars = [newCar, ...allCars]
    }

    setAllCars(updatedCars)
    setIsModalOpen(false)
    setEditingCar(undefined)

    // Save to file
    if (window.electron && window.electron.ipcRenderer) {
      try {
        const ownedSet = new Set(updatedOwned)
        const mappedData = updatedCars.map((c) => mapCarToRaw(c, ownedSet))
        await window.electron.ipcRenderer.invoke('save-forza-data', mappedData)
      } catch (err) {
        console.error('Error al intentar guardar en el archivo JSON físico', err)
      }
    }
  }

  const handleDeleteCar = (car: Car): void => {
    const carName = `${car.Manufacturer} ${car.Model} (${car.Year})`
    setConfirmModal({
      isOpen: true,
      title: language === 'es' ? 'Eliminar Vehículo' : 'Delete Vehicle',
      message: t['Confirm.deleteCar'].replace('{carName}', carName),
      onConfirm: async () => {
        const carKey = `${car.Manufacturer}-${car.Model}-${car.Year}`
        const updatedCars = allCars.filter(
          (c) => `${c.Manufacturer}-${c.Model}-${c.Year}` !== carKey
        )
        setAllCars(updatedCars)

        // Remove from other state lists
        setGarageList((prev) =>
          prev.filter((c) => `${c.Manufacturer}-${c.Model}-${c.Year}` !== carKey)
        )
        const updatedOwned = ownedCars.filter((k) => k !== carKey)
        setOwnedCars(updatedOwned)
        setUsedCars((prev) => prev.filter((k) => k !== carKey))
        setRepairCars((prev) => prev.filter((k) => k !== carKey))

        if (window.electron && window.electron.ipcRenderer) {
          try {
            const ownedSet = new Set(updatedOwned)
            const mappedData = updatedCars.map((c) => mapCarToRaw(c, ownedSet))
            await window.electron.ipcRenderer.invoke('save-forza-data', mappedData)
          } catch (err) {
            console.error('Error al intentar guardar en el archivo JSON físico', err)
          }
        }
      }
    })
  }

  // Extract unique brands for autocomplete
  const brandList = useMemo(() => {
    const brands = new Set<string>()
    allCars.forEach((c) => {
      if (c.Manufacturer) brands.add(c.Manufacturer)
    })
    return Array.from(brands).sort()
  }, [allCars])

  // Toggle Used
  const toggleUsed = (car: Car): void => {
    const carKey = `${car.Manufacturer}-${car.Model}-${car.Year}`
    setUsedCars((prev) => {
      if (prev.includes(carKey)) {
        return prev.filter((k) => k !== carKey)
      } else {
        return [...prev, carKey]
      }
    })
  }

  // Toggle Repair
  const toggleRepair = async (car: Car): Promise<void> => {
    const carKey = `${car.Manufacturer}-${car.Model}-${car.Year}`
    let updatedRepair: string[]
    const isNowRepair = !repairCars.includes(carKey)

    if (isNowRepair) {
      updatedRepair = [...repairCars, carKey]
    } else {
      updatedRepair = repairCars.filter((k) => k !== carKey)
    }
    setRepairCars(updatedRepair)

    // Actualizar allCars en memoria para reflejar NeedsRepair
    const updatedAllCars = allCars.map((item) => {
      if (`${item.Manufacturer}-${item.Model}-${item.Year}` === carKey) {
        return { ...item, NeedsRepair: isNowRepair }
      }
      return item
    })
    setAllCars(updatedAllCars)

    // Actualizar garageList en memoria
    setGarageList((prev) =>
      prev.map((item) => {
        if (`${item.Manufacturer}-${item.Model}-${item.Year}` === carKey) {
          return { ...item, NeedsRepair: isNowRepair }
        }
        return item
      })
    )

    // Guardar en el archivo JSON físico del disco mediante IPC
    if (window.electron && window.electron.ipcRenderer) {
      try {
        const ownedSet = new Set(ownedCars)
        const mappedData = updatedAllCars.map((c) => mapCarToRaw(c, ownedSet))
        await window.electron.ipcRenderer.invoke('save-forza-data', mappedData)
      } catch (err) {
        console.error('Error al intentar guardar en el archivo JSON físico', err)
      }
    }
  }

  // Randomizer Modal State & Handlers
  const handlePickRandom = (): void => {
    setIsRandomizerModalOpen(true)
  }

  // Reset Filters
  const resetFilters = (): void => {
    setSearchQuery('')
    setSelectedCarType('')
    setSelectedRaceType('')
    setSortBy('manuf-asc')
    setFilterOwned('all')
    setFilterUsed('all')
    setFilterRepair('all')
  }

  // Filtered & Sorted Cars for Explore View
  const filteredCars = useMemo(() => {
    return allCars
      .filter((car) => {
        const carKey = `${car.Manufacturer}-${car.Model}-${car.Year}`

        // Search query match (Manufacturer, Model)
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase()
          const manuf = car.Manufacturer ? String(car.Manufacturer).toLowerCase() : ''
          const model = car.Model ? String(car.Model).toLowerCase() : ''
          if (!manuf.includes(query) && !model.includes(query)) return false
        }

        // CarType match
        if (selectedCarType !== '' && car.CarType !== selectedCarType) return false

        // RaceType match
        if (selectedRaceType !== '') {
          if (selectedRaceType === 'Sin Asignar') {
            if (car.RaceType && car.RaceType !== '') return false
          } else {
            if (car.RaceType !== selectedRaceType) return false
          }
        }

        // Owned match
        if (filterOwned === 'owned' && !ownedCars.includes(carKey)) return false
        if (filterOwned === 'not_owned' && ownedCars.includes(carKey)) return false

        // Used match
        if (filterUsed === 'used' && !usedCars.includes(carKey)) return false
        if (filterUsed === 'not_used' && usedCars.includes(carKey)) return false

        // Repair match
        if (filterRepair === 'repair' && !repairCars.includes(carKey)) return false
        if (filterRepair === 'not_repair' && repairCars.includes(carKey)) return false

        return true
      })
      .sort((a, b) => {
        // Base manufacturer/model/year sub-sorting function for stability
        const compareBase = (x: Car, y: Car): number => {
          const compManuf = String(x.Manufacturer || '').localeCompare(String(y.Manufacturer || ''))
          if (compManuf !== 0) return compManuf
          const compModel = String(x.Model || '').localeCompare(String(y.Model || ''))
          if (compModel !== 0) return compModel
          return (y.Year || 0) - (x.Year || 0)
        }

        if (sortBy === 'year-desc') {
          const yearDiff = (b.Year || 0) - (a.Year || 0)
          if (yearDiff !== 0) return yearDiff
          return compareBase(a, b)
        }
        if (sortBy === 'year-asc') {
          const yearDiff = (a.Year || 0) - (b.Year || 0)
          if (yearDiff !== 0) return yearDiff
          return compareBase(a, b)
        }
        if (sortBy === 'manuf-asc') {
          return compareBase(a, b)
        }
        if (sortBy === 'manuf-desc') {
          const compManuf = String(b.Manufacturer || '').localeCompare(String(a.Manufacturer || ''))
          if (compManuf !== 0) return compManuf
          const compModel = String(a.Model || '').localeCompare(String(b.Model || ''))
          if (compModel !== 0) return compModel
          return (b.Year || 0) - (a.Year || 0)
        }
        if (sortBy === 'class-desc') {
          const rankA = getCarClassRank(a.CarClass)
          const rankB = getCarClassRank(b.CarClass)
          if (rankA !== rankB) return rankB - rankA
          const piDiff = (b.PI || 0) - (a.PI || 0)
          if (piDiff !== 0) return piDiff
          return compareBase(a, b)
        }
        if (sortBy === 'class-asc') {
          const rankA = getCarClassRank(a.CarClass)
          const rankB = getCarClassRank(b.CarClass)
          if (rankA !== rankB) return rankA - rankB
          const piDiff = (a.PI || 0) - (b.PI || 0)
          if (piDiff !== 0) return piDiff
          return compareBase(a, b)
        }
        if (sortBy === 'race-asc') {
          const raceA = a.RaceType || ''
          const raceB = b.RaceType || ''
          if (raceA === '' && raceB !== '') return 1
          if (raceB === '' && raceA !== '') return -1
          const compRace = raceA.localeCompare(raceB)
          if (compRace !== 0) return compRace
          return compareBase(a, b)
        }
        if (sortBy === 'race-desc') {
          const raceA = a.RaceType || ''
          const raceB = b.RaceType || ''
          if (raceA === '' && raceB !== '') return 1
          if (raceB === '' && raceA !== '') return -1
          const compRace = raceB.localeCompare(raceA)
          if (compRace !== 0) return compRace
          return compareBase(a, b)
        }
        if (sortBy === 'races-desc') {
          const racesDiff = (b.RacesCount || 0) - (a.RacesCount || 0)
          if (racesDiff !== 0) return racesDiff
          return compareBase(a, b)
        }
        if (sortBy === 'races-asc') {
          const racesDiff = (a.RacesCount || 0) - (b.RacesCount || 0)
          if (racesDiff !== 0) return racesDiff
          return compareBase(a, b)
        }
        return 0
      })
  }, [
    allCars,
    searchQuery,
    selectedCarType,
    selectedRaceType,
    sortBy,
    filterOwned,
    filterUsed,
    filterRepair,
    ownedCars,
    usedCars,
    repairCars
  ])

  // Pagination calculation for Explore view
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage)
  const displayedCars = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredCars.slice(start, start + itemsPerPage)
  }, [filteredCars, currentPage])

  return (
    <div className="h-screen bg-brand-dark text-[#f1f5f9] flex flex-col font-sans selection:bg-brand-primary/30 selection:text-white border border-brand-primary/30 overflow-hidden">
      {/* Custom Window Title Bar */}
      <TitleBar />

      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalCars={allCars.length}
        garageCount={garageList.length}
        onClearAllOwned={handleClearAllOwned}
        onAddCar={handleOpenAddModal}
        language={language}
        toggleLanguage={toggleLanguage}
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
          filterRepair={filterRepair}
          setFilterRepair={setFilterRepair}
          onPickRandom={handlePickRandom}
          isRandomDisabled={allCars.length === 0}
          language={language}
        />
      )}

      {/* Main Content Container */}
      <main className="flex-1 overflow-y-auto w-full py-8">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {activeTab === 'explore' && (
            <div>
              {/* Results count & Quick summary */}
              <div className="flex items-center justify-between mb-6 border-b border-slate-800/60 pb-3">
                <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                  <CarIcon className="h-5 w-5 text-brand-primary" /> {t['Explore.title']}
                </h2>
                <span className="text-xs font-semibold text-slate-400">
                  {t['Explore.showing']}{' '}
                  <strong className="text-white">{filteredCars.length}</strong> {t['Explore.of']}{' '}
                  {allCars.length} {t['Explore.vehicles']}
                </span>
              </div>

              {filteredCars.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-dark-card border border-brand-dark-border mb-4">
                    <AlertCircle className="h-8 w-8 text-brand-primary" />
                  </div>
                  <h3 className="text-base font-bold text-white">{t['Explore.notFound']}</h3>
                  <p className="mt-1 text-sm text-slate-400 max-w-sm">
                    {t['Explore.notFoundDesc']}
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-6 rounded-xl bg-slate-800 border border-slate-700 px-5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm"
                  >
                    {t['Explore.clearFilters']}
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayedCars.map((car) => {
                      const carKey = `${car.Manufacturer}-${car.Model}-${car.Year}`
                      const isFav = garageList.some(
                        (item) =>
                          item.Manufacturer === car.Manufacturer &&
                          item.Model === car.Model &&
                          item.Year === car.Year
                      )
                      const isOwned = ownedCars.includes(carKey)
                      const isUsed = usedCars.includes(carKey)
                      const isRepair = repairCars.includes(carKey)

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
                          needsRepair={isRepair}
                          toggleRepair={toggleRepair}
                          onUpdatePerformance={handleUpdatePerformance}
                          onUpdateRaces={handleUpdateRaces}
                          onEdit={handleOpenEditModal}
                          onDelete={handleDeleteCar}
                          language={language}
                        />
                      )
                    })}
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredCars.length}
                    itemsPerPage={itemsPerPage}
                  />
                </>
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
              repairCars={repairCars}
              toggleRepair={toggleRepair}
              onUpdatePerformance={handleUpdatePerformance}
              onUpdateRaces={handleUpdateRaces}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteCar}
              language={language}
            />
          )}
        </div>
      </main>

      {/* Modal for Add / Edit */}
      <CarModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCar(undefined)
        }}
        onSave={handleSaveCar}
        car={editingCar}
        existingBrands={brandList}
        language={language}
      />

      {/* Random Car Selector Modal */}
      <RandomizerModal
        key={isRandomizerModalOpen ? 'open' : 'closed'}
        isOpen={isRandomizerModalOpen}
        onClose={() => setIsRandomizerModalOpen(false)}
        allCars={allCars}
        ownedCars={ownedCars}
        usedCars={usedCars}
        repairCars={repairCars}
        garageList={garageList}
        carTypes={carTypesList}
        defaultRaceType={selectedRaceType}
        defaultCarType={selectedCarType}
        defaultOwned={filterOwned}
        defaultUsed={filterUsed}
        defaultRepair={filterRepair}
        toggleFavorite={toggleFavorite}
        toggleOwned={toggleOwned}
        toggleUsed={toggleUsed}
        toggleRepair={toggleRepair}
        onUpdatePerformance={handleUpdatePerformance}
        onUpdateRaces={handleUpdateRaces}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteCar}
        language={language}
      />

      {/* Confirmation Alert Dialog Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        language={language}
      />
    </div>
  )
}

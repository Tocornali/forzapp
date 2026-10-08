/* eslint-disable @typescript-eslint/no-explicit-any */
import bundledCars from '../assets/FH6Cars.json'

export interface SyncResult {
  success: boolean
  newCars: any[]
  updatedList: any[]
  source?: 'live-web' | 'github-fallback' | 'github-direct' | 'none' | string
  error?: string
}

export interface IDataService {
  isElectron: boolean
  loadCars(): Promise<any[]>
  saveCars(data: any[]): Promise<boolean>
  checkForUpdates(currentCars: any[]): Promise<SyncResult>
  onCarsUpdated(callback: (cars: any[]) => void): () => void
}

const GITHUB_BACKUP_URL =
  'https://raw.githubusercontent.com/tocornali/forzapp/main/ForzAPP/FH6Cars.json'

const STORAGE_KEY_CARS = 'forza_cars_data'

export function isElectronEnvironment(): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.electron && window.electron.ipcRenderer)
  )
}

function getCarKey(c: any): string {
  const brand = c.Manufacturer || c.Brand || ''
  const pf = c['point2580/4160'] || ''
  const m = pf.match(/^(\d{4})\s+(.*)$/)
  const y = m ? m[1] : c.Year || ''
  const mod = m ? m[2] : c.Model || pf
  return `${brand}-${mod}-${y}`.toLowerCase().replace(/\s+/g, ' ').trim()
}

/**
 * Adapter for Desktop (Electron IPC)
 */
class ElectronDataService implements IDataService {
  public readonly isElectron = true

  async loadCars(): Promise<any[]> {
    return await window.electron.ipcRenderer.invoke('get-forza-data')
  }

  async saveCars(data: any[]): Promise<boolean> {
    return await window.electron.ipcRenderer.invoke('save-forza-data', data)
  }

  async checkForUpdates(_currentCars: any[]): Promise<SyncResult> {
    return await window.electron.ipcRenderer.invoke('check-forza-updates')
  }

  onCarsUpdated(callback: (cars: any[]) => void): () => void {
    const handler = (_event: any, updatedData: any[]): void => {
      callback(updatedData)
    }
    window.electron.ipcRenderer.on('forza-data-updated', handler)
    return () => {
      window.electron.ipcRenderer.removeListener('forza-data-updated', handler)
    }
  }
}

/**
 * Adapter for Web / Mobile (Capacitor / LocalStorage / Fetch)
 */
class WebMobileDataService implements IDataService {
  public readonly isElectron = false

  async loadCars(): Promise<any[]> {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CARS)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch (e) {
      console.error('Failed reading cars from localStorage, falling back to bundled JSON', e)
    }
    return bundledCars
  }

  async saveCars(data: any[]): Promise<boolean> {
    try {
      localStorage.setItem(STORAGE_KEY_CARS, JSON.stringify(data))
      return true
    } catch (e) {
      console.error('Failed saving cars to localStorage', e)
      return false
    }
  }

  async checkForUpdates(currentCars: any[]): Promise<SyncResult> {
    try {
      const response = await fetch(GITHUB_BACKUP_URL, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} al consultar respaldo de GitHub`)
      }
      const remoteData: any[] = await response.json()
      if (!Array.isArray(remoteData)) {
        throw new Error('Formato de datos inválido desde GitHub')
      }

      const localMap = new Map<string, any>()
      currentCars.forEach((c) => localMap.set(getCarKey(c), c))

      const newCarsAdded: any[] = []
      const updatedList = [...currentCars]

      remoteData.forEach((remoteCar) => {
        const key = getCarKey(remoteCar)
        if (!localMap.has(key)) {
          const newCarObj = {
            ...remoteCar,
            'Is own?': 'FALSE',
            NeedsRepair: false,
            RaceType: '',
            RacesCount: 0
          }
          updatedList.push(newCarObj)
          localMap.set(key, newCarObj)
          newCarsAdded.push(newCarObj)
        }
      })

      if (newCarsAdded.length > 0) {
        await this.saveCars(updatedList)
      }

      return {
        success: true,
        newCars: newCarsAdded,
        updatedList,
        source: 'github-direct'
      }
    } catch (err: any) {
      return {
        success: false,
        newCars: [],
        updatedList: currentCars,
        source: 'none',
        error: err.message || 'Error de conexión'
      }
    }
  }

  onCarsUpdated(_callback: (cars: any[]) => void): () => void {
    return () => {}
  }
}

export const dataService: IDataService = isElectronEnvironment()
  ? new ElectronDataService()
  : new WebMobileDataService()

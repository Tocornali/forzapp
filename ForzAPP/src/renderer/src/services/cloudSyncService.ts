/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabaseClient'
import { Car } from '../types'

export interface UserSyncPayload {
  ownedCars: string[]
  garageCars: Car[]
  usedCars: string[]
  repairCars: string[]
  customPerformance: Record<string, { CarClass: string; PI: number; RaceType?: string }>
  racesCount: Record<string, number>
}

export interface CloudSyncResult {
  success: boolean
  message?: string
  error?: string
  mergedPayload?: UserSyncPayload
}

const STORAGE_KEY_SYNC_CODE = 'forza_sync_code'
const STORAGE_KEY_LAST_SYNC = 'forza_last_cloud_sync'

export function getSavedSyncCode(): string {
  return localStorage.getItem(STORAGE_KEY_SYNC_CODE) || ''
}

export function saveSyncCode(code: string): void {
  localStorage.setItem(STORAGE_KEY_SYNC_CODE, code.trim().toLowerCase())
}

export function getLastCloudSync(): string {
  return localStorage.getItem(STORAGE_KEY_LAST_SYNC) || ''
}

export function setLastCloudSync(dateIso: string): void {
  localStorage.setItem(STORAGE_KEY_LAST_SYNC, dateIso)
}

const SYNC_ADJECTIVES = [
  'turbo',
  'apex',
  'drift',
  'nitro',
  'rapid',
  'carbon',
  'hyper',
  'sprint',
  'aero',
  'sonic',
  'rally',
  'vector',
  'monza',
  'silver',
  'corsa'
]

const SYNC_NOUNS = [
  'garage',
  'falcon',
  'gt',
  'pilot',
  'driver',
  'speed',
  'paddock',
  'track',
  'viper',
  'motor',
  'racer',
  'chassis',
  'clutch'
]

/**
 * Generates a human-friendly collision-resistant sync code (e.g., "turbo-apex-4892")
 */
export function generateUniqueSyncCode(): string {
  const adj = SYNC_ADJECTIVES[Math.floor(Math.random() * SYNC_ADJECTIVES.length)]
  const noun = SYNC_NOUNS[Math.floor(Math.random() * SYNC_NOUNS.length)]
  const num = Math.floor(1000 + Math.random() * 9000)
  return `${adj}-${noun}-${num}`
}

/**
 * Professional Bidirectional Set-Union Cloud Sync
 */
export async function syncWithCloud(
  syncCode: string,
  localData: UserSyncPayload
): Promise<CloudSyncResult> {
  const code = syncCode.trim().toLowerCase()
  if (!code) {
    return { success: false, error: 'Ingresá un código de sincronización válido' }
  }

  try {
    // 1. Fetch remote data for this sync_code
    const { data: remoteRow, error: fetchError } = await supabase
      .from('user_sync')
      .select('*')
      .eq('sync_code', code)
      .maybeSingle()

    if (fetchError) {
      throw fetchError
    }

    // 2. If row doesn't exist yet, insert local data
    if (!remoteRow) {
      const nowIso = new Date().toISOString()
      const { error: insertError } = await supabase.from('user_sync').insert({
        sync_code: code,
        owned_cars: localData.ownedCars,
        garage_cars: localData.garageCars,
        used_cars: localData.usedCars,
        repair_cars: localData.repairCars,
        custom_perf: localData.customPerformance,
        races_count: localData.racesCount,
        updated_at: nowIso
      })

      if (insertError) throw insertError

      saveSyncCode(code)
      setLastCloudSync(nowIso)
      return {
        success: true,
        message: '¡Garage vinculado y subido a la nube con éxito!',
        mergedPayload: localData
      }
    }

    // 3. Row exists: Perform bidirectional CRDT merge (Set Union & max count)
    const remoteOwned: string[] = Array.isArray(remoteRow.owned_cars) ? remoteRow.owned_cars : []
    const remoteGarage: Car[] = Array.isArray(remoteRow.garage_cars) ? remoteRow.garage_cars : []
    const remoteUsed: string[] = Array.isArray(remoteRow.used_cars) ? remoteRow.used_cars : []
    const remoteRepair: string[] = Array.isArray(remoteRow.repair_cars) ? remoteRow.repair_cars : []
    const remotePerf: Record<string, any> = remoteRow.custom_perf || {}
    const remoteRaces: Record<string, number> = remoteRow.races_count || {}

    // Merge Sets
    const mergedOwned = Array.from(new Set([...localData.ownedCars, ...remoteOwned]))
    const mergedUsed = Array.from(new Set([...localData.usedCars, ...remoteUsed]))
    const mergedRepair = Array.from(new Set([...localData.repairCars, ...remoteRepair]))

    // Merge Garage Lists (deduplicate by car key)
    const garageMap = new Map<string, Car>()
    remoteGarage.forEach((c) => {
      garageMap.set(`${c.Manufacturer}-${c.Model}-${c.Year}`, c)
    })
    localData.garageCars.forEach((c) => {
      garageMap.set(`${c.Manufacturer}-${c.Model}-${c.Year}`, c)
    })
    const mergedGarage = Array.from(garageMap.values())

    // Merge Custom Performance (combine records)
    const mergedPerf = { ...remotePerf, ...localData.customPerformance }

    // Merge Races Count (take max count per car)
    const mergedRaces: Record<string, number> = { ...remoteRaces }
    Object.entries(localData.racesCount).forEach(([carKey, count]) => {
      mergedRaces[carKey] = Math.max(mergedRaces[carKey] || 0, count)
    })

    const mergedPayload: UserSyncPayload = {
      ownedCars: mergedOwned,
      garageCars: mergedGarage,
      usedCars: mergedUsed,
      repairCars: mergedRepair,
      customPerformance: mergedPerf,
      racesCount: mergedRaces
    }

    // 4. Update row in Supabase with merged result so all devices are identical
    const nowIso = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('user_sync')
      .update({
        owned_cars: mergedOwned,
        garage_cars: mergedGarage,
        used_cars: mergedUsed,
        repair_cars: mergedRepair,
        custom_perf: mergedPerf,
        races_count: mergedRaces,
        updated_at: nowIso
      })
      .eq('sync_code', code)

    if (updateError) throw updateError

    saveSyncCode(code)
    setLastCloudSync(nowIso)

    return {
      success: true,
      message: '¡Datos sincronizados y unificados correctamente!',
      mergedPayload
    }
  } catch (err: any) {
    console.error('Error during cloud sync:', err)
    return {
      success: false,
      error: err.message || 'Error de conexión con la nube'
    }
  }
}

const STORAGE_KEY_SAFETY_BACKUP = 'forza_safety_backup'

/**
 * Saves a local safety snapshot before any cloud import
 */
export function saveSafetyBackup(data: UserSyncPayload): void {
  try {
    const backup = {
      timestamp: new Date().toISOString(),
      payload: data
    }
    localStorage.setItem(STORAGE_KEY_SAFETY_BACKUP, JSON.stringify(backup))
  } catch (e) {
    console.error('Failed saving safety backup:', e)
  }
}

/**
 * Gets the last local safety snapshot if one exists
 */
export function getSafetyBackup(): { timestamp: string; payload: UserSyncPayload } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAFETY_BACKUP)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Uploads (Exports) the local state directly to the cloud, making it the master copy.
 * Replaces remote state so any unselected or deleted items are cleanly saved.
 */
export async function exportToCloud(
  syncCode: string,
  localData: UserSyncPayload
): Promise<CloudSyncResult> {
  const code = syncCode.trim().toLowerCase()
  if (!code) {
    return { success: false, error: 'Ingresá un código de sincronización válido' }
  }

  try {
    const nowIso = new Date().toISOString()
    const { error: upsertError } = await supabase.from('user_sync').upsert(
      {
        sync_code: code,
        owned_cars: localData.ownedCars,
        garage_cars: localData.garageCars,
        used_cars: localData.usedCars,
        repair_cars: localData.repairCars,
        custom_perf: localData.customPerformance,
        races_count: localData.racesCount,
        updated_at: nowIso
      },
      { onConflict: 'sync_code' }
    )

    if (upsertError) throw upsertError

    saveSyncCode(code)
    setLastCloudSync(nowIso)

    return {
      success: true,
      message: '¡Copia de seguridad subida a la nube con éxito!',
      mergedPayload: localData
    }
  } catch (err: any) {
    console.error('Error exporting to cloud:', err)
    return {
      success: false,
      error: err.message || 'Error al exportar a la nube'
    }
  }
}

/**
 * Downloads (Imports / Restores) the cloud backup into this device.
 * Takes an automatic local safety snapshot before applying.
 */
export async function importFromCloud(
  syncCode: string,
  currentLocalData: UserSyncPayload
): Promise<CloudSyncResult> {
  const code = syncCode.trim().toLowerCase()
  if (!code) {
    return { success: false, error: 'Ingresá un código de sincronización válido' }
  }

  try {
    const { data: remoteRow, error: fetchError } = await supabase
      .from('user_sync')
      .select('*')
      .eq('sync_code', code)
      .maybeSingle()

    if (fetchError) throw fetchError

    if (!remoteRow) {
      return {
        success: false,
        error: `No se encontró ninguna copia en la nube con el código "${code}". Primero exportá tus datos desde el otro dispositivo.`
      }
    }

    // Save a local safety backup before overwriting
    saveSafetyBackup(currentLocalData)

    const payload: UserSyncPayload = {
      ownedCars: Array.isArray(remoteRow.owned_cars) ? remoteRow.owned_cars : [],
      garageCars: Array.isArray(remoteRow.garage_cars) ? remoteRow.garage_cars : [],
      usedCars: Array.isArray(remoteRow.used_cars) ? remoteRow.used_cars : [],
      repairCars: Array.isArray(remoteRow.repair_cars) ? remoteRow.repair_cars : [],
      customPerformance: remoteRow.custom_perf || {},
      racesCount: remoteRow.races_count || {}
    }

    saveSyncCode(code)
    if (remoteRow.updated_at) {
      setLastCloudSync(remoteRow.updated_at)
    }

    return {
      success: true,
      message: '¡Datos descargados y recuperados con éxito!',
      mergedPayload: payload
    }
  } catch (err: any) {
    console.error('Error importing from cloud:', err)
    return {
      success: false,
      error: err.message || 'Error al recuperar desde la nube'
    }
  }
}

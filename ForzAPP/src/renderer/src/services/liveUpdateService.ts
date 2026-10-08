import { Capacitor } from '@capacitor/core'
import { CapacitorUpdater } from '@capgo/capacitor-updater'

export interface AppVersionInfo {
  version: string
  bundleId: string
  isNative: boolean
  isBuiltin: boolean
}

export interface LiveUpdateCheckResult {
  hasUpdate: boolean
  version?: string
  url?: string
  error?: string
}

class LiveUpdateService {
  private isNative: boolean

  constructor() {
    this.isNative = Capacitor.isNativePlatform()
  }

  /**
   * CRITICAL: Must be called as early as possible on app startup.
   * Notifies the native Capgo watchdog that the JS bundle initialized successfully.
   * If this is not called before the timeout (default 10s), Capgo will roll back to the previous bundle.
   */
  async notifyAppReady(): Promise<void> {
    if (!this.isNative) return
    try {
      await CapacitorUpdater.notifyAppReady()
      console.log('[LiveUpdate] Native layer notified: App is ready.')
    } catch (err) {
      console.warn('[LiveUpdate] notifyAppReady warning:', err)
    }
  }

  /**
   * Retrieves current active bundle information and native version.
   */
  async getCurrentVersion(): Promise<AppVersionInfo> {
    if (!this.isNative) {
      return {
        version: '1.0.0',
        bundleId: 'web/desktop',
        isNative: false,
        isBuiltin: true
      }
    }

    try {
      const res = await CapacitorUpdater.current()
      const bundleId = res?.bundle?.id || 'builtin'
      const version = res?.bundle?.version || res?.native || '1.0.0'
      return {
        version,
        bundleId,
        isNative: true,
        isBuiltin: bundleId === 'builtin'
      }
    } catch (err) {
      console.warn('[LiveUpdate] Failed to get current version:', err)
      return {
        version: '1.0.0',
        bundleId: 'unknown',
        isNative: true,
        isBuiltin: true
      }
    }
  }

  /**
   * Checks for updates from Capgo server or configured endpoint.
   */
  async checkForUpdate(): Promise<LiveUpdateCheckResult> {
    if (!this.isNative) {
      return { hasUpdate: false, error: 'Not running on a native device' }
    }

    try {
      const latest = await CapacitorUpdater.getLatest()
      if (latest.kind === 'up_to_date') {
        return { hasUpdate: false }
      }
      if (latest.kind === 'blocked') {
        return { hasUpdate: false, error: latest.message || 'Update is blocked for this device' }
      }
      if (latest.url) {
        return {
          hasUpdate: true,
          version: latest.version,
          url: latest.url
        }
      }
      return { hasUpdate: false }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      console.warn('[LiveUpdate] Check for update error:', message)
      return { hasUpdate: false, error: message }
    }
  }

  /**
   * Downloads a new bundle from a direct URL and stages it for activation.
   */
  async downloadAndStageBundle(url: string, version: string): Promise<boolean> {
    if (!this.isNative) return false

    try {
      console.log(`[LiveUpdate] Downloading bundle version ${version} from ${url}...`)
      const bundle = await CapacitorUpdater.download({ url, version })
      await CapacitorUpdater.next({ id: bundle.id })
      console.log(`[LiveUpdate] Bundle ${bundle.id} downloaded and staged for next launch.`)
      return true
    } catch (err) {
      console.error('[LiveUpdate] Failed to download or stage bundle:', err)
      return false
    }
  }

  /**
   * Immediately reloads the app into the newly downloaded bundle.
   */
  async reloadApp(): Promise<void> {
    if (!this.isNative) {
      window.location.reload()
      return
    }
    try {
      await CapacitorUpdater.reload()
    } catch (err) {
      console.error('[LiveUpdate] Failed to reload app:', err)
      window.location.reload()
    }
  }

  /**
   * Subscribes to Capgo download and update events.
   * Returns an unsubscription function.
   */
  onUpdateDownloaded(callback: (version: string) => void): () => void {
    if (!this.isNative) return () => {}

    let cleanup: (() => void) | null = null

    CapacitorUpdater.addListener('downloadComplete', (state) => {
      console.log('[LiveUpdate] Download complete:', state.bundle)
      callback(state.bundle.version || state.bundle.id)
    }).then((handle) => {
      cleanup = () => handle.remove()
    })

    return () => {
      if (cleanup) cleanup()
    }
  }
}

export const liveUpdateService = new LiveUpdateService()

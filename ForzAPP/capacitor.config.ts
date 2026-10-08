import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.forzapp.app',
  appName: 'ForzAPP',
  webDir: 'out/renderer',
  plugins: {
    CapacitorUpdater: {
      autoUpdate: 'atBackground',
      appReadyTimeout: 10000,
      resetWhenUpdate: true
    }
  }
}

export default config

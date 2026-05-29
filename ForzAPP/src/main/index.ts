/* eslint-disable @typescript-eslint/no-explicit-any */
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    frame: false, // Make window frameless
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window-maximized-state', true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window-maximized-state', false)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // IPC window controls
  ipcMain.on('window-minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.on('window-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize()
      } else {
        mainWindow.maximize()
      }
    }
  })

  ipcMain.on('window-close', () => {
    mainWindow?.close()
  }) // Helper to normalize strings for comparison
  const normalizeStr = (str: string): string => {
    if (!str) return ''
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
  }

  // Helper to get unique key for a car
  const getCarKey = (car: any): string => {
    const brand = car.Brand || ''
    const pointField = car['point2580/4160'] || ''
    const yearMatch = pointField.trim().match(/^(\d{4})\b/)
    const year = yearMatch ? yearMatch[1] : ''
    const model = year ? pointField.substring(5) : pointField
    return `${normalizeStr(brand)}_${normalizeStr(year)}_${normalizeStr(model)}`
  }

  // Asynchronous background sync from GitHub Raw
  const syncDatabaseFromWeb = async (localData: any[]): Promise<any[] | null> => {
    const remoteUrl = 'https://raw.githubusercontent.com/tocornali/forzapp/main/ForzAPP/FH6Cars.json'
    try {
      console.log('Background Sync: Fetching remote database from GitHub...')
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000) // 6 seconds timeout

      const response = await fetch(remoteUrl, { signal: controller.signal })
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const remoteData = (await response.json()) as any[]
      if (!Array.isArray(remoteData)) {
        throw new Error('Remote database is not an array')
      }

      const localMap = new Map<string, any>()
      localData.forEach((car) => {
        localMap.set(getCarKey(car), car)
      })

      let hasChanges = false
      const mergedList: any[] = []

      remoteData.forEach((remoteCar) => {
        const key = getCarKey(remoteCar)
        if (localMap.has(key)) {
          const localCar = localMap.get(key)
          // Keep remote data, but preserve local progress properties
          const mergedCar = {
            ...remoteCar,
            'Is own?': localCar['Is own?'] !== undefined ? localCar['Is own?'] : 'FALSE',
            NeedsRepair: localCar.NeedsRepair !== undefined ? localCar.NeedsRepair : false,
            RaceType: localCar.RaceType !== undefined ? localCar.RaceType : '',
            RacesCount: localCar.RacesCount !== undefined ? localCar.RacesCount : 0
          }
          mergedList.push(mergedCar)
        } else {
          // New car from GitHub
          const newCar = {
            ...remoteCar,
            'Is own?': 'FALSE',
            NeedsRepair: false,
            RaceType: '',
            RacesCount: 0
          }
          mergedList.push(newCar)
          hasChanges = true
          console.log(
            `Background Sync: New car found: ${remoteCar.Brand} ${remoteCar['point2580/4160']}`
          )
        }
      })

      // Include user-created/local-only cars if they aren't in remote database
      const remoteKeys = new Set(remoteData.map((c) => getCarKey(c)))
      localData.forEach((localCar) => {
        const key = getCarKey(localCar)
        if (!remoteKeys.has(key)) {
          mergedList.push(localCar)
        }
      })

      if (hasChanges || mergedList.length !== localData.length) {
        // Sort final list by Brand index "1" numerically, then model alphabetically
        mergedList.sort((a, b) => {
          const brandA = Number(a['1']) || 0
          const brandB = Number(b['1']) || 0
          if (brandA !== brandB) return brandA - brandB
          return a['point2580/4160'].localeCompare(b['point2580/4160'])
        })
        return mergedList
      }

      console.log('Background Sync: Local database is already up to date.')
      return null
    } catch (error) {
      console.error('Background Sync: Failed to sync database from GitHub:', error)
      return null
    }
  }

  ipcMain.handle('get-forza-data', async () => {
    const userDataPath = join(app.getPath('userData'), 'FH6Cars.json')
    let localData: any[] = []
    let loadPath = ''

    const possiblePaths = [
      userDataPath,
      join(process.cwd(), 'FH6Cars.json'),
      join(app.getAppPath(), 'FH6Cars.json'),
      join(__dirname, '../../src/renderer/src/assets/FH6Cars.json'),
      join(__dirname, '../../FH6Cars.json'),
      join(__dirname, '../renderer/assets/FH6Cars.json')
    ]

    for (const p of possiblePaths) {
      try {
        if (fs.existsSync(p)) {
          const raw = fs.readFileSync(p, 'utf-8')
          localData = JSON.parse(raw)
          loadPath = p
          break
        }
      } catch (e) {
        console.error(`Failed reading ${p}`, e)
      }
    }

    // Copy to userData path immediately to initialize if we loaded from bundled resources
    if (loadPath && loadPath !== userDataPath) {
      try {
        fs.writeFileSync(userDataPath, JSON.stringify(localData, null, 2), 'utf-8')
      } catch (e) {
        console.error('Failed initializing userData database', e)
      }
    }

    // Trigger background update checks asynchronously
    setTimeout(async () => {
      const mergedList = await syncDatabaseFromWeb(localData)
      if (mergedList) {
        try {
          fs.writeFileSync(userDataPath, JSON.stringify(mergedList, null, 2), 'utf-8')
          console.log('Background Sync: Successfully saved updated database to disk.')
          // Notify the renderer to reload state
          mainWindow?.webContents.send('forza-data-updated', mergedList)
        } catch (writeErr) {
          console.error('Background Sync: Failed writing updated database:', writeErr)
        }
      }
    }, 1500)

    return localData
  })

  ipcMain.handle('save-forza-data', (_, data) => {
    const possiblePaths = [
      join(app.getPath('userData'), 'FH6Cars.json'),
      join(process.cwd(), 'FH6Cars.json'),
      join(app.getAppPath(), 'FH6Cars.json'),
      join(__dirname, '../../src/renderer/src/assets/FH6Cars.json'),
      join(__dirname, '../../FH6Cars.json')
    ]

    let saved = false
    for (const p of possiblePaths) {
      try {
        if (
          p === join(app.getPath('userData'), 'FH6Cars.json') ||
          fs.existsSync(p) ||
          p === join(process.cwd(), 'FH6Cars.json')
        ) {
          fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8')
          saved = true
        }
      } catch (e) {
        console.error(`Failed writing ${p}`, e)
      }
    }
    return saved
  })

  ipcMain.handle('check-forza-updates', async () => {
    const userDataPath = join(app.getPath('userData'), 'FH6Cars.json')
    let localData: any[] = []

    const possiblePaths = [
      userDataPath,
      join(process.cwd(), 'FH6Cars.json'),
      join(app.getAppPath(), 'FH6Cars.json'),
      join(__dirname, '../../src/renderer/src/assets/FH6Cars.json'),
      join(__dirname, '../../FH6Cars.json'),
      join(__dirname, '../renderer/assets/FH6Cars.json')
    ]

    for (const p of possiblePaths) {
      try {
        if (fs.existsSync(p)) {
          const raw = fs.readFileSync(p, 'utf-8')
          localData = JSON.parse(raw)
          break
        }
      } catch (e) {
        console.error(`Failed reading ${p}`, e)
      }
    }

    const remoteUrl = 'https://raw.githubusercontent.com/tocornali/forzapp/main/ForzAPP/FH6Cars.json'
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const response = await fetch(remoteUrl, { signal: controller.signal })
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const remoteData = (await response.json()) as any[]
      if (!Array.isArray(remoteData)) {
        throw new Error('Remote database is not an array')
      }

      const localMap = new Map<string, any>()
      localData.forEach((car) => {
        localMap.set(getCarKey(car), car)
      })

      const newCarsAdded: any[] = []
      const mergedList: any[] = []

      remoteData.forEach((remoteCar) => {
        const key = getCarKey(remoteCar)
        if (localMap.has(key)) {
          const localCar = localMap.get(key)
          const mergedCar = {
            ...remoteCar,
            'Is own?': localCar['Is own?'] !== undefined ? localCar['Is own?'] : 'FALSE',
            NeedsRepair: localCar.NeedsRepair !== undefined ? localCar.NeedsRepair : false,
            RaceType: localCar.RaceType !== undefined ? localCar.RaceType : '',
            RacesCount: localCar.RacesCount !== undefined ? localCar.RacesCount : 0
          }
          mergedList.push(mergedCar)
        } else {
          const newCar = {
            ...remoteCar,
            'Is own?': 'FALSE',
            NeedsRepair: false,
            RaceType: '',
            RacesCount: 0
          }
          mergedList.push(newCar)
          newCarsAdded.push(remoteCar)
        }
      })

      const remoteKeys = new Set(remoteData.map((c) => getCarKey(c)))
      localData.forEach((localCar) => {
        const key = getCarKey(localCar)
        if (!remoteKeys.has(key)) {
          mergedList.push(localCar)
        }
      })

      if (newCarsAdded.length > 0) {
        mergedList.sort((a, b) => {
          const brandA = Number(a['1']) || 0
          const brandB = Number(b['1']) || 0
          if (brandA !== brandB) return brandA - brandB
          return a['point2580/4160'].localeCompare(b['point2580/4160'])
        })
        fs.writeFileSync(userDataPath, JSON.stringify(mergedList, null, 2), 'utf-8')
      }

      return {
        success: true,
        newCars: newCarsAdded,
        updatedList: mergedList
      }
    } catch (error: any) {
      console.error('Manual Update Sync: Failed:', error)
      return {
        success: false,
        error: error.message || 'Error de conexión'
      }
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

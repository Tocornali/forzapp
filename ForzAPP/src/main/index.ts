/* eslint-disable @typescript-eslint/no-explicit-any */
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import fs, { promises as fsPromises } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { performFullSync } from './syncService'

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
  })

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

    // Deduplicate on load to prevent phantom duplicates from older persisted stores
    const seen = new Set<string>()
    const deduplicatedData: any[] = []
    for (const c of localData) {
      const brand = c.Manufacturer || c.Brand || ''
      const pf = c['point2580/4160'] || ''
      const m = pf.match(/^(\d{4})\s+(.*)$/)
      const y = m ? m[1] : c.Year || ''
      const mod = m ? m[2] : c.Model || pf
      const k = `${brand}-${mod}-${y}`.toLowerCase().replace(/\s+/g, ' ').trim()
      if (!seen.has(k)) {
        seen.add(k)
        deduplicatedData.push(c)
      }
    }
    const hadDuplicates = deduplicatedData.length !== localData.length
    localData = deduplicatedData

    // Copy to userData path immediately to initialize if we loaded from bundled resources or fixed duplicates
    if ((loadPath && loadPath !== userDataPath) || hadDuplicates) {
      try {
        fs.writeFileSync(userDataPath, JSON.stringify(localData, null, 2), 'utf-8')
      } catch (e) {
        console.error('Failed initializing userData database', e)
      }
    }

    // Trigger background update checks asynchronously
    setTimeout(async () => {
      try {
        const syncResult = await performFullSync(localData, [userDataPath])
        if (syncResult.success && syncResult.newCars.length > 0) {
          console.log(
            `Background Sync: Successfully added ${syncResult.newCars.length} new vehicles via ${syncResult.source}.`
          )
          mainWindow?.webContents.send('forza-data-updated', syncResult.updatedList)
        }
      } catch (bgErr) {
        console.error('Background Sync: Error during background sync:', bgErr)
      }
    }, 2500)

    return localData
  })

  let saveTimeout: NodeJS.Timeout | null = null
  let pendingSaveData: any = null
  let pendingResolvers: ((value: boolean) => void)[] = []

  const flushSave = async (): Promise<boolean> => {
    if (!pendingSaveData) return true
    const rawDataToSave = pendingSaveData
    const resolvers = pendingResolvers
    pendingSaveData = null
    pendingResolvers = []

    // Ensure deduplication before writing to disk
    const seenKeys = new Set<string>()
    const dataToSave: any[] = []
    if (Array.isArray(rawDataToSave)) {
      for (const c of rawDataToSave) {
        const brand = c.Manufacturer || c.Brand || ''
        const pf = c['point2580/4160'] || ''
        const m = pf.match(/^(\d{4})\s+(.*)$/)
        const y = m ? m[1] : c.Year || ''
        const mod = m ? m[2] : c.Model || pf
        const k = `${brand}-${mod}-${y}`.toLowerCase().replace(/\s+/g, ' ').trim()
        if (!seenKeys.has(k)) {
          seenKeys.add(k)
          dataToSave.push(c)
        }
      }
    } else {
      dataToSave.push(rawDataToSave)
    }

    const userDataPath = join(app.getPath('userData'), 'FH6Cars.json')
    const possiblePaths = [userDataPath]

    if (is.dev) {
      possiblePaths.push(
        join(process.cwd(), 'FH6Cars.json'),
        join(__dirname, '../../src/renderer/src/assets/FH6Cars.json'),
        join(__dirname, '../../FH6Cars.json')
      )
    }

    try {
      const jsonContent = JSON.stringify(dataToSave, null, 2)
      await Promise.all(
        possiblePaths.map(async (p) => {
          try {
            if (p === userDataPath || fs.existsSync(p)) {
              await fsPromises.writeFile(p, jsonContent, 'utf-8')
            }
          } catch (err) {
            console.error(`Failed async writing to ${p}:`, err)
          }
        })
      )
      resolvers.forEach((res) => res(true))
      return true
    } catch (err) {
      console.error('Failed serializing or saving data:', err)
      resolvers.forEach((res) => res(false))
      return false
    }
  }

  ipcMain.handle('save-forza-data', (_, data) => {
    pendingSaveData = data
    return new Promise<boolean>((resolve) => {
      pendingResolvers.push(resolve)
      if (saveTimeout) clearTimeout(saveTimeout)
      saveTimeout = setTimeout(flushSave, 250)
    })
  })

  app.on('before-quit', () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
      flushSave()
    }
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

    const savePaths = [
      userDataPath,
      join(__dirname, '../../FH6Cars.json'),
      join(__dirname, '../../src/renderer/src/assets/FH6Cars.json'),
      join(process.cwd(), 'FH6Cars.json')
    ].filter((p) => p === userDataPath || fs.existsSync(p))

    try {
      const result = await performFullSync(localData, savePaths)
      return result
    } catch (error: any) {
      console.error('Manual Update Sync: Failed:', error)
      return {
        success: false,
        error: error.message || 'Error de conexión',
        newCars: [],
        updatedList: localData,
        source: 'none'
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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import fs from 'fs'
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

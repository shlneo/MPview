import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { registerIpcHandlers } from './ipc'
import { startRealtimeServer } from './realtime'

// Открытые окна HUD-оверлеев, по одному на каждый hudId, чтобы повторный
// клик на "Launch Overlay" не плодил дубликаты, а поднимал уже открытое окно.
const hudWindows = new Map<string, BrowserWindow>()
let mainWindowRef: BrowserWindow | null = null

function hudsRoot(): string {
  // В dev-режиме app.getAppPath() указывает на корень проекта (там же лежит src/, package.json),
  // поэтому папка huds/ рядом с ним резолвится напрямую.
  return join(app.getAppPath(), 'huds')
}

function appIconPath(): string {
  return join(app.getAppPath(), 'src/main/img/logo.png')
}

function notifyHudStatus(hudId: string, open: boolean): void {
  if (mainWindowRef && !mainWindowRef.isDestroyed()) {
    mainWindowRef.webContents.send('hud:status-changed', { hudId, open })
  }
}

function isHudOpen(hudId: string): boolean {
  const existing = hudWindows.get(hudId)
  return !!existing && !existing.isDestroyed()
}

function launchHudOverlay(hudId: string): void {
  const existing = hudWindows.get(hudId)
  if (existing && !existing.isDestroyed()) {
    existing.focus()
    return
  }

  const overlayWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    autoHideMenuBar: true,
    backgroundColor: '#00000000',
    transparent: true,
    frame: false,
    resizable: true,
    webPreferences: {
      sandbox: true
    }
  })

  overlayWindow.on('closed', () => {
    hudWindows.delete(hudId)
    notifyHudStatus(hudId, false)
  })

  hudWindows.set(hudId, overlayWindow)
  overlayWindow.loadFile(join(hudsRoot(), hudId, 'index.html'))
  notifyHudStatus(hudId, true)
}

function closeHudOverlay(hudId: string): void {
  const existing = hudWindows.get(hudId)
  if (existing && !existing.isDestroyed()) {
    existing.close()
  }
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0d0d10',
    icon: appIconPath(),
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0d0d10',
      symbolColor: '#ffffff',
      height: 36
    },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindowRef = mainWindow

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  ipcMain.handle('hud:launch', (_event, hudId: string) => {
    launchHudOverlay(hudId)
  })
  ipcMain.handle('hud:close', (_event, hudId: string) => {
    closeHudOverlay(hudId)
  })
  ipcMain.handle('hud:isOpen', (_event, hudId: string) => isHudOpen(hudId))
  registerIpcHandlers()
  startRealtimeServer()

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

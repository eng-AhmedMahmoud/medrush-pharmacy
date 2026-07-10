import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { readFile } from 'fs/promises'

const isDev = !app.isPackaged

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    title: 'MedRush Pharmacy',
    backgroundColor: '#0f172a',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      // Security: renderer runs sandboxed with no direct Node access.
      // All privileged work goes through the typed IPC bridge in preload.
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

  // Open external links in the OS browser, never inside the app window.
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  const devServerUrl = process.env['ELECTRON_RENDERER_URL']
  if (isDev && devServerUrl) {
    mainWindow.loadURL(devServerUrl)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

// ---------------------------------------------------------------------------
// IPC handlers — the only surface the renderer can use to reach the OS.
// Each handler is small, validated, and returns plain serializable data.
// ---------------------------------------------------------------------------
function registerIpc(): void {
  // App / environment info (desktop-specific: proves we run under Electron).
  ipcMain.handle('app:info', () => ({
    version: app.getVersion(),
    platform: process.platform,
    electron: process.versions.electron,
    node: process.versions.node
  }))

  // Local file import: open a native file dialog, read a CSV, hand back text.
  // The renderer never touches the filesystem directly.
  ipcMain.handle('inventory:importCsv', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const result = await dialog.showOpenDialog(win!, {
      title: 'Import inventory CSV',
      properties: ['openFile'],
      filters: [
        { name: 'CSV', extensions: ['csv'] },
        { name: 'All files', extensions: ['*'] }
      ]
    })
    if (result.canceled || result.filePaths.length === 0) return null
    const filePath = result.filePaths[0]
    const content = await readFile(filePath, 'utf-8')
    return { name: filePath.split(/[\\/]/).pop() ?? 'import.csv', content }
  })

  // Print the current view (used by the invoice/receipt screen).
  ipcMain.handle('invoice:print', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return { ok: false }
    return new Promise((resolve) => {
      win.webContents.print({ silent: false, printBackground: true }, (success) => {
        resolve({ ok: success })
      })
    })
  })
}

app.whenReady().then(() => {
  registerIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

import { contextBridge, ipcRenderer } from 'electron'

/**
 * The typed bridge exposed to the renderer as `window.api`.
 * This is the ONLY channel between the sandboxed UI and the OS.
 * Nothing here exposes ipcRenderer or Node primitives directly.
 */
const api = {
  getAppInfo: (): Promise<AppInfo> => ipcRenderer.invoke('app:info'),
  importInventoryCsv: (): Promise<CsvImportResult | null> =>
    ipcRenderer.invoke('inventory:importCsv'),
  printInvoice: (): Promise<{ ok: boolean }> => ipcRenderer.invoke('invoice:print')
}

export interface AppInfo {
  version: string
  platform: string
  electron: string
  node: string
}

export interface CsvImportResult {
  name: string
  content: string
}

export type MedRushApi = typeof api

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('api', api)
} else {
  // Fallback for the unlikely case contextIsolation is off.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).api = api
}

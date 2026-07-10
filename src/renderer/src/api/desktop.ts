import type { AppInfo, CsvImportResult } from '../../../preload'

// ---------------------------------------------------------------------------
// Desktop bridge wrapper. Prefers the Electron IPC bridge (window.api) but
// falls back to browser equivalents so the app still runs under `vite` in a
// plain browser during development. This keeps components decoupled from
// whether they run inside Electron or not.
// ---------------------------------------------------------------------------

export const isElectron = typeof window !== 'undefined' && !!window.api

export async function getAppInfo(): Promise<AppInfo> {
  if (window.api) return window.api.getAppInfo()
  return { version: 'web-dev', platform: 'browser', electron: 'n/a', node: 'n/a' }
}

/** Opens a native file dialog in Electron, or an <input type=file> in browser. */
export async function importCsv(): Promise<CsvImportResult | null> {
  if (window.api) return window.api.importInventoryCsv()

  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,text/csv'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return resolve(null)
      const reader = new FileReader()
      reader.onload = () => resolve({ name: file.name, content: String(reader.result) })
      reader.onerror = () => resolve(null)
      reader.readAsText(file)
    }
    input.click()
  })
}

/** Prints via Electron's silent-safe print pipeline, or window.print() in browser. */
export async function printCurrentView(): Promise<{ ok: boolean }> {
  if (window.api) return window.api.printInvoice()
  window.print()
  return { ok: true }
}

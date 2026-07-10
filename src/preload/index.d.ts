import type { MedRushApi } from './index'

declare global {
  interface Window {
    api: MedRushApi
  }
}

export {}

// Lightweight, dependency-free routing. A single discriminated union describes
// every screen; App holds one Route in state. This keeps navigation fully typed
// and avoids pulling in react-router for a five-screen desktop tool.

export type Route =
  | { name: 'dashboard' }
  | { name: 'inventory' }
  | { name: 'orders' }
  | { name: 'order'; id: string }
  | { name: 'invoice'; orderId: string }

export type TopLevel = 'dashboard' | 'inventory' | 'orders'

export const NAV_ITEMS: { key: TopLevel; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '▪' },
  { key: 'inventory', label: 'Inventory', icon: '▪' },
  { key: 'orders', label: 'Orders', icon: '▪' }
]

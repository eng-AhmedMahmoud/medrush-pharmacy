// ---------------------------------------------------------------------------
// Domain models. Kept in one place so every layer (mock API, hooks, UI) shares
// the same typed contract. No `any`, no data shapes invented inside JSX.
// ---------------------------------------------------------------------------

export type AvailabilityStatus = 'in-stock' | 'low-stock' | 'out-of-stock'

export interface Medicine {
  id: string
  name: string
  quantity: number
  price: number // unit price in USD
  batchNumber: string
  expiryDate: string // ISO date, e.g. '2026-09-01'
  lowStockThreshold: number
}

/** A medicine plus the derived availability status the UI renders. */
export interface MedicineWithStatus extends Medicine {
  status: AvailabilityStatus
  isExpired: boolean
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'delivered'
  | 'rejected'

export interface OrderItem {
  medicineId: string
  name: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  customerName: string
  createdAt: string // ISO datetime
  status: OrderStatus
  items: OrderItem[]
}

export interface DashboardStats {
  ordersToday: number
  pendingOrders: number
  salesToday: number
  lowStockCount: number
}

/** Payload for creating a medicine (no id yet). */
export type MedicineDraft = Omit<Medicine, 'id'>

/** The set of actions available on an order, mapped to the target status. */
export type OrderAction = 'accept' | 'reject' | 'prepare' | 'deliver'

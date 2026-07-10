import type {
  DashboardStats,
  Medicine,
  MedicineDraft,
  MedicineWithStatus,
  AvailabilityStatus,
  Order,
  OrderAction,
  OrderStatus
} from '../types'
import { seedMedicines, seedOrders } from './seed'

// ---------------------------------------------------------------------------
// In-memory mock API. Mimics an async network data layer so the UI is written
// exactly as it would be against a real backend (promises, latency, errors).
// Swapping this file for real fetch() calls would not change any component.
// ---------------------------------------------------------------------------

// Working copies so mutations don't touch the seed constants.
let medicines: Medicine[] = clone(seedMedicines)
let orders: Order[] = clone(seedOrders)

// Toggled from the UI to demonstrate the error state end-to-end.
let failureMode = false

const LATENCY_MS = 450

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (failureMode) {
        reject(new Error('MedRush API is unreachable. Check your connection and retry.'))
      } else {
        resolve(value)
      }
    }, LATENCY_MS)
  })
}

// --- derived helpers (pure, reused by UI + stats) --------------------------

export function deriveStatus(m: Medicine): AvailabilityStatus {
  if (m.quantity <= 0) return 'out-of-stock'
  if (m.quantity <= m.lowStockThreshold) return 'low-stock'
  return 'in-stock'
}

export function isExpired(m: Medicine, now = new Date()): boolean {
  return new Date(m.expiryDate).getTime() < now.getTime()
}

function withStatus(m: Medicine): MedicineWithStatus {
  return { ...m, status: deriveStatus(m), isExpired: isExpired(m) }
}

export function orderTotal(order: Order): number {
  return order.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
}

function isToday(iso: string, now = new Date()): boolean {
  const d = new Date(iso)
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

// Valid order status transitions keyed by action. Guards against illegal jumps.
const TRANSITIONS: Record<OrderAction, { from: OrderStatus[]; to: OrderStatus }> = {
  accept: { from: ['pending'], to: 'accepted' },
  reject: { from: ['pending'], to: 'rejected' },
  prepare: { from: ['accepted'], to: 'preparing' },
  deliver: { from: ['preparing', 'accepted'], to: 'delivered' }
}

// --- public API ------------------------------------------------------------

export const mockApi = {
  setFailureMode(on: boolean): void {
    failureMode = on
  },

  isFailureMode(): boolean {
    return failureMode
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const ordersToday = orders.filter((o) => isToday(o.createdAt)).length
    const pendingOrders = orders.filter((o) => o.status === 'pending').length
    const salesToday = orders
      .filter((o) => isToday(o.createdAt) && o.status === 'delivered')
      .reduce((sum, o) => sum + orderTotal(o), 0)
    const lowStockCount = medicines.filter(
      (m) => deriveStatus(m) !== 'in-stock'
    ).length
    return delay({ ordersToday, pendingOrders, salesToday, lowStockCount })
  },

  async listInventory(): Promise<MedicineWithStatus[]> {
    return delay(medicines.map(withStatus))
  },

  async createMedicine(draft: MedicineDraft): Promise<MedicineWithStatus> {
    const created: Medicine = { ...draft, id: `m-${Date.now()}` }
    medicines = [created, ...medicines]
    return delay(withStatus(created))
  },

  async updateMedicine(
    id: string,
    patch: Partial<MedicineDraft>
  ): Promise<MedicineWithStatus> {
    const idx = medicines.findIndex((m) => m.id === id)
    if (idx === -1) throw new Error(`Medicine ${id} not found`)
    medicines[idx] = { ...medicines[idx], ...patch }
    return delay(withStatus(medicines[idx]))
  },

  async deleteMedicine(id: string): Promise<{ id: string }> {
    medicines = medicines.filter((m) => m.id !== id)
    return delay({ id })
  },

  /** Bulk insert used by the CSV import preview flow. */
  async importMedicines(drafts: MedicineDraft[]): Promise<MedicineWithStatus[]> {
    const created = drafts.map((d, i) => ({ ...d, id: `m-${Date.now()}-${i}` }))
    medicines = [...created, ...medicines]
    return delay(created.map(withStatus))
  },

  async listOrders(): Promise<Order[]> {
    return delay(clone(orders))
  },

  async getOrder(id: string): Promise<Order> {
    const order = orders.find((o) => o.id === id)
    if (!order) throw new Error(`Order ${id} not found`)
    return delay(clone(order))
  },

  async applyOrderAction(id: string, action: OrderAction): Promise<Order> {
    const idx = orders.findIndex((o) => o.id === id)
    if (idx === -1) throw new Error(`Order ${id} not found`)
    const rule = TRANSITIONS[action]
    const current = orders[idx].status
    if (!rule.from.includes(current)) {
      throw new Error(`Cannot "${action}" an order that is "${current}".`)
    }
    orders[idx] = { ...orders[idx], status: rule.to }
    return delay(clone(orders[idx]))
  }
}

/** Reset store to seed — handy for tests/demos. */
export function __resetMockData(): void {
  medicines = clone(seedMedicines)
  orders = clone(seedOrders)
  failureMode = false
}

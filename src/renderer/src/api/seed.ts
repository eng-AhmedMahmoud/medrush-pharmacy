import type { Medicine, Order } from '../types'

// Seed data lives here, NOT inside JSX. The mock API clones from these on init.
// All values are fictional — no real patient, prescription, or credential data.

export const seedMedicines: Medicine[] = [
  { id: 'm-1001', name: 'Paracetamol 500mg', quantity: 240, price: 2.5, batchNumber: 'PCM-2405', expiryDate: '2027-03-01', lowStockThreshold: 50 },
  { id: 'm-1002', name: 'Amoxicillin 250mg', quantity: 18, price: 6.9, batchNumber: 'AMX-2401', expiryDate: '2026-11-15', lowStockThreshold: 40 },
  { id: 'm-1003', name: 'Ibuprofen 400mg', quantity: 130, price: 3.2, batchNumber: 'IBU-2312', expiryDate: '2026-08-20', lowStockThreshold: 60 },
  { id: 'm-1004', name: 'Cetirizine 10mg', quantity: 8, price: 4.1, batchNumber: 'CTZ-2404', expiryDate: '2027-01-10', lowStockThreshold: 30 },
  { id: 'm-1005', name: 'Omeprazole 20mg', quantity: 75, price: 5.5, batchNumber: 'OMP-2402', expiryDate: '2026-12-05', lowStockThreshold: 45 },
  { id: 'm-1006', name: 'Metformin 500mg', quantity: 0, price: 3.8, batchNumber: 'MET-2311', expiryDate: '2026-09-30', lowStockThreshold: 50 },
  { id: 'm-1007', name: 'Salbutamol Inhaler', quantity: 22, price: 12.0, batchNumber: 'SAL-2403', expiryDate: '2026-07-01', lowStockThreshold: 25 },
  { id: 'm-1008', name: 'Vitamin C 1000mg', quantity: 310, price: 8.0, batchNumber: 'VTC-2406', expiryDate: '2028-02-01', lowStockThreshold: 80 }
]

export const seedOrders: Order[] = [
  {
    id: 'ORD-5001',
    customerName: 'Layla Hassan',
    createdAt: isoTodayAt(9, 12),
    status: 'pending',
    items: [
      { medicineId: 'm-1001', name: 'Paracetamol 500mg', quantity: 2, unitPrice: 2.5 },
      { medicineId: 'm-1003', name: 'Ibuprofen 400mg', quantity: 1, unitPrice: 3.2 }
    ]
  },
  {
    id: 'ORD-5002',
    customerName: 'Omar Farouk',
    createdAt: isoTodayAt(10, 3),
    status: 'pending',
    items: [{ medicineId: 'm-1007', name: 'Salbutamol Inhaler', quantity: 1, unitPrice: 12.0 }]
  },
  {
    id: 'ORD-5003',
    customerName: 'Nadia Kamal',
    createdAt: isoTodayAt(11, 45),
    status: 'accepted',
    items: [
      { medicineId: 'm-1005', name: 'Omeprazole 20mg', quantity: 3, unitPrice: 5.5 },
      { medicineId: 'm-1008', name: 'Vitamin C 1000mg', quantity: 2, unitPrice: 8.0 }
    ]
  },
  {
    id: 'ORD-5004',
    customerName: 'Youssef Adel',
    createdAt: isoTodayAt(8, 30),
    status: 'delivered',
    items: [{ medicineId: 'm-1002', name: 'Amoxicillin 250mg', quantity: 1, unitPrice: 6.9 }]
  },
  {
    id: 'ORD-5005',
    customerName: 'Mariam Saleh',
    createdAt: isoYesterdayAt(16, 20),
    status: 'delivered',
    items: [{ medicineId: 'm-1004', name: 'Cetirizine 10mg', quantity: 4, unitPrice: 4.1 }]
  }
]

// Build ISO datetimes relative to "now" so "orders today" stats stay meaningful
// whenever the app is launched. Kept as helpers rather than hardcoded strings.
function isoTodayAt(hours: number, minutes: number): string {
  const d = new Date()
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

function isoYesterdayAt(hours: number, minutes: number): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

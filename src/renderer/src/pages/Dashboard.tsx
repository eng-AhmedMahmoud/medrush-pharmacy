import { useCallback } from 'react'
import { mockApi } from '../api/mockApi'
import { useAsync } from '../hooks/useAsync'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import { DataTable, type Column } from '../components/DataTable'
import { LoadingState, ErrorState } from '../components/StateViews'
import { formatCurrency, formatDateTime } from '../utils/format'
import type { MedicineWithStatus, Order } from '../types'

interface DashboardData {
  stats: Awaited<ReturnType<typeof mockApi.getDashboardStats>>
  lowStock: MedicineWithStatus[]
  pending: Order[]
}

interface Props {
  onOpenOrder: (id: string) => void
}

export function Dashboard({ onOpenOrder }: Props): JSX.Element {
  const load = useCallback(async (): Promise<DashboardData> => {
    const [stats, inventory, orders] = await Promise.all([
      mockApi.getDashboardStats(),
      mockApi.listInventory(),
      mockApi.listOrders()
    ])
    return {
      stats,
      lowStock: inventory.filter((m) => m.status !== 'in-stock'),
      pending: orders.filter((o) => o.status === 'pending')
    }
  }, [])

  const { data, loading, error, reload } = useAsync(load, [])

  if (loading) return <LoadingState label="Loading dashboard…" />
  if (error) return <ErrorState message={error} onRetry={reload} />
  if (!data) return <ErrorState message="No data" onRetry={reload} />

  const { stats, lowStock, pending } = data

  const lowStockCols: Column<MedicineWithStatus>[] = [
    { key: 'name', header: 'Medicine', render: (m) => m.name },
    { key: 'qty', header: 'Qty', align: 'right', render: (m) => m.quantity },
    { key: 'threshold', header: 'Threshold', align: 'right', render: (m) => m.lowStockThreshold },
    { key: 'status', header: 'Status', render: (m) => <StatusBadge kind="availability" status={m.status} /> }
  ]

  const pendingCols: Column<Order>[] = [
    { key: 'id', header: 'Order', render: (o) => o.id },
    { key: 'customer', header: 'Customer', render: (o) => o.customerName },
    { key: 'time', header: 'Received', render: (o) => formatDateTime(o.createdAt) },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge kind="order" status={o.status} /> }
  ]

  return (
    <div className="page">
      <section className="cards-grid">
        <StatCard label="Orders today" value={String(stats.ordersToday)} icon="🧾" />
        <StatCard
          label="Pending orders"
          value={String(stats.pendingOrders)}
          tone={stats.pendingOrders > 0 ? 'warn' : 'default'}
          icon="⏳"
        />
        <StatCard label="Sales today" value={formatCurrency(stats.salesToday)} tone="good" icon="💵" />
        <StatCard
          label="Low-stock items"
          value={String(stats.lowStockCount)}
          tone={stats.lowStockCount > 0 ? 'warn' : 'default'}
          icon="📦"
        />
      </section>

      <div className="two-col">
        <section className="panel">
          <div className="panel__head">
            <h3>Low-stock alerts</h3>
            <span className="panel__count">{lowStock.length}</span>
          </div>
          <DataTable
            columns={lowStockCols}
            rows={lowStock}
            rowKey={(m) => m.id}
            rowClassName={(m) => (m.status !== 'in-stock' ? 'row--low' : undefined)}
            emptyLabel="All items above threshold"
            emptyHint="Stock levels look healthy."
          />
        </section>

        <section className="panel">
          <div className="panel__head">
            <h3>Pending orders</h3>
            <span className="panel__count">{pending.length}</span>
          </div>
          <DataTable
            columns={pendingCols}
            rows={pending}
            rowKey={(o) => o.id}
            onRowClick={(o) => onOpenOrder(o.id)}
            emptyLabel="No pending orders"
            emptyHint="Everything is handled. 🎉"
          />
        </section>
      </div>
    </div>
  )
}

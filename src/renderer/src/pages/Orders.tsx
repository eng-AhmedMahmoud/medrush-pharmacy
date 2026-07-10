import { useCallback, useMemo, useState } from 'react'
import { mockApi, orderTotal } from '../api/mockApi'
import { useAsync } from '../hooks/useAsync'
import { DataTable, type Column } from '../components/DataTable'
import { StatusBadge } from '../components/StatusBadge'
import { formatCurrency, formatDateTime } from '../utils/format'
import type { Order, OrderStatus } from '../types'

interface Props {
  onOpenOrder: (id: string) => void
}

const FILTERS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'rejected', label: 'Rejected' }
]

export function Orders({ onOpenOrder }: Props): JSX.Element {
  const load = useCallback(() => mockApi.listOrders(), [])
  const { data, loading, error, reload } = useAsync(load, [])
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')

  const rows = useMemo(() => {
    const list = data ?? []
    return filter === 'all' ? list : list.filter((o) => o.status === filter)
  }, [data, filter])

  const columns: Column<Order>[] = [
    { key: 'id', header: 'Order', render: (o) => <strong>{o.id}</strong> },
    { key: 'customer', header: 'Customer', render: (o) => o.customerName },
    { key: 'items', header: 'Items', align: 'right', render: (o) => o.items.length },
    { key: 'total', header: 'Total', align: 'right', render: (o) => formatCurrency(orderTotal(o)) },
    { key: 'time', header: 'Received', render: (o) => formatDateTime(o.createdAt) },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge kind="order" status={o.status} /> }
  ]

  return (
    <div className="page">
      <div className="tabs">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`tab ${filter === f.key ? 'is-active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {data && (
              <span className="tab__count">
                {f.key === 'all' ? data.length : data.filter((o) => o.status === f.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(o) => o.id}
        loading={loading}
        error={error}
        onRetry={reload}
        onRowClick={(o) => onOpenOrder(o.id)}
        emptyLabel="No orders in this view"
        emptyHint="Try a different status filter."
      />
    </div>
  )
}

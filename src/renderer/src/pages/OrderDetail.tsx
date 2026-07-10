import { useCallback, useState } from 'react'
import { mockApi, orderTotal } from '../api/mockApi'
import { useAsync } from '../hooks/useAsync'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingState, ErrorState } from '../components/StateViews'
import { formatCurrency, formatDateTime } from '../utils/format'
import type { OrderAction, OrderStatus } from '../types'

interface Props {
  orderId: string
  onBack: () => void
  onViewInvoice: (orderId: string) => void
}

const ACTION_LABELS: Record<OrderAction, string> = {
  accept: 'Accept',
  reject: 'Reject',
  prepare: 'Mark Preparing',
  deliver: 'Mark Delivered'
}

// Which actions are offered for each status (mirrors the API's transition rules).
const AVAILABLE: Record<OrderStatus, OrderAction[]> = {
  pending: ['accept', 'reject'],
  accepted: ['prepare', 'deliver'],
  preparing: ['deliver'],
  delivered: [],
  rejected: []
}

export function OrderDetail({ orderId, onBack, onViewInvoice }: Props): JSX.Element {
  const load = useCallback(() => mockApi.getOrder(orderId), [orderId])
  const { data, loading, error, reload, setData } = useAsync(load, [orderId])
  const [busy, setBusy] = useState<OrderAction | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function run(action: OrderAction): Promise<void> {
    setBusy(action)
    setActionError(null)
    try {
      const updated = await mockApi.applyOrderAction(orderId, action)
      setData(() => updated)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Action failed')
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <LoadingState label="Loading order…" />
  if (error) return <ErrorState message={error} onRetry={reload} />
  if (!data) return <ErrorState message="Order not found" onRetry={reload} />

  const actions = AVAILABLE[data.status]
  const isTerminal = data.status === 'delivered' || data.status === 'rejected'

  return (
    <div className="page">
      <button className="link-btn" onClick={onBack}>
        ← Back to orders
      </button>

      <div className="detail-head">
        <div>
          <h2>{data.id}</h2>
          <p className="muted">
            {data.customerName} · {formatDateTime(data.createdAt)}
          </p>
        </div>
        <StatusBadge kind="order" status={data.status} />
      </div>

      {actionError && (
        <div className="banner banner--error" role="alert">
          {actionError}
          <button className="icon-btn" onClick={() => setActionError(null)} aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}

      <div className="panel">
        <div className="panel__head">
          <h3>Items</h3>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th style={{ textAlign: 'right' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Unit price</th>
                <th style={{ textAlign: 'right' }}>Line total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((it) => (
                <tr key={it.medicineId}>
                  <td>{it.name}</td>
                  <td style={{ textAlign: 'right' }}>{it.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(it.unitPrice)}</td>
                  <td style={{ textAlign: 'right' }}>
                    {formatCurrency(it.unitPrice * it.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>
                  Total
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>
                  {formatCurrency(orderTotal(data))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="action-bar">
        <div className="action-bar__left">
          {actions.map((a) => (
            <button
              key={a}
              className={`btn ${a === 'reject' ? 'btn--danger' : 'btn--primary'}`}
              disabled={busy !== null}
              onClick={() => run(a)}
            >
              {busy === a ? 'Working…' : ACTION_LABELS[a]}
            </button>
          ))}
          {isTerminal && <span className="muted">No further actions — order is {data.status}.</span>}
        </div>
        <button className="btn" onClick={() => onViewInvoice(data.id)}>
          🧾 View invoice
        </button>
      </div>
    </div>
  )
}

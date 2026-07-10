import { useCallback, useState } from 'react'
import { mockApi, orderTotal } from '../api/mockApi'
import { printCurrentView, isElectron } from '../api/desktop'
import { useAsync } from '../hooks/useAsync'
import { LoadingState, ErrorState } from '../components/StateViews'
import { formatCurrency, formatDateTime } from '../utils/format'
import type { Order } from '../types'

interface Props {
  orderId: string
  onBack: () => void
}

const TAX_RATE = 0.05

export function Invoice({ orderId, onBack }: Props): JSX.Element {
  const load = useCallback(() => mockApi.getOrder(orderId), [orderId])
  const { data, loading, error, reload } = useAsync(load, [orderId])
  const [printing, setPrinting] = useState(false)

  async function handlePrint(): Promise<void> {
    setPrinting(true)
    try {
      await printCurrentView()
    } finally {
      setPrinting(false)
    }
  }

  // Download placeholder: emit a plain-text receipt via a blob download.
  function handleDownload(order: Order): void {
    const lines = [
      'MedRush Pharmacy — Receipt',
      `Invoice: INV-${order.id}`,
      `Customer: ${order.customerName}`,
      `Date: ${formatDateTime(order.createdAt)}`,
      '',
      ...order.items.map(
        (i) => `${i.quantity} x ${i.name} @ ${i.unitPrice.toFixed(2)} = ${(i.quantity * i.unitPrice).toFixed(2)}`
      ),
      '',
      `Subtotal: ${orderTotal(order).toFixed(2)}`,
      `Tax (5%): ${(orderTotal(order) * TAX_RATE).toFixed(2)}`,
      `Total: ${(orderTotal(order) * (1 + TAX_RATE)).toFixed(2)}`
    ].join('\n')
    const blob = new Blob([lines], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `INV-${order.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <LoadingState label="Loading invoice…" />
  if (error) return <ErrorState message={error} onRetry={reload} />
  if (!data) return <ErrorState message="Order not found" onRetry={reload} />

  const subtotal = orderTotal(data)
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  return (
    <div className="page">
      <div className="no-print">
        <button className="link-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="action-bar">
          <div className="action-bar__left">
            <button className="btn btn--primary" onClick={handlePrint} disabled={printing}>
              {printing ? 'Opening print…' : '🖨 Print'}
            </button>
            <button className="btn" onClick={() => handleDownload(data)}>
              ⬇ Download (.txt)
            </button>
          </div>
          <span className="muted">
            {isElectron ? 'Prints via Electron' : 'Prints via browser dialog'} · download is a placeholder
          </span>
        </div>
      </div>

      <div className="invoice-sheet" id="invoice-sheet">
        <header className="invoice-sheet__head">
          <div>
            <div className="invoice-sheet__brand">MedRush Pharmacy</div>
            <div className="muted">123 Health St · Cairo · +20 100 000 0000</div>
          </div>
          <div className="invoice-sheet__meta">
            <div>
              <strong>INV-{data.id}</strong>
            </div>
            <div className="muted">{formatDateTime(data.createdAt)}</div>
          </div>
        </header>

        <div className="invoice-sheet__bill">
          <span className="muted">Billed to</span>
          <strong>{data.customerName}</strong>
        </div>

        <table className="data-table invoice-sheet__table">
          <thead>
            <tr>
              <th>Item</th>
              <th style={{ textAlign: 'right' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Unit</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((it) => (
              <tr key={it.medicineId}>
                <td>{it.name}</td>
                <td style={{ textAlign: 'right' }}>{it.quantity}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(it.unitPrice)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(it.unitPrice * it.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-sheet__totals">
          <div>
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div>
            <span>Tax (5%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="invoice-sheet__grand">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <footer className="invoice-sheet__foot muted">
          Thank you for choosing MedRush. This is a demo receipt — not a real transaction.
        </footer>
      </div>
    </div>
  )
}

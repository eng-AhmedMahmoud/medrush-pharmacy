// Shared formatting helpers so currency/date rendering stays consistent.

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

export function formatCurrency(value: number): string {
  return currency.format(value)
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/** Days until expiry; negative means already expired. */
export function daysUntil(iso: string, now = new Date()): number {
  const ms = new Date(iso).getTime() - now.getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

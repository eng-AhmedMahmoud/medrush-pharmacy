import type { AvailabilityStatus, OrderStatus } from '../types'

type Tone = 'green' | 'amber' | 'red' | 'blue' | 'gray'

const AVAILABILITY: Record<AvailabilityStatus, { label: string; tone: Tone }> = {
  'in-stock': { label: 'In stock', tone: 'green' },
  'low-stock': { label: 'Low stock', tone: 'amber' },
  'out-of-stock': { label: 'Out of stock', tone: 'red' }
}

const ORDER: Record<OrderStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Pending', tone: 'amber' },
  accepted: { label: 'Accepted', tone: 'blue' },
  preparing: { label: 'Preparing', tone: 'blue' },
  delivered: { label: 'Delivered', tone: 'green' },
  rejected: { label: 'Rejected', tone: 'red' }
}

interface Props {
  kind: 'availability' | 'order'
  status: AvailabilityStatus | OrderStatus
}

/** Reusable pill used for both inventory availability and order status. */
export function StatusBadge({ kind, status }: Props): JSX.Element {
  const config =
    kind === 'availability'
      ? AVAILABILITY[status as AvailabilityStatus]
      : ORDER[status as OrderStatus]
  return <span className={`badge badge--${config.tone}`}>{config.label}</span>
}

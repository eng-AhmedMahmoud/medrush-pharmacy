import type { ReactNode } from 'react'
import { EmptyState, ErrorState, LoadingState } from './StateViews'

export interface Column<T> {
  key: string
  header: string
  /** Cell renderer. Receives the row; return any ReactNode. */
  render: (row: T) => ReactNode
  align?: 'left' | 'right' | 'center'
  width?: string
}

interface Props<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyLabel?: string
  emptyHint?: string
  /** Optional per-row class (e.g. low-stock highlight). */
  rowClassName?: (row: T) => string | undefined
  onRowClick?: (row: T) => void
}

/**
 * Reusable, typed table that also owns the loading / error / empty states so
 * every screen renders them the same way. Generic over the row type <T>.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  error,
  onRetry,
  emptyLabel = 'Nothing here yet',
  emptyHint,
  rowClassName,
  onRowClick
}: Props<T>): JSX.Element {
  if (loading) return <LoadingState label="Loading…" />
  if (error) return <ErrorState message={error} onRetry={onRetry} />
  if (rows.length === 0) return <EmptyState title={emptyLabel} hint={emptyHint} />

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{ textAlign: c.align ?? 'left', width: c.width }}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className={rowClassName?.(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === 'Enter') onRowClick(row)
                    }
                  : undefined
              }
              style={onRowClick ? { cursor: 'pointer' } : undefined}
            >
              {columns.map((c) => (
                <td key={c.key} style={{ textAlign: c.align ?? 'left' }}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

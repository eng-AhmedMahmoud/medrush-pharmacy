import type { CsvParseResult } from '../api/csv'

interface Props {
  fileName: string
  result: CsvParseResult
  importing?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Preview table for CSV inventory import: shows valid vs invalid rows before commit. */
export function CsvPreview({ fileName, result, importing, onConfirm, onCancel }: Props): JSX.Element {
  return (
    <div className="csv-preview">
      <p className="csv-preview__meta">
        <strong>{fileName}</strong> · {result.validCount} valid ·{' '}
        <span className={result.errorCount > 0 ? 'text-danger' : ''}>
          {result.errorCount} skipped
        </span>
      </p>

      <div className="table-wrap table-wrap--scroll">
        <table className="data-table data-table--compact">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th style={{ textAlign: 'right' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Price</th>
              <th>Batch</th>
              <th>Expiry</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((r) => (
              <tr key={r.row} className={r.error ? 'row--invalid' : undefined}>
                <td>{r.row}</td>
                <td>{r.draft?.name ?? '—'}</td>
                <td style={{ textAlign: 'right' }}>{r.draft?.quantity ?? '—'}</td>
                <td style={{ textAlign: 'right' }}>{r.draft ? r.draft.price.toFixed(2) : '—'}</td>
                <td>{r.draft?.batchNumber ?? '—'}</td>
                <td>{r.draft?.expiryDate ?? '—'}</td>
                <td>
                  {r.error ? (
                    <span className="text-danger">{r.error}</span>
                  ) : (
                    <span className="text-success">OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="form__actions">
        <button type="button" className="btn" onClick={onCancel} disabled={importing}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={onConfirm}
          disabled={importing || result.validCount === 0}
        >
          {importing ? 'Importing…' : `Import ${result.validCount} item(s)`}
        </button>
      </div>
    </div>
  )
}

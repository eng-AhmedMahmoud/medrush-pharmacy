import { useCallback, useMemo, useState } from 'react'
import { mockApi } from '../api/mockApi'
import { importCsv } from '../api/desktop'
import { parseInventoryCsv, type CsvParseResult } from '../api/csv'
import { useAsync } from '../hooks/useAsync'
import { DataTable, type Column } from '../components/DataTable'
import { StatusBadge } from '../components/StatusBadge'
import { Modal } from '../components/Modal'
import { InventoryForm } from '../components/InventoryForm'
import { CsvPreview } from '../components/CsvPreview'
import { formatCurrency, formatDate, daysUntil } from '../utils/format'
import type { MedicineDraft, MedicineWithStatus } from '../types'

type FormModal =
  | { mode: 'closed' }
  | { mode: 'add' }
  | { mode: 'edit'; medicine: MedicineWithStatus }

interface CsvModalState {
  fileName: string
  result: CsvParseResult
}

export function Inventory(): JSX.Element {
  const load = useCallback(() => mockApi.listInventory(), [])
  const { data, loading, error, reload, setData } = useAsync(load, [])

  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<FormModal>({ mode: 'closed' })
  const [csv, setCsv] = useState<CsvModalState | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const rows = useMemo(() => {
    const list = data ?? []
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (m) => m.name.toLowerCase().includes(q) || m.batchNumber.toLowerCase().includes(q)
    )
  }, [data, search])

  async function handleCreate(draft: MedicineDraft): Promise<void> {
    setBusy(true)
    setActionError(null)
    try {
      const created = await mockApi.createMedicine(draft)
      setData((prev) => [created, ...(prev ?? [])])
      setModal({ mode: 'closed' })
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to add medicine')
    } finally {
      setBusy(false)
    }
  }

  async function handleEdit(id: string, draft: MedicineDraft): Promise<void> {
    setBusy(true)
    setActionError(null)
    try {
      const updated = await mockApi.updateMedicine(id, draft)
      setData((prev) => (prev ?? []).map((m) => (m.id === id ? updated : m)))
      setModal({ mode: 'closed' })
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to update medicine')
    } finally {
      setBusy(false)
    }
  }

  async function handleImportClick(): Promise<void> {
    setActionError(null)
    try {
      const file = await importCsv()
      if (!file) return
      setCsv({ fileName: file.name, result: parseInventoryCsv(file.content) })
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not read file')
    }
  }

  async function handleConfirmImport(): Promise<void> {
    if (!csv) return
    setBusy(true)
    try {
      const drafts = csv.result.rows
        .map((r) => r.draft)
        .filter((d): d is MedicineDraft => d !== null)
      const created = await mockApi.importMedicines(drafts)
      setData((prev) => [...created, ...(prev ?? [])])
      setCsv(null)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Import failed')
    } finally {
      setBusy(false)
    }
  }

  const columns: Column<MedicineWithStatus>[] = [
    { key: 'name', header: 'Medicine', render: (m) => <strong>{m.name}</strong> },
    { key: 'qty', header: 'Qty', align: 'right', render: (m) => m.quantity },
    { key: 'price', header: 'Price', align: 'right', render: (m) => formatCurrency(m.price) },
    { key: 'batch', header: 'Batch', render: (m) => m.batchNumber },
    {
      key: 'expiry',
      header: 'Expiry',
      render: (m) => {
        const days = daysUntil(m.expiryDate)
        return (
          <span className={m.isExpired ? 'text-danger' : days <= 60 ? 'text-warn' : ''}>
            {formatDate(m.expiryDate)}
            {m.isExpired ? ' · expired' : days <= 60 ? ` · ${days}d` : ''}
          </span>
        )
      }
    },
    { key: 'status', header: 'Status', render: (m) => <StatusBadge kind="availability" status={m.status} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (m) => (
        <button className="btn btn--sm" onClick={() => setModal({ mode: 'edit', medicine: m })}>
          Edit
        </button>
      )
    }
  ]

  return (
    <div className="page">
      <div className="toolbar">
        <input
          className="search"
          type="search"
          placeholder="Search by name or batch…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="toolbar__actions">
          <button className="btn" onClick={handleImportClick}>
            ⇪ Import CSV
          </button>
          <button className="btn btn--primary" onClick={() => setModal({ mode: 'add' })}>
            + Add medicine
          </button>
        </div>
      </div>

      {actionError && (
        <div className="banner banner--error" role="alert">
          {actionError}
          <button className="icon-btn" onClick={() => setActionError(null)} aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(m) => m.id}
        loading={loading}
        error={error}
        onRetry={reload}
        rowClassName={(m) => (m.status !== 'in-stock' ? 'row--low' : undefined)}
        emptyLabel={search ? 'No matches' : 'No inventory yet'}
        emptyHint={search ? 'Try a different search term.' : 'Add your first medicine to get started.'}
      />

      <Modal
        open={modal.mode !== 'closed'}
        title={modal.mode === 'edit' ? 'Edit medicine' : 'Add medicine'}
        onClose={() => setModal({ mode: 'closed' })}
      >
        {modal.mode !== 'closed' && (
          <InventoryForm
            initial={modal.mode === 'edit' ? modal.medicine : undefined}
            submitting={busy}
            onSubmit={(draft) =>
              modal.mode === 'edit' ? handleEdit(modal.medicine.id, draft) : handleCreate(draft)
            }
            onCancel={() => setModal({ mode: 'closed' })}
          />
        )}
      </Modal>

      <Modal
        open={csv !== null}
        title="CSV import preview"
        width={720}
        onClose={() => setCsv(null)}
      >
        {csv && (
          <CsvPreview
            fileName={csv.fileName}
            result={csv.result}
            importing={busy}
            onConfirm={handleConfirmImport}
            onCancel={() => setCsv(null)}
          />
        )}
      </Modal>
    </div>
  )
}

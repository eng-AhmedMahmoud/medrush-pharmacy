import { useState, type FormEvent } from 'react'
import type { MedicineDraft, MedicineWithStatus } from '../types'

interface Props {
  initial?: MedicineWithStatus
  submitting?: boolean
  onSubmit: (draft: MedicineDraft) => void
  onCancel: () => void
}

type Errors = Partial<Record<keyof MedicineDraft, string>>

const emptyDraft: MedicineDraft = {
  name: '',
  quantity: 0,
  price: 0,
  batchNumber: '',
  expiryDate: '',
  lowStockThreshold: 10
}

function validate(d: MedicineDraft): Errors {
  const e: Errors = {}
  if (!d.name.trim()) e.name = 'Name is required'
  if (!Number.isFinite(d.quantity) || d.quantity < 0) e.quantity = 'Must be 0 or more'
  if (!Number.isFinite(d.price) || d.price < 0) e.price = 'Must be 0 or more'
  if (!d.batchNumber.trim()) e.batchNumber = 'Batch number is required'
  if (!d.expiryDate || Number.isNaN(new Date(d.expiryDate).getTime()))
    e.expiryDate = 'Valid date required'
  if (!Number.isFinite(d.lowStockThreshold) || d.lowStockThreshold < 0)
    e.lowStockThreshold = 'Must be 0 or more'
  return e
}

/** Controlled, validated form reused for both Add and Edit inventory flows. */
export function InventoryForm({ initial, submitting, onSubmit, onCancel }: Props): JSX.Element {
  const [draft, setDraft] = useState<MedicineDraft>(
    initial
      ? {
          name: initial.name,
          quantity: initial.quantity,
          price: initial.price,
          batchNumber: initial.batchNumber,
          expiryDate: initial.expiryDate,
          lowStockThreshold: initial.lowStockThreshold
        }
      : emptyDraft
  )
  const [errors, setErrors] = useState<Errors>({})

  function update<K extends keyof MedicineDraft>(key: K, value: MedicineDraft[K]): void {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function handleSubmit(e: FormEvent): void {
    e.preventDefault()
    const found = validate(draft)
    setErrors(found)
    if (Object.keys(found).length === 0) onSubmit({ ...draft, name: draft.name.trim() })
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="name">Medicine name</label>
        <input
          id="name"
          value={draft.name}
          autoFocus
          onChange={(e) => update('name', e.target.value)}
          placeholder="e.g. Paracetamol 500mg"
        />
        {errors.name && <span className="field__error">{errors.name}</span>}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="quantity">Quantity</label>
          <input
            id="quantity"
            type="number"
            min={0}
            value={draft.quantity}
            onChange={(e) => update('quantity', Number(e.target.value))}
          />
          {errors.quantity && <span className="field__error">{errors.quantity}</span>}
        </div>
        <div className="field">
          <label htmlFor="price">Unit price (USD)</label>
          <input
            id="price"
            type="number"
            min={0}
            step="0.01"
            value={draft.price}
            onChange={(e) => update('price', Number(e.target.value))}
          />
          {errors.price && <span className="field__error">{errors.price}</span>}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="batch">Batch number</label>
          <input
            id="batch"
            value={draft.batchNumber}
            onChange={(e) => update('batchNumber', e.target.value)}
            placeholder="e.g. PCM-2405"
          />
          {errors.batchNumber && <span className="field__error">{errors.batchNumber}</span>}
        </div>
        <div className="field">
          <label htmlFor="expiry">Expiry date</label>
          <input
            id="expiry"
            type="date"
            value={draft.expiryDate}
            onChange={(e) => update('expiryDate', e.target.value)}
          />
          {errors.expiryDate && <span className="field__error">{errors.expiryDate}</span>}
        </div>
      </div>

      <div className="field">
        <label htmlFor="threshold">Low-stock threshold</label>
        <input
          id="threshold"
          type="number"
          min={0}
          value={draft.lowStockThreshold}
          onChange={(e) => update('lowStockThreshold', Number(e.target.value))}
        />
        <span className="field__hint">Rows at or below this quantity are flagged low-stock.</span>
        {errors.lowStockThreshold && (
          <span className="field__error">{errors.lowStockThreshold}</span>
        )}
      </div>

      <div className="form__actions">
        <button type="button" className="btn" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add medicine'}
        </button>
      </div>
    </form>
  )
}

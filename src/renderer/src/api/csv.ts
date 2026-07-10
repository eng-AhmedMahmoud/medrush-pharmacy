import type { MedicineDraft } from '../types'

export interface ParsedCsvRow {
  row: number
  draft: MedicineDraft | null
  error: string | null
}

export interface CsvParseResult {
  rows: ParsedCsvRow[]
  validCount: number
  errorCount: number
}

const EXPECTED = ['name', 'quantity', 'price', 'batchnumber', 'expirydate', 'lowstockthreshold']

/**
 * Minimal, dependency-free CSV parser tuned to the inventory shape.
 * Header (case-insensitive): name,quantity,price,batchNumber,expiryDate,lowStockThreshold
 * Returns per-row results so the preview modal can show valid vs invalid rows.
 */
export function parseInventoryCsv(text: string): CsvParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  const rows: ParsedCsvRow[] = []
  if (lines.length === 0) {
    return { rows, validCount: 0, errorCount: 0 }
  }

  const header = splitLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, ''))
  const hasHeader = EXPECTED.every((col) => header.includes(col))
  const startIndex = hasHeader ? 1 : 0
  const cols = hasHeader ? header : EXPECTED

  for (let i = startIndex; i < lines.length; i++) {
    const cells = splitLine(lines[i])
    const record: Record<string, string> = {}
    cols.forEach((c, idx) => (record[c] = (cells[idx] ?? '').trim()))

    const parsed = toDraft(record)
    rows.push({
      row: i + 1,
      draft: parsed.error ? null : parsed.draft,
      error: parsed.error
    })
  }

  const validCount = rows.filter((r) => r.draft).length
  return { rows, validCount, errorCount: rows.length - validCount }
}

function toDraft(r: Record<string, string>): { draft: MedicineDraft; error: string | null } {
  const empty: MedicineDraft = {
    name: '',
    quantity: 0,
    price: 0,
    batchNumber: '',
    expiryDate: '',
    lowStockThreshold: 0
  }

  const name = r['name']
  const quantity = Number(r['quantity'])
  const price = Number(r['price'])
  const batchNumber = r['batchnumber']
  const expiryDate = r['expirydate']
  const lowStockThreshold = Number(r['lowstockthreshold'])

  if (!name) return { draft: empty, error: 'Missing medicine name' }
  if (!Number.isFinite(quantity) || quantity < 0)
    return { draft: empty, error: 'Invalid quantity' }
  if (!Number.isFinite(price) || price < 0) return { draft: empty, error: 'Invalid price' }
  if (!batchNumber) return { draft: empty, error: 'Missing batch number' }
  if (!expiryDate || Number.isNaN(new Date(expiryDate).getTime()))
    return { draft: empty, error: 'Invalid expiry date' }
  if (!Number.isFinite(lowStockThreshold) || lowStockThreshold < 0)
    return { draft: empty, error: 'Invalid low-stock threshold' }

  return {
    draft: { name, quantity, price, batchNumber, expiryDate, lowStockThreshold },
    error: null
  }
}

function splitLine(line: string): string[] {
  // Handles simple quoted fields containing commas.
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out
}

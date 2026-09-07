import { Router } from 'express'

const router = Router()

function normaliseRow(row) {
  const keys = Object.keys(row).map(k => k.toLowerCase().trim())
  const rawKeys = Object.keys(row)

  function findKey(candidates) {
    for (const c of candidates) {
      const idx = keys.indexOf(c)
      if (idx !== -1) return rawKeys[idx]
    }
    return null
  }

  const idKey = findKey(['transaction_id', 'txn_id', 'id', 'reference', 'ref_no'])
  const amtKey = findKey(['amount', 'amt', 'value', 'debit', 'credit'])
  const dateKey = findKey(['date', 'txn_date', 'transaction_date', 'value_date'])
  const descKey = findKey(['description', 'desc', 'narration', 'remarks', 'particulars'])

  return {
    id: idKey ? row[idKey] : null,
    amount: amtKey ? (parseFloat(row[amtKey]) || 0) : 0,
    date: dateKey ? row[dateKey] : null,
    description: descKey ? row[descKey] : null,
    raw: row,
  }
}

const STATUS_ORDER = {
  AMOUNT_MISMATCH: 0,
  MISSING_IN_EXTERNAL: 1,
  MISSING_IN_INTERNAL: 2,
  MATCHED: 3,
}

router.post('/', (req, res) => {
  try {
    const { internal, external } = req.body

    if (!Array.isArray(internal) || !Array.isArray(external) ||
        internal.length === 0 || external.length === 0) {
      return res.status(400).json({
        error: 'Both files are required and must contain data',
      })
    }

    if (internal.length > 10000 || external.length > 10000) {
      return res.status(400).json({
        error: 'File too large. Max 10,000 rows per file.',
      })
    }

    const internalNorm = internal.map(normaliseRow)
    const externalNorm = external.map(normaliseRow)

    const internalValid = internalNorm.filter(r => r.id)
    const externalValid = externalNorm.filter(r => r.id)

    const internalMap = new Map()
    internalValid.forEach(r => internalMap.set(String(r.id).trim(), r))

    const externalMap = new Map()
    externalValid.forEach(r => externalMap.set(String(r.id).trim(), r))

    const allIds = new Set([...internalMap.keys(), ...externalMap.keys()])

    const results = []
    for (const id of allIds) {
      const intRow = internalMap.get(id) || null
      const extRow = externalMap.get(id) || null

      let status
      let discrepancy = null

      if (intRow && extRow) {
        if (Math.abs(intRow.amount - extRow.amount) < 0.01) {
          status = 'MATCHED'
        } else {
          status = 'AMOUNT_MISMATCH'
          discrepancy = extRow.amount - intRow.amount
        }
      } else if (intRow && !extRow) {
        status = 'MISSING_IN_EXTERNAL'
      } else {
        status = 'MISSING_IN_INTERNAL'
      }

      results.push({ id, status, internal: intRow, external: extRow, discrepancy })
    }

    results.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])

    const summary = {
      total: allIds.size,
      matched: results.filter(r => r.status === 'MATCHED').length,
      amount_mismatch: results.filter(r => r.status === 'AMOUNT_MISMATCH').length,
      missing_in_external: results.filter(r => r.status === 'MISSING_IN_EXTERNAL').length,
      missing_in_internal: results.filter(r => r.status === 'MISSING_IN_INTERNAL').length,
      internal_rows: internalValid.length,
      external_rows: externalValid.length,
      skipped_internal: internalNorm.length - internalValid.length,
      skipped_external: externalNorm.length - externalValid.length,
    }

    res.json({ summary, results })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router

import { useState } from 'react'

function getRowClass(status) {
  if (status === 'MATCHED') return 'row-matched'
  if (status === 'AMOUNT_MISMATCH') return 'row-mismatch'
  return 'row-missing'
}

export default function ResultsTable({ results }) {
  const [filter, setFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredResults = results
    .filter(r => {
      if (filter === 'ALL') return true
      if (filter === 'MISSING') return r.status === 'MISSING_IN_EXTERNAL' || r.status === 'MISSING_IN_INTERNAL'
      return r.status === filter
    })
    .filter(r => !searchTerm || String(r.id).toLowerCase().includes(searchTerm.toLowerCase()))

  function exportToCSV() {
    const headers = ['Transaction ID', 'Status', 'Internal Amount', 'External Amount', 'Discrepancy', 'Date (Internal)', 'Description']
    const rows = filteredResults.map(r => [
      r.id,
      r.status,
      r.internal ? r.internal.amount.toFixed(2) : '',
      r.external ? r.external.amount.toFixed(2) : '',
      r.discrepancy !== null ? r.discrepancy.toFixed(2) : '',
      r.internal?.date || r.external?.date || '',
      r.internal?.description || r.external?.description || '',
    ])
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reconx-results-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const counts = {
    mismatch: results.filter(r => r.status === 'AMOUNT_MISMATCH').length,
    missing: results.filter(r => r.status === 'MISSING_IN_EXTERNAL' || r.status === 'MISSING_IN_INTERNAL').length,
    matched: results.filter(r => r.status === 'MATCHED').length,
  }

  const tabs = [
    { key: 'ALL', label: `All (${results.length})` },
    { key: 'AMOUNT_MISMATCH', label: `Mismatches (${counts.mismatch})` },
    { key: 'MISSING', label: `Missing (${counts.missing})` },
    { key: 'MATCHED', label: `Matched (${counts.matched})` },
  ]

  function isTabActive(key) {
    return filter === key
  }

  function handleTabSet(key) {
    setFilter(key)
  }

  return (
    <div>
      <div className="table-controls">
        <div className="filter-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={'filter-tab' + (isTabActive(tab.key) ? ' active' : '')}
              onClick={() => handleTabSet(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            placeholder="Search by ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
            }}
          />
          <button className="btn-ghost" onClick={exportToCSV}>
            Export CSV
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="results-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Status</th>
              <th>Internal Amount</th>
              <th>External Amount</th>
              <th>Discrepancy</th>
              <th>Date</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map(row => (
              <tr key={row.id} className={getRowClass(row.status)}>
                <td><code>{row.id}</code></td>
                <td>
                  <span className={'badge badge-' + row.status.toLowerCase()}>
                    {row.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td>
                  {row.internal
                    ? 'Rs ' + row.internal.amount.toFixed(2)
                    : <em style={{ color: 'var(--muted)' }}>Missing</em>}
                </td>
                <td>
                  {row.external
                    ? 'Rs ' + row.external.amount.toFixed(2)
                    : <em style={{ color: 'var(--muted)' }}>Missing</em>}
                </td>
                <td>
                  {row.discrepancy !== null ? (
                    <span className={row.discrepancy > 0 ? 'discrepancy-positive' : 'discrepancy-negative'}>
                      {row.discrepancy > 0 ? '+' : ''}Rs {row.discrepancy.toFixed(2)}
                    </span>
                  ) : '—'}
                </td>
                <td>{row.internal?.date || row.external?.date || '—'}</td>
                <td style={{
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {row.internal?.description || row.external?.description || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredResults.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
          No results match this filter.
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import FileUploader from './components/FileUploader'
import SummaryBar from './components/SummaryBar'
import ResultsTable from './components/ResultsTable'
import AIExplainer from './components/AIExplainer'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

export default function App() {
  const [internalData, setInternalData] = useState(null)
  const [externalData, setExternalData] = useState(null)
  const [internalFileName, setInternalFileName] = useState(null)
  const [externalFileName, setExternalFileName] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleReconcile() {
    if (!internalData || !externalData) {
      setError('Please upload both files first')
      return
    }
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const res = await fetch(BACKEND_URL + '/api/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internal: internalData, external: externalData }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Reconciliation failed')
      setResults(data)
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      setError(err.message || 'Reconciliation failed')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setInternalData(null)
    setExternalData(null)
    setInternalFileName(null)
    setExternalFileName(null)
    setResults(null)
    setError(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>ReconX</h1>
          <div className="tagline">Transaction Reconciliation Dashboard</div>
        </div>
        {results && (
          <button className="btn-ghost" onClick={handleReset}>
            New Reconciliation
          </button>
        )}
      </header>

      {!results && (
        <div className="card">
          <h2>Upload Files</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Upload your internal ledger and the counterparty statement. Both files must be CSV
            format with a transaction ID column.
          </p>

          <div className="upload-grid">
            <div>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Internal Ledger
              </p>
              <FileUploader
                label="Internal Ledger"
                onParsed={(data, name) => { setInternalData(data); setInternalFileName(name) }}
                fileName={internalFileName}
                onClear={() => { setInternalData(null); setInternalFileName(null) }}
              />
            </div>
            <div>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Counterparty Statement
              </p>
              <FileUploader
                label="Counterparty Statement"
                onParsed={(data, name) => { setExternalData(data); setExternalFileName(name) }}
                fileName={externalFileName}
                onClear={() => { setExternalData(null); setExternalFileName(null) }}
              />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className="btn-primary"
              onClick={handleReconcile}
              disabled={!internalData || !externalData || loading}
            >
              {loading ? 'Reconciling...' : 'Run Reconciliation'}
            </button>
            {loading && <div className="spinner" />}
            {error && <p className="error-text">{error}</p>}
          </div>

          <div style={{
            marginTop: '1.25rem',
            padding: '1rem',
            background: '#F6F8FA',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: 'var(--muted)',
          }}>
            <strong>Required CSV columns:</strong> The app auto-detects common column names
            including transaction_id / txn_id / id / reference, amount / amt / value,
            date / txn_date, description / narration / remarks
          </div>
        </div>
      )}

      {results && (
        <div id="results-section">
          <SummaryBar summary={results.summary} />

          <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
            Internal: {results.summary.internal_rows} rows ·{' '}
            External: {results.summary.external_rows} rows
            {results.summary.skipped_internal > 0 &&
              ` · ${results.summary.skipped_internal} internal rows skipped (no ID)`}
            {results.summary.skipped_external > 0 &&
              ` · ${results.summary.skipped_external} external rows skipped (no ID)`}
          </div>

          <AIExplainer summary={results.summary} results={results.results} />

          <div className="card">
            <h2>Transaction Details</h2>
            <ResultsTable results={results.results} />
          </div>
        </div>
      )}
    </div>
  )
}

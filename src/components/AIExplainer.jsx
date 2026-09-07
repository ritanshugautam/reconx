import { useState } from 'react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

export default function AIExplainer({ summary, results }) {
  const [explanation, setExplanation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleExplain() {
    setLoading(true)
    setError(null)
    setExplanation(null)

    const sample_mismatches = results
      .filter(r => r.status === 'AMOUNT_MISMATCH')
      .slice(0, 5)
      .map(r => ({
        id: r.id,
        internal_amount: r.internal?.amount || 0,
        external_amount: r.external?.amount || 0,
        discrepancy: r.discrepancy,
      }))

    try {
      const res = await fetch(BACKEND_URL + '/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary, sample_mismatches }),
      })
      const data = await res.json()
      if (res.ok) {
        setExplanation(data.explanation)
      } else {
        setError(data.error || 'Failed. Try again.')
      }
    } catch {
      setError('Cannot reach server. Try again in 30s.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="ai-box-header">
        <span className="ai-label">🤖 AI Analysis</span>
        {!explanation && !loading && (
          <button className="btn-primary" onClick={handleExplain}>
            Explain Discrepancies
          </button>
        )}
        {explanation && (
          <button className="btn-ghost" onClick={handleExplain}>
            Refresh Analysis
          </button>
        )}
      </div>

      {!explanation && !loading && !error && (
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
          Click above to get an AI-powered explanation of your reconciliation results,
          including likely causes and recommended next steps.
        </p>
      )}

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
          <div className="spinner" />
          <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
            Analysing discrepancies...
          </span>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      {explanation && <div className="ai-box">{explanation}</div>}
    </div>
  )
}

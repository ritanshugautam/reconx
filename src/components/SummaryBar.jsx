export default function SummaryBar({ summary }) {
  return (
    <div className="summary-bar">
      <div className="summary-stat total">
        <div className="stat-number">{summary.total}</div>
        <div className="stat-label">Total Compared</div>
      </div>
      <div className="summary-stat matched">
        <div className="stat-number">{summary.matched}</div>
        <div className="stat-label">Matched</div>
      </div>
      <div className="summary-stat mismatch">
        <div className="stat-number">{summary.amount_mismatch}</div>
        <div className="stat-label">Amount Mismatch</div>
      </div>
      <div className="summary-stat missing">
        <div className="stat-number">
          {summary.missing_in_external + summary.missing_in_internal}
        </div>
        <div className="stat-label">Missing Entries</div>
      </div>
    </div>
  )
}

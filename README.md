# ReconX

Transaction reconciliation dashboard for fintech and banking operations. Upload your internal ledger and counterparty statement as CSV files — ReconX matches every transaction by ID, flags amount mismatches and missing entries, and uses AI to explain discrepancies with recommended next steps.

## The problem
Every payment processor, bank, and NBFC runs daily reconciliation between their internal records and counterparty statements (NPCI, acquiring banks, payment gateways). Mismatches signal data errors, timing differences, or potential fraud. Operations teams spend hours doing this manually in Excel. ReconX automates the matching and surfaces anomalies instantly.

## Features
- Upload any two CSV files — auto-detects common column names (transaction_id, txn_id, reference etc.)
- Four-state reconciliation: Matched, Amount Mismatch, Missing in External, Missing in Internal
- Summary dashboard with instant counts
- Filterable, searchable results table
- Export reconciliation report as CSV
- AI-powered discrepancy analysis via Gemini — explains likely causes and recommends next steps
- Colour-coded results dashboard

## Tech stack
- Frontend: React 19 (Vite), plain CSS
- CSV parsing: PapaParse 5.4.1, loaded from a CDN script tag (browser-side, no file upload)
- Backend: Node.js + Express REST API
- AI: Google Gemini API (gemini-flash-lite-latest, free tier)
- Deployment: Vercel (frontend) + Render (backend)

Built with AI coding assistance (Claude Code).

## Architecture decisions
- CSV parsing happens in the browser (PapaParse), not the server — no file storage needed, works on Render's free tier, faster user experience
- Reconciliation logic uses JavaScript Maps for O(1) lookups by transaction ID; the server caps each file at 10,000 rows
- Column auto-detection normalises inconsistent CSV headers from different banking systems without requiring users to map columns manually
- Amount comparison uses a 0.01 tolerance threshold to handle floating point precision issues

## Finance context
Banks, payment gateways and NBFCs routinely reconcile their internal ledger against counterparty statements. ReconX is a small demonstration of that workflow, not a production system.

## Known limitations
- Amounts are parsed as floats and compared with a 0.01 tolerance. Integer paise or Decimal would be correct for money.
- Duplicate transaction IDs are not detected: the last row with a given ID silently overwrites earlier ones.
- IDs are trimmed but not case-normalised, so `txn001` and `TXN001` are treated as different transactions.
- A blank or non-numeric amount is read as 0.
- Dates are displayed but not used for matching, so timing differences are not handled.
- If a file has separate debit and credit columns and no amount column, only the debit column is read.
- Each file is capped at 10,000 rows (enforced on the server).
- The AI summary sees only aggregate counts and up to five sample mismatches, so its causes are suggestions, not findings. The 200-word limit is a prompt instruction, not enforced.
- No automated tests, and the API has no rate limiting.

## Live demo
https://reconx-mu.vercel.app

## Backend API
https://reconx-9ujm.onrender.com

## Running locally
1. `git clone https://github.com/ritanshugautam/reconx.git`
2. `npm install`
3. Create `.env` with `GEMINI_API_KEY` and `VITE_BACKEND_URL=http://localhost:3001`
4. Terminal 1: `node backend/server.js`
5. Terminal 2: `npm run dev`
6. Open http://localhost:5173
7. Use `sample_internal.csv` and `sample_external.csv` to test

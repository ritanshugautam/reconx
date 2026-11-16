#!/usr/bin/env bash
# Files the 7 ReconX QA defects as GitHub Issues. Run AFTER the qa/ folder is pushed (the issue screenshots load from the repo).
set -e
cd "$(dirname "$0")"
REPO="ritanshugautam/reconx"
if ! command -v gh >/dev/null 2>&1; then echo "GitHub CLI not found. Install it with: brew install gh   then run: gh auth login"; exit 1; fi
if ! gh auth status >/dev/null 2>&1; then echo "Not logged in. Run: gh auth login   then run this script again"; exit 1; fi
if [ -f issue_links.txt ]; then echo "issue_links.txt already exists, so issues were filed already. Delete it only if you want to file them again."; exit 1; fi
gh label create "severity: high" --repo "$REPO" --color d73a4a --force >/dev/null
gh label create "severity: medium" --repo "$REPO" --color fbca04 --force >/dev/null
gh label create "severity: low" --repo "$REPO" --color 0e8a16 --force >/dev/null
gh label create "bug" --repo "$REPO" --color d73a4a --force >/dev/null
: > issue_links.txt
echo "DEF-01: $(gh issue create --repo "$REPO" --title "Duplicate IDs in one file are silently dropped, causing a false mismatch" --body-file "01-def-01.md" --label bug --label "severity: high")" | tee -a issue_links.txt
echo "DEF-02: $(gh issue create --repo "$REPO" --title "Blank amount is read as 0.00 and shown as Matched" --body-file "02-def-02.md" --label bug --label "severity: high")" | tee -a issue_links.txt
echo "DEF-03: $(gh issue create --repo "$REPO" --title "Formatted or non-numeric amounts are misread as 1.00 or 0.00 with no warning" --body-file "03-def-03.md" --label bug --label "severity: high")" | tee -a issue_links.txt
echo "DEF-04: $(gh issue create --repo "$REPO" --title "Tolerance check gives different results for the same 0.01 difference" --body-file "04-def-04.md" --label bug --label "severity: medium")" | tee -a issue_links.txt
echo "DEF-05: $(gh issue create --repo "$REPO" --title "AI analysis names a cause the data contradicts (fee deduction for an amount that went up)" --body-file "05-def-05.md" --label bug --label "severity: medium")" | tee -a issue_links.txt
echo "DEF-06: $(gh issue create --repo "$REPO" --title "AI analysis shows raw markdown symbols (** and *)" --body-file "06-def-06.md" --label bug --label "severity: low")" | tee -a issue_links.txt
echo "DEF-07: $(gh issue create --repo "$REPO" --title "Transaction IDs that differ only by letter case are treated as different transactions" --body-file "07-def-07.md" --label bug --label "severity: low")" | tee -a issue_links.txt
echo; echo "Done. Copy the 7 lines above and send them to Claude."

# Assistant Integration Guide

## What this pack does
- Gives you a stable, public **source of truth** I can read from each session.
- Auto-generates `STATE.md` on push/schedule so I can quickly catch up.
- Normalizes Issues/PRs with templates that include WBS/Task IDs.

## How to use
1) Copy this pack to your repo root.
2) Commit `templates/ROADMAP.md`, `templates/STATE.md` (initial), and `templates/DECISIONS/*` into proper places (e.g., top-level `ROADMAP.md`, `DECISIONS/`).  
   - Or just keep `templates/` and rename later.
3) Keep a CSV snapshot of your Notion WBS/Tasks in the repo (`WBS.csv`, `Tasks.csv`) whenever you want me to see the latest.
4) The workflow `.github/workflows/state.yml` will produce/update `STATE.md`.  
   - It lists open PRs/Issues and shows a WBS/Tasks summary (if CSVs exist).
5) Start sessions with a pasted `templates/SYNC_PACKET.md` or link me to your repo (public/accessible).

## Files in this pack
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/ISSUE_TEMPLATE/feature.yml`
- `.github/workflows/state.yml`
- `templates/SYNC_PACKET.md`
- `templates/ROADMAP.md`
- `templates/STATE.md`
- `templates/DECISIONS/ADR-0001-template.md`
- `scripts/gen_sync_packet.sh`
- `scripts/gen_sync_packet.ps1`

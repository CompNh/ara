# ADR-0001: Adopt Assistant Sync Pipeline (STATE.md Automation)

## Status
Accepted

## Context
We need a stable, shareable source of truth so ChatGPT sessions can instantly catch up even across new chats. GitHub Actions can auto-build `STATE.md` from WBS/Tasks CSVs and open PR/Issues, while PR/Issue templates keep work linked to plans.

## Decision
- Keep the **Assistant Sync Pack** in the repo.
- Run the **state.yml** workflow on push/schedule to generate/update `STATE.md`.
- Pin links to `STATE.md` and `ROADMAP.md` in README.
- Use Issue/PR templates consistently (no WBS-ID in commits; IDs only in PR body/issues if needed).
- Use **Sync Packet** text for session kick-offs (not committed by default).

## Consequences
**Positive**
- Fast context restore across sessions
- Traceability between plan and code
- Lower onboarding/sync overhead

**Negative / Risks**
- Requires occasional WBS/Tasks CSV refresh
- Minor repo noise from STATE.md updates

## Alternatives considered
- Notion-only source (no code traceability)
- Manual weekly summaries (too slow/error-prone)

## Links
- `STATE.md`
- `ROADMAP.md`
- `.github/workflows/state.yml`

# CLAUDE.md — Project Word

## Project

**Product:** A word-guessing game. Two compound words or common two-word phrases share an overlapping word — the second half of the first equals the first half of the second. The shared word is hidden as a blank; the player guesses it.

Example: *Spotlight* + *Lighthouse* → displayed as `Spot _____ House` → answer: **light**.

**Problem:** No mobile/web game exists for this specific overlap-word puzzle format.

**Current phase:** Concept only. Nothing built yet — no prototype, no puzzle set, no platform decision.

## Current State

*(Keep this updated — newest status here, details in `change_log.md`.)*

- 2026-09-25: Project scaffolded. Concept doc exists (`project word overview.docx`). No build started.

## Repository Structure

| Folder | Holds |
|---|---|
| `docs/` | Specs, design notes, anything written to explain or scope the product. |
| `research/` | Puzzle-format research, competitive scan, word-pair sourcing. |
| `prototype/` | Working/experimental builds of the game. |
| `stakeholders/` | Notes and communications involving anyone outside the core project (currently: none — solo project). |
| `skills/` | Claude Code skill/template files, e.g. `weekly-status.md`. |

## Key Facts to Not Re-Derive

- **Stakeholders:** solo project — Trevor is the only stakeholder. No review or approval chain exists.
- **Puzzle mechanic is fixed:** the overlap must be a real shared substring between two compound words/common phrases (not a synonym or thematic link). `Spotlight`/`Lighthouse` → `light` is the canonical example.
- **Nothing is built.** Any reference to "the game" or "the app" prior to a first prototype existing is aspirational, not a report of working software.

## Working Conventions

- **Change log:** every finding, decision, or notable change gets one entry in `change_log.md`, newest entry first. Use the template at the top of that file — don't skip the "open assumption" line even when nothing seems untested.
- **Status updates:** use `skills/weekly-status.md`. Since this is solo, default to the team/eng format unless a status is explicitly for an outside audience.

# CLAUDE.md — Betwixt

## Project

**Product:** Betwixt — a daily word-guessing game. Two compound words or common two-word phrases share an overlapping word — the second half of the first equals the first half of the second. The shared word is hidden as a blank; the player guesses it.

Example: *spotlight* + *lighthouse* → displayed as `spot _____ house` → answer: **light**.

**Problem:** No mobile/web game exists for this specific overlap-word puzzle format.

**Current phase:** Built and locally tested. Static site (`index.html`, `styles.css`, `script.js`, `puzzles.js`) implements the full spec — daily puzzle, 3-guess hint progression, streak via `localStorage`, exhausted-content end state. Not yet deployed to GitHub Pages, not yet pushed.

## Current State

*(Keep this updated — newest status here, details in `change_log.md`.)*

- 2026-09-25: First working build complete, tested locally in a browser (solve path, fail path, hint progression, skip-day streak break, exhausted-puzzles state, mobile viewport). One real bug caught by testing and fixed: the share button's clipboard copy had no fallback path when `navigator.clipboard.writeText` is denied — now falls back to `execCommand`, then to a manual "copy this text" message if that fails too. Not yet committed or pushed; GitHub Pages not yet enabled.

## Repository Structure

| Folder | Holds |
|---|---|
| `docs/` | Specs, design notes, anything written to explain or scope the product. |
| `research/` | Puzzle-format research, competitive scan, word-pair sourcing. |
| *(root)* | The live app: `index.html`, `styles.css`, `script.js`, `puzzles.js`. Lives at root, not in `prototype/`, so GitHub Pages can serve it directly from `main` with no build step. |
| `prototype/` | Superseded by the root-level app above — kept as a placeholder folder in case an experimental variant needs to live separately from the live build. |
| `stakeholders/` | Notes and communications involving anyone outside the core project (currently: none — solo project). |
| `skills/` | Claude Code skill/template files, e.g. `weekly-status.md`. |

## Key Facts to Not Re-Derive

- **Stakeholders:** solo project — Trevor is the only stakeholder. No review or approval chain exists.
- **Puzzle mechanic is fixed:** the overlap must be a real shared substring between two compound words/common phrases (not a synonym or thematic link), and both leftover fragments must themselves be recognizable standalone words. `spotlight`/`lighthouse` → `light` is the canonical example. All puzzle text is lowercase.
- **Play format:** one puzzle per calendar day, same puzzle for every player. Rolls over at 12:00am US Eastern (`America/New_York`, DST-aware) — not UTC, not the player's local time.
- **Guess mechanic:** free-text input, 3 attempts. Guess 1: fixed-width blank, no hint. Guess 2: first letter of the answer revealed. Guess 3: blank switches to match the real letter count (full-length hint). Wrong guess is a plain miss — no "close"/"too short" feedback.
- **End states:** solve within 3 → shareable result text showing guess count. Fail all 3 → answer revealed, daily streak breaks.
- **Streak:** tracked client-side only, `localStorage`, no accounts/backend. Breaks on failing all 3 guesses *or* skipping a day entirely. Increments on solve.
- **Content:** 56 puzzles for MVP (not 50 — the interview-stage target was revised after curation), in `puzzle-candidates.md`. Once a player exhausts all 56 days, show: "Thanks for testing the beta! More puzzles to be added soon." — never loop back to puzzle #1.
- **Platform:** static HTML/CSS/JS, no backend, no accounts. Hosted on GitHub Pages from this repo (`github.com/tlaverriere/Betwixt`).
- **Nothing is built.** Any reference to "the game" or "the app" prior to a first prototype existing is aspirational, not a report of working software.

## Working Conventions

- **Change log:** every finding, decision, or notable change gets one entry in `change_log.md`, newest entry first. Use the template at the top of that file — don't skip the "open assumption" line even when nothing seems untested.
- **Status updates:** use `skills/weekly-status.md`. Since this is solo, default to the team/eng format unless a status is explicitly for an outside audience.

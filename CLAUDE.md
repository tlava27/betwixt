# CLAUDE.md — Betwixt

## Project

**Product:** Betwixt — a daily word-guessing game. Two compound words or common two-word phrases share an overlapping word — the second half of the first equals the first half of the second. The shared word is hidden as a blank; the player guesses it.

Example: *spotlight* + *lighthouse* → displayed as `spot _____ house` → answer: **light**.

**Problem:** No mobile/web game exists for this specific overlap-word puzzle format.

**Current phase:** Live and playable. Static site (`index.html`, `styles.css`, `script.js`, `puzzles.js`) implements the full spec — daily puzzle, 3-guess hint progression, streak via `localStorage`, exhausted-content end state — deployed at `https://tlava27.github.io/betwixt/`. All 56 puzzles content-checked. No real player has used it yet beyond this testing.

## Current State

*(Keep this updated — newest status here, details in `change_log.md`.)*

- 2026-09-25: Live at `https://tlava27.github.io/betwixt/` (repo moved from private `tlaverriere/Betwixt` to public `tlava27/betwixt` — GitHub Pages needs a paid plan to publish from a private repo). Added a beta-testing "skip to next day" control and restyled the title's "i" (upside-down, dark orange). All 56 puzzles verified content-correct and end-to-end playable. Since then: added a post-solve Venn diagram revealing the word overlap, changed the share-text icon to echo the flipped "i", and switched the streak from flat +1/day to points by guess number (5/3/1). Streak-explainer placement recommended, not yet built.

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
- **Streak:** points-based, not +1/day. Solving on guess 1 = +5, guess 2 = +3, guess 3 = +1; the running point total *is* the streak. Tracked client-side only, `localStorage`, no accounts/backend. Resets to 0 on failing all 3 guesses *or* skipping a day entirely (day-index gap > 1 since last played) — those two reset conditions are unchanged from the original +1/day design, only the reward side changed.
- **Content:** 56 puzzles for MVP (not 50 — the interview-stage target was revised after curation), in `puzzle-candidates.md`. Once a player exhausts all 56 days, show: "Thanks for testing the beta! More puzzles to be added soon." — never loop back to puzzle #1.
- **Platform:** static HTML/CSS/JS, no backend, no accounts. Hosted on GitHub Pages from `github.com/tlava27/betwixt` (moved 2026-09-25 from the original private `tlaverriere/Betwixt` — Pages can't publish from a private repo without a paid plan). Requires `.nojekyll` at root or GitHub Pages tries to run Jekyll over the markdown files.
- **Beta-testing day skip:** a "Skip to next day" button (`#skip-day-button`, always visible, outside the `#game` div so it survives every render state) adds to a `betwixt_debugDayOffset` localStorage value that's added to the real calendar-derived day index. Lets testers reach any puzzle without waiting for real days, and still correctly exercises the skip-breaks-streak logic. This is intentionally permanent for the beta phase, not scaffolding to remove later — revisit before a real public launch.
- **Betwixt wordmark:** the "i" in the `<h1>` title is deliberately styled upside-down and dark orange (`.flip-i` in `styles.css`) — a design choice, not a rendering bug.

## Working Conventions

- **Change log:** every finding, decision, or notable change gets one entry in `change_log.md`, newest entry first. Use the template at the top of that file — don't skip the "open assumption" line even when nothing seems untested.
- **Status updates:** use `skills/weekly-status.md`. Since this is solo, default to the team/eng format unless a status is explicitly for an outside audience.

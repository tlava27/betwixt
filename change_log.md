# Change Log

Append-only. Newest entry first. One entry per finding, decision, or change.

## Entry template

```
### YYYY-MM-DD — [short title]

- **Source:** where this came from (doc, conversation, test, external research)
- **Finding:** what was learned or observed
- **Why it matters:** the consequence for the project
- **Change made:** what was actually changed as a result (or "none yet" if this is a finding without a change)
- **Open assumption:** what's still untested or unverified about this
```

<!-- New entries go below this line, newest first -->

### 2026-09-25 — Generated 98 candidate puzzles for curation

- **Source:** Claude-generated, checked by hand against the puzzle rule (both source compounds real, both leftover fragments standalone recognizable words).
- **Finding:** Found enough valid overlap-word pairs across ~40 connector words to produce 98 candidates, well over the 50 needed — gives real room to cut weak ones. Caught two accidental duplicate-compound conflicts during generation (`Ballgame` and `Headline` each got used to build two different puzzle rows) and resolved both before finalizing.
- **Why it matters:** MVP is gated on having 50 curated puzzles; this is the first real supply against that requirement.
- **Change made:** Added `puzzle-candidates.md` with all 98 candidates in a table (display, answer, source compounds, notes), flagged ~10 as borderline (informal tone, niche terms, or modern slang) for a second look during curation.
- **Open assumption:** None of these have been curated yet — the 50 for launch are still Trevor's pick. Difficulty/tone balance across the final 50 hasn't been evaluated (e.g. how many "modern slang" or "niche" entries survive curation).

### 2026-09-25 — Deduped candidates to one puzzle per answer word

- **Source:** Trevor's curation instruction — each answer should only fit one puzzle in the final list.
- **Finding:** Only 42 of the original 97 candidates have distinct answer words; the other 55 were duplicate connector words (e.g. three different "time" puzzles). Enforcing one-per-answer caps the list at 42 — 8 short of the 50 needed for MVP. Also found `puzzle-candidates.md` had been re-saved as UTF-16 (rewritten back to UTF-8 here) and row 93 (Payload/Loadout, answer "load") was already gone before this edit — that wasn't a duplicate, so it reads as a separate deliberate cut rather than a side effect of the dedup.
- **Why it matters:** the 50-puzzle MVP requirement can't be hit by curating this batch alone — more candidates using new connector words are needed regardless of which 42 survive further cuts.
- **Change made:** rewrote `puzzle-candidates.md` down to 42 rows, one per answer, picking the cleanest source-compound pair per answer (skipping "niche"/"informal"/"modern slang"-flagged rows where a clean alternative existed).
- **Open assumption:** the 8+ additional puzzles needed to reach 50 haven't been generated yet.

### 2026-09-25 — Generated 19 more candidates with new connector words, closing the gap past 50

- **Source:** Claude-generated, same rule as the original batch (both source compounds real, both leftover fragments standalone words); each new answer word checked against all 42 existing answers to keep the whole list duplicate-free.
- **Finding:** Found 19 clean new connector words (table, chair, wall, paper, floor, door, rock, roll, show, fish, cat, dog, storm, worm, bird, bug, bear, fly, cup) with no overlap against the existing list. Only one came out borderline: Teddybear/Bearskin, flagged informal/toy term since "teddy" leans casual.
- **Why it matters:** brings the deduped, one-answer-per-puzzle list to 61 — 11 over the 50 needed, restoring room to cut weak ones during curation.
- **Change made:** appended rows 43–61 to `puzzle-candidates.md` (rewrote the whole file rather than patching, since the file keeps getting silently re-saved as UTF-16 — likely by whatever editor has it open — and a plain edit would have failed on the encoding mismatch again).
- **Open assumption:** still fully uncurated. The file's repeated UTF-16 re-saving is a live nuisance worth checking — if it keeps happening, worth finding out what's re-saving it.

### 2026-09-25 — Curation done: 56 puzzles finalized, target revised from 50, all text lowercased

- **Source:** Trevor's curation pass on `puzzle-candidates.md` (cut stone, case, fish, bug, bear) plus his explicit calls to (1) accept whatever count survives curation instead of forcing exactly 50, and (2) make all puzzle text lowercase.
- **Finding:** 56 puzzles survived the cut, including dropping the one row already flagged "informal/toy term" (teddybear/bearskin) during generation — the flagging system worked as intended. Separately: `CLAUDE.md` had never been updated with any of the 2026-09-25 interview's decisions (name, gameplay rules, streak logic, hosting, hint system) — it was still titled "Project Word" with no puzzle count or mechanic detail at all.
- **Why it matters:** 56, not 50, is now the real MVP content target — anything referencing "50 puzzles" going forward is stale. And `CLAUDE.md` was not doing its job as the fact-of-record; anyone (or any future session) reading it alone would have missed the entire locked spec.
- **Change made:** rewrote `puzzle-candidates.md` with 56 rows, renumbered, all puzzle words lowercase. Rewrote `CLAUDE.md`'s title, current phase, current state, and Key Facts section to carry the full locked spec (play format, guess mechanic, hint progression, end states, streak rules, content count, platform).
- **Open assumption:** none of this is built yet. The puzzle data file format the app will actually read from doesn't exist yet — `puzzle-candidates.md` is a curation artifact, not the production data source.

### 2026-09-25 — First working build: puzzle data file + full app, tested locally

- **Source:** Trevor's go-ahead to build, against the locked spec in `CLAUDE.md`.
- **Finding:** Built `puzzles.js` (production data — the 56 curated puzzles as `{a, b, answer}` objects, embedded as a `<script>` global rather than fetched JSON, so it works over `file://` too, not just a real server) plus `index.html`, `styles.css`, `script.js` implementing the daily-puzzle logic, 3-guess hint progression, `localStorage` streak tracking, and the exhausted-content end state. Set up a local PowerShell static server (untracked, `.gitignore`d) to actually test in a browser rather than just reading the code. Testing caught one real bug: the share button's `navigator.clipboard.writeText()` can reject (confirmed — it does in this sandboxed browser), and the original code had no `.catch`, so a denied-permission browser would silently fail to share with no feedback. Fixed with a fallback chain: clipboard API → `execCommand('copy')` → visible "copy this text" message, verified each link of the chain actually failing/succeeding as expected.
- **Why it matters:** this is the first point Betwixt exists as running software rather than spec or content. The clipboard bug would have shipped silently — it only surfaced by actually clicking the button in a browser, not by reading the code.
- **Change made:** added `puzzles.js`, `index.html`, `styles.css`, `script.js`, `.gitignore` (excludes local `.claude/` dev-server config, which points to a machine-specific temp path and isn't portable). Verified in-browser: solve path (guess 1), fail path (3 wrong guesses), hint progression (blank → first letter → full length), reload persistence (mid-puzzle and end-state), skip-a-day streak break, consecutive-day streak preservation, exhausted-puzzles state (56+ days out), and a mobile viewport render.
- **Open assumption:** not yet deployed. GitHub Pages isn't enabled on the repo yet, nothing is pushed, and no real user has played it outside this testing.

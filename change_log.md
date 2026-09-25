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

### 2026-09-25 — Repo moved: private tlaverriere/Betwixt → public tlava27/betwixt

- **Source:** Trevor's request, after discovering GitHub Pages can't publish from a private repo without a paid plan.
- **Finding:** the original repo (`github.com/tlaverriere/Betwixt`) was private — confirmed via an unauthenticated API call returning 404 where an authenticated one succeeded. Free-plan GitHub Pages requires a public repo. `tlava27/betwixt` is a separate account's public repo, created empty.
- **Why it matters:** the live game's source, including the puzzle answers, is now publicly visible on GitHub (not just the playable site) — that's the tradeoff of the public-repo path over paying for Pages-on-private.
- **Change made:** `git remote set-url origin` repointed at `https://github.com/tlava27/betwixt.git`; pushed `main` there. The `tlaverriere` account's cached credential had no push access to the `tlava27` repo — Trevor cleared the cached Windows credential and re-authenticated as `tlava27` to push.
- **Open assumption:** the old `tlaverriere/Betwixt` repo still exists with the same history and hasn't been deleted or repointed anywhere — it's just no longer the one being deployed.

### 2026-09-25 — First deploy failed: Jekyll processing markdown, plus a stale UTF-16 file

- **Source:** Trevor pasted the GitHub Actions build log after the Pages deploy showed a red X.
- **Finding:** two compounding issues. (1) GitHub Pages runs Jekyll by default on any repo without a `.nojekyll` file — it was trying to render `CLAUDE.md`, `change_log.md`, and `puzzle-candidates.md` as site pages under a theme, never the intent for this static app. (2) The actual build error — "source text contains invalid characters for the used encoding UTF-8" on `puzzle-candidates.md` — because that file had been committed while re-saved as UTF-16 (the same silent-editor-resave issue flagged during curation on 2026-09-25, this time it slipped through into a commit uncaught).
- **Why it matters:** this is what actually blocked the site from going live — Pages was enabled correctly and the push landed, but every build failed before producing anything to serve. Also confirms the UTF-16 re-saving issue isn't just a cosmetic nuisance; it can break things silently.
- **Change made:** added `.nojekyll` at repo root (disables Jekyll entirely, matching the "static, no build step" design already in `CLAUDE.md`). Rewrote `puzzle-candidates.md` as verified UTF-8 (confirmed via raw byte inspection, not just console output — PowerShell's console rendering had made a correctly-fixed file look corrupted, which cost a round of confusion before checking bytes directly).
- **Open assumption:** whether the next deploy actually succeeds — not yet confirmed live as of this entry. Also unconfirmed: what specifically keeps re-saving `puzzle-candidates.md` as UTF-16 — still worth tracking down if it recurs.

### 2026-09-25 — Confirmed live, then full content QA pass on all 56 puzzles

- **Source:** confirmed the fixed deploy went live at `tlava27.github.io/betwixt` (serving the real app, not a Jekyll page). Then Trevor asked to play through all 56 puzzles to double-check content.
- **Finding:** no issues found across three layers of checking. (1) Structural: all 56 entries lowercase, letters-only, unique answers, no accidentally-reused source compound between two different puzzles. (2) Linguistic re-audit of every `a`+`answer` and `answer`+`b` pair plus both displayed fragments — all real, valid, no repeat of the earlier `Ballgame`/`Headline`-style collision. (3) Runtime: exercised the actual hint-progression and answer-matching logic against all 56 (min answer length 2 — "up", max 6 — "ground"), then verified both length extremes end-to-end in the real running app (correct blank-width shrink/grow at guess 3, correct solve). A temporary `?day=N` debug override was added to script.js to make this possible without waiting for real calendar days, then removed — confirmed via `git diff` that the shipped file is unchanged.
- **Why it matters:** this is the first pass that actually confirms the specific puzzle content is solid end-to-end, not just that the app framework works (which the earlier testing covered using puzzle #1 only).
- **Change made:** none to shipped files — this was verification only, nothing to commit.
- **Open assumption:** content has been checked by the same process that generated it (me), not by an independent human or player. No real user has attempted any of the 56 yet.

### 2026-09-25 — Blank display changed: single continuous line, not 5 discrete boxes, for guesses 1-2

- **Source:** Trevor noticed puzzle #1 showed 5 separate letter-box slots on guess 1 and asked why — he'd pictured one undifferentiated blank line until guess 3, not a fixed box count.
- **Finding:** the interview had settled *whether* the blank hints at length (no) but never specified *how* it should look. I'd implemented Wordle-style discrete boxes at a fixed width (5), which technically never hints at the *real* length but still gives the player a countable number to look at — not the same as giving no countable information at all.
- **Why it matters:** matches the actual design intent more precisely — "don't hint at length" now means literally nothing to count, not just "the count is wrong."
- **Change made:** guesses 1-2 now render a single `.blank-line` element (no segments) instead of 5 boxes; guess 2 shows the first-letter box followed by the line. Guess 3+ is unchanged — discrete per-letter boxes at the real length. Caught and fixed a real regression while rewriting this: the guess-3 path briefly revealed the *entire* answer instead of just the first letter, caught by re-screenshotting before shipping. Re-ran the full 56-puzzle logic check after the fix — all still pass.
- **Open assumption:** none — verified in-browser for guess 1, 2, 3, and the solved state.

### 2026-09-25 — Beta day-skip control, and restyled the "i" in the wordmark

- **Source:** Trevor's two requests — a way for beta testers to advance to the next day without waiting for a real calendar day, and the "i" in "Betwixt" made upside-down and dark orange.
- **Finding:** the day-skip needed more than a button — the existing streak-break-on-skip logic (`applySkipBreak`) compared the current day index against a *last-played real date string*. That desyncs the moment a tester skips more than once within the same real calendar day, since the stored date string doesn't move but the simulated day does — testing this myself caught it before it shipped. Fixed by switching `betwixt_lastPlayedDate` to store the day index itself (an integer) instead of a date string, so everything derives from the same single source of truth.
- **Why it matters:** without the fix, a beta tester who played several simulated days in a row within one real sitting would have their streak incorrectly reset to 0 partway through, making the feature actively misleading for the exact audience it's built for.
- **Change made:** added a `betwixt_debugDayOffset` localStorage value and a "Skip to next day (beta testing)" button, placed outside the `#game` div so it survives every render state (active, solved, failed, exhausted, not-yet-launched). Reworked `applySkipBreak` and the two streak-update call sites to key off day index instead of date string. Restyled the title's "i" via a `.flip-i` span (`transform: rotate(180deg)`, color `#c1440e`). Verified in-browser: single skip preserves streak, skip-without-playing (gap > 1) still breaks it, multiple skips within one real day no longer desync, and the wordmark renders correctly.
- **Open assumption:** the day-skip control has no way to go backward or reset to the real day short of clearing `localStorage` entirely — not asked for, so not built, but worth knowing if testing gets confusing. Also: automated clicks that trigger `location.reload()` raced unreliably against this testing tool's click timing during verification (not a product bug — confirmed by dispatching the same click via direct JS and reading `localStorage` synchronously) — worth remembering for future QA passes on anything that reloads on click.

### 2026-09-25 — Share-text icon changed to match the wordmark's flipped "i"

- **Source:** Trevor's request to replace the share text's 🔗 emoji with "the same upside-down i in dark orange" from the title.
- **Finding:** the shared text is plain clipboard content that can land anywhere (SMS, Slack, etc.) — it can't carry the wordmark's actual color or CSS rotation, only a character shape. Considered reusing "!" (visually what the rotated "i" resembles), but that reads as an accidental double-exclamation next to the sentence's own "!". Settled on **ᴉ** (U+1D09, Unicode "turned i") — a real dedicated upside-down-i character, so it's shape-correct without the double-punctuation problem. Confirmed it renders as an actual glyph (not a missing-character box) in this testing browser.
- **Why it matters:** ties the shareable result back to the brand mark as closely as plain text allows.
- **Change made:** share text in `script.js` changed from `"...! 🔗"` to `"...! ᴉ"`.
- **Open assumption:** color still can't transfer to plain text — this is a shape-only echo of the wordmark, not a full match. Also unverified on real iOS/Android keyboards and fonts (only confirmed in the desktop testing browser); worth a real-device check if the character shows as a box (tofu) anywhere.

### 2026-09-25 — Post-solve Venn diagram showing how the two words overlap

- **Source:** Trevor asked for a recommendation on visualizing "the middle word completes the first word and starts the second," like a Venn diagram, and explicitly asked to be consulted before any changes. Presented three options (post-solve reveal / permanent how-it-works explainer / word-shaped overlap animation); he picked the post-solve reveal.
- **Finding:** placement mattered more than shape — showing the overlap for *today's* puzzle anywhere before a solve would spoil the answer, so this only ever renders after `state.solved` is true, never on the failed path (confirmed: stays hidden on fail).
- **Why it matters:** turns the "aha" moment into something visual, reusing the win state that already exists rather than adding a new screen or flow.
- **Change made:** added `buildVennDiagram(puzzle)` to `script.js` — two overlapping SVG circles (left = `a`+`answer`, right = `answer`+`b`), with the actual intersection lens (via `clipPath`, not alpha-blended overlap) filled solid and labeled with the answer. New `#venn-diagram` div in `index.html`, shown only in `renderSolved()`, explicitly hidden in `renderActive()`/`renderFailed()`. Verified on the canonical puzzle and on the longest word pair in the dataset (`marketplace`/`placemat`, 11 characters) — labels sit below the circles rather than inside them specifically so length doesn't matter.
- **Open assumption:** only visually checked in this testing browser at desktop and default sizes — not checked against very small phone screens or with a screen reader (the SVG has an `aria-label` but that's untested with real assistive tech).

### 2026-09-25 — Streak switched from flat +1/day to points by guess number

- **Source:** Trevor's request — solving on guess 1/2/3 now earns 5/3/1 points respectively, and the running point total is the streak.
- **Finding:** the two reset conditions (fail all 3, or skip a day) were left untouched — only the reward side of the streak changed. Nothing in the request mentioned changing what breaks a streak, so `applySkipBreak` and the fail-path `setStreak(0)` are unmodified.
- **Why it matters:** rewards fast solves more than the old flat system did — a string of first-guess solves now climbs the streak 5x faster than one full of last-guess saves, which the old +1/day couldn't distinguish at all.
- **Change made:** added `POINTS_BY_ATTEMPT` (`{1: 5, 2: 3, 3: 1}`) in `script.js`; the solve path now does `setStreak(getStreak() + POINTS_BY_ATTEMPT[state.attempts.length])` instead of `+ 1`. Verified end-to-end: guess-1 solve on a fresh streak → 5, guess-2 solve → +3 (8 total), guess-3 solve → +1 (9 total), then a full fail → resets to 0.
- **Open assumption:** the app doesn't yet explain this scoring anywhere — a player watching their streak jump by 5 one day and 1 the next has no in-app way to know why. Trevor asked for a placement recommendation for this; see the next entry for what was proposed. Nothing built yet for that part.

### 2026-09-25 — Recommended (not built): where to explain the points-based streak

- **Source:** Trevor asked for a recommendation on where to explain the new streak scoring, without building anything yet.
- **Recommendation given:** primary — show the points earned inline in the solve message itself (e.g. "Solved in 2/3! +3 points"), reusing the moment the rule actually applies, same philosophy as the post-solve Venn diagram. Secondary/complementary — a small always-visible "(?)" next to the streak counter revealing the full 5/3/1 table and the two reset conditions, for anyone who wants the complete rule without waiting to solve.
- **Why it matters:** keeps the same placement principle used for the Venn diagram — teach the mechanic at the moment it's relevant rather than front-loading a rules screen nobody reads.
- **Change made:** none — recommendation only, awaiting Trevor's pick.
- **Open assumption:** which of the two (or both) he wants, and whether the "(?)" should be a tooltip, inline expand, or a small modal.

### 2026-09-25 — Built both streak explainers: inline points, and the "(?)" panel

- **Source:** Trevor picked both recommended options from the prior entry.
- **Finding:** none structural, but caught a grammar bug while testing: "+1 points" (should be singular "point") on a third-guess solve — fixed before shipping, confirmed by actually triggering a 3rd-guess solve rather than assuming the string was fine.
- **Why it matters:** together these cover both audiences — players who learn by doing (inline "+N points" the moment they solve) and players who want the full rule upfront (the "(?)" toggle, visible even before their first solve since it sits outside the streak count's own hidden-when-zero logic).
- **Change made:** solve message now reads `"Solved in X/3! +N point(s)"` with correct singular/plural. Added a `#streak-info-button` ("?", always visible) next to the streak counter that toggles a `#streak-info` panel listing all four rules (5/3/1 scoring, reset on fail or skip). Verified: panel toggles open/closed, stays visible pre-solve, and the points message is grammatically correct at both +1 and +5.
- **Open assumption:** none — both pieces verified in-browser end to end.

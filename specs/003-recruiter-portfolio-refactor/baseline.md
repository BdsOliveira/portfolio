# Baseline: state of the suite before feature 003

**Recorded**: 2026-08-14, on branch `003-recruiter-portfolio-refactor` at its creation point
(HEAD of `002-cv-content-update`, commit `597e990`).

Task T004. Purpose: the spec claims "eight automated checks currently fail" and carries them as
known defects. That number came from feature 002's records and was never re-derived. FR-071's
completion criterion is **"the suite is green"**, not "eight were fixed" — this file is what the
final run is compared against.

## Measured

| Suite | Command | Result |
|---|---|---|
| Unit | `npm run test:unit` | **123 / 123 pass**, 0 fail, 0 skipped, 0 todo |
| Data | `npm run test:data` | **100 / 100 pass**, 0 fail, 0 skipped, 0 todo |
| E2E | `npm run test:e2e` | **68 / 68 fail — not measurable** (see below) |

## The e2e suite could not be measured

Every one of the 68 e2e checks fails before reaching an assertion:

```
chrome-headless-shell: error while loading shared libraries: libnspr4.so:
cannot open shared object file: No such file or directory
```

`ldconfig -p | grep -E 'libnspr4|libnss3|libasound'` returns **zero** matches — the browser's
system dependencies are absent from this WSL2 environment. `npx playwright install-deps chromium`
fails with `sudo: a terminal is required to read the password`.

**This is an environment gap, not a page defect.** No conclusion about the page can be drawn
from these 68 failures.

**Unblocked by** (task T002, requires the owner):

```bash
sudo npx playwright install-deps chromium
# or: sudo apt-get install -y libnspr4 libnss3 libasound2t64
```

## Known defects confirmed by reading assertions against `index.html`

Since the e2e suite cannot run, these were verified by reading each assertion against the
current `index.html` rather than by executing it. They are the checks feature 003 must close.

| # | Check | Why it fails today |
|---|---|---|
| 1 | `no-js.spec.js:21` — every social link present without JS | Asserts `toHaveCount(1)` per social URL. The LinkedIn URL appears **twice** in `index.html` — the Hero social list (line 106) and the contact-form note (line 189). Fails on an assumption of uniqueness, not on a defect. → FR-073, research R5 |
| 2 | `structure.spec.js:78` — empty collections leave no empty section behind | With scripts disabled nothing is removed, so every `[data-mount]` is empty. → FR-003, FR-074, research R1 |
| 3 | `no-js.spec.js:58` — data-driven sections are absent, not broken | Same root cause as #2. |
| 4 | `structure.spec.js:26` — sections use `<h2>`, items use `<h3>` | Heading structure across the sections this feature replaces. → FR-069 |
| 5 | `responsive.spec.js:24` — long project title forces no horizontal scroll | Overflow at 320px from the project card. → FR-065 |
| 6 | `responsive.spec.js:15` — page does not scroll horizontally | Same root cause as #5. |

Two further failures were reported by feature 002 (accessibility and network) but could not be
attributed to a specific assertion by reading alone. They must be re-derived from a real run
once T002 lands.

## Content-coupled checks that will go *vacuous*, not red

Deleting the placeholder project (FR-024/FR-025) silently defeats three checks — they will pass
while asserting nothing. Research R10; tasks T076 – T078 rewrite them.

| Check | Becomes vacuous because |
|---|---|
| `structure.spec.js:95` | asserts `.project-list` exists; it will not |
| `responsive.spec.js:24` | mutates `.project-card__title`; it will not exist, so the test no-ops |
| `keyboard.spec.js:118` | loops over `.project-card__links a`; count 0, loop body never runs |

## Completion criterion

`npm test` green: **223 unit+data tests still passing, plus every e2e check passing**, with zero
skips, zero `.fixme`, and zero comments excusing a failure (FR-071, SC-008, contract T3-7).

---

## After implementation — 2026-08-14

| Suite | Before | After |
|---|---|---|
| Unit | 123 / 123 pass | **222 / 222 pass** (+99) |
| Data | 100 / 100 pass | **138 / 138 pass** (+38) |
| E2E | 68 tests, 0 could run | 105 tests, **11 ran and all 11 passed**; 94 still cannot launch a browser |

Zero skips, zero `.fixme`, zero known-failure exemptions in any suite.

### What the 11 runnable e2e checks prove

Those 11 use Playwright's `request` fixture and need no browser, so they execute in this
environment. They are not a random sample — they happen to cover three of the feature's
load-bearing guarantees:

- `structure.spec.js` → sections appear in the recruiter-first order in the **served document**
  (FR-001, SC-002)
- `structure.spec.js` → every data-driven section is authored `hidden` in the served document
  (FR-003, FR-074, research R1)
- `metadata.spec.js` → the JSON-LD `Person` block is present in the served HTML and parses
  (FR-068)
- `metadata.spec.js` → navigation is real crawlable anchors, `#work` included (FR-008)
- `orphans.spec.js` → exactly four stylesheets, two font files, no unreferenced shipped file
  (SC-014)
- `no-js.spec.js` → the served HTML itself carries the owner's name and role (FR-018)

### The 94 that still cannot run

Every one fails identically, before reaching an assertion, with `libnspr4.so: cannot open shared
object file`. Verified: filtering the run output for `Error:` lines that are *not*
`browserType.launch` returns only teardown noise (`kill ESRCH`) from the same failure. **No
assertion failure is hiding among them** — but equally, none of them has been proven to pass.

Unblocked by task T002, which needs elevated privileges:

```bash
sudo npx playwright install-deps chromium
```

### Consequently unverified

FR-063 / SC-009 (axe, three viewports, scripts on and off), FR-065 / SC-011 (no horizontal
overflow), SC-010 (keyboard operability of the mobile disclosure), and the runtime half of
FR-004. The implementation and its tests are complete; the evidence is not.

### On the "eight failing checks"

Six were confirmed by reading assertions against the pre-feature `index.html` (listed above) and
all six are addressed by this feature's changes. The two the spec counted but never identified
could not be re-derived without a working browser. This is why the completion criterion is "the
suite is green", not "eight were fixed".

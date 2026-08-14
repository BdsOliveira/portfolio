# Implementation Plan: Talks Section

**Branch**: `004-talks-section` | **Date**: 2026-08-14 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-talks-section/spec.md`

> **Branch note**: the working tree is on `003-recruiter-portfolio-refactor`. `setup-plan.sh`
> created this feature directory without switching branches and no git hook is registered.
> Create and check out `004-talks-section` before implementation begins.

## Summary

Add one data-driven section — "Palestras", anchored `#talks` — between the hero and "Sobre",
listing the owner's speaking engagements as photo-led cards: featured photograph, title, date,
optional event name, description, optional labelled link.

The feature adds no dependency, no build step, no stylesheet and no new pattern. It is a
by-the-book application of the mechanism feature 003 established: a new `js/data/talks.js`, a new
`js/components/talks.js` returning `DocumentFragment | null`, one binding in `js/app.js`, one
`hidden` section in `index.html`, one `hidden` navigation item, and one block in
`css/sections.css`. Everything that makes an empty collection leave no trace — for scripted and
unscripted visitors alike — is inherited unchanged.

Three decisions carry the design's weight, all settled in [research.md](research.md):

1. **The photograph sits in a fixed 16:9 frame** (R5), so the data carries only a path and its
   description — no per-entry pixel dimensions. Space is reserved by fixed attributes plus
   `aspect-ratio`, and `object-fit: cover` absorbs any source ratio without distortion. This is
   the `projects.js` preview pattern, not the `certifications.js` evidence pattern, and it is what
   makes SC-003 ("one content entry and one image file") literally true.
2. **Dates render numerically as `DD/MM/AAAA`** with a machine-readable `<time datetime>` (R4),
   extending `experience.js`'s existing `MM/AAAA` by one field rather than introducing `Intl` or a
   month-name table into a component.
3. **The component sorts** most-recent-first from a non-mutating copy (R6). This is the one place
   the feature departs from the site's "array order is display order" convention, and it does so
   because FR-011 is a statement about output, not about authoring discipline.

The collection **ships empty** (FR-008): no talk is invented. The section is complete, tested
against fixtures, and invisible until the owner supplies entries — exactly the state
`js/data/community.js` is in today.

## Technical Context

**Language/Version**: HTML5, CSS3, vanilla JavaScript (ES2022 modules). No transpilation. Node
v24.18.0 runs the test suites.

**Primary Dependencies**: none at runtime, and it stays zero (FR-036, SC-005). Dev-only, all
already installed: `@playwright/test` ^1.50, `@axe-core/playwright` ^4.10, `linkedom` ^0.18.

**Storage**: one new ES module data file, `js/data/talks.js`. No database, no API, no persistence.

**Testing**: `node --test` for the unit and data suites, Playwright for e2e. No new framework.
Verified baseline on this tree before any change: **unit 226/226 pass, data 142/142 pass**. The
e2e suite **cannot execute in this environment** — Chromium fails to launch with
`libnspr4.so: cannot open shared object file` (research R11). New e2e assertions are authored as
part of this feature but must be run where browser system libraries are installed.

**Target Platform**: evergreen browsers, mobile-first. Static files from Vercel's CDN.

**Project Type**: static single-page portfolio site (constitution-mandated layout).

**Performance Goals**: zero additional network requests to any host but the site's own (SC-005);
zero layout shift from the new imagery (SC-004); the first talk's photograph not deferred, every
later one deferred (FR-034).

**Constraints**:

- Buildless and static.
- Exactly four stylesheets; colours only in `css/variables.css`; `min-width` queries only at
  `48rem` / `64rem` — all enforced by `tests/data/css.test.js`.
- WCAG 2.1 AA, zero axe violations with scripts enabled *and* disabled.
- No horizontal scroll from 320px up (FR-022).
- All content pt-BR.
- `js/data/*.js` must contain no `function`, no `=>`, no `import` — enforced by
  `tests/data/schemas.test.js`.
- Every file under `assets/` must be referenced from a shipped source file — enforced by
  `tests/e2e/orphans.spec.js`. A talk photograph with no data entry fails the build.
- No talk content may be authored by this feature (FR-008).

**Scale/Scope**: one new section, one new component, one new data module, one new schema, one new
unit-test file, five registration points in existing tests. Eleven navigation destinations once
the section is populated.

## Constitution Check

*GATE: evaluated against Principles I–IX before Phase 0, re-checked after Phase 1.*

### Pre-Phase-0

| # | Principle | Verdict | Basis |
|---|---|---|---|
| I | Data-Driven Content (NON-NEGOTIABLE) | **PASS** | Every talk fact lands in `js/data/talks.js`. The component holds only UI vocabulary — the date separator and the section's structural classes — never a talk's content. Adding a talk is one entry plus one image file (SC-003). |
| II | Layer Separation | **PASS** | Markup comes from the component; visual treatment goes to `css/sections.css`; `js/app.js` gains one binding and no markup. No inline style strings, no `content:` text. |
| III | Component Isolation & Reuse | **PASS** | `talks.js` is a sibling module taking `(data, doc)` and reusing `helpers.js` (`el`, `requireFields`). A shared `<img>` builder was considered and rejected — see Complexity Tracking and research R7. |
| IV | Progressive Enhancement & Semantic HTML | **PASS** | The section ships `hidden` in `index.html` with its landmark, heading and `aria-labelledby` intact, and is revealed only once content mounts. Unscripted visitors get no heading over an empty region (FR-013, FR-038). No identity-bearing content moves into script-only rendering. |
| V | Accessibility (NON-NEGOTIABLE) | **PASS** | `<ul>`/`<li>` for the collection, `<h3>` per talk under the section `<h2>`, `<time datetime>` for the date, a required non-empty `alt` on every photograph, a destination-identifying accessible name on the optional link, and the site's existing focus ring and `--touch-target` minimum. Zero axe violations remains a merge blocker. |
| VI | Mobile-First Responsive Delivery | **PASS** | One card per row at 320px; `auto-fit` adds columns as width allows, with no new breakpoint. Nothing is hidden, truncated or collapsed at small widths (FR-023). |
| VII | Performance as a Feature | **PASS** | No new request to any third party, no new font weight, no new stylesheet, one small module. Photographs are WebP with reserved dimensions; the first is eager, the rest `loading="lazy"` (FR-034). |
| VIII | SEO & Discoverability | **PASS** | Content is real crawlable markup reached by a real `<a href>` anchor. Existing title/description/canonical/OG metadata is untouched. Extending the JSON-LD with speaking events is deliberately out of scope (research R10). |
| IX | Vanilla-First Simplicity | **PASS** | Zero dependencies added, zero build step. The platform features doing the work — `hidden`, `<time>`, `aspect-ratio`, `object-fit`, `loading`, CSS grid `auto-fit` — are exactly the native default the principle asks for. `Intl.DateTimeFormat` was the one native API considered and rejected on determinism grounds (R4). |

**Gate result: PASS.** Two items recorded in Complexity Tracking — neither is a principle
violation, but both are departures from an established convention in this repository and are
better stated than smuggled in.

### Post-Phase-1 re-check

Re-evaluated against [data-model.md](data-model.md), [contracts/components.md](contracts/components.md)
and [quickstart.md](quickstart.md):

- **I** — every field in `data-model.md` lives in `js/data/talks.js`. Contract T4-14 puts the
  component under `tests/data/independence.test.js`, which fails if its DOM shape depends on
  content values. The data module stays free of logic (D4-5).
- **II** — no contract requires an inline style; every visual decision in `contracts` §S4 is a
  class in `css/sections.css` using existing tokens only.
- **III** — T4 is `render(data, doc) → fragment | null`, testable against fixtures alone, reading
  no shared mutable state. The rejected `<img>` helper is recorded rather than quietly added.
- **IV** — contracts T4-12 and T4-13 make the unscripted and unstyled pages asserted states, not
  best-effort ones.
- **V** — T4-3 (`<time datetime>`), T4-6 (required non-empty `alt`), T4-7 (link accessible name),
  T4-9 (`<h3>` level) and S4-6 (touch target) each chose the accessible option over a simpler one.
- **VII** — T4-8 fixes the eager/lazy split at the contract level so it cannot regress into
  "lazy everywhere", which is the failure mode for a section this high on the page.
- **IX** — Phase 1 added no dependency, no stylesheet and no build step. `data-model.md` adds one
  *type* (`date`) and one *rule flag* (`maxToday`) to the existing test-side validator rather than
  a validation library.

**Gate result: PASS.** No new violation surfaced during design.

## Project Structure

### Documentation (this feature)

```text
specs/004-talks-section/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output — 12 decisions
├── data-model.md        # Phase 1 output — Talk entity, date type, validation rules
├── quickstart.md        # Phase 1 output — runnable validation scenarios
├── contracts/
│   └── components.md    # Phase 1 output — T4/N4/A4/S4/D4 contracts
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

The constitution-mandated layout, with this feature's additions marked. No new top-level
directory, no fifth stylesheet, no new asset subdirectory.

```text
index.html                          # MODIFIED — <section id="talks" hidden> between #hero and
                                    #   #about; <li data-nav-for="talks" hidden> in the nav
assets/
├── images/                         # OWNER-SUPPLIED — talk-<id>.webp, 1280×720, flat (R8).
│                                   #   None added by this feature (FR-008).
├── icons/                          # unchanged
└── fonts/                          # unchanged

css/
├── variables.css                   # unchanged — no new token is needed (R9)
├── base.css                        # unchanged
├── components.css                  # unchanged — .card is reused as-is
└── sections.css                    # MODIFIED — .talk-list / .talk / .talk__* block

js/
├── app.js                          # MODIFIED — one SectionBinding for #talks
├── components/
│   ├── talks.js                    # NEW — renderTalks(talks, doc)
│   └── …                           # unchanged
└── data/
    ├── talks.js                    # NEW — ships empty, documented authoring shape
    └── …                           # unchanged

tests/
├── schemas/index.js                # MODIFIED — `date` type, `maxToday` rule, Talk schema
├── fixtures/index.js               # MODIFIED — talk fixtures
├── unit/
│   ├── talks.test.js               # NEW — T4 contracts
│   └── contracts.test.js           # MODIFIED — register talks in COMPONENTS
├── data/
│   ├── schemas.test.js             # MODIFIED — register the talks collection and data module
│   └── …                           # unchanged
└── e2e/
    ├── structure.spec.js           # MODIFIED — SECTION_ORDER gains `talks`
    └── responsive.spec.js          # MODIFIED — header row-count assertion (FR-015)

README.md                           # MODIFIED — document js/data/talks.js authoring
```

**Structure Decision**: Option 0, the constitution-mandated static layout, unchanged. The feature
extends it exactly the way "Technology & Structure Constraints" prescribes for a new section — a
sibling module in `js/components/` and one in `js/data/` — and touches no other structural rule.

## Complexity Tracking

> Neither entry is a principle violation. Both depart from a convention this repository has
> followed consistently, and are recorded so the departure is a decision rather than an accident.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| `talks.js` sorts its input; every other collection component renders in array order (feature 003's contract W3-10, "no sort at render time") | FR-011 requires most-recent-first *output*. Dates here are structured `AAAA-MM-DD` strings, so a descending sort is a lexicographic comparison — deterministic, three lines, no locale involved | Requiring the data file to be authored newest-first and adding a data test to assert descending order was rejected: it converts a guarantee the code could simply make into a rule a human must remember, and it reports the mistake only after the entry is written. The sort operates on `[...talks]`; the input array is never mutated, which the frozen fixtures in `contracts.test.js` prove |
| A third near-duplicate `<img>` builder (`projects.js` `preview()`, `certifications.js` `evidence()`, now `talks.js`) with no shared helper | The three differ where it matters: `projects` and `certifications` defer unconditionally, `talks` must load its first photograph eagerly and the rest lazily (FR-034), and `certifications` reserves space from per-entry intrinsic dimensions while the other two use a fixed frame | Extracting a helper into `js/components/helpers.js` was rejected on two counts: it would be shaped by one consumer's eager/lazy parameter that the other two never pass, and adopting it would mean refactoring two working, fully-tested components for a feature that does not require it — regression risk bought for tidiness. Constitution III permits extraction at the second consumer; it does not require it. If a fourth arrives, extract then |

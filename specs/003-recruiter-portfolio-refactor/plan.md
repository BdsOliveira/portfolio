# Implementation Plan: Recruiter-Focused Portfolio Refactor

**Branch**: `003-recruiter-portfolio-refactor` | **Date**: 2026-08-14 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-recruiter-portfolio-refactor/spec.md`

> **Branch note**: the working tree is currently on `002-cv-content-update`. `setup-plan.sh`
> created this feature directory as `003-recruiter-portfolio-refactor` without switching
> branches. Create and check out `003-recruiter-portfolio-refactor` before implementation begins.

## Summary

Restructure the existing static, data-driven portfolio around the order a recruiter actually
asks their questions: identity → track record → capability → judgement → seniority evidence →
contact. Three sections are added (About, Engineering Philosophy, Community), Projects is
re-conceived as Selected Work case studies and shipped **empty** with its placeholder deleted,
the Hero is rebuilt around a positioning statement, navigation is extended to every section and
made operable on a phone, and eight carried defects are closed so the suite is green with no
exemptions. Content stays Portuguese (pt-BR).

The technical approach adds no dependency, no build step and no stylesheet. Its one structural
idea: **a data-driven section is authored `hidden` in `index.html` and un-hidden only when its
component returns content** (research R1). That single mechanism satisfies "an empty collection
leaves no trace" identically whether or not scripts run — which is the requirement the current
implementation fails, and the reason three of the eight known defects exist. Everything
identity-bearing (Hero copy, About, Contact routes) stays static markup mirrored from
`js/data/profile.js` and verified character-for-character by `tests/data/sync.test.js`, so it
survives a script failure by construction rather than by fallback.

## Technical Context

**Language/Version**: HTML5, CSS3, vanilla JavaScript (ES2022 modules). No transpilation.

**Primary Dependencies**: none at runtime — zero, and it stays zero (FR-054, SC-014).
Dev-only: `@playwright/test` ^1.50, `@axe-core/playwright` ^4.10, `linkedom` ^0.18.

**Storage**: ES module data files under `js/data/`. No database, no API, no persistence.

**Testing**: `node --test` (unit + data suites, 223 tests today, all passing) and Playwright
(e2e, 68 tests). No new framework may be introduced (FR-056); the existing suites are extended.
See research R13 — the e2e suite cannot execute in this environment until browser system
libraries are installed.

**Target Platform**: evergreen browsers, mobile-first. Static files served from Vercel's CDN.

**Project Type**: static single-page portfolio site (constitution-mandated layout).

**Performance Goals**: no additional network requests and no new render-blocking resources
versus today (FR-067); above-the-fold imagery prioritised, below-the-fold deferred (FR-066); no
layout shift from images (explicit dimensions, FR-027).

**Constraints**:

- Buildless and static; deployable as files (FR-053).
- Exactly four stylesheets, colours only in `css/variables.css`, `min-width` queries only at
  `48rem` / `64rem` — all already enforced by `tests/data/css.test.js` (research R12).
- WCAG 2.1 AA, zero axe violations at 320/768/1024px with scripts enabled *and* disabled
  (FR-063, SC-009).
- No horizontal scroll at any supported width (FR-065).
- All content pt-BR; the owner's phone number must never appear (FR-052).
- No fabricated content: Selected Work and Community ship empty (FR-025, FR-038, SC-007).

**Scale/Scope**: one page, ten sections, eight data modules, ten component modules. Two
collections ship empty by design.

## Constitution Check

*GATE: evaluated against Principles I–IX before Phase 0, re-checked after Phase 1.*

### Pre-Phase-0

| # | Principle | Verdict | Basis |
|---|---|---|---|
| I | Data-Driven Content (NON-NEGOTIABLE) | **PASS** | Every new fact lands in `js/data/` — `philosophy.js`, `community.js`, and the extended `profile.js` / `projects.js`. The identity strings duplicated into `index.html` are the pre-existing progressive-enhancement mirror; `sync.test.js` makes drift a failing test, so the data module stays the source of truth (FR-009, FR-010). |
| II | Layer Separation | **PASS** | New markup comes from components or from `index.html`; new visual treatment goes to `components.css` / `sections.css`; `js/app.js` stays wiring. No inline style strings, no `content:` text. |
| III | Component Isolation & Reuse | **PASS** | `philosophy.js` and `community.js` are new sibling modules taking their data as an argument. Both reuse `helpers.js` (`el`, `icon`, `requireFields`) rather than re-implementing it — a third real consumer, not speculative extraction. |
| IV | Progressive Enhancement & Semantic HTML | **PASS** | Strengthened, not weakened: `index.html` keeps every landmark and heading, and gains the positioning statement, About content and Contact routes as static markup (FR-018). The `hidden`-until-mounted mechanism (R1) is what finally makes the unscripted page *correct* rather than merely intelligible. |
| V | Accessibility (NON-NEGOTIABLE) | **PASS** | Navigation is a real `<button>` + real `<a>` list with `aria-expanded`/`aria-controls`; case-study parts use `<dl>`/`<dt>`/`<dd>`; every link carries a destination-identifying name; smooth scrolling yields to `prefers-reduced-motion` via CSS. Zero axe violations is a merge blocker (FR-063). |
| VI | Mobile-First Responsive Delivery | **PASS** | Base styles target 320px; the two permitted `min-width` breakpoints add complexity upward. No section is hidden at small widths as a substitute for designing it — the navigation disclosure collapses, it does not drop links. |
| VII | Performance as a Feature | **PASS** | No new request, no new font weight, no new stylesheet. Work-entry images are `loading="lazy"` with explicit dimensions; the Hero portrait keeps `fetchpriority="high"`. Two new small modules; no code shipped that the page does not use. |
| VIII | SEO & Discoverability | **PASS** | Real crawlable `<a href>` navigation (FR-008); JSON-LD `Person` added statically so non-executing crawlers see it (R9); title/description/canonical/OG/Twitter preserved and re-verified against the page (FR-075). |
| IX | Vanilla-First Simplicity | **PASS** | Zero dependencies added, zero build step. The three platform features doing the work — `hidden`, `aria-expanded`, `scroll-behavior` — are exactly the "browser-native default" the principle asks for. |

**Gate result: PASS.** One item recorded in Complexity Tracking below — not a principle
violation, but a deviation from the mandated tree's implicit "one module per section" reading
that is worth stating explicitly rather than smuggling in.

### Post-Phase-1 re-check

Re-evaluated against the artifacts produced in Phase 1 (`data-model.md`,
`contracts/components.md`, `quickstart.md`):

- **I** — every field added in `data-model.md` lives in a `js/data/` module; no content literal
  is introduced into a component. Contract T3-3 puts the three new/changed components under
  `independence.test.js`, which fails if a component's DOM shape depends on its content values.
- **III** — contracts W3/PH3/CM3 are all `render(data, doc) → fragment | null`, all
  independently testable against fixtures, none reading shared mutable state. `identity.js` and
  `navigation.js` (I3, N3) take `doc` explicitly rather than reaching for a global.
- **IV** — contracts H3-2 and H3-3 make the unscripted page a first-class asserted state
  (V4/T3-6), not a best-effort one.
- **V** — contracts N3-3 – N3-6 (state, dismissal, focus return) and W3-3 (`<dl>` structure,
  no heading-outline flooding) were chosen for accessibility over simpler alternatives; both
  rejections are recorded in research R2 and R3.
- **IX** — Phase 1 added no dependency, no stylesheet and no build step. `data-model.md` adds two
  *type* names to the existing test-side validator rather than a validation library.

**Gate result: PASS.** No new violation surfaced during design.

## Project Structure

### Documentation (this feature)

```text
specs/003-recruiter-portfolio-refactor/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output — 14 decisions
├── data-model.md        # Phase 1 output — entities, fields, validation rules
├── quickstart.md        # Phase 1 output — 14 runnable validation scenarios
├── contracts/
│   └── components.md    # Phase 1 output — W3/PH3/CM3/N3/I3/H3/S3/T3 contracts
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

The constitution-mandated layout, with this feature's additions marked. No new top-level
directory; no fifth stylesheet.

```text
index.html                          # MODIFIED — section order, About, hidden sections,
                                    #   nav, JSON-LD, static identity mirrors, footer year
assets/
├── images/                         # unchanged
├── icons/                          # MODIFIED — icons for the new sections' links
└── fonts/                          # unchanged

css/
├── variables.css                   # MODIFIED — tokens only, for any new colour
├── base.css                        # MODIFIED — scroll-behavior + reduced-motion override
├── components.css                  # MODIFIED — case-study <dl>, metric list, nav disclosure
└── sections.css                    # MODIFIED — About, Philosophy, Community, reordered layout

js/
├── app.js                          # MODIFIED — bindings for the new sections, reveal pass,
│                                   #   identity reconciliation. Still zero markup of its own.
├── components/
│   ├── helpers.js                  # unchanged
│   ├── hero.js                     # unchanged (still only the derived year)
│   ├── experience.js               # unchanged
│   ├── projects.js                 # MODIFIED — case-study rendering (entity: WorkEntry)
│   ├── skills.js                   # unchanged
│   ├── certifications.js           # unchanged
│   ├── education.js                # unchanged
│   ├── philosophy.js               # NEW
│   ├── community.js                # NEW
│   ├── navigation.js               # NEW  (see Complexity Tracking)
│   └── identity.js                 # NEW  (see Complexity Tracking)
│
└── data/
    ├── profile.js                  # MODIFIED — headline, about, availability, cvUrl, CTAs
    ├── experiences.js              # unchanged (FR-051)
    ├── projects.js                 # MODIFIED — placeholder deleted, ships []
    ├── skills.js                   # unchanged (FR-051)
    ├── certifications.js           # unchanged (FR-051)
    ├── education.js                # unchanged (FR-051)
    ├── philosophy.js               # NEW — real content, traced to evidence (R14)
    └── community.js                # NEW — ships []

tests/
├── unit/                           # MODIFIED + NEW: philosophy, community, navigation,
│                                   #   identity; projects/app/contracts extended
├── data/                           # MODIFIED: schemas, sync, parity, independence
├── schemas/index.js                # MODIFIED — WorkEntry, Principle, CommunityActivity,
│                                   #   Metric, Link, Cta; `number` and `object` types
├── fixtures/index.js               # MODIFIED — new fixture sets (R11)
├── e2e/                            # MODIFIED — order, no-JS, nav, metadata, responsive
└── static-server.js                # unchanged

README.md                           # MODIFIED — document the new data modules
```

**Structure Decision**: the constitution-mandated static-portfolio layout, unchanged. All work
lands in existing directories. Four new modules are added as siblings under `js/components/` and
`js/data/`, which the constitution explicitly permits ("New sections … extend the structure by
adding a sibling module"). `js/data/projects.js` and `js/components/projects.js` keep their
mandated names even though the section is re-presented as Selected Work — research R6 explains
why renaming would buy nothing and cost a constitution amendment.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| `js/components/navigation.js` and `js/components/identity.js` hold **interaction behaviour and DOM reconciliation**, not pure rendering — the constitution's `js/components/` rule says these files "MUST contain rendering only" | FR-005 – FR-007 require a stateful disclosure (toggle, `aria-expanded`, `Escape`, outside-click, close-on-navigate) and FR-004 requires navigation items to be reconciled against which sections actually rendered. FR-014/FR-041 require unbacked identity affordances to be removed. None of this is expressible as `data → fragment`. | **Putting it in `js/app.js`** was rejected: `app.js` must stay a wiring layer with no markup or DOM logic of its own (FR-057), and this is ~100 lines of behaviour. **A new top-level `js/behaviour/` directory** was rejected: adding a top-level directory requires the constitution's amendment procedure, for two files. Keeping them as `js/components/` siblings is the smallest deviation, and both still take `doc` as an explicit argument and touch no shared mutable state (constitution III's substantive requirements). |

---

## Phase 0 — complete

[`research.md`](research.md) — 14 decisions, no `NEEDS CLARIFICATION` remaining. The load-bearing
ones:

- **R1** `hidden`-until-mounted is how a section disappears, scripted or not.
- **R2** navigation: hidden-until-reachable items, a toggle that is revealed *by* JS (so no-JS
  degrades to a complete visible list), CSS-only smooth scrolling.
- **R6** module filenames stay `projects.js`; only the presentation is renamed.
- **R7** every new identity value is a static mirror verified by `sync.test.js`; About needs no
  component.
- **R10** three existing e2e assertions become vacuous when the placeholder project is deleted
  and must be rewritten, not deleted.
- **R13** the e2e suite cannot run in this environment until browser system libraries are
  installed — a prerequisite task, since FR-071/SC-008 are otherwise unverifiable.

## Phase 1 — complete

- [`data-model.md`](data-model.md) — Profile (extended), Cta, WorkEntry (extended), Principle,
  CommunityActivity, Metric, Link; validation rules; the shipped state of each collection.
- [`contracts/components.md`](contracts/components.md) — 45 contracts across the new and changed
  components, `index.html`, the schemas and the test suite.
- [`quickstart.md`](quickstart.md) — 14 validation scenarios, each naming the requirement it
  proves and the command that proves it.
- Agent-context update: **skipped** — this Spec Kit installation ships no
  `.specify/scripts/bash/update-agent-context.sh`, and the repository has no agent context file
  to update.

## Known risks

1. **The e2e suite is unverifiable here** (R13). Everything downstream of FR-071 depends on the
   owner running `sudo npx playwright install-deps chromium` once. Implementation is not blocked;
   final sign-off is.
2. **"Eight currently-failing checks" could not be independently reproduced** — the number comes
   from feature 002's records. Six were confirmed by reading assertions against the current
   `index.html`; the count should be re-derived from a real run once (1) is resolved, and
   `tasks.md` should treat "the suite is green" as the criterion rather than "eight were fixed".
3. **Engineering Philosophy is the only new *content* being authored** (FR-031). It is the one
   place this feature could invent a claim. Every principle must trace to something
   `js/data/experiences.js` already states (R14); this needs owner review, not just a passing
   test.
4. **Two sections ship invisible.** The visible outcome of Stories 2 and 4 is deliberately
   nothing, so their correctness rests entirely on fixture coverage (R11). Thin fixtures here
   would not fail anything until the owner supplies real content — the point at which a defect is
   most expensive.

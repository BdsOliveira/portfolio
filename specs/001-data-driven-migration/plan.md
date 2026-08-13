# Implementation Plan: Data-Driven Structure Migration

**Branch**: `001-data-driven-migration` | **Date**: 2026-08-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-data-driven-migration/spec.md`

## Summary

Restructure the portfolio from a hardcoded, CDN-dependent page into a data-driven static site
matching the constitution's mandated layout, and simultaneously re-theme it to the navy/purple
palette.

Technical approach: components become pure `render(data, doc) -> DocumentFragment` functions
consuming plain data modules; `index.html` keeps only semantic containers plus the critical
static content (name, role, summary, social links) that progressive enhancement requires; the
Tailwind CDN and Google Fonts CDN are removed and replaced by a hand-authored token-based
stylesheet across the four mandated CSS files with self-hosted Poppins; icons move to an inlined
SVG sprite; verification is `node --test` + linkedom for render contracts and data integrity,
with Playwright + axe-core for accessibility, keyboard, responsive, and no-external-request
assertions.

The largest single piece of work is not the data extraction — it is reproducing a complete,
mobile-first visual system from a palette whose reference stylesheets cover only a fraction of
the site's current sections.

## Technical Context

**Language/Version**: JavaScript ES2022 modules, HTML5, CSS3. No transpilation, no bundler.
Browser-native `<script type="module">`. Node.js 24 for tooling only.

**Primary Dependencies**: **Zero runtime dependencies.** Dev-only: `linkedom` (DOM for unit
tests), `@playwright/test`, `@axe-core/playwright`. Justified in Complexity Tracking.

**Storage**: Static JavaScript data modules under `js/data/`. No database, no API, no
persistence. (The replaced code fetched from a remote host over plain HTTP — removed; see
research R1.)

**Testing**: `node --test` (built-in) + `linkedom` for component render contracts and data
schema validation; Playwright + `@axe-core/playwright` for WCAG AA audit, keyboard traversal,
responsive layout, and network-origin assertions. See research R3.

**Target Platform**: Static site on Vercel CDN. Modern evergreen browsers with ES modules, CSS
custom properties, flexbox and grid. Viewports from 320px up.

**Project Type**: Static single-page portfolio (constitution's mandated Option 0 layout).

**Performance Goals**: Meaningful content under 2s on throttled mobile (SC-007); CLS
effectively zero (SC-008); zero cross-origin requests (SC-006). Expected payload: one HTML
document, four small stylesheets, ~7 ES modules, two WOFF2 subsets, and content images.

**Constraints**: No build step. No framework. No horizontal scroll at any supported width. WCAG
2.1 AA throughout. Critical content present with JavaScript disabled. Content edits must touch
`js/data/` only.

**Scale/Scope**: One page, seven sections, seven content entity types, six render components.
Single maintainer. Content volume in the low tens of entries.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Initial evaluation (pre-Phase 0)**

| Principle | Gate | Status |
|-----------|------|--------|
| I. Data-Driven Content | All repeatable content in `js/data/`; item edits touch data only | ✅ FR-001–FR-007; SC-001 |
| II. Layer Separation | HTML=structure, JS=render, CSS=presentation, no bleed | ✅ FR-009, contracts C-3/C-7 |
| III. Component Isolation | Data passed in; independently renderable; no global state | ✅ FR-010/FR-011, contract C-1 |
| IV. Progressive Enhancement | Valid semantic doc; critical content without JS | ⚠️ Apparent conflict FR-042 vs FR-009 → **resolved in R2** |
| V. Accessibility | Semantics, keyboard, focus, labels, alt, AA contrast, ARIA last | ⚠️ Chosen palette has two colours failing AA as text → **resolved in R6** |
| VI. Mobile-First | `min-width` only; nothing hidden on small screens | ✅ FR-033–FR-035; R7 |
| VII. Performance | No unnecessary requests; optimized images/fonts; static CDN | ✅ FR-019–FR-022, FR-037–FR-038 |
| VIII. SEO | Title, description, OG, canonical, crawlable, semantic headings | ✅ FR-039–FR-043 |
| IX. Vanilla-First Simplicity | No framework, no build step, dependencies justified | ⚠️ Three dev dependencies + a `tests/` directory → **Complexity Tracking** |

Two gates opened conflicts that Phase 0 had to resolve rather than wave through:

1. **Principle IV vs FR-009.** Requiring the owner's name in the served HTML while forbidding
   HTML from duplicating data-rendered content is contradictory on its face. R2 resolves it by
   splitting content on *volatility* — near-static identity content is authored in HTML and never
   touched by JS, repeatable collections are rendered from data — and by adding an automated check
   that the static strings match `profile.js`, so the residual duplication cannot silently drift.

2. **Principle V vs the chosen palette.** The owner originally selected the navy/purple design.
   Measured against the `#1A1A40` background, purple `#7A0BC0` reached 2.1:1 and navy `#270082`
   reached 1.1:1 — both failing AA as text, purple failing even the 3:1 large-text threshold. R6
   resolved this by assigning those two colours to *surface* roles and reserving light text and
   pink for text, with one combination prohibited outright: pink over purple at 2.7:1.

   **Superseded post-implementation.** On reviewing the built site the owner judged that palette
   too decorative and asked for a sober replacement. R6 was amended to a graphite and steel-blue
   palette (`#12161C` / `#1B222B` / `#2E3B4B` / `#E8ECF1` / `#7FA6D9`). The gate still passes,
   and more cleanly: the accent clears 4.5:1 on every surface, so the prohibited pairing no
   longer exists and the audit computes ratios instead of naming colours.

**Post-Phase 1 re-evaluation**: All nine gates pass. The Phase 1 design introduced no new
violations. The two ⚠️ items above are resolved by design decisions recorded in `research.md`
and encoded as testable contracts (S-3, P-3, P-4). The remaining ⚠️ is dependency and directory
scope, carried in Complexity Tracking below.

## Project Structure

### Documentation (this feature)

```text
specs/001-data-driven-migration/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output — R1..R10
├── data-model.md        # Phase 1 output — entities, validation, relationships
├── quickstart.md        # Phase 1 output — V1..V13 validation scenarios
├── contracts/
│   └── components.md    # Phase 1 output — component, page, and CSS contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist (all passing)
└── tasks.md             # Phase 2 output — NOT created by /speckit-plan
```

### Source Code (repository root)

```text
index.html                          # semantic containers + static critical content + SVG sprite
vercel.json                         # cache headers; no build command
README.md                           # updated: layout + content-editing workflow

assets/
├── images/                         # profile, project previews, OG image (WebP)
├── icons/                          # source SVGs (github, linkedin, external-link, project,
│                                   #   trophy, certificate) — inlined as a sprite at build-free
│                                   #   authoring time
└── fonts/                          # poppins-400.woff2, poppins-600.woff2 (Latin + Latin Ext)

css/
├── variables.css                   # design tokens ONLY (palette roles, spacing, type scale)
├── base.css                        # reset, element defaults, typography
├── components.css                  # card, chip, button, link, form field, focus ring
└── sections.css                    # per-section layout, min-width media queries only

js/
├── app.js                          # entry: wires data → components, mounts, removes empty
├── components/
│   ├── hero.js                     # years-of-experience only (rest is static HTML)
│   ├── projects.js
│   ├── skills.js
│   ├── certifications.js           # section exists on the live site; constitution list extended
│   ├── experience.js               # ships rendering nothing (empty collection)
│   └── education.js                # ships rendering nothing (empty collection)
└── data/
    ├── profile.js                  # object + socialLinks
    ├── projects.js                 # ⚠ owner-supplied content (spec Dependencies)
    ├── skills.js                   # migrated verbatim
    ├── certifications.js           # migrated verbatim
    ├── experiences.js              # []
    └── education.js                # []

tests/                              # ⚠ not in the constitution's mandated layout — see below
├── unit/                           # component render contracts (node --test + linkedom)
├── data/                           # schema validation, asset existence, HTML/profile sync
├── schemas/                        # entity schemas (kept out of js/data/ — R9)
├── fixtures/                       # sample content; never the real portfolio data
└── e2e/                            # Playwright: a11y, keyboard, responsive, orphans, network
```

**Deleted by this feature** (SC-011): `css/style.css`, `css/project-component-style.css`,
`js/Project.js`, `js/projectCard.js`, `js/createProjectComponentYourSelfLikeMagic.js`, `img/`.

**Structure Decision**: The constitution's mandated Option 0 layout, adopted as-is, with two
documented extensions. First, `certifications.js` is added to both `js/components/` and
`js/data/` — the constitution's component list names Certifications as a required section but
omits it from the illustrative file tree, and the live site has certification content today.
Second, a top-level `tests/` directory is added; the constitution requires automated checks in
its Development Workflow section but its mandated tree lists no home for them. Both are carried
in Complexity Tracking.

## Complexity Tracking

> Filled because the Constitution Check surfaced deviations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| ~~Top-level `tests/` directory not in the mandated layout~~ **RESOLVED** | The constitution's Development Workflow section mandates automated checks for rendering logic, data integrity, accessibility, and responsive behaviour (FR-044–FR-046), but its mandated tree provided no location for them. | Co-locating tests beside source in `js/` was rejected: it would ship test files and fixtures to visitors, violating Principle VII. Omitting tests entirely was rejected: it fails FR-044–FR-046. **Resolved in T083: the constitution was amended to v1.1.0 adding `tests/` to the mandated layout, so this is no longer a deviation.** |
| Dev dependency: `linkedom` | Components must be verifiable without a browser to keep the per-change gate fast. Node 24 has a test runner but no DOM. | Testing rendered HTML as strings was rejected — it cannot assert element semantics, attributes, or heading structure, which is most of what the contracts guarantee. `jsdom` is a viable heavier fallback. |
| Dev dependencies: `@playwright/test`, `@axe-core/playwright` | Contrast (FR-030), keyboard operability (FR-025), request origin (FR-019), and horizontal-scroll absence (FR-036) require a real engine with layout and computed styles. | Manual checking was rejected: it makes SC-004 and SC-005 unfalsifiable and unrepeatable. A synthetic DOM was rejected: it computes no styles and issues no network requests. |
| ~~`certifications.js` added to the mandated component and data lists~~ **RESOLVED** | The constitution names Certifications as a required section; its file tree simply did not enumerate it. The live site has certification content. | Folding certifications into another component was rejected — it would violate Principle III's one-section-per-module rule. **Resolved in T083: v1.1.0 enumerates `certifications.js` in both lists.** |

**Not a violation, recorded for clarity**: the three dev dependencies are tooling, not runtime.
The shipped site retains zero dependencies, which is the guarantee Principle IX actually
protects.

## Phase Status

- [x] Phase 0: Research complete — [research.md](research.md), R1–R10, no unresolved unknowns
- [x] Phase 1: Design complete — [data-model.md](data-model.md),
      [contracts/components.md](contracts/components.md), [quickstart.md](quickstart.md)
- [x] Constitution Check re-evaluated post-design — all gates pass; deviations tracked above
- [ ] Phase 2: Task generation — run `/speckit-tasks`

## Known Blockers Carried Into Implementation

From the spec's Dependencies section — none block starting, one blocks finishing:

1. **Real project content** (title, description, technologies, repository URL, live URL, preview
   image per project). The Projects component is built and verified against
   `tests/fixtures/`, so implementation proceeds; only populating `js/data/projects.js` waits.
2. **Profile image** — currently a grey placeholder box in the markup.
3. **Open Graph preview image** — required for SC-009.
4. **Canonical published URL** — required for FR-041.

# Phase 0 Research: Data-Driven Structure Migration

**Date**: 2026-08-13 | **Feature**: `001-data-driven-migration`

Each item below resolves an unknown from Technical Context. Format: Decision / Rationale /
Alternatives considered.

---

## R1. Rendering strategy — how components produce UI

**Decision**: Components are pure functions `render(data, doc) -> DocumentFragment`. They build
nodes with `doc.createElement` / `textContent` and return a single fragment. `app.js` appends
each fragment to its section container exactly once.

**Rationale**:

- Testable without a browser: pass a DOM implementation in, assert on the returned fragment.
  Satisfies FR-044 and FR-010 (independently renderable).
- `textContent` makes content injection inert by construction — portfolio data is authored by
  the owner, but building the habit costs nothing and removes a whole class of defect.
- Fixes a real bug in the code being replaced: `projectCard.js` does `this.innerHTML +=` inside
  a loop, which re-serializes and re-parses the entire subtree on every iteration and destroys
  any already-attached listeners. Building a fragment and appending once is both faster and
  correct.

**Alternatives considered**:

- *Template literal strings + `innerHTML`* (what the current code does): simplest to write, but
  untestable at node granularity, and carries the accumulation bug above.
- *`<template>` elements in `index.html` cloned per item*: keeps markup in HTML, which is
  appealing, but it puts per-item structure back into the page and makes the component's output
  depend on markup it does not own — weakens FR-010.
- *Web Components / custom elements* (what `projectCard.js` uses): the current implementation
  fetches data inside a constructor, which is both an anti-pattern and untestable. Custom
  elements add a registration lifecycle for no benefit here — nothing on this page needs
  encapsulation or reuse across documents.

---

## R2. Progressive enhancement — resolving FR-042 against FR-009

**The tension**: FR-042 requires the owner's name, role, and primary links to exist in the
served document. FR-009 requires `index.html` not to duplicate content rendered from data. Taken
naively these conflict.

**Decision**: Split content by *volatility*, not by convenience.

- **Static in `index.html`, never rendered by JS**: owner name, professional role, hero summary,
  primary social links, section headings. This is the critical content of FR-042 and it changes
  perhaps twice a decade.
- **Rendered from data**: every repeatable collection — projects, skill groups, certifications,
  experiences, education — plus the computed years-of-experience figure.
- **No element is written by both.** `hero.js` does not re-render the name; it only fills the
  years-of-experience placeholder and any dynamic hero affordances.
- **The duplication that remains is enforced, not tolerated**: `profile.js` is the single source
  of truth for name/role/links, and an automated check asserts the static strings in
  `index.html` match `profile.js`. Drift fails the test suite rather than silently shipping.

**Rationale**: Satisfies both requirements without a build step. The check converts a
maintenance hazard into a caught error, which is the honest way to hold two copies of a string.

**Alternatives considered**:

- *Prerender/build step that injects `profile.js` into HTML*: eliminates duplication entirely
  and is the "correct" answer at larger scale, but introduces a build step the constitution
  explicitly defaults against (Principle IX) for a page with exactly one owner and one name.
- *Render everything from JS, accept an empty shell*: fails FR-042, fails SC-013, and hands
  crawlers a blank page.
- *Duplicate the strings and rely on discipline*: rejected — this is exactly how the current
  repository ended up with two divergent designs.

---

## R3. Test tooling

**Decision**: Two tiers.

| Tier | Runner | Scope | When |
|------|--------|-------|------|
| 1 | `node --test` (built-in, Node 24) + `linkedom` | Component render contracts, data schema validation, HTML/profile sync check | Every change |
| 2 | Playwright + `@axe-core/playwright` | WCAG AA audit, keyboard traversal, no-external-requests assertion, responsive layout at 320/640/1024 | Before merge |

Total devDependencies: 3. Zero runtime dependencies — nothing here ships to visitors.

**Rationale**:

- Node 24 ships a stable test runner, so tier 1 needs no runner dependency at all.
- `linkedom` is pure JavaScript with no native build step, and components only need
  `createElement`/`textContent`/`append` — the full fidelity of a heavier DOM is unnecessary.
- Tier 2 exists because FR-030 (contrast), FR-025 (keyboard), FR-019 (no external hosts) and
  FR-036 (no horizontal scroll) are *not verifiable in a synthetic DOM*. They need a real
  engine with layout and computed styles. Asserting them by eye would make SC-004 and SC-005
  unfalsifiable.
- Constitution Principle IX governs shipped code. Dev tooling still requires justification, and
  it is recorded in the plan's Complexity Tracking table.

**Alternatives considered**:

- *Vitest / Jest*: heavier, bring their own transform pipelines, and duplicate what
  `node --test` already provides.
- *jsdom instead of linkedom*: more faithful and more widely used, but substantially larger and
  slower to start for a DOM surface this small. Acceptable fallback if `linkedom` proves
  insufficient.
- *No tests at all*: violates FR-044 through FR-046 and the constitution's Development Workflow
  section.
- *Tier 2 only, via Playwright for everything*: would satisfy the AA and layout checks but makes
  the fast feedback loop slow, discouraging the per-change gate.

---

## R4. Typeface — self-hosting Poppins

**Decision**: Self-host Poppins as WOFF2 in `assets/fonts/`, weights 400 and 600 only, subset to
Latin + Latin Extended, loaded via `@font-face` with `font-display: swap` and `<link rel=preload>`
for the 400 weight.

**Rationale**:

- FR-020 forbids third-party font hosts. Poppins is licensed under the SIL Open Font License,
  which permits redistribution and self-hosting.
- Two weights cover every use the design has (body 400, headings/card titles 600). Shipping the
  full family would violate the constitution's "font weights that are not used MUST NOT be
  shipped".
- Latin Extended covers Portuguese diacritics (ã, õ, ç, é, á) with margin.
- `font-display: swap` prevents invisible text; preloading the body weight prevents a visible
  swap flash on the largest block of text.

**Worth noting**: the stylesheet being restored declares `font-family: 'Poppins', sans-serif`
but never loads Poppins. The old design has therefore always rendered in the system sans-serif
fallback. Self-hosting it is a genuine (intended) visual change, not a restoration.

**Alternatives considered**:

- *Keep the Google Fonts CDN link*: violates FR-019/FR-020 and adds a blocking third-party
  round trip on the critical path.
- *System font stack, drop Poppins*: fastest possible option, and defensible — but discards the
  design's typographic identity, which the owner chose to restore.
- *Variable font file*: one file covering all weights, but larger than two static subsets when
  only two weights are used.

---

## R5. Icons

**Decision**: An SVG sprite inlined directly into `index.html`, with icons referenced as
`<svg><use href="#icon-github"></use></svg>`. Individual source SVGs are kept in
`assets/icons/` as the editable originals.

**Rationale**:

- FR-022 forbids a third-party icon service; the current markup uses Font Awesome classes
  (`fa-github`, `fa-diagram-project`, `fa-arrow-up-right-from-square`) that were never even
  loaded, so those icons render as nothing today.
- Inlining the sprite costs zero additional network requests and works without the same-origin
  caveats that external-file `<use href>` carries.
- Icon count is small (GitHub, LinkedIn, external-link, project, trophy, certificate) — perhaps
  1–2 KB of markup total.

**Defect to fix in passing**: the footer's LinkedIn link currently contains the *GitHub* icon
path — both `<svg>` elements in `index.html` hold identical path data. A correct LinkedIn glyph
is required.

**Alternatives considered**:

- *External sprite file*: one cacheable request, but adds a round trip and `<use href>` across
  documents has historically been inconsistent.
- *Inline `<svg>` per icon at every use site*: no sprite indirection, but duplicates path data
  wherever an icon repeats.
- *Icon font*: extra binary, worse accessibility, and the constitution's font rules argue
  against it.

---

## R6. Palette token roles and contrast

**Decision**: Colours are assigned by *role*, and the role assignment is fixed by the measured
contrast values rather than by taste.

> **Amended 2026-08-13 (post-implementation).** The owner reviewed the built site and judged
> the navy/purple/pink palette too decorative for a professional portfolio, and asked for
> something more sober. The palette below replaces it. The *method* is unchanged — roles are
> still assigned from measured contrast — and the structural rule from FR-016 still holds: the
> two darkest colours are surfaces, never text. The superseded palette is recorded at the end
> of this section.

| Token | Value | Role | Contrast |
|-------|-------|------|----------|
| `--color-bg` | `#12161C` | page background (graphite) | — |
| `--color-surface` | `#1B222B` | raised surface (cards, nav) | `--color-text` on it: 13.5:1 |
| `--color-surface-accent` | `#2E3B4B` | emphasis surface, buttons, chips | `--color-text` on it: 9.6:1 |
| `--color-text` | `#E8ECF1` | all body text | on bg: 15.3:1 |
| `--color-text-muted` | `#A6B2C0` | secondary text | on bg: 8.4:1; on surface-accent: 5.3:1 |
| `--color-accent` | `#7FA6D9` | links, focus ring (steel blue) | on bg: 7.2:1; on surface: 6.4:1; on surface-accent: 4.5:1 |

**The constraint that disappeared.** The superseded palette had exactly one pairing that failed
AA — pink text on a purple surface, at 2.7:1 — which had to be encoded as a prohibition in
`variables.css`, asserted in the audit, and remembered by anyone touching the CSS. The
desaturated accent clears 4.5:1 against every surface it can land on, so the rule is gone
rather than merely enforced. That is most of the argument for a restrained accent: it removes a
class of mistake instead of policing it.

Two consequences follow, both applied:

- `--color-focus` is now the accent rather than plain text. A focus indicator needs 3:1; the
  accent gives 4.5:1 at worst, so the ring can carry colour.
- `components.css` no longer needs a per-surface link-colour override. Links are one colour
  everywhere.

**Rationale**: FR-016 requires the palette's two darkest colours to serve as surfaces rather
than text. These measurements are what make that requirement concrete and checkable — and the
tier-2 audit computes the ratios rather than comparing against hardcoded colours, so a future
palette change cannot silently invalidate the check.

**Alternatives considered** (presented to the owner, with measured contrast for each):

- *Near-black monochrome, no accent hue at all*: the most austere option. Rejected as having no
  chromatic identity — and it would have required permanent underlines, since colour alone
  could no longer distinguish a link (WCAG 1.4.1).
- *Graphite with a bronze/amber accent*: equally sober and passes AA, but reads editorial
  rather than technical.

**Superseded palette** (navy/purple/pink), kept for history: `--color-bg: #1A1A40`,
`--color-surface: #270082`, `--color-surface-accent: #7A0BC0`, `--color-text: #F5F5F5`,
`--color-accent: #FA58B6`. Purple and navy reached 2.1:1 and 1.1:1 as text on the background,
failing even the 3:1 large-text threshold, which is why they were surfaces. Lightening purple
until it passed as text would have needed roughly `#B36BE8` — far enough from `#7A0BC0` that it
was no longer the chosen palette.

---

## R7. Responsive breakpoints

**Decision**: Mobile-first, `min-width` only, three breakpoints: base (320px+), `48rem` (768px,
tablet), `64rem` (1024px, desktop).

**Rationale**: FR-033 mandates mobile-first and FR-035 forbids unstyled gaps. The stylesheets
being restored use `@media (max-width: 720px)` and `@media (min-width: 740px)`, leaving every
viewport between 721px and 739px with neither rule applied — a literal dead zone. `min-width`-only
authoring makes that class of gap structurally impossible.

**Alternatives considered**: container queries — better suited to genuinely reusable components
in varied contexts; overkill for a single-column page with fixed section widths.

---

## R8. Empty-collection and optional-field handling

**Decision**: A single shared rule, applied identically by every component:

- Collection empty (after filtering out `isVisible: false`) → the component returns `null` and
  `app.js` removes the section container entirely. No heading, no whitespace.
- Optional field absent → the element for that field is not created at all.
- Required field absent → throw during render. In development this surfaces immediately; the
  data-integrity test suite (FR-045) catches it before it can reach a deploy.

**Rationale**: Satisfies FR-006, FR-007, SC-014, and the "empty collection" and "fewer tags"
edge cases with one rule rather than per-component special-casing. Experience and Education ship
empty, so this path is exercised from day one rather than being theoretical.

---

## R9. Data validation location

**Decision**: Schemas live in `tests/schemas/`, not in `js/data/`. Validation runs in the test
suite and in a dev-only assertion pass, never in shipped page code.

**Rationale**: The constitution requires `js/data/` to hold content only — no logic, no side
effects. Putting schema definitions there would violate that. Visitors gain nothing from
shipping a validator, so it stays out of the runtime bundle entirely.

**Consequence**: this introduces a top-level `tests/` directory, which the constitution's
mandated layout does not list. Recorded in Complexity Tracking; a constitution amendment to
v1.1.0 adding `tests/` is the recommended follow-up.

---

## R10. Deployment configuration

**Decision**: Add `vercel.json` with long-lived immutable cache headers for `assets/**` and
short-lived revalidating headers for `index.html`. No build command; the repository root is the
static output.

**Rationale**: FR-038 requires a static deploy with no server runtime. Fonts and images are
content-addressed by path and effectively never change, so year-long immutable caching is safe
and directly serves SC-007; the HTML must revalidate so content edits go live promptly.

**Alternative considered**: no `vercel.json` at all — works, deploys fine, but leaves default
caching on the assets that most affect repeat-visit performance.

---

## Resolved unknowns summary

| # | Unknown | Status |
|---|---------|--------|
| R1 | Rendering strategy | Resolved — fragment-returning pure functions |
| R2 | Progressive enhancement vs. no-duplication | Resolved — volatility split + enforced sync check |
| R3 | Test tooling | Resolved — `node --test` + linkedom; Playwright + axe |
| R4 | Typeface hosting | Resolved — self-hosted Poppins 400/600 WOFF2 |
| R5 | Icons | Resolved — inlined SVG sprite |
| R6 | Palette roles | Resolved — measured; pink-on-purple prohibited |
| R7 | Breakpoints | Resolved — min-width only, 320/768/1024 |
| R8 | Empty/optional/required fields | Resolved — one shared rule |
| R9 | Schema location | Resolved — `tests/schemas/`; needs constitution amendment |
| R10 | Deploy config | Resolved — `vercel.json` cache headers, no build |

No `NEEDS CLARIFICATION` items remain.

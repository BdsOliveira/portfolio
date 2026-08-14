# Implementation Plan: CV Content Update

**Branch**: `002-cv-content-update` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-cv-content-update/spec.md`

## Summary

Replace the portfolio's stale and placeholder content with the owner's authoritative CV: a new
professional title and summary, three real employment entries, two academic entries, and a
rebuilt skill list. Feature 001 already made the site data-driven, so the bulk of this work is
editing six files under `js/data/` plus the static identity strings in `index.html` that mirror
them.

Three things are *not* pure data edits, and they are what this plan is mostly about:

1. **The CV supplies facts the current schemas cannot hold.** Education entries have no years,
   yet `startYear` is required; experience entries have a work-location context (remote / on-site,
   city, country) with nowhere to live. Both need small, backward-compatible schema and component
   changes rather than invented data.
2. **`tests/data/parity.test.js` is deliberately content-bound.** It exists to assert that feature
   001's migration lost nothing, and it hardcodes the exact strings this feature replaces —
   including a `deepEqual` on all 21 current skill chips. It cannot survive unchanged, so it is
   retargeted at the CV instead of deleted, keeping the guarantee while changing the reference.
3. **The social preview image bakes the old title into pixels.** `assets/images/og-card.svg` and
   its rendered `.png` both read "Desenvolvedor Fullstack", so SC-007 is not satisfiable by
   metadata edits alone.

Everything else — layout, styling, component structure, dependencies — is untouched.

## Technical Context

**Language/Version**: HTML5, CSS3, vanilla JavaScript (ES2022 modules). Node.js ≥20 for the test
runner only; nothing is transpiled or bundled.

**Primary Dependencies**: none at runtime — zero shipped dependencies is a project invariant.
Dev-only: `@playwright/test`, `@axe-core/playwright`, `linkedom`. **No new dependency is
introduced by this feature.**

**Storage**: static ES module data files under `js/data/` (`profile.js`, `experiences.js`,
`education.js`, `skills.js`, `projects.js`, `certifications.js`). No database, no runtime fetch.

**Testing**: `node:test` for unit (`tests/unit/`) and data-integrity (`tests/data/`) suites;
Playwright for e2e (`tests/e2e/`). Entry points: `npm run test:unit`, `npm run test:data`,
`npm run test:e2e`, `npm test`.

**Target Platform**: modern evergreen browsers, mobile-first; served as static files from
Vercel's CDN.

**Project Type**: single static site — one HTML document, four stylesheets, seven ES modules
plus data.

**Performance Goals**: unchanged from feature 001. Content growth must add **zero** network
requests: no new images, fonts, scripts, or stylesheets. The regenerated Open Graph card
replaces an existing asset rather than adding one.

**Constraints**:

- Exactly four stylesheets may exist (`tests/data/css.test.js` asserts the directory listing).
- No hex colour outside `css/variables.css`.
- Every shipped file must be reachable from `index.html` (`tests/e2e/orphans.spec.js`).
- `index.html` and `js/data/profile.js` must stay byte-identical on `name`, `role`, `summary`
  (`tests/data/sync.test.js`).
- Contract tests must not contain literals from `js/data/`
  (`tests/data/independence.test.js`); `parity.test.js` is the single documented exemption.

**Scale/Scope**: one page, seven sections. After this change: 1 profile, 3 experience entries
(≈19 achievement bullets), 2 education entries, 6 skill groups holding 19 skills, 2
certifications, 1 (placeholder) project.

## Constitution Check

*GATE: evaluated before Phase 0, re-checked after Phase 1 design.*

| # | Principle | Verdict | Basis |
|---|-----------|---------|-------|
| I | Data-Driven Content (NON-NEGOTIABLE) | **PASS** | Every new fact lands in `js/data/*.js`. The identity strings duplicated into `index.html` are the pre-existing progressive-enhancement mirror, and `sync.test.js` makes drift a failing test — the data module remains the source of truth. |
| II | Layer Separation | **PASS** | Data files gain fields only. Components gain rendering for those fields and no content literals. No new inline styles; the location/date lines reuse existing `timeline__*` classes. |
| III | Component Isolation & Reuse | **PASS** | No component learns about another. `experience.js` and `education.js` each render one more optional field via the shared `el()` helper; no new shared abstraction is introduced (no second consumer exists to justify one). |
| IV | Progressive Enhancement & Semantic HTML | **PASS** | Location and email are authored **statically** in `index.html` and mirrored in `profile.js` — the same pattern as social links — so primary contact survives a script failure. Heading hierarchy is unchanged. |
| V | Accessibility (NON-NEGOTIABLE) | **PASS** | New markup is a semantic list of contact details with a `mailto:` anchor whose text *is* the address (never "click here"). No new interactive controls, so no new focus or keyboard surface. Axe audit re-runs against the longer content. |
| VI | Mobile-First Responsive Delivery | **PASS** | No new layout. Risk is content-driven overflow only — the longest CV bullet is materially longer than any current string — which is a verification item, not a design change. |
| VII | Performance as a Feature | **PASS** | Zero added requests. `og-card.png` is regenerated in place at the same dimensions; the size budget is re-checked. |
| VIII | SEO & Discoverability | **PASS** | `<title>`, meta description, Open Graph and Twitter metadata are all updated to the current title, and the preview image is regenerated so it does not contradict them. |
| IX | Vanilla-First Simplicity | **PASS** | No dependency, no build step, no abstraction added. The og-card render step uses Playwright, which is already installed for e2e. |

**Result: PASS — no constitution violations.** The deviations this plan does carry are against the
*spec's own* FR-028 ("no structural change"), not against the constitution; they are recorded in
Complexity Tracking below with their justification.

## Project Structure

### Documentation (this feature)

```text
specs/002-cv-content-update/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output — schema deltas against feature 001's model
├── content-inventory.md # Phase 1 output — the CV transcribed as the parity reference
├── quickstart.md        # Phase 1 output — validation guide
├── contracts/
│   └── components.md    # Phase 1 output — component contract deltas
├── checklists/
│   └── requirements.md  # Spec quality checklist (complete)
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
index.html                          # MODIFIED — title, meta, OG/Twitter, hero role+summary,
                                    #   new contact-details block
assets/
├── images/og-card.svg              # MODIFIED — baked title/summary text
├── images/og-card.png              # REGENERATED from the svg, same 1200×630 dimensions
├── images/portrait.webp            # unchanged
├── icons/                          # unchanged
└── fonts/                          # unchanged

css/
├── variables.css                   # unchanged
├── base.css                        # unchanged
├── components.css                  # MODIFIED (only if the contact-details list needs a class)
└── sections.css                    # unchanged

js/
├── app.js                          # unchanged — no new binding
├── components/
│   ├── hero.js                     # unchanged
│   ├── experience.js               # MODIFIED — render optional `location`
│   ├── education.js                # MODIFIED — date line becomes conditional
│   ├── skills.js                   # unchanged
│   ├── projects.js                 # unchanged
│   ├── certifications.js           # unchanged
│   └── helpers.js                  # unchanged
└── data/
    ├── profile.js                  # MODIFIED — role, summary, location, email
    ├── experiences.js              # MODIFIED — [] → 3 entries
    ├── education.js                # MODIFIED — [] → 2 entries
    ├── skills.js                   # MODIFIED — regrouped from the CV
    ├── certifications.js           # unchanged (FR-024)
    └── projects.js                 # unchanged (FR-025, exception E-1)

tests/
├── schemas/index.js                # MODIFIED — Education.startYear optional;
                                    #   Experience.location added
├── fixtures/index.js               # MODIFIED — fixtures for the new optional fields
├── data/parity.test.js             # REWRITTEN — reference moves to the CV inventory
├── data/sync.test.js               # MODIFIED — also assert location/email mirror profile.js
├── unit/experience.test.js         # MODIFIED — cover location present/absent
├── unit/education.test.js          # MODIFIED — cover years present/absent
├── e2e/metadata.spec.js            # MODIFIED — assert against profile.role, not a literal
└── (all other suites)              # unchanged, must pass untouched
```

**Structure Decision**: the constitution-mandated static layout is already in place from feature
001 and is not altered. No file is created or deleted outside `specs/`; every source change is a
modification to an existing file. The one directory-shaped rule worth restating: `tests/schemas/`
holds the validators, so relaxing `Education.startYear` is a test-side edit and ships nothing to
visitors.

## Phase 0 — Research

See [research.md](./research.md). Ten decisions, the load-bearing ones being:

- **R1** — Education years are absent from the CV, so `startYear` becomes optional rather than
  being filled with invented dates.
- **R2** — Experience gains an optional `location` field instead of smuggling location into the
  summary prose.
- **R3** — Location and email are authored statically in `index.html` and mirrored in
  `profile.js`, matching the existing social-link pattern; no contact component is added.
- **R4** — `parity.test.js` keeps its filename and its exemption, and is retargeted from the
  pre-migration inventory to the CV inventory.
- **R9** — The Open Graph card is regenerated from its SVG source with a one-off Playwright
  screenshot script, run manually and not committed as a test.

## Phase 1 — Design & Contracts

- [data-model.md](./data-model.md) — schema deltas only; feature 001's model remains the base.
- [content-inventory.md](./content-inventory.md) — the CV transcribed field-by-field into the
  shape the data files require. This is both the authoring source and the reference the rewritten
  parity suite asserts against, which is what makes FR-026 ("every statement traceable to the CV")
  mechanically checkable rather than a matter of opinion.
- [contracts/components.md](./contracts/components.md) — the delta to feature 001's component
  contracts.
- [quickstart.md](./quickstart.md) — the validation runbook.

**Agent context update**: `.specify/scripts/bash/` ships no `update-agent-context.sh` in this
installation and the repository has no `CLAUDE.md`, so this step is a no-op. Recorded rather than
silently skipped.

**Post-design Constitution re-check**: **PASS**, unchanged from the pre-Phase-0 evaluation. The
Phase 1 design introduced no new module, no new dependency, and no new stylesheet; the two
component edits stay inside their own rendering responsibility, and the decision in R3 moved
contact details *toward* Principle IV rather than away from it.

## Complexity Tracking

> No constitution violations. This table records deviations from the **spec's** FR-028
> ("this change MUST NOT alter page structure, layout, styling, or interactive behaviour") and
> from feature 001's frozen contracts, each of which is required by a requirement in this same
> spec. Listed so `/speckit-tasks` and implementation treat them as authorised, not as drift.

| Deviation | Why needed | Simpler alternative rejected because |
|-----------|------------|--------------------------------------|
| `Education.startYear` relaxed from required to optional (schema + component + fixtures) | FR-017 requires both academic entries; the CV gives neither a start nor an end year for them. FR-026 forbids inventing facts. | Filling in plausible years — fabricates data the owner never supplied. Blocking the feature until the owner provides years — delays everything else for one line of a two-entry section. Dropping the date line entirely — destroys the field for future entries that *do* have years. |
| `Experience` gains an optional `location` field, rendered as a new line in the timeline card | FR-008 requires each role to state its work-location context ("Remoto", "Presencial", city, country). No existing field can hold it. | Appending it to `summary` prose — makes it unassertable, mixes two facts in one string, and would force the parity suite to substring-match sentences. Omitting it — fails FR-008, and "Remoto" vs "Presencial" is exactly what a recruiter filters on. |
| `index.html` gains a small contact-details block (location + email) inside the existing `#contact` section | FR-021 and FR-022 require both to be stated; nothing on the page renders `profile.location` or `profile.email` today, though both fields already exist in the schema. | Rendering them from a new `contact.js` component — puts primary contact behind JavaScript, which Principle IV forbids. Leaving them unpublished — fails FR-021/FR-022 outright. |
| `tests/data/parity.test.js` rewritten rather than left passing | It hardcodes the superseded strings and asserts an exact 21-chip skill set; the feature's whole purpose is to change those values. | Deleting it — throws away the only mechanism proving no content was silently lost. Leaving it and marking it skipped — a disabled test is a lie that outlives the person who disabled it. |
| `tests/e2e/metadata.spec.js` title assertion changed | It asserts `/Desenvolvedor\|Developer/`, a literal that this feature invalidates. | Adding "Engineer" to the alternation — re-hardcodes a content value in a contract test. The fix imports `profile.role` instead, making the assertion content-independent for good. |
| `assets/images/og-card.png` regenerated (and its `.svg` source edited) | SC-007 requires the shared-link preview to state the current title; the old title is rasterised into the image, so no metadata edit can fix it. | Leaving the stale card — the preview would contradict every other tag on the page. Adding an image-processing dependency — violates Principle IX when Playwright is already present. |

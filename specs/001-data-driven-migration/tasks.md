---

description: "Task list for Data-Driven Structure Migration"
---

# Tasks: Data-Driven Structure Migration

**Input**: Design documents from `/specs/001-data-driven-migration/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/components.md](contracts/components.md),
[quickstart.md](quickstart.md)

**Tests**: INCLUDED. The spec mandates automated checks (FR-044–FR-046) and the constitution's
Development Workflow section requires them. They are not optional here.

**Organization**: Tasks grouped by user story. Each story is independently completable and
testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps to a user story (US1–US4)
- All paths are repo-relative from `/home/bdsoliveira/coding/portfolio/`

## ⚠️ Owner-supplied content

Three tasks wait on assets only the owner can provide (spec Dependencies). **None of them block
the MVP** — components are built and verified against `tests/fixtures/`, and T034 ships a working
placeholder until T081 replaces it.

| Task | Needs |
|------|-------|
| T081 | Real project entries — title, description, technologies, repository URL, live URL, preview image |
| T074 | Profile photo (currently a grey placeholder block) |
| T075 | Open Graph preview image, plus the canonical URL for T071 |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Tooling and scaffolding. Nothing user-visible.

- [X] T001 Create directory scaffolding: `assets/{images,icons,fonts}/`, `js/{components,data}/`, `tests/{unit,data,schemas,fixtures,e2e}/`
- [X] T002 Create `package.json` with `"private": true`, `"type": "module"`, zero `dependencies`, and devDependencies `linkedom`, `@playwright/test`, `@axe-core/playwright`; add scripts `test:unit` (`node --test tests/unit/`), `test:data` (`node --test tests/data/`), `test:e2e` (`playwright test`), `test` (all three)
- [X] T003 [P] Create `.gitignore` covering `node_modules/`, `test-results/`, `playwright-report/`, `.vercel/`
- [X] T004 [P] Create `vercel.json` with no build command, `assets/**` served `Cache-Control: public, max-age=31536000, immutable`, and `index.html` served `public, max-age=0, must-revalidate` (research R10)
- [X] T005 [P] Create `playwright.config.js` with a static `webServer`, `chromium` project, and viewports 320/768/1024 registered for the responsive specs

**Checkpoint**: `npm install` succeeds; `npm test` runs and reports zero tests.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Everything every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase completes.

### Assets

- [X] T006 [P] Add self-hosted Poppins 400 WOFF2 subset (Latin + Latin Extended) at `assets/fonts/poppins-400.woff2` (research R4; OFL licensed, redistribution permitted)
- [X] T007 [P] Add self-hosted Poppins 600 WOFF2 subset at `assets/fonts/poppins-600.woff2`
- [X] T008 [P] Create source icon SVGs in `assets/icons/`: `github.svg`, `linkedin.svg`, `external-link.svg`, `project.svg`, `trophy.svg`, `certificate.svg` — **the LinkedIn glyph must be the real LinkedIn path**, not a copy of GitHub's (data-model.md, "Known defect")

### Page skeleton

- [X] T009 Create `index.html` semantic skeleton: `<header>`/`<nav>`, `<main>`, `<footer>` landmarks, one `<h1>`, and empty section containers `#hero`, `#skills`, `#projects`, `#certifications`, `#experience`, `#education`, `#contact` (contracts P-1, P-2)
- [X] T010 Inline the SVG sprite into the top of `<body>` in `index.html` as `<svg aria-hidden="true" style="display:none">` with `<symbol id="icon-*">` per icon from T008 (research R5)
- [X] T011 Add static critical content to `index.html` — owner name, professional role, hero summary, and social links, authored directly in markup and never rendered by JS (research R2; contracts P-3)

### Styles

- [X] T012 Create `css/variables.css` with design tokens only: palette, spacing and type scales, plus a comment recording the measured contrast ratio for every pairing — research R6, contract S-3. **Palette amended post-implementation at the owner's request** (navy/purple/pink judged too decorative): now `--color-bg: #12161C`, `--color-surface: #1B222B`, `--color-surface-accent: #2E3B4B`, `--color-text: #E8ECF1`, `--color-text-muted: #A6B2C0`, `--color-accent: #7FA6D9`. The accent clears 4.5:1 on every surface, so R6's prohibited pairing no longer exists
- [X] T013 Create `css/base.css`: reset, `@font-face` for both Poppins weights with `font-display: swap`, element defaults, typography scale, a global `:focus-visible` indicator, and a `prefers-reduced-motion: reduce` block. All values via `var(--token)` (contracts S-1, S-5)

### Rendering infrastructure

- [X] T014 Create `js/components/helpers.js` exporting `requireFields(entity, fields, entityName)` (throws naming entity, field, and `id` per contract C-6) and a small `el(doc, tag, props)` builder. Sibling module justified by six known consumers, not speculative abstraction
- [X] T015 Create `js/app.js` mount harness: import data and components, call each `render(data, document)`, append the returned fragment to its container, remove the container entirely on `null`, and wrap each call so one component throwing cannot stop the others (contract A-1, SC-013). No markup construction of its own

### Test infrastructure

- [X] T016 [P] Create entity schemas in `tests/schemas/` for Profile, SocialLink, Project, SkillGroup, Certification, Experience, Education per data-model.md — kept out of `js/data/` so no validator ships (research R9)
- [X] T017 [P] Create sample content in `tests/fixtures/` for every entity, including edge fixtures: empty collection, missing optional field, missing required field, single-technology project, `isVisible: false` project
- [X] T018 [P] Create `tests/unit/_setup.js` bootstrapping a `linkedom` document for injection into components

**Checkpoint**: Foundation ready. `index.html` is a valid semantic document with static critical content and correct fonts. User stories can begin in parallel.

---

## Phase 3: User Story 1 - Update portfolio content by editing one entry (Priority: P1) 🎯 MVP

**Goal**: All repeatable content lives in `js/data/`; adding, editing, or removing an item is a
one-file data change with no markup or logic edits.

**Independent Test**: Add a project, a skill, and a certification by editing data only. All three
appear. `git status` shows changes confined to `js/data/` (quickstart V1).

### Tests for User Story 1 ⚠️

> Write these FIRST and confirm they FAIL before implementing.

- [X] T019 [P] [US1] Contract test for `renderHero` in `tests/unit/hero.test.js` — derives years from `experienceStartYear`, throws on future start year
- [X] T020 [P] [US1] Contract test for `renderProjects` in `tests/unit/projects.test.js` — **renders exactly `technologies.length` chips**, filters `isVisible: false`, omits absent `repositoryUrl`/`liveUrl`
- [X] T021 [P] [US1] Contract test for `renderSkills` in `tests/unit/skills.test.js`
- [X] T022 [P] [US1] Contract test for `renderCertifications` in `tests/unit/certifications.test.js`
- [X] T023 [P] [US1] Contract test for `renderExperience` in `tests/unit/experience.test.js` — `null` `endDate` renders "Atual"
- [X] T024 [P] [US1] Contract test for `renderEducation` in `tests/unit/education.test.js` — `null` `endYear` renders "Em andamento"
- [X] T025 [P] [US1] Universal contract tests in `tests/unit/contracts.test.js` — every component satisfies C-1 through C-12 (purity, `null` on empty, no `innerHTML`, `<h2>`/`<h3>` levels, `<ul>`/`<li>` for repeats)
- [X] T026 [P] [US1] Data integrity tests in `tests/data/schemas.test.js` — validates every entry against `tests/schemas/`: required fields, unique kebab-case ids, `https:` URLs, existing asset paths, `imageAlt` present when `image` is, non-empty arrays, date ordering (data-model.md validation rules 1–8)
- [X] T027 [P] [US1] Sprite-reference test in `tests/data/icons.test.js` — every `icon` value resolves to a symbol in the sprite, and social link icons are distinct per platform (guards the LinkedIn/GitHub defect)
- [X] T028 [P] [US1] Error-isolation test in `tests/unit/app.test.js` — a throwing component removes only its own section; siblings still render

### Data modules for User Story 1

- [X] T029 [P] [US1] Create `js/data/profile.js` — name, role, summary, `experienceStartYear: 2022`, `socialLinks` for GitHub and LinkedIn with distinct `icon` values and descriptive `label`s
- [X] T030 [P] [US1] Create `js/data/skills.js` — migrate all five groups verbatim from `index.html`: Frontend, Backend, Bancos de Dados, Ferramentas, Mobile (data-model.md migrated-content table)
- [X] T031 [P] [US1] Create `js/data/certifications.js` — migrate both entries verbatim, replacing the 🏆/📘 emoji with `trophy`/`certificate` sprite ids
- [X] T032 [P] [US1] Create `js/data/experiences.js` exporting `[]`
- [X] T033 [P] [US1] Create `js/data/education.js` exporting `[]`
- [X] T034 [P] [US1] Create `js/data/projects.js` with the existing "Plataforma E-commerce" entry converted to the `technologies` array shape, as a working placeholder until T057 replaces it

### Components for User Story 1

- [X] T035 [P] [US1] Implement `js/components/hero.js` — years-of-experience only; does not render name, role, or summary (research R2)
- [X] T036 [P] [US1] Implement `js/components/projects.js` — `<li>` per visible project, `<h3>` title, description, variable-length technology chips, conditional links with accessible names incorporating the project title
- [X] T037 [P] [US1] Implement `js/components/skills.js`
- [X] T038 [P] [US1] Implement `js/components/certifications.js`
- [X] T039 [P] [US1] Implement `js/components/experience.js` — returns `null` on the empty collection it ships with
- [X] T040 [P] [US1] Implement `js/components/education.js` — returns `null` on the empty collection it ships with
- [X] T041 [US1] Wire all six components and six data modules into `js/app.js` (depends on T035–T040)
- [X] T042 [US1] Add `<script type="module" src="js/app.js">` to `index.html`
- [X] T043 [US1] Delete `js/Project.js`, `js/projectCard.js`, `js/createProjectComponentYourSelfLikeMagic.js` — replaced, and carrying the five-slot and `innerHTML +=` defects forward is prohibited
- [X] T044 [US1] Run quickstart V1, V2, V3 and confirm content edits touch only `js/data/`

**Checkpoint**: US1 fully functional and independently testable. Page renders all content from data. Styling is still absent — that is US2.

---

## Phase 4: User Story 2 - Visitor finds the same portfolio in a new theme (Priority: P2)

**Goal**: No content lost, and the navy/purple theme applied across every section.

**Independent Test**: Content inventory matches pre-migration exactly; every section renders in
the navy/purple palette at 320/768/1024 with no unstyled region (quickstart V4, V5).

### Tests for User Story 2 ⚠️

- [X] T045 [P] [US2] Content-parity test in `tests/data/parity.test.js` — asserts every section, text string, link destination, and skill tag captured from the pre-migration page is present after
- [X] T046 [P] [US2] HTML/profile sync test in `tests/data/sync.test.js` — static `name`, `role`, `summary` in `index.html` match `js/data/profile.js` exactly (research R2, contract P-4)
- [X] T047 [P] [US2] CSS discipline test in `tests/data/css.test.js` — zero literal hex outside `variables.css` (S-1), zero `max-width` media queries (S-2), zero `outline: none` without replacement (S-5)
- [X] T048 [P] [US2] Responsive spec in `tests/e2e/responsive.spec.js` — at 320/768/1024 no section is unstyled and `scrollWidth <= clientWidth` (quickstart V11)

### Implementation for User Story 2

- [X] T049 [US2] Capture the pre-migration content inventory from `git show HEAD:index.html` into `specs/001-data-driven-migration/content-inventory.md` as the T045 reference
- [X] T050 [P] [US2] Create `css/components.css` — card, technology chip, button, link, form field, focus ring. Tokens only; pink never over purple (S-3)
- [X] T051 [P] [US2] Create `css/sections.css` — layout for nav, hero, skills, projects, certifications, contact, footer. **`min-width` queries only**, breakpoints at base/`48rem`/`64rem` (research R7, contract S-2)
- [X] T052 [US2] Link all four stylesheets in `index.html` and **remove the Tailwind CDN `<script>` and the Google Fonts `<link>`** (depends on T050, T051 — removing them before the replacement exists leaves the page unstyled)
- [X] T053 [US2] Strip Tailwind utility classes from `index.html`, replacing them with semantic class names the new stylesheets target
- [X] T054 [US2] Remove the inline years-of-experience `<script>` from `index.html`, replacing it with a static fallback value inside the placeholder element so the sentence reads correctly before JS runs
- [X] T055 [US2] Delete `css/style.css`, `css/project-component-style.css`, and `img/` — superseded (SC-011)
- [X] T056 [US2] Run quickstart V4 and V5; confirm zero content loss and no unstyled section

**Checkpoint**: Site is fully themed and content-complete. US1 + US2 together are a shippable portfolio.

---

## Phase 5: User Story 3 - Keyboard and screen-reader visitors can use the whole site (Priority: P3)

**Goal**: Zero WCAG 2.1 AA violations; every interactive element keyboard-operable with visible focus.

**Independent Test**: Full keyboard traversal without a mouse; axe-core reports zero AA
violations (quickstart V6, V7).

### Tests for User Story 3 ⚠️

- [X] T057 [P] [US3] Accessibility spec in `tests/e2e/accessibility.spec.js` — `@axe-core/playwright` at WCAG 2.1 AA, zero violations (SC-005)
- [X] T058 [P] [US3] Keyboard spec in `tests/e2e/keyboard.spec.js` — tab through every interactive element, assert visible focus on each, assert no trap, assert nav destinations reachable at 320px
- [X] T059 [P] [US3] Structure spec in `tests/e2e/structure.spec.js` — exactly one `<h1>`, no skipped heading levels, distinct landmarks present (P-1, P-2)

### Implementation for User Story 3

- [X] T060 [US3] Add persistent `<label>` elements to all three contact fields in `index.html`; placeholders become supplementary, never the sole identifier (FR-027)
- [X] T061 [US3] Fix the hero call-to-action in `index.html` — currently a `<button>` that does nothing. Make it an `<a>` to the contact section, or a button with real behaviour (FR-028, contract C-10)
- [X] T062 [US3] Fix navigation in `index.html` and `css/sections.css` — links are currently `hidden md:flex`, so every destination is unreachable below the tablet breakpoint. Provide a mobile-reachable navigation (FR-034, contract P-8)
- [X] T063 [US3] Mark decorative sprite icons `aria-hidden="true"` and give meaningful ones accessible names across all components in `js/components/` (FR-029, contract C-9)
- [X] T064 [US3] Verify and correct heading levels across `index.html` and every component — `<h1>` once, sections `<h2>`, items `<h3>` (contract C-11)
- [X] T065 [US3] Audit rendered colour pairs against `css/variables.css` roles and correct any pink-on-purple or purple-as-text usage (research R6, contract S-3)
- [X] T066 [US3] Confirm the reduced-motion block in `css/base.css` suppresses the card hover transform and all transitions (FR-032)
- [ ] T067 [US3] Run quickstart V6 and V7; resolve every axe finding

**Checkpoint**: Site is accessible. Constitution Principle V gate passes.

---

## Phase 6: User Story 4 - Loads fast and previews correctly when shared (Priority: P4)

**Goal**: Zero cross-origin requests, sub-2s meaningful content on throttled mobile, correct link
preview.

**Independent Test**: Network panel shows only same-origin requests; Lighthouse mobile confirms
timing; a link-preview tool renders name, description, and image (quickstart V8, V9).

### Tests for User Story 4 ⚠️

- [X] T068 [P] [US4] Network spec in `tests/e2e/network.spec.js` — assert zero requests to hosts outside the origin; explicitly assert absence of `cdn.tailwindcss.com` and `fonts.googleapis.com` (SC-006)
- [X] T069 [P] [US4] No-JS spec in `tests/e2e/no-js.spec.js` — with JavaScript disabled, name, role, summary, and social links are all present (SC-013, quickstart V10)
- [X] T070 [P] [US4] Metadata spec in `tests/e2e/metadata.spec.js` — `lang`, canonical, description, and Open Graph tags present and non-empty (P-10)

### Implementation for User Story 4

- [X] T071 [P] [US4] Add SEO metadata to `index.html` — unique `<title>`, meta description, `lang`, canonical link (FR-039, FR-041)
- [X] T072 [P] [US4] Add Open Graph and Twitter card metadata to `index.html` (FR-040)
- [X] T073 [P] [US4] Add `<link rel="preload">` for `assets/fonts/poppins-400.woff2` in `index.html` (research R4)
- [X] T074 [US4] Replace the grey placeholder profile block with a real image — WebP in `assets/images/`, explicit `width`/`height`, descriptive `alt` (FR-037; needs owner asset)
- [X] T075 [US4] Create and reference the Open Graph preview image in `assets/images/` (needs owner asset)
- [X] T076 [US4] Ensure every rendered image in `js/components/projects.js` carries explicit dimensions and `loading="lazy"` below the fold (contract C-8)
- [ ] T077 [US4] Run quickstart V8, V9, V10 and confirm SC-006, SC-007, SC-008, SC-013

**Checkpoint**: All four user stories complete and independently verified.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T078 [P] Rewrite `README.md` — document the mandated layout and the content-editing workflow ("to add a project, edit `js/data/projects.js`"), closing the ⚠️ flagged in the constitution's Sync Impact Report
- [X] T079 [P] Add orphan-file spec in `tests/e2e/orphans.spec.js` — zero repo files unreferenced by the published page (SC-011, quickstart V12)
- [X] T080 [P] Add content-independence check in `tests/data/independence.test.js` — mutating content values leaves the suite green, proving tests bind to contracts not values (SC-012, FR-046, quickstart V13)
- [ ] T081 Replace the placeholder in `js/data/projects.js` with the owner's real projects — title, description, technologies, repository URL, live URL, preview image per entry **(BLOCKED on owner content; see spec Dependencies)**
- [ ] T082 Run Lighthouse mobile on the deployed URL; confirm sub-2s meaningful content and near-zero CLS (SC-007, SC-008)
- [X] T083 Amend `.specify/memory/constitution.md` to v1.1.0 adding `tests/` and `certifications` to the mandated layout, clearing both Complexity Tracking deviations rather than leaving permanent tracked violations (plan.md Complexity Tracking)
- [ ] T084 Run the full pre-merge gate from [quickstart.md](quickstart.md) — all eight checkboxes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: depends on Setup — **blocks all user stories**
- **US1 (Phase 3)**: depends on Foundational
- **US2 (Phase 4)**: depends on Foundational; styles the DOM US1 produces, so **US1 first in practice**
- **US3 (Phase 5)**: depends on Foundational; audits markup from US1/US2, so runs after both
- **US4 (Phase 6)**: depends on Foundational; independent of US2/US3 except T076
- **Polish (Phase 7)**: depends on all desired stories

### Story Dependencies

Unlike a greenfield feature, these stories are **sequential rather than parallel** — this is a
migration of one page, and every story touches the same `index.html`.

```text
Setup → Foundational → US1 (data-driven) → US2 (theme) → US3 (a11y) ─┐
                                    └──────────────────→ US4 (perf/SEO) ┴→ Polish
```

US4 can proceed alongside US3 once US2 lands: metadata and font preload (T071–T073) touch
`<head>`, while US3 works on `<body>`.

### Critical Ordering Within Phases

- T052 **must** follow T050 and T051 — removing the Tailwind CDN before replacement CSS exists leaves the page unstyled
- T041 must follow T035–T040
- T043 and T055 (deletions) must follow their replacements
- All Phase 3 tests (T019–T028) precede their implementations and must fail first

### Parallel Opportunities

- **Phase 1**: T003, T004, T005 together
- **Phase 2**: T006, T007, T008 (assets) together; T016, T017, T018 (test infra) together
- **Phase 3**: all ten tests T019–T028 together; then all six data modules T029–T034 together; then all six components T035–T040 together
- **Phase 4**: T045–T048 together; T050 and T051 together
- **Phase 5**: T057–T059 together
- **Phase 6**: T068–T070 together; T071–T073 together
- **Phase 7**: T078, T079, T080 together

---

## Parallel Example: User Story 1

```bash
# All contract tests first (they must fail):
Task: "Contract test for renderHero in tests/unit/hero.test.js"
Task: "Contract test for renderProjects in tests/unit/projects.test.js"
Task: "Contract test for renderSkills in tests/unit/skills.test.js"
Task: "Contract test for renderCertifications in tests/unit/certifications.test.js"
Task: "Contract test for renderExperience in tests/unit/experience.test.js"
Task: "Contract test for renderEducation in tests/unit/education.test.js"

# Then all data modules together:
Task: "Create js/data/profile.js"
Task: "Create js/data/skills.js"
Task: "Create js/data/certifications.js"
Task: "Create js/data/experiences.js"
Task: "Create js/data/education.js"
Task: "Create js/data/projects.js"

# Then all components together:
Task: "Implement js/components/hero.js"
Task: "Implement js/components/projects.js"
Task: "Implement js/components/skills.js"
Task: "Implement js/components/certifications.js"
Task: "Implement js/components/experience.js"
Task: "Implement js/components/education.js"
```

---

## Implementation Strategy

### MVP scope: Setup + Foundational + US1 (T001–T044)

Delivers the feature's entire reason for existing — content becomes data. The page renders every
section from `js/data/`, and adding a project is a one-file edit.

**Honest caveat**: at the US1 checkpoint the page is semantically correct but visually
unstyled, because T052 has not yet swapped Tailwind for the project's own CSS. This is a valid
stopping point for *verification*, not for deploying. The first deployable increment is
**US1 + US2**.

### Incremental delivery

1. Setup + Foundational → skeleton renders, tests run
2. **+ US1** → data-driven, verifiable, not yet deployable
3. **+ US2** → themed and content-complete → **first deployable increment**
4. **+ US3** → accessible → constitution Principle V gate passes
5. **+ US4** → fast, shareable → all success criteria met
6. **+ Polish** → docs, real project content, constitution amendment

### Suggested commit boundaries

One commit per checkpoint, plus a separate commit for each deletion task (T043, T055) so the
removal of dead code is reviewable on its own rather than buried inside a feature diff.

---

## Implementation status — 2026-08-13

**79 of 84 tasks complete.** Tier-1 suites green: 189 tests (114 unit, 75 data), plus the 5
orphan checks. Every Playwright spec is written; four of the five open tasks are blocked on
things outside the code.

| Task | Blocked on | What it needs |
|------|-----------|---------------|
| T067 | Local environment | Playwright's Chromium cannot start: `libnspr4.so` is missing. Run `sudo npx playwright install-deps chromium`, then `npm run test:e2e`. |
| T077 | Same as T067 | The network, no-JS and metadata specs are written and unrun. |
| T081 | Owner content | `js/data/projects.js` holds the single migrated placeholder. Real entries need title, description, technologies, repository URL, live URL, preview image. |
| T082 | A deploy | Lighthouse mobile against the live URL, for SC-007 and SC-008. |
| T084 | T067 + T077 | Six of the eight pre-merge boxes are verified; V6 (keyboard) and V7 (axe) need the browser. |

**Deviations from the task text, all deliberate:**

- **T006/T007** ship four WOFF2 files, not two: `poppins-{400,600}.woff2` (latin) plus
  `poppins-{400,600}-ext.woff2` (latin-ext), declared with `unicode-range`. Merging the two
  subsets into one file per weight needs `fonttools`, which cannot be installed here (no pip,
  no venv). The split is Google's own and is strictly better for transfer: Portuguese
  diacritics live in the latin file, so the extended file is usually never fetched.
- **T009 vs T052/T053** — `index.html` was rewritten from scratch at T009, so it never carried
  Tailwind forward. T052 therefore only linked the four stylesheets, and T053 became a
  verification step (`tests/data/parity.test.js` asserts zero utility classes survive). This
  matches the US1 checkpoint's own description of the page as unstyled at that point.
- **T034's** in-text pointer to "T057" is a typo for T081; the ⚠️ table at the top is correct.
- **T074/T075** ship generated brand stand-ins (`assets/images/portrait.webp`,
  `og-card.png`), not owner photography. The portrait is an abstract code illustration and its
  `alt` text says so — it is not presented as a photograph. Both have `.svg` sources beside
  them and are a drop-in replacement away from being real.
- **Profile image stays static markup.** `profile.image` exists in the schema but no component
  renders it: the portrait is identity content, which research R2 places in `index.html` and
  keeps out of JavaScript's hands.
- **The contact form has no submission target**, exactly as before the migration. It is now
  properly labelled and keyboard-operable, and points at LinkedIn as a working alternative,
  but wiring it to an inbox or a form service is an open product decision.

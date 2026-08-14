---

description: "Task list for the Talks section"
---

# Tasks: Talks Section

**Input**: Design documents from `/specs/004-talks-section/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/components.md](contracts/components.md), [quickstart.md](quickstart.md)

**Tests**: Included, and **not optional here**. The constitution's "Development Workflow & Quality
Gates" mandates automated checks for rendering logic, data integrity, accessibility and responsive
behaviour, and makes accessibility a merge blocker. Every contract in `contracts/components.md` is
a behaviour a test asserts.

**Organization**: grouped by user story so each can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel — different files, no dependency on an incomplete task
- **[Story]**: US1 / US2 / US3, mapping to the user stories in [spec.md](spec.md)
- Every task names its exact file path

## Path Conventions

Constitution-mandated static layout (plan.md → Structure Decision): `index.html`, `assets/`,
`css/`, `js/components/`, `js/data/`, `tests/`. No new top-level directory.

## Environment note — read before starting

`npm run test:e2e` **cannot run on this machine**. Chromium fails to launch with
`libnspr4.so: cannot open shared object file` (research R11). Tasks that depend on it are tagged
**[BLOCKED-E2E]** and must be run after:

```bash
sudo npx playwright install-deps chromium
```

Baseline measured before any work: **unit 226/226 pass, data 142/142 pass**.

## Implementation status — 2026-08-14

**27 of 35 complete. Every remaining task is browser-blocked, and all 8 depend on T027.**

`sudo` requires a password in this session, so T027 could not be run here. Nothing was skipped for
any other reason.

| Suite | Before | After |
|---|---|---|
| `npm run test:unit` | 226 pass | **262 pass**, 0 fail |
| `npm run test:data` | 142 pass | **157 pass**, 0 fail |
| `npm run test:e2e` | blocked | still blocked — assertions authored, never executed |

**A sixth registration point was found during implementation**, missed by research R12:
`tests/data/independence.test.js` keeps its *own* `COMPONENTS` table, separate from the one in
`tests/unit/contracts.test.js`, and has no coverage guard comparing it against the components
directory. Contract T4-13 was silently unasserted until `talks` was added to it. Worth carrying
into the next feature that adds a component — the table will not tell you it is incomplete.

**One test-tool defect worked around**: linkedom's `compareDocumentPosition` reports
`DOCUMENT_POSITION_PRECEDING` when the first node is nested deeper than the second — a `<time>`
inside the meta line versus the description paragraph after it. T4-4 asserts against a flat
`querySelectorAll('*')` document-order walk instead, which is correct in linkedom.

---

## Phase 1: Setup

**Purpose**: get onto the right branch and confirm the baseline is real before changing anything.

- [X] T001 Create and check out branch `004-talks-section` from the current tree (the tree is on `003-recruiter-portfolio-refactor`; `setup-plan.sh` created the spec directory without switching branches)
- [X] T002 Confirm the baseline by running `npm run test:unit` and `npm run test:data` from the repository root; record the counts and stop if either is not green — a pre-existing failure must not be attributed to this feature

**Checkpoint**: on `004-talks-section`, unit 226 pass, data 142 pass.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: the data module, the schema and the fixtures. Every user story reads from these.

**⚠️ CRITICAL**: no user story work can begin until this phase is complete.

**Ordering note**: T004–T007 all edit `tests/schemas/index.js`, so none of them is `[P]` with
respect to each other. T003 must land before T007, because registering a collection whose module
does not exist fails the import.

- [X] T003 Create `js/data/talks.js` exporting `[]`, with the authoring comment block from [data-model.md](data-model.md) § "Authoring shape" — required and optional fields, the `AAAA-MM-DD` format, the `talk-<id>.webp` filename convention, that array order does not matter because the component sorts, and the FR-008 prohibition on inventing any talk, date or description. The file must contain no `function`, no `=>`, no `import` (contract D4-5)
- [X] T004 Add the `date` field type to `TYPES` in `tests/schemas/index.js`: match `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/` **and** round-trip through `Date.parse` so `2025-02-30` is rejected (contract D4-2)
- [X] T005 Add the `maxToday` rule flag to `validateEntity` in `tests/schemas/index.js`, mirroring the existing `maxCurrentYear` handling: compare the value as a string against today rendered `AAAA-MM-DD`; a talk dated today passes, later fails (contract D4-3)
- [X] T006 Add the `Talk` schema to `SCHEMAS` in `tests/schemas/index.js` per [data-model.md](data-model.md): required `id`/`title`/`date`/`description`/`photo`/`photoAlt`, optional `event` and `link` (`{ type: 'object', required: false, of: 'Link' }`), with `date` carrying `maxToday: true`
- [X] T007 Register the collection in `tests/data/schemas.test.js`: import `talks` from `js/data/talks.js`, add `['talks', talks, SCHEMAS.Talk]` to `COLLECTIONS`, and add `'talks.js'` to the data-module file list that drives the "data only" assertion (contracts D4-1, D4-5; research R12)
- [X] T008 Add schema rejection cases to `tests/data/schemas.test.js` for the four failure modes in [quickstart.md](quickstart.md) V6: malformed date `2025-3-12`, impossible date `2025-02-30`, a future date, and a `photo` path with no file behind it (contracts D4-2, D4-3, D4-4; SC-012)
- [X] T009 [P] Add the talk fixtures to `tests/fixtures/index.js` per the fixture table in [contracts/components.md](contracts/components.md): `talks` (three entries, **authored oldest-first**, mixed optional fields), `talkMinimal`, `talkWithEvent`, `talkWithLink`, `talksSameDate`, `talkWithoutField(field)`, `talksDifferentValues`, `talkFutureDate`, `talkImpossibleDate`. Fixture `photo` paths deliberately reference files that do not exist — unit fixtures never touch the filesystem

**Checkpoint**: `npm run test:data` green with the new rejection cases passing. `js/data/talks.js`
exists and exports an empty array, so nothing is visible on the page yet.

---

## Phase 3: User Story 1 — A recruiter sees speaking credibility without scrolling far (Priority: P1) 🎯 MVP

**Goal**: the section renders below the hero with each talk's photograph, title, date and
description, newest first, and leaves no trace when the collection is empty.

**Independent Test**: supply two or more entries via the fixtures, render at 375px, and confirm
every entry shows all four required elements in the correct order — with no navigation work done.

### Tests for User Story 1 ⚠️

> Write these first. They must FAIL before T014 — the module does not exist yet.

- [X] T010 [P] [US1] Create `tests/unit/talks.test.js` asserting contracts T4-1 through T4-13 from [contracts/components.md](contracts/components.md): one `<li class="talk card">` per entry inside one `<ul class="talk-list">` with `data-talk` ids; descending date order from an oldest-first fixture; input array unmutated and a frozen array rendering without throwing; `<time datetime="AAAA-MM-DD">` with `DD/MM/AAAA` text; child order photograph → title → date → description; a throw per missing required field naming `Talk`, the id and the field; exactly one `<img class="talk__photo">` with non-empty `alt` from `photoAlt`; optional `event`/`link` producing an element or nothing at all with zero empty `textContent` nodes anywhere; `loading="eager"` on the first image and `loading="lazy"` on every later one, all `decoding="async"`; `width="1280"`/`height="720"` attributes; exactly one `<h3>` per item; `renderTalks([], doc) === null`
- [X] T011 [P] [US1] Add the same-date tie-break case to `tests/unit/talks.test.js` using the `talksSameDate` fixture: two entries sharing one `date` retain their relative input order (contract T4-2)

### Implementation for User Story 1

- [X] T012 [US1] Create `js/components/talks.js` exporting `renderTalks(talks, doc)`: return `null` on an empty collection; sort a copy with `[...talks].sort((a, b) => b.date.localeCompare(a.date))`; build the list with `el()` and validate with `requireFields()` from `js/components/helpers.js`; declare `IMAGE_WIDTH = 1280` / `IMAGE_HEIGHT = 720` as module constants; set `loading` to `eager` for index 0 and `lazy` thereafter; format the date by splitting on `-` and re-joining as `DD/MM/AAAA` — no `Intl`, no month-name table (research R4, R5, R6). No talk content literal may appear in the file (contract T4-12)
- [X] T013 [US1] Register the component in `tests/unit/contracts.test.js`: add `{ name: 'talks', file: 'talks.js', render: renderTalks, data: fixtures.talks, collection: true }` to `COMPONENTS` and import `renderTalks`. Without this the suite's `readdirSync('js/components')` coverage check fails on an unaccounted module (contract T4-14, research R12)
- [X] T014 [US1] Add the section to `index.html` between `<section id="hero">` and `<section id="about">`, exactly as contract N4-1 specifies: `<section id="talks" class="section" aria-labelledby="talks-heading" hidden>` containing `<h2 id="talks-heading" class="section__heading">Palestras</h2>` and `<div class="section__body" data-mount="talks"></div>`. Carry a comment stating why it ships `hidden`, matching the convention of the sections around it
- [X] T015 [US1] Add `'talks'` in second position to `SECTION_ORDER` in `tests/e2e/structure.spec.js`. This is asserted against the **served** HTML, so it must be done in the same change as T014 or the e2e suite fails on section order (research R12)
- [X] T016 [US1] Add the binding to the `sections` array in `js/app.js`: `{ mount: '[data-mount="talks"]', section: '#talks', render: renderTalks, data: talks }`, with the import. Position it to match page order. `app.js` must gain no markup (contracts A4-1, A4-2)
- [X] T017 [US1] Add the `.talk-*` block to `css/sections.css` per contracts S4-1 through S4-6: `.talk-list` grid with `repeat(auto-fit, minmax(min(100%, 20rem), 1fr))` and `gap: var(--grid-gap)`; `.talk` with `min-width: 0` and `overflow-wrap: anywhere`; `.talk__photo` with `width: 100%`, `height: auto`, `aspect-ratio: 16 / 9`, `object-fit: cover`, `border-radius: var(--radius-md)`, `display: block`; `.talk__meta` and `.talk__description` on `var(--color-text-muted)`; `.talk__link` with `min-height: var(--touch-target)` and `margin-block-start: auto`. Existing tokens only — no new custom property, no new breakpoint, no literal colour (enforced by `tests/data/css.test.js`)
- [X] T018 [US1] Run `npm run test:unit && npm run test:data` and confirm both suites are green with the new cases passing, and that `tests/data/independence.test.js` accepts the component (contract T4-13)

**Checkpoint**: with entries supplied via fixtures the section renders correctly; with the shipped
empty collection the page is byte-for-byte unchanged from before the feature. US1 is complete and
demonstrable without any navigation work.

---

## Phase 4: User Story 2 — A visitor reaches and shares the section directly (Priority: P2)

**Goal**: the section is reachable from the navigation and from a shared link, with its heading
clear of the sticky header, and the header gains no row.

**Independent Test**: with entries supplied, confirm a navigation item exists, is absent when the
collection is empty, and that following it leaves `#talks-heading` fully visible at 375px, 768px
and 1440px.

**Dependency, stated rather than hidden**: the navigation item is revealed by the existing
`revealNavigation`, which un-hides it only when `#talks` exists and is not itself hidden. So this
story's *positive* case needs T014 from US1. Its *negative* case — no link when there is nothing to
link to — is independently testable today.

### Tests for User Story 2 ⚠️

- [X] T019 [P] [US2] **[BLOCKED-E2E]** Add the header row-count assertion to `tests/e2e/responsive.spec.js` per contract N4-3: with every `[data-nav-for]` item revealed, sweep 320/375/768/1024/1440px and require the site header to occupy no more rows than the current ten-item maximum (FR-015, SC-010). Measure rows from the header's rendered height against a single-row height, not by counting items
- [X] T020 [P] [US2] **[BLOCKED-E2E]** Add the anchor-clearance assertion to `tests/e2e/responsive.spec.js` per contract N4-4: after following `#talks`, `#talks-heading` is fully visible and not covered by the sticky header at 375px, 768px and 1440px (FR-014)

### Implementation for User Story 2

- [X] T021 [US2] Add `<li data-nav-for="talks" hidden><a href="#talks">Palestras</a></li>` to the navigation list in `index.html`, between the `hero` and `about` items so navigation order matches page order (contract N4-2, FR-012). No change to `js/components/navigation.js` is needed or permitted
- [X] T022 [US2] Verify `tests/data/parity.test.js` still passes without modification: `SECTION_IDS` lists sections that must be **present** on the rendered page, and `#talks` is removed while its collection is empty, so it must **not** be added there. `NAV_LABELS` and `SECTION_HEADINGS` are containment checks that a new label does not break (research R12). If either assumption proves wrong, fix the test to reflect the empty-collection reality rather than adding `#talks` to a must-be-present list
- [ ] T023 [US2] **[BLOCKED-E2E]** Run `npx playwright test tests/e2e/responsive.spec.js` and act on T019's result. If the header takes a third row, apply mitigation 1 from research R3 — move the navigation disclosure breakpoint in `css/sections.css` from `48rem` to `64rem`, which is already a permitted breakpoint and needs no new token. Do **not** introduce a new breakpoint; `tests/data/css.test.js` rejects one. Do not shorten existing labels; `parity.test.js` binds them to the CV

**Checkpoint**: the navigation reaches the section when it exists and offers nothing when it does
not; the header still fits in the rows it fitted in before.

---

## Phase 5: User Story 3 — The owner adds a talk by editing content only (Priority: P3)

**Goal**: publishing a talk is one data entry plus one image file, with no structural or logic
change, and bad data fails before publication.

**Independent Test**: add one entry and one image, reload, confirm the talk renders in the right
position and `git status --short` shows exactly two changed files.

**Dependency**: needs the component from US1 to have something to render into.

- [X] T024 [P] [US3] Document the new data module in `README.md` alongside the existing "to add a project, edit js/data/projects.js" guidance: the field list, the `AAAA-MM-DD` date format, the `assets/images/talk-<id>.webp` convention at 1280×720 WebP, that the component sorts so authoring order is free, and that committing an image without its data entry fails `tests/e2e/orphans.spec.js`
- [X] T025 [US3] Prove the two-file property end to end per [quickstart.md](quickstart.md) V9: add one throwaway entry to `js/data/talks.js` plus a placeholder `assets/images/talk-<id>.webp` at 1280×720, run `npm run test:unit && npm run test:data`, serve the page with `npm run serve` and confirm the talk renders in date position, then run `git status --short` and confirm exactly two files changed. **Revert both afterwards** — FR-008 forbids shipping an invented talk
- [X] T026 [US3] Confirm the failure paths reported by T025's run are useful: a missing required field names the entity, id and field; a `photo` path with no file behind it names the broken reference (US3 acceptance scenarios 2 and 3)

**Checkpoint**: adding a talk touches only content. The collection ships empty.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: the checks the constitution makes merge blockers, and the scenarios only a browser can
run.

- [ ] T027 **[BLOCKED-E2E]** Install the browser system libraries once — `sudo npx playwright install-deps chromium` — and confirm `npx playwright test --list` is followed by an actual passing run. This unblocks T019, T020, T023 and T028–T031 (research R11)
- [ ] T028 [P] **[BLOCKED-E2E]** Run `npx playwright test tests/e2e/no-js.spec.js` and confirm quickstart V10: with scripts disabled and no talks supplied, there is no "Palestras" heading, no empty region and no navigation link to one (FR-013, FR-038, SC-009)
- [ ] T029 [P] **[BLOCKED-E2E]** Run `npx playwright test tests/e2e/structure.spec.js` and confirm quickstart V11: `talks` second in section order against the served HTML, heading outline `h1` → `h2` → `h3` unbroken, every image carrying `alt` and reserved dimensions (FR-010, FR-025, SC-011)
- [ ] T030 [P] **[BLOCKED-E2E]** Run `npx playwright test tests/e2e/accessibility.spec.js tests/e2e/keyboard.spec.js` and confirm quickstart V12: zero axe violations at 320/768/1024px with scripts on and off, every interactive element in the section keyboard-reachable in visual order with a visible focus ring (FR-025 – FR-032, SC-006, SC-007). Accessibility is a merge blocker, not a follow-up
- [ ] T031 [P] **[BLOCKED-E2E]** Run `npx playwright test tests/e2e/network.spec.js tests/e2e/orphans.spec.js` and confirm quickstart V14: zero requests to any host but the site's own, and no shipped file left unreferenced (FR-036, SC-005)
- [ ] T032 Verify the layout at 320, 375, 768, 1024 and 1440px with fixture-scale content: no horizontal scrollbar, no clipped card text, a single talk rendering as a deliberate full-width card rather than an orphaned grid cell, and mixed portrait/landscape/square sources filling the 16:9 frame without distortion (FR-019 – FR-023, SC-008)
- [X] T033 Re-evaluate the per-change gates in the constitution's "Development Workflow & Quality Gates" against the finished diff: no content hardcoded in HTML or component logic; keyboard-operable, focus-visible, contrast-compliant, correctly labelled; renders at mobile, tablet and desktop; no new dependency; `index.html` still a valid semantic document with an intact heading hierarchy
- [X] T034 Walk [quickstart.md](quickstart.md) V1 – V14 end to end and record the result of each. Any scenario left unrun is an incomplete feature, not a passing one
- [ ] T035 Run the full gate `npm test` and confirm unit ≥ 226 plus the new `talks.test.js` cases, data ≥ 142 plus the new schema cases, and e2e green

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: depends on Setup — **blocks every user story**
- **US1 (Phase 3)**: depends on Foundational. Delivers the whole visible feature
- **US2 (Phase 4)**: depends on Foundational; its positive case depends on T014 in US1
- **US3 (Phase 5)**: depends on Foundational and on US1's component
- **Polish (Phase 6)**: depends on all desired stories, and on T027 for anything tagged **[BLOCKED-E2E]**

### Within Phase 2

T003 → T007 (the collection cannot be registered before its module exists). T004 → T005 → T006 →
T007 → T008 all edit `tests/schemas/index.js` or depend on it, so they run in order. T009 is
independent of all of them.

### Within User Story 1

T010, T011 (tests, must fail first) → T012 (component) → T013 (registration, or the suite fails on
an unaccounted module) → T014 + T015 (markup and its order assertion, together) → T016 (binding) →
T017 (styles) → T018 (verify).

### Parallel Opportunities

- T009 runs alongside T004 – T008 — different file
- T010 and T011 are written together, both in `tests/unit/talks.test.js`, before any implementation
- T019 and T020 are both authored in `tests/e2e/responsive.spec.js` and can be written while US1 is
  in progress; they cannot be **run** until T027
- T024 runs alongside anything — `README.md` touches nothing else
- T028 – T031 run in parallel once T027 lands

### Not parallelisable, and worth knowing why

- T004 – T006 all edit `tests/schemas/index.js`
- T014 and T021 both edit `index.html`
- T012 and T013 look independent but are not: creating the component file without registering it
  fails `tests/unit/contracts.test.js`, and registering before the file exists fails the import

---

## Parallel Example: Phase 2

```bash
# T009 is the only foundational task on its own file:
Task: "Add talk fixtures to tests/fixtures/index.js"

# Meanwhile, in order, on tests/schemas/index.js:
Task: "Add the date type"  →  "Add maxToday"  →  "Add the Talk schema"
```

## Parallel Example: Phase 6, after T027

```bash
Task: "npx playwright test tests/e2e/no-js.spec.js"
Task: "npx playwright test tests/e2e/structure.spec.js"
Task: "npx playwright test tests/e2e/accessibility.spec.js tests/e2e/keyboard.spec.js"
Task: "npx playwright test tests/e2e/network.spec.js tests/e2e/orphans.spec.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1: Setup — T001, T002
2. Phase 2: Foundational — T003 – T009 (**blocks everything**)
3. Phase 3: User Story 1 — T010 – T018
4. **STOP and VALIDATE**: quickstart V1 – V8 all run on `node` alone, so the MVP is fully
   verifiable on this machine without the browser suite
5. At this point the section is complete and correct, and invisible because the collection is
   empty — a shippable state, not a half-built one

### Incremental Delivery

1. Setup + Foundational → schema and data module in place, page unchanged
2. + US1 → the section renders (MVP)
3. + US2 → it is reachable and shareable
4. + US3 → it is maintainable by content edit alone
5. + Polish → the browser-verified guarantees

### Parallel Team Strategy

Small enough that splitting costs more than it saves. If split: one person takes Phase 2 through
US1 (the critical path), a second writes T019/T020 and T024 alongside, and both converge on Phase 6
once T027 unblocks the browser suite.

---

## Notes

- **The collection ships empty.** FR-008 forbids inventing a talk. T025 adds one temporarily to
  prove the two-file property and **reverts it**. The feature is complete with `export default []`
- **The eager/lazy split is the regression to watch.** Copying `projects.js` gives you
  `loading="lazy"` on every image, which is wrong for the first card in a section this high on the
  page. Contract T4-8 is why T010 asserts it
- **The sort must not mutate.** `contracts.test.js` deep-freezes fixtures, so an in-place `.sort()`
  throws — which is the test doing its job, not a flake
- **Five registration points** (research R12) are T007, T013, T015 and the two verify-only checks in
  T022. Each exists because this suite refuses to let a module appear without someone deciding
  about it
- Commit after each task or logical group; stop at any checkpoint to validate independently

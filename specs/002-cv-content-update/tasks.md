---

description: "Task list for CV Content Update"
---

# Tasks: CV Content Update

**Input**: Design documents from `/specs/002-cv-content-update/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/components.md](./contracts/components.md),
[content-inventory.md](./content-inventory.md), [quickstart.md](./quickstart.md)

**Tests**: INCLUDED. Not optional here — the constitution's "Development Workflow & Quality
Gates" mandates automated checks for rendering logic and data integrity, and the spec's FR-029 /
SC-011 require the existing suites to keep passing. Test tasks are written **before** the data
they validate, so each one fails first for the right reason.

**Organization**: grouped by user story. Every phase ends green — `npm test` passes at every
checkpoint, so work can stop at any of them and ship.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable — different file, no dependency on an incomplete task
- **[Story]**: US1–US4, mapping to the spec's prioritized user stories

## Path Conventions

Static portfolio at repository root, per the constitution's mandated layout: `index.html`,
`assets/`, `css/`, `js/{app.js,components/,data/}`, `tests/{unit,data,schemas,fixtures,e2e}/`.

## ⚠️ Serialized files — read before parallelizing

Four files are touched by multiple phases and **must never carry `[P]`**:

| File | Touched by |
|------|-----------|
| `tests/data/parity.test.js` | Foundational, US1, US2, US3, US4 |
| `index.html` | US1, US4 |
| `js/data/profile.js` | US1, US4 |
| `tests/schemas/index.js` | US2, US3 |
| `tests/fixtures/index.js` | US2, US3 |

Phases run sequentially, so this is only a hazard *within* a phase.

---

## Phase 1: Setup

**Purpose**: known-good starting point. Nothing here changes site content.

- [ ] T001 Install and verify baseline: run `npm ci` then `npx playwright install`, then `npm test` at the repository root; confirm all three suites (unit, data, e2e) pass **before any edit**. Record the pass in the commit message or PR body — every later "did I break it?" question resolves against this baseline.
- [ ] T002 Create and switch to branch `002-cv-content-update` from the current branch (the repository is presently on `made-with-ai`; no branch hook ran during `/speckit-specify`).

**Checkpoint**: clean tree, green suite, correct branch.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: cross-cutting guards that must exist *before* content lands, so every later phase is
protected the moment it is written. Both tasks are additive and pass immediately against current
content.

**⚠️ CRITICAL**: no user story work begins until this phase is complete.

- [ ] T003 Rewrite the docblock at the top of `tests/data/parity.test.js` so its stated reference document is `specs/002-cv-content-update/content-inventory.md` instead of `specs/001-data-driven-migration/content-inventory.md`. Explain in the docblock that this suite is the one deliberately content-bound file in the project, that `tests/data/independence.test.js` exempts it **by filename**, and that the filename must therefore not change. Do **not** touch any assertion yet — the suite must still pass against current content at the end of this task.
- [ ] T004 Add a phone-number absence test to `tests/data/parity.test.js` (contract T2-1, data-model validation rule 11): assert the digit run `99806` appears nowhere in the rendered page text, nowhere in `index.html`, and nowhere under `js/`, `css/`, or `assets/`. This passes immediately — that is the point. It exists so FR-023 cannot be violated silently by any later task in this feature.

**Checkpoint**: `npm test` still green. Parity now points at the CV inventory and the phone guard
is armed.

---

## Phase 3: User Story 1 — Recruiter reads an accurate professional identity (Priority: P1) 🎯 MVP

**Goal**: the headline, page metadata, and social preview all state "Software Engineer" and the
CV-derived summary, instead of the superseded "Desenvolvedor Fullstack".

**Independent Test**: load the page and read only the area above the fold, the browser tab title,
and the rendered `og-card.png`. Every identity fact matches the CV. No other section need change.

**Reference**: [content-inventory.md §1](./content-inventory.md), research R5 and R7.

### Tests for User Story 1

- [ ] T005 [US1] Update the identity constants in `tests/data/parity.test.js`: replace `'Desenvolvedor Fullstack'` and `'soluções robustas e escaláveis'` in the `IDENTITY` array with the new role and summary from content-inventory §1. This test now **fails** — that is correct, and it is what T007/T008 fix.
- [ ] T006 [P] [US1] Fix the content-bound title assertion in `tests/e2e/metadata.spec.js` (contract T2-3): import `profile` from `js/data/profile.js` and replace `expect(title).toMatch(/Desenvolvedor|Developer/)` with an assertion that the title contains `profile.role`. Grep `tests/e2e/` afterwards to confirm the literal `Desenvolvedor` survives nowhere in that directory.

### Implementation for User Story 1

- [ ] T007 [US1] Update `js/data/profile.js`: set `role` to `Software Engineer` and `summary` to the sentence in content-inventory §1. Leave `name`, `experienceStartYear` (2022) and `socialLinks` untouched — the derived years-of-experience must keep reading 4 in 2026 (FR-004).
- [ ] T008 [US1] Update the mirrored strings in `index.html`: `[data-profile="role"]` and `[data-profile="summary"]` must match `js/data/profile.js` **exactly** — `tests/data/sync.test.js` compares them character for character. Leave the `#years-of-experience` fallback at `4`.
- [ ] T009 [US1] Update page metadata in `index.html` per content-inventory §1: `<title>`, `meta[name="description"]`, `og:title`, `og:description`, `og:image:alt`, `twitter:title`, `twitter:description`. Leave `og:url`, `og:site_name`, `og:type`, `og:locale` and the image dimensions alone. The description must stay inside the 50–200 character window `tests/e2e/metadata.spec.js` enforces (the planned copy is 148).
- [ ] T010 [US1] Edit the three `<text>` nodes in `assets/images/og-card.svg` per content-inventory §1: line 1 unchanged, line 2 becomes `Software Engineer`, line 3 becomes the shortened summary. The shortened form is deliberate — the full sentence overflows at 30px in a 1200px frame.
- [ ] T011 [US1] Regenerate `assets/images/og-card.png` from the edited SVG using the Playwright snippet in [quickstart.md](./quickstart.md#regenerating-the-open-graph-card). Verify with `file` that the output is exactly 1200×630 and that its byte size has not grown (Principle VII). Do **not** add an image-processing dependency.

**Checkpoint**: `npm test` green. Title, meta, hero and preview card all say Software Engineer.
US1 is shippable on its own.

---

## Phase 4: User Story 2 — Recruiter reviews the professional experience record (Priority: P2)

**Goal**: the Experience section, which renders nothing today, lists all three CV roles
newest-first with employer, title, location, period, and responsibility bullets.

**Independent Test**: load the page; `#experience` is present and complete. Verify `js/app.js` is
untouched in the diff — the section must appear as a pure data consequence (FR-012).

**Reference**: [content-inventory.md §2](./content-inventory.md), data-model "Experience",
contracts E2-1 → E2-4.

### Tests for User Story 2

- [ ] T012 [P] [US2] Add experience fixtures to `tests/fixtures/index.js` (contract T2-4): one entry **with** `location`, one **without**, and one with a `startDate` in the future plus `endDate: null`. Keep every string fictional — `tests/data/independence.test.js` fails if a fixture value equals real portfolio content, and the real content is about to change.
- [ ] T013 [US2] Add unit tests to `tests/unit/experience.test.js` for contracts E2-1 and E2-2: an entry with `location` produces exactly one `[data-location]` element whose text is the value verbatim; an entry without `location` produces **no** `[data-location]` element — not an empty one. These fail until T015.
- [ ] T014 [P] [US2] Add a test to `tests/data/schemas.test.js` for contract E2-4 and the data-model "Validation note": an `Experience` entry whose `startDate` is later than today and whose `endDate` is `null` validates cleanly. This passes immediately — `maxCurrentYear` is declared only on `Profile.experienceStartYear`, and the ordering check skips a null `endDate`. It is a regression guard so nobody later adds a future-date rejection of the kind `renderHero` has.

### Implementation for User Story 2

- [ ] T015 [US2] Add `location: { type: 'string', required: false }` to the `Experience` schema in `tests/schemas/index.js` (contract S2-1).
- [ ] T016 [US2] Render `location` in `js/components/experience.js`: a new element carrying `data-location`, placed between the `timeline__title` heading and the date range, built with the existing `el()` helper and an existing class. Do **not** add `location` to the module's `REQUIRED` array (contract E2-3) — that would make it mandatory by accident and break every existing fixture.
- [ ] T017 [US2] Populate `js/data/experiences.js` with the three entries from content-inventory §2, authored **newest-first**: `cwi-software` (2026-09 → null), `devsquad` (2025-11 → 2026-07), `cajutec` (2022-10 → 2025-09). Array order *is* display order; no sort runs at render time. **Watch the apostrophe in "Rede D'Or"** — the file uses single-quoted strings, so this one must be double-quoted or escaped, and getting it wrong is a page-load syntax error rather than a test failure.
- [ ] T018 [US2] Add the experience block to `tests/data/parity.test.js`: assert all three employers, titles, locations and rendered periods, plus every achievement bullet from content-inventory §2. Assert the rendered period of `cwi-software` reads `Atual`.

**Checkpoint**: `npm test` green. `#experience` renders three roles. `git diff --stat` shows
`js/app.js` unchanged.

---

## Phase 5: User Story 3 — Recruiter checks technical stack and qualifications (Priority: P3)

**Goal**: skills match the CV's 19 competências in six groups; the Formação section, which
renders nothing today, lists both academic entries without inventing any dates.

**Independent Test**: compare the rendered skill groups and education entries against
content-inventory §3 and §4. Verify `js/app.js` is untouched (FR-019).

**Reference**: [content-inventory.md §3–§4](./content-inventory.md), data-model "Education" and
"SkillGroup", contracts D2-1 → D2-3, research R1 and R6.

Two independent workstreams — skills (T019, T023) and education (T020–T022, T024–T025) — touching
different files except the shared parity and fixtures files.

### Tests for User Story 3

- [ ] T019 [US3] Update the skills constants in `tests/data/parity.test.js`: replace `SKILL_GROUPS` and the 21-entry `SKILL_TAGS` array with the six groups and 19 skills from content-inventory §4. **Keep the exact assertions** — `chips.length === 19` and the sorted `deepEqual` — because that pair is what catches a skill silently dropped during regrouping. Fails until T023.
- [ ] T020 [P] [US3] Add education fixtures to `tests/fixtures/index.js` covering all four date cases in contract D2-2: both years present; `startYear` with `endYear: null`; neither year with `endYear: null`; neither year at all. Keep all strings fictional.
- [ ] T021 [US3] Add unit tests to `tests/unit/education.test.js` for contract D2-2, one per case in the table — most importantly: an entry with **neither** year renders **no** date element at all, not an empty one and not a stray separator. Fails until T022/T024.
- [ ] T022 [P] [US3] Add a test to `tests/data/schemas.test.js`: an `Education` entry validates with `startYear` absent and `endYear` absent, and separately with `endYear: null`. Fails until T024.

### Implementation for User Story 3

- [ ] T023 [P] [US3] Replace the contents of `js/data/skills.js` with the six groups from content-inventory §4. Use ASCII-folded ids (`arquitetura-e-integracao`, `infraestrutura-e-devops`) — the `id` validator is `^[a-z0-9]+(?:-[a-z0-9]+)*$` and rejects `ç`/`ã` — while keeping the accents in the display `name`. The `mobile` group disappears entirely along with the 17 technologies the CV drops.
- [ ] T024 [US3] Relax the `Education` schema in `tests/schemas/index.js` (contract S2-2): `startYear` becomes `{ type: 'integer', required: false }` and `endYear` becomes `{ type: 'integer', required: false, nullable: true }`. `validateCollection`'s ordering check needs no edit — it already guards on both values being integers. `institution` and `qualification` stay required.
- [ ] T025 [US3] Update `js/components/education.js`: remove `startYear` from `REQUIRED` (contract D2-1) and make the date line conditional across the four cases in contract D2-2 — `2020 – 2022`, `2020 – Em andamento`, `Em andamento` alone, `Desde 2020`, and no element at all when neither year is known. The three-state `endYear` (absent ≠ `null` ≠ integer) is load-bearing: collapsing "unknown" into `null` would render the completed IFPI course as still in progress, which is a false statement about the owner.
- [ ] T026 [US3] Populate `js/data/education.js` with the two entries from content-inventory §3: `mba-engenharia-software-ia` (Faculdade Full Cycle, `endYear: null`, no `startYear`) and `tecnico-desenvolvimento-software` (IFPI, neither year). Do not invent years — FR-026.
- [ ] T027 [US3] Add the education block to `tests/data/parity.test.js`: both institutions and qualifications present; the MBA renders `Em andamento`; the IFPI entry renders no date text.

**Checkpoint**: `npm test` green. Six skill groups, 19 chips, `#education` renders two entries and
the IFPI entry shows no date line.

---

## Phase 6: User Story 4 — Visitor finds a way to make contact (Priority: P4)

**Goal**: the owner's location and email are published, survive a script failure, and the phone
number does not appear anywhere.

**Independent Test**: load the page, exercise every contact affordance, confirm each destination
matches the CV. Then disable JavaScript and confirm location and email are still visible.

**Reference**: [content-inventory.md §1](./content-inventory.md), contracts H2-1 → H2-5 and T2-2,
research R3.

### Tests for User Story 4

- [ ] T028 [US4] Extend `tests/data/sync.test.js` (contract T2-2): widen the mirrored-field loop from `['name', 'role', 'summary']` to include `'location'` and `'email'`, and assert the email anchor's `href` equals `mailto:` + `profile.email`. Fails until T029/T030.

### Implementation for User Story 4

- [ ] T029 [US4] Add `location: 'Parnaíba, PI – Brasil'` and `email: 'bds.commus@gmail.com'` to `js/data/profile.js` (both fields are already declared optional in the schema — no schema change). The phone number must **not** be added under any field name (FR-023, contract S2-3).
- [ ] T030 [US4] Add a static contact-details list to `index.html` inside `#contact`, above the existing form (contracts H2-1 → H2-5): a semantic `<ul>` whose items carry `data-profile="location"` and `data-profile="email"`; the email is an `<a href="mailto:…">` whose **visible text is the address itself**, satisfying the accessible-name and never-"click-here" rules with one string. Authored statically, not rendered — Principle IV requires primary contact to survive a script failure. Add **no** heading (`#contact` must keep exactly one `<h2>`) and **no** `[data-mount]` container (`sync.test.js` asserts every mount point is empty in the served HTML).
- [ ] T031 [US4] Style the contact-details list only if it needs it. If a class is required, add it to `css/components.css` using existing `var(--token)` values — `tests/data/css.test.js` fails on any literal hex colour outside `variables.css` and on any fifth stylesheet appearing in `css/`.
- [ ] T032 [US4] Add the contact block to `tests/data/parity.test.js`: the rendered page states the location and the email address, and both social URLs still resolve.

**Checkpoint**: `npm test` green. All four stories complete.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: the verification that automated suites cannot do, plus diff hygiene.

- [ ] T033 Run the full quickstart validation V1–V6 (`npm test` plus the V3 grep) and confirm every item passes. The V3 grep — `grep -rn "99806\|9980-6\|99806-3078" index.html js/ css/ assets/` — must return nothing.
- [ ] T034 Run quickstart V7–V11 in a browser: both previously-empty sections appear; experience is newest-first with CWI reading `set 2026 – Atual`; the IFPI entry shows no date line; six skill groups with 19 chips and no Flutter/BLOC/NuxtJS/Vuetify/MongoDB survivors; metadata and the regenerated `og-card.png` agree with each other.
- [ ] T035 Run quickstart V12 (scripts disabled): name, role, summary, location and email all still visible and correct; `#experience` and `#education` absent rather than broken — an empty heading with a gap beneath it is a failure, not a pass.
- [ ] T036 Run quickstart V13 at 360px, 768px and 1280px. Two risks the old placeholder content never exercised: the longest achievement bullet (CWI #2, ~180 characters) must wrap inside its card, and the 5-chip `Arquitetura e Integração` group against the 2-chip `Práticas` group must not leave the card grid ragged or holed.
- [ ] T037 Run quickstart V14: `npm run test:e2e` axe audit passes against the longer content; by hand, confirm the email link is keyboard-reachable with a visible focus ring and that its accessible name is the address.
- [ ] T038 Diff hygiene — verify with `git diff --stat` that these are untouched: `js/app.js`, `js/components/{hero,skills,projects,certifications,helpers}.js`, `js/data/projects.js` (FR-025/exception E-1), `js/data/certifications.js` (FR-024), `css/{variables,base,sections}.css`, and every test suite except the six this feature names. Confirm no new file under `css/`, `js/` or `assets/`, and no new entry in `package.json`.
- [ ] T039 Confirm the `deliberate removals` block in `tests/data/parity.test.js` survived the rewrite verbatim — no Tailwind CDN, no Google Fonts, no inline `getFullYear`, no emoji icons, no Tailwind utility classes. Those are regression guards from feature 001, not content parity, and this feature must not have disturbed them.
- [ ] T040 Confirm `tests/data/parity.test.js` carries an inline comment on the `Plataforma E-commerce` assertions explaining that these strings are knowingly **not** CV-traceable and are whitelisted under spec exception E-1. Without it, the next reader deletes them as a mistake.
- [ ] T041 [P] Update `README.md` if it documents the site's content or the skills list, so it does not contradict the page.

**Checkpoint**: feature complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: needs Setup. **Blocks all user stories** — T004's phone guard must
  be armed before any CV content is authored.
- **US1 (Phase 3)**: needs Foundational. Independent of US2–US4.
- **US2 (Phase 4)**: needs Foundational. Independent of US1, US3, US4.
- **US3 (Phase 5)**: needs Foundational. Independent of US1, US2, US4.
- **US4 (Phase 6)**: needs Foundational. Touches `index.html` and `js/data/profile.js`, which US1
  also touches — different regions of each, but run US1 first to keep the diffs legible.
- **Polish (Phase 7)**: needs every story that is being shipped.

### Within Each User Story

Test task → implementation task, in that order, so each test fails first for the right reason.
Within US2: fixtures (T012) → unit tests (T013) → schema (T015) → component (T016) → data (T017)
→ parity (T018). Within US3 the same shape, run twice in parallel for skills and education.

### Parallel Opportunities

| Phase | Parallel |
|-------|----------|
| US1 | T006 (`metadata.spec.js`) alongside T005 (`parity.test.js`) |
| US2 | T012 (fixtures) and T014 (`schemas.test.js`) alongside each other |
| US3 | The whole skills track (T019, T023) alongside the whole education track (T020–T022, T024–T026); T020 and T022 with each other |
| Polish | T041 alongside the manual verification tasks |

Everything else is serialized by the shared-file table at the top. `tests/data/parity.test.js`
alone is touched by five phases — it is never `[P]`.

### Parallel Example: User Story 3

```bash
# Two independent tracks after the checkpoint of Phase 4:

# Track A — skills
Task: "T019 Update SKILL_GROUPS and SKILL_TAGS in tests/data/parity.test.js"
Task: "T023 Replace js/data/skills.js with the six CV groups"

# Track B — education
Task: "T020 Add four-case education fixtures to tests/fixtures/index.js"
Task: "T022 Add Education optional-year validation to tests/data/schemas.test.js"
Task: "T024 Relax Education schema in tests/schemas/index.js"
Task: "T025 Make the date line conditional in js/components/education.js"
Task: "T026 Populate js/data/education.js"
```

Track A and Track B collide only in `tests/data/parity.test.js` (T019 and T027) and
`tests/fixtures/index.js` (T020) — sequence those two files' edits.

---

## Implementation Strategy

### MVP (User Story 1 only)

Phases 1 → 2 → 3, then stop and validate. Eleven tasks. The page's headline, title, meta
description and social card all state the current role. This is the highest-leverage slice: it is
what a recruiter sees before scrolling and what a shared link previews.

### Incremental Delivery

1. Setup + Foundational → guards armed, baseline green.
2. **+ US1** → correct identity everywhere. **Ship.**
3. **+ US2** → the Experience section exists for the first time. Biggest single content gain.
4. **+ US3** → skills match the current stack; Formação appears.
5. **+ US4** → location and email published.
6. Polish → manual verification across viewports, scripts-off, and diff hygiene.

### Notes

- Commit per task or per logical group; every phase checkpoint should be a green `npm test`.
- If a suite outside the six this feature names ever needs editing, **stop** — the change has
  drifted outside content and the cause needs understanding first (FR-029, SC-011).
- Deliberately **not** done here, and recorded in quickstart's follow-ups: nav still omits
  Experiência and Formação (research R10), the footer still reads `© 2024`, both education
  entries carry no years, and the Projects placeholder stays (exception E-1).

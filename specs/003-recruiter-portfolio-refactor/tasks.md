---
description: "Task list for 003-recruiter-portfolio-refactor"
---

# Tasks: Recruiter-Focused Portfolio Refactor

**Input**: Design documents from `/specs/003-recruiter-portfolio-refactor/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/components.md](contracts/components.md),
[quickstart.md](quickstart.md)

**Tests**: **Included, and mandatory.** Not an optional TDD preference — FR-056 requires the
existing suites be extended, FR-071 and SC-008 require every check to pass with zero
known-failure exemptions, and two collections ship empty (FR-025, FR-038) so fixtures are the
*only* way their populated path is ever exercised (research R11).

**Organization**: grouped by user story. Each story is an independently deployable increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable — different file, no dependency on an incomplete task
- **[Story]**: US1–US6, mapping to spec.md's prioritized user stories

## Path Conventions

Constitution-mandated static-portfolio layout (plan.md → Project Structure). All paths are
repository-relative from `/home/bdsoliveira/coding/portfolio`.

---

## Phase 1: Setup

**Purpose**: get the branch and the verification environment into a state where results mean
something.

- [X] T001 Create and check out branch `003-recruiter-portfolio-refactor` from the current `002-cv-content-update` HEAD (the feature directory exists but the branch does not — see plan.md's branch note)
- [ ] T002 ⛔ **BLOCKED — needs the owner** Install the Playwright browser system libraries so the e2e suite can launch Chromium: `sudo npx playwright install-deps chromium && npx playwright install chromium`. **Requires elevated privileges — the owner must run this.** Research R13; without it all 68 e2e checks fail with `libnspr4.so: cannot open shared object file` before any assertion runs
- [ ] T003 ⛔ **BLOCKED by T002** Verify T002 by running `npx playwright test tests/e2e/structure.spec.js --reporter=list` and confirming the failures are assertion failures, not browser-launch errors
- [X] T004 Run `npm test` and record the real baseline — which checks fail and why — in `specs/003-recruiter-portfolio-refactor/baseline.md`. Plan.md risk 2: the spec's "eight failing checks" comes from feature 002's records and was never reproduced; the completion criterion is "the suite is green", not "eight were fixed"

**Checkpoint**: `npm run test:unit` and `npm run test:data` pass (123 + 100 today), and the e2e suite runs and reports real assertions.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: the empty-section mechanism and the schema vocabulary that every subsequent story
depends on.

**⚠️ CRITICAL**: no user story work can begin until this phase is complete.

- [X] T005 Add the `number` field type (accepts any finite number, **including `0`**) and the singular `object` composite type with `of` to the `TYPES` map and `validateEntity` in `tests/schemas/index.js` (contract S3-1, data-model.md §preamble)
- [X] T006 [P] Add a test to `tests/data/schemas.test.js` asserting `validateCollection([], schema)` returns `[]` for every schema in `SCHEMAS` — an empty collection is the shipped state of two collections and must never be reported as an error (contract S3-5, FR-049)
- [X] T007 [P] Add a test to `tests/data/schemas.test.js` covering the `number` type with a `0` value and the singular `object` type, so T005's two additions are pinned before any entity uses them
- [X] T008 Implement the hidden-until-mounted mechanism in `js/app.js`: after a binding's render returns a non-null fragment, remove the `hidden` attribute from its `section` element; a `null` return or a throw still calls `drop()` and removes the section entirely (research R1, FR-002, FR-003, FR-074)
- [X] T009 Extend `tests/unit/app.test.js` to cover T008's three paths — content → section revealed; `null` → section removed; throw → section removed *and* every other binding still mounted (FR-046, FR-047, SC-013)
- [X] T010 Add the `hidden` attribute to every data-driven `<section>` in `index.html` (`#experience`, `#skills`, `#education`, `#certifications` today; `#work`, `#philosophy`, `#community` are added by their own stories). `#hero` and `#contact` are static and never hidden (contract H3-2)
- [X] T011 Update the `empty collections leave no empty section behind` assertion in `tests/e2e/structure.spec.js:78` so it accounts for hidden sections: no *visible* `main > section` may contain an empty `[data-mount]`
- [X] T012 Create `js/components/identity.js` exporting `pruneOptionalIdentity(profile, doc)`, which removes every element carrying `data-profile-optional="<key>"` whose `profile[<key>]` is `undefined`, `null` or empty — removed, never hidden or disabled, and idempotent (contracts I3-2, I3-3, I3-4; FR-014, FR-041)
- [X] T013 [P] Create `tests/unit/identity.test.js` covering T012 against fixtures: key present → element kept; key absent → element removed; run twice → no throw; profile with no optional keys → no throw
- [X] T014 Wire `pruneOptionalIdentity(profile, document)` into `js/app.js` in its own `try`/`catch`, after `mount()`. `js/app.js` must still produce no markup of its own — it removes nodes, it does not create them (FR-057)

**Checkpoint**: a section with no data leaves no trace whether or not scripts run. Stories can now proceed in parallel.

---

## Phase 3: User Story 1 — Recruiter grasps the positioning in ten seconds (Priority: P1) 🎯 MVP

**Goal**: a Hero built on a positioning statement, an About section, and the reordered section flow that puts identity and track record before technology inventory.

**Independent Test**: load at 320px, read only what is visible before scrolling, then scroll once. Positioning statement, availability and both CTAs are above the fold; About follows immediately; Experience precedes Skills. Verifiable with no other story landed.

### Tests for User Story 1

- [X] T015 [P] [US1] Add the `Cta` schema and extend the `Profile` schema in `tests/schemas/index.js` — `headline` (required `string`), `about` (required `string[]`), `availability` (optional `string`), `cvUrl` (optional `url`), `primaryCta`/`secondaryCta` (required `object` of `Cta`) — per contract S3-3 and data-model.md §1
- [X] T016 [P] [US1] Add profile fixtures to `tests/fixtures/index.js`: a full profile with headline/about/availability/both CTAs; one without `availability`; one without `cvUrl`. Fixture content stays fictional (`independence.test.js` asserts it)
- [X] T017 [US1] Extend `tests/data/sync.test.js` to assert the new static mirrors character-for-character against `js/data/profile.js`: `headline`, each `about` paragraph, `availability`, and both CTA labels and hrefs (contract T3-2, FR-010)
- [X] T018 [P] [US1] Add a test to `tests/e2e/structure.spec.js` asserting the `main > section` id order is exactly `hero, about, experience, skills, education, certifications, contact` — the sections that exist at this story's completion. Later stories insert `work`, `philosophy` and `community` at their spec'd positions and update this list (contract H3-1, FR-001, SC-002)
- [X] T019 [P] [US1] Extend `tests/e2e/no-js.spec.js` to assert `headline`, every `about` paragraph, `location` and `email` are readable with scripts disabled (FR-018, SC-012)

### Implementation for User Story 1

- [X] T020 [US1] Extend `js/data/profile.js` with `headline`, `about` (array of two paragraph strings), `availability`, `primaryCta`, `secondaryCta`. `cvUrl` is **deliberately omitted** — the owner has not supplied one (data-model.md §1, spec Dependencies). Headline must state professional value, not a job title; "desenvolvedor apaixonado" and equivalents are defects (FR-012)
- [X] T021 [US1] Rewrite the `#hero` block in `index.html`: name (`h1`), role, headline, summary, availability, primary CTA, secondary CTA, GitHub and LinkedIn links — all as static literals carrying `data-profile="<key>"` anchors, with the CV-dependent secondary CTA carrying `data-profile-optional="cvUrl"` if it points at the CV (contracts H3-3, FR-011, FR-013, FR-014, FR-018)
- [X] T022 [US1] Add the `#about` section to `index.html` immediately after `#hero`: one `<h2>`, one paragraph per `profile.about` entry, static and mirrored. **No component and no `[data-mount]`** — FR-018 requires this content in the served document, so rendering it would render it twice (research R7)
- [X] T023 [US1] Reorder the `main > section` blocks in `index.html` to `hero, about, experience, skills, education, certifications, contact`, leaving insertion points for `#work` (after `#experience`), `#philosophy` (after `#skills`) and `#community` (after `#philosophy`) (FR-001)
- [X] T024 [P] [US1] Style the Hero and About in `css/sections.css` — mobile-first, `min-width` queries at `48rem`/`64rem` only, colours via `var(--token)` only. Add any new token to `css/variables.css` (research R12, constitution VI)
- [X] T025 [US1] Run `npm run test:unit && npm run test:data` and the three e2e specs touched by this story; fix until green

**Checkpoint**: US1 ships alone. A recruiter can state who the owner is, what they build and what they are open to from the first screen (SC-001).

---

## Phase 4: User Story 2 — Recruiter evaluates the work as case studies (Priority: P2)

**Goal**: Projects becomes Selected Work — a case-study renderer with every field optional but `title` and `description` — and the fictional placeholder is deleted so the section ships absent.

**Independent Test**: with the collection empty, no Selected Work section exists anywhere — no heading, no gap, no empty container. In the unit harness, fixtures covering a full case study, a minimal entry, and every individually-absent optional field each render with no empty elements.

### Tests for User Story 2

- [X] T026 [P] [US2] Replace the `Project` schema with `WorkEntry` in `tests/schemas/index.js`: only `id`, `title`, `description` required; `technologies` and `isVisible` become optional; add `tagline`, `problem`, `solution`, `contribution`, `architecture`, `result`, `caseStudyUrl` (contract S3-4, data-model.md §2)
- [X] T027 [P] [US2] Add the WorkEntry fixture set to `tests/fixtures/index.js` per research R11: full case study (every field); minimal (id/title/description only); **one fixture per individually-omitted optional field**; with image; missing a required field; hidden entry; all-hidden collection; empty collection
- [X] T028 [US2] Extend `tests/unit/projects.test.js` to cover contracts W3-1 … W3-11. The load-bearing assertions: absent optional field produces **zero** elements (not an empty one, not an orphan label or separator); no `<dl>` at all when every case-study part is absent; part order is fixed problem → solution → contribution → architecture → result regardless of key order in the data; `isVisible` absent means visible; empty and all-hidden collections return `null`
- [X] T029 [US2] Delete the `PROJECT_CONTENT` whitelist and its ⚠ WHITELISTED EXCEPTION comment from `tests/data/parity.test.js:93-110`, and replace them with an assertion that `Plataforma E-commerce` and its description are **absent** from the served page, so the placeholder cannot quietly return (contract T3-1, FR-024)
- [X] T030 [P] [US2] Add an assertion to `tests/e2e/structure.spec.js` that no `main > section#work` is present in the rendered page while the collection is empty — no heading, no container (SC-003)

### Implementation for User Story 2

- [X] T031 [US2] Rewrite `js/components/projects.js` for the case-study contract: `<h3>` title, optional tagline, description, optional `<dl class="case-study">` with one `<dt>`/`<dd>` pair per present part as direct children of the `<dl>` (axe `definition-list`), optional chip list, optional links, optional image. Entity is `WorkEntry`; **the module filename stays `projects.js`** (research R6 — keep the header comment stating the mapping)
- [X] T032 [US2] Add the `caseStudyUrl` anchor to the links builder with a destination-identifying accessible name (`Ler o estudo de caso de {title}`), alongside the existing repository and live links (contract W3-7, FR-059)
- [X] T033 [US2] Empty `js/data/projects.js` to `export default []`, deleting the `plataforma-e-commerce` entry. Replace the PLACEHOLDER header comment with authoring instructions naming every supported field (FR-024, FR-025, FR-026)
- [X] T034 [US2] Add the `#work` section to `index.html` after `#experience`, `hidden`, with a Portuguese heading ("Trabalhos Selecionados") and a `[data-mount="projects"]` body. The id is `work` — it names the section as the recruiter and the navigation see it (contract H3-1, FR-019)
- [X] T035 [US2] Update the `projects` binding in `js/app.js` to point at `#work`
- [X] T036 [P] [US2] Style the case study in `css/components.css`: `<dl>` label/body pairs, long-title and long-body wrapping that cannot overflow at 320px (FR-065 — this is the cause of a currently-failing overflow check)
- [X] T037 [US2] Update the section-order assertion from T018 to include `work` between `experience` and `skills`
- [X] T038 [US2] Run `npm test`; fix until green

**Checkpoint**: adding one entry to `js/data/projects.js` makes the section appear, correctly rendered, with no other file edited (SC-004). Revert after checking.

---

## Phase 5: User Story 3 — Recruiter understands how the owner approaches engineering (Priority: P3)

**Goal**: an Engineering Philosophy section ("Como Trabalho") backed by its own data source, shipping with real, concrete principles.

**Independent Test**: read the section in isolation and confirm each principle is concrete enough that a reader could disagree with it. In the harness, a principle missing its optional detail renders as a title alone, not a title with an empty body.

### Tests for User Story 3

- [X] T039 [P] [US3] Add the `Principle` schema to `tests/schemas/index.js` — `id` and `title` required, `detail` optional (data-model.md §3)
- [X] T040 [P] [US3] Add Principle fixtures to `tests/fixtures/index.js`: with detail; without detail; missing `title` (must throw); empty collection
- [X] T041 [US3] Create `tests/unit/philosophy.test.js` covering contracts PH3-1 … PH3-5. Fixture-based only — the real philosophy content is a literal in `js/data/`, and `tests/data/independence.test.js:93` fails if any unit or data test contains one
- [X] T042 [P] [US3] Add `js/data/philosophy.js` to the collection list validated by `tests/data/schemas.test.js`

### Implementation for User Story 3

- [X] T043 [US3] Create `js/components/philosophy.js` exporting `renderPhilosophy(principles, doc)`: one `<ul>`, one `<li>` per principle in array order, `<h3>` title, optional body element, `null` for an empty collection, throws naming entity/field/id on a missing `title`. Reuses `el`/`requireFields` from `js/components/helpers.js`
- [X] T044 [US3] Author `js/data/philosophy.js` with real principles. **Every principle must trace to something `js/data/experiences.js` already states** — legacy modernisation, code review and mentoring, observability, performance work, specification-driven development (research R14, FR-031). Each must state a falsifiable position, not an unfalsifiable virtue (FR-030)
- [ ] T045 [US3] ⛔ **NEEDS OWNER REVIEW** — content authored, awaiting sign-off. **Owner review of T044's content.** This is the only new *content* the feature authors and the one place it could invent a claim. A passing test cannot detect a fabricated practice (plan.md risk 3)
- [X] T046 [US3] Add the `#philosophy` section to `index.html` after `#skills`, `hidden`, with an `<h2>` ("Como Trabalho") and a `[data-mount="philosophy"]` body
- [X] T047 [US3] Add the philosophy binding to the `sections` array in `js/app.js`
- [X] T048 [P] [US3] Style the philosophy list in `css/sections.css`
- [X] T049 [US3] Update the section-order assertion to include `philosophy` between `skills` and `education`
- [X] T050 [US3] Run `npm test`; fix until green

**Checkpoint**: adding, reordering or removing a principle requires editing only `js/data/philosophy.js` (FR-032).

---

## Phase 6: User Story 4 — Recruiter sees leadership beyond the day job (Priority: P4)

**Goal**: a Community section with organisation, role, period, description, links and real metrics — shipping empty, so the visible outcome is deliberately nothing.

**Independent Test**: with the collection empty, the section is absent from the rendered page. In the harness, fixtures covering an activity with metrics, one without, one with a **zero-valued** metric, one missing its period and one missing links each render without empty elements.

### Tests for User Story 4

- [X] T051 [P] [US4] Add the `Link`, `Metric` and `CommunityActivity` schemas to `tests/schemas/index.js`. `Metric.value` uses the `number` type from T005 so `0` validates; `period` is a free-text `string`, **not** `year-month` — forcing a month would compel an invented date (data-model.md §4, FR-037)
- [X] T052 [P] [US4] Add CommunityActivity fixtures to `tests/fixtures/index.js`: with metrics; without metrics; **with a `{ value: 0, unit: … }` metric**; missing period; missing links; missing a required field; empty collection (research R11)
- [X] T053 [US4] Create `tests/unit/community.test.js` covering contracts CM3-1 … CM3-8. The one that matters most is CM3-5: a metric value of `0` must render — if this passes against an implementation using `if (metric.value)`, the test is wrong, not the code
- [X] T054 [P] [US4] Add an assertion to `tests/e2e/structure.spec.js` that no `main > section#community` is present while the collection is empty (SC-003)

### Implementation for User Story 4

- [X] T055 [US4] Create `js/components/community.js` exporting `renderCommunity(activities, doc)` per contracts CM3-1 … CM3-8. Metric presence is tested with `value === undefined`, **never** truthiness (FR-036). No metric is synthesised, defaulted or inferred (FR-037)
- [X] T056 [US4] Create `js/data/community.js` as `export default []`, with a header comment naming every supported field and stating that no metric may be estimated, rounded, extrapolated or invented (FR-037, FR-038)
- [X] T057 [US4] Add the `#community` section to `index.html` after `#philosophy`, `hidden`, with an `<h2>` and a `[data-mount="community"]` body
- [X] T058 [US4] Add the community binding to the `sections` array in `js/app.js`
- [X] T059 [P] [US4] Style the community list and metric list in `css/components.css` and `css/sections.css`
- [X] T060 [US4] Update the section-order assertion to the full final order: `hero, about, experience, work, skills, philosophy, community, education, certifications, contact` — with `work` and `community` absent while their collections are empty (FR-001, SC-002)
- [X] T061 [US4] Run `npm test`; fix until green

**Checkpoint**: adding an activity to `js/data/community.js` makes the section appear with no change to page structure (SC-004). Revert after checking.

---

## Phase 7: User Story 5 — Visitor navigates and makes contact from any device (Priority: P5)

**Goal**: navigation that reaches every present section and no absent one, is operable on a phone by pointer and keyboard, and a closing call to action that states availability and offers every contact route.

**Independent Test**: at phone, tablet and desktop widths, open the navigation, follow every link, confirm each lands on its section, then exercise every contact route. Repeat using only a keyboard.

### Tests for User Story 5

- [X] T062 [P] [US5] Create `tests/unit/navigation.test.js` covering contracts N3-1, N3-3, N3-4, N3-7: `revealNavigation` un-hides an item **iff** its target section exists and is not hidden; `enableMobileNavigation` reveals the toggle and sets `aria-expanded="false"`; activating the toggle flips `aria-expanded`; every `href` resolves to an existing id
- [X] T063 [P] [US5] Extend `tests/e2e/keyboard.spec.js`: at all three viewports, open the navigation with the keyboard, Tab every link, follow one, press `Escape`, and confirm focus returns to the toggle with a visible indicator at every step (contracts N3-4, N3-5; FR-005, FR-058, SC-010)
- [X] T064 [P] [US5] Extend `tests/e2e/no-js.spec.js` to assert that with scripts disabled the full navigation list is visible and operable, and **no navigation item points at a hidden section** (contract N3-2, FR-004)
- [X] T065 [P] [US5] Add a test asserting anchor navigation jumps rather than scrolls under `prefers-reduced-motion: reduce` (FR-007). `tests/e2e/accessibility.spec.js` already builds a reduced-motion context
- [X] T066 [P] [US5] Add a test asserting no CV contact route exists while `profile.cvUrl` is absent — not a disabled one, not an empty one (FR-041, spec US5 scenario 7)

### Implementation for User Story 5

- [X] T067 [US5] Create `js/components/navigation.js` exporting `revealNavigation(doc)` and `enableMobileNavigation(doc)` per contracts N3-1 … N3-7. `Escape` and outside-click dismiss without navigating away; activating a link closes the disclosure; **no `preventDefault` and no script-driven scrolling** — smooth behaviour is CSS's job
- [X] T068 [US5] Rewrite the `<nav>` in `index.html`: brand link, `<button hidden aria-expanded="false" aria-controls="…">` toggle, and one `<li data-nav-for="<section-id>">` per section. Items bound to a data-driven section carry `hidden`; Home / Sobre / Contato never do (contract H3-5, research R2)
- [X] T069 [US5] Wire `revealNavigation(document)` and `enableMobileNavigation(document)` into `js/app.js` after `mount()`, each in its own `try`/`catch` (FR-046)
- [X] T070 [US5] Add `scroll-behavior: smooth` on `html` in `css/base.css` and override it to `auto` inside the existing `@media (prefers-reduced-motion: reduce)` block (FR-007, research R2)
- [X] T071 [P] [US5] Style the navigation disclosure in `css/components.css` — collapsed at base width, expanded from `48rem`. `min-width` only; no `outline: none` without a replacement indicator (research R12)
- [X] T072 [US5] Rewrite the `#contact` section in `index.html`: an availability statement saying what the owner is open to (FR-039), and email / LinkedIn / GitHub / CV as distinct routes sourced from `profile` (FR-040). The CV route carries `data-profile-optional="cvUrl"` so T012 removes it while the link is absent (FR-041). The existing static contact details and contact form are preserved unchanged (FR-043)
- [X] T073 [US5] Remove the contact-form prose LinkedIn anchor at `index.html:189` — LinkedIn is now an explicit contact route immediately above it, so the note duplicated an adjacent route (contract H3-8, research R5)
- [X] T074 [P] [US5] Style the closing call to action in `css/sections.css` — visually prominent without being sales-oriented (FR-042)
- [X] T075 [US5] Run `npm test`; fix until green

**Checkpoint**: the whole page, including opening the navigation at 320px, is operable by keyboard alone (SC-010), and every contact route reaches the owner's real details.

---

## Phase 8: User Story 6 — The site withstands the scrutiny it invites (Priority: P6)

**Goal**: the suite is green with no known-failure exemptions, and the page's claim to be a work sample becomes true.

**Independent Test**: run the full suite and confirm it is green with no exemptions. Then load with scripts disabled and confirm every visible section contains real content.

### Tests for User Story 6

- [X] T076 [P] [US6] Rewrite `tests/e2e/structure.spec.js:95` "repeated items are announced as lists" — it asserts `.project-list` exists, which will never be true with the collection empty. Bind it to the lists that ship with content (`.skill-groups`, `.certification-list`, `.chip-list`, `.timeline`) and keep the global "no orphan `<li>`" assertion, which is the part that generalises (research R10)
- [X] T077 [P] [US6] Rewrite `tests/e2e/responsive.spec.js:24` "an artificially long project title does not force horizontal scroll" — it mutates `.project-card__title`, which will not exist, so the test silently no-ops. Inject the long string into elements that always exist (the About paragraphs and every section heading) so the overflow guarantee is still exercised at 320px (research R10, FR-065, SC-011)
- [X] T078 [P] [US6] Rewrite `tests/e2e/keyboard.spec.js:118` "project links are operable without a mouse" — its loop body never runs with an empty collection. Keep it as a live-page check and move the real coverage into `tests/unit/projects.test.js`, where fixtures supply entries (research R10)
- [X] T079 [P] [US6] Rewrite the social-link assertion in `tests/e2e/no-js.spec.js:21` from `toHaveCount(1)` to: at least one visible instance per social URL, and **every** instance carries a descriptive accessible name. LinkedIn appears deliberately in two places and the uniqueness assumption is the defect, not the duplication (contract T3-1, FR-073, research R5)
- [X] T080 [P] [US6] Add a test to `tests/e2e/no-js.spec.js` asserting **no section heading appears above an empty region** with scripts disabled — every visible section contains real content (FR-074, SC-012)
- [X] T081 [P] [US6] Add a test to `tests/e2e/metadata.spec.js` that the JSON-LD block parses as valid JSON, declares `@type: Person`, and that every field agrees with the page (FR-068)
- [X] T082 [P] [US6] Add a test asserting the footer states the current year, derived rather than authored (FR-072, SC-017)
- [X] T083 [US6] Add the three new/changed components (`projects`, `philosophy`, `community`) to the `COMPONENTS` table in `tests/data/independence.test.js`, so mutating every displayed string must leave the DOM shape identical (contract T3-3, SC-012)

### Implementation for User Story 6

- [X] T084 [US6] Add `renderCopyrightYear(profile, doc)` to `js/components/identity.js`, returning the current year as a text fragment, and wire it in `js/app.js`. Replace the `2024` literal in `index.html:197` with `<span id="copyright-year">2026</span>` as the no-script fallback, mirroring the existing years-of-experience pattern (contract I3-1, research R4, FR-072)
- [X] T085 [US6] Extend `tests/data/sync.test.js` with the copyright-year fallback assertion — close enough to the derived value to not read as wrong, matching the existing years-of-experience precedent (contract T3-2)
- [X] T086 [US6] Add the static JSON-LD `Person` block to `<head>` in `index.html`: `name`, `jobTitle`, `description`, `email`, `url`, `sameAs` (the social URLs), `address.addressLocality`. Every value already appears on the page; it adds no new claim (contract H3-6, research R9, FR-068)
- [X] T087 [US6] Extend `tests/data/sync.test.js` to parse the JSON-LD block and assert each field against `js/data/profile.js` — it is a mirror under FR-010 and must be verified like every other one (contract T3-2)
- [X] T088 [US6] Audit the heading hierarchy across the final page: exactly one `<h1>`, exactly one `<h2>` per `main > section`, item titles at `<h3>`, no level skipped (FR-069, `structure.spec.js:10` and `:26`)
- [X] T089 [US6] Fix every horizontal-overflow source found by T077 at 320 / 768 / 1024px — long unbroken titles, chip lists, the case-study `<dl>`, the timeline and the navigation (FR-065, SC-011)
- [X] T090 [US6] Verify the Open Graph and Twitter preview metadata still agree with the page's own title and description after the content changes, and update `assets/images/og-card.svg`/`.png` if they no longer do (FR-075, SC-016)
- [ ] T091 [US6] ⛔ **BLOCKED by T002** Run the axe audit at all three viewports with scripts **enabled and disabled** and fix every violation. Accessibility is a merge blocker, not a follow-up (FR-063, SC-009, constitution V)
- [ ] T092 [US6] ⛔ **BLOCKED by T002** (unit 222/222 and data 138/138 green; e2e unrunnable) Run `npm test` and confirm **zero failures and zero exemptions** — no `.skip`, no `.fixme`, no comment excusing a failure (contract T3-7, FR-071, SC-008). Compare against the T004 baseline and account for every difference

**Checkpoint**: the site's closing argument — that it is itself a work sample — is now true.

---

## Phase 9: Polish & Cross-Cutting

- [X] T093 [P] Update `README.md` to document the new data modules (`js/data/philosophy.js`, `js/data/community.js`) and the extended authoring workflow — "to add a case study, edit `js/data/projects.js`" — per the constitution's Sync Impact Report expectation
- [X] T094 [P] Delete `next-steps.txt` if its items are now covered by this feature or by the spec's Dependencies section; otherwise leave it and note what remains. **Outcome: deleted at the owner's instruction.** The file's content survives in git history (last touched in `ef0a7d8`); the items that were still open when it was removed are the backend-dependent ones — a projects database with CRUD, an admin form, a submitting contact form, a job-offers page, and a Google Drive backup — none of which are possible without a runtime dependency the constitution forbids by default (Principles VII, IX; FR-053, FR-054)
- [ ] T095 ⚠ **PARTIAL — V1–V3, V5–V7, V12, V13 verified; V4, V8–V11, V14 need T002.** Walk every scenario in [quickstart.md](quickstart.md) V1 – V14 end to end and confirm each passes as written. Fix the guide where reality differs
- [X] T096 Re-check the plan's Constitution Check against the delivered code: zero dependencies added, exactly four stylesheets, only `48rem`/`64rem` breakpoints, no colour literal outside `variables.css`, no component importing a data module, nothing under `tests/` referenced by `index.html` (research R12, SC-014)
- [X] T097 Confirm the feature-002 content survived verbatim: 19 skills, 3 experiences, 2 education entries, 2 certifications, all Portuguese, `lang="pt-BR"`, and the owner's phone number absent (FR-050, FR-051, FR-052, SC-015, SC-018)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies. T002 needs the owner's privileges; T004 depends on T003.
- **Foundational (Phase 2)**: depends on Setup. **Blocks every user story.** T005 → T006/T007; T008 → T009 → T010 → T011; T012 → T013 → T014.
- **US1 (Phase 3)**: depends on Foundational. Nothing depends on it.
- **US2 (Phase 4)**: depends on Foundational. Independent of US1 except that T037 edits the section-order assertion T018 created — if US2 runs before US1, T037 creates it instead.
- **US3 (Phase 5)**, **US4 (Phase 6)**: depend on Foundational. Independent of each other and of US1/US2. Same section-order-assertion caveat.
- **US5 (Phase 7)**: depends on Foundational; `revealNavigation` (T067) reconciles against whichever sections exist, so it works with any subset of US1–US4 landed. Nav items for sections not yet built simply do not exist yet.
- **US6 (Phase 8)**: depends on **US1–US5**. Most of it is only verifiable once the structure it audits exists — this is why it is last, not because it is optional.
- **Polish (Phase 9)**: depends on all stories.

### Within Each Story

Tests are written before the implementation they describe and must fail first. Schema → fixtures → unit tests → component → data → markup → CSS → wiring → suite run.

### Parallel Opportunities

- **Phase 2**: T006 ∥ T007 (both add independent tests to `schemas.test.js` — sequence them if editing the same file concurrently is awkward); T013 ∥ the T008–T011 chain.
- **Phase 3**: T015 ∥ T016 ∥ T018 ∥ T019; T024 runs alongside T020–T023.
- **Phase 4**: T026 ∥ T027 ∥ T030; T036 alongside T031–T035.
- **Phase 5**: T039 ∥ T040 ∥ T042; T048 alongside T043–T047.
- **Phase 6**: T051 ∥ T052 ∥ T054; T059 alongside T055–T058.
- **Phase 7**: T062 ∥ T063 ∥ T064 ∥ T065 ∥ T066 — five independent test files; T071 ∥ T074.
- **Phase 8**: T076 ∥ T077 ∥ T078 ∥ T079 ∥ T080 ∥ T081 ∥ T082 ∥ T083 — eight independent test edits, the largest parallel block in the feature.
- **Phase 9**: T093 ∥ T094.
- **Across stories**: once Phase 2 is done, US1–US4 can be built by four people simultaneously. The only shared file is the section-order assertion; the shared `index.html` edits are in disjoint blocks.

---

## Parallel Example: User Story 4

```bash
# Tests first — three independent files:
Task: "Add Link, Metric, CommunityActivity schemas in tests/schemas/index.js"
Task: "Add CommunityActivity fixtures incl. a zero-valued metric in tests/fixtures/index.js"
Task: "Assert #community is absent while empty in tests/e2e/structure.spec.js"

# Then implementation, with styling in parallel:
Task: "Create js/components/community.js"
Task: "Style the community and metric lists in css/components.css"
```

---

## Implementation Strategy

### MVP (User Story 1 only)

1. Phase 1 Setup — **T002 needs the owner; do it first, nothing else verifies without it**
2. Phase 2 Foundational — the empty-section mechanism blocks everything
3. Phase 3 US1
4. **STOP and VALIDATE**: quickstart V1, V2, V4
5. Deployable. The reorder plus a real Hero and About is a coherent improvement even if nothing else lands.

### Incremental Delivery

Foundation → US1 (MVP, positioning) → US2 (case-study machinery; visible outcome is the placeholder disappearing) → US3 (philosophy; the first new visible section) → US4 (community machinery; visible outcome deliberately nothing) → US5 (navigation and conversion) → US6 (the suite goes green) → Polish.

US2 and US4 ship invisible. That is the spec'd outcome, not an incomplete increment — but it means their correctness rests entirely on fixture coverage, and thin fixtures would not fail anything until the owner supplies real content, which is when a defect costs most (plan.md risk 4).

---

## Notes

- `[P]` = different file, no dependency on an incomplete task.
- Every task names its file path and the contract or requirement it satisfies.
- Commit after each task or logical group; the branch is `003-recruiter-portfolio-refactor`.
- **Two tasks need the owner, not the implementer**: T002 (privileged install) and T045 (reviewing authored philosophy content for truthfulness).
- Do not add a dependency, a build step, a fifth stylesheet or a new breakpoint. Four separate automated checks already enforce each of those.

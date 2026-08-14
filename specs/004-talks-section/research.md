# Phase 0 Research: Talks Section

**Feature**: `004-talks-section` | **Date**: 2026-08-14

Twelve decisions. Each was a real fork with a defensible alternative; the rationale records why
the alternative lost, so a future reader can reverse one deliberately rather than by accident.

There were no unresolved `NEEDS CLARIFICATION` markers entering this phase — the spec's three
open judgement calls (placement, visible label, photograph required) were settled as documented
Assumptions. R1 and R2 below restate them as technical decisions.

---

## R1 · Placement: between `#hero` and `#about`

**Decision**: the `<section id="talks">` element is authored in `index.html` immediately after
`<section id="hero">` and immediately before `<section id="about">`. The navigation item for it
sits between "Início"/"Sobre" in the same relative order.

**Rationale**: the spec asks for it (FR-010), and the reason it asks holds up — this is the
section carrying photographs, and photographs are worth the most at the point in the page where a
visitor's attention has not yet been spent. The mechanism costs nothing: `.hero + .section` and
`.section + .section` in `sections.css` already give any section in that position its hairline
rule, so no style change is needed to move it there.

**Consequence to accept**: this pushes "Sobre" and "Experiência" one section further down for a
recruiter. That is a product trade-off the spec records in Assumptions, not a technical problem.

**Alternatives considered**:

- *Hero → Sobre → Palestras → Experiência.* Keeps the identity block (name, positioning, about)
  contiguous and still puts the photographs high. Rejected only because the spec asks for the
  other; it remains a one-line change to `index.html` plus one list entry in
  `tests/e2e/structure.spec.js`.
- *Inside "Comunidade".* A talk is community participation, and that section exists and ships
  empty. Rejected: `CommunityActivity` is organisation-shaped (`organisation`, `contribution`,
  `period`, `metrics`), a talk is event-shaped, and forcing one into the other would make the data
  lie about what it describes. They are also presented differently — Comunidade has no imagery.

---

## R2 · Naming: anchor `talks`, heading and navigation label "Palestras"

**Decision**: `id="talks"`, `<h2 id="talks-heading">Palestras</h2>`, navigation label "Palestras",
data module `js/data/talks.js`, component `js/components/talks.js`, CSS block `.talk-*`.

**Rationale**: the site's visible copy is pt-BR while its identifiers are English — the precedent
is exact: `<section id="work">` is headed "Trabalhos Selecionados" and its data module is
`js/data/projects.js` (feature 003, R6). Following it keeps the split consistent instead of
introducing a third naming convention.

**Alternatives considered**:

- *Heading "Talks".* The site already displays one English label ("Skills"), so it would not be
  unprecedented. Rejected: "Skills" is a term Brazilian tech readers use natively; "Talks" would
  read as an untranslated string beside "Trabalhos Selecionados" and "Certificações".
- *"Palestras e Apresentações".* More complete, and it is what the request describes. Rejected for
  the navigation, where it is the longest item by half and directly worsens the header-wrap
  problem R3 is about. "Palestras" covers both in ordinary Brazilian usage.

---

## R3 · The eleventh navigation item — measure, then mitigate

**Decision**: add the item and **verify** the header's row count rather than pre-emptively
restructuring the navigation. A new assertion in `tests/e2e/responsive.spec.js` sweeps widths from
320px to 1440px with every navigation item revealed and requires the header to occupy no more rows
than the current ten-item maximum (FR-015, SC-010).

**Rationale**: `css/variables.css` documents the current measurement — the header is 65px at every
width **except** roughly 768px–1000px, where the row wraps and it becomes 113px. `--anchor-offset`
is sized against that two-row case, so a third row would silently break anchor navigation
(FR-014), which is why this is worth an assertion rather than an eyeball.

Two facts make the risk smaller than it first appears. First, navigation items are `hidden` unless
their section actually rendered, and two collections ship empty today — so the live page currently
shows eight items, not ten. Second, the new item is only revealed once the owner supplies talks.

**Ranked mitigations, to apply only if the assertion fails** — none are pre-applied:

1. **Move the navigation disclosure breakpoint from `48rem` to `64rem`.** `64rem` is already one
   of the two breakpoints `tests/data/css.test.js` permits, so this needs no new token and no test
   exemption. It collapses the navigation into its existing, already-accessible disclosure across
   the entire band where wrapping occurs, removing the two-row case rather than managing it. It
   also improves the page as it stands today.
2. **Shorten the new label.** Cheapest, but it only buys one item's width and does nothing about
   the twelfth.

Rejected outright: hiding navigation items at small widths (constitution VI forbids it), and
shortening existing labels, which `tests/data/parity.test.js` binds to the CV.

---

## R4 · Dates render as `DD/MM/AAAA`, from string parts, with `<time datetime>`

**Decision**: store `AAAA-MM-DD`; render the visible text by splitting on `-` and re-joining as
`DD/MM/AAAA`; wrap it in `<time datetime="AAAA-MM-DD">`.

**Rationale**: this is `js/components/experience.js`'s existing `time()` helper extended by one
field — that component already renders `MM/AAAA` from a `AAAA-MM` string the same way. Reusing the
shape keeps every date on the site reading the same, needs no locale data, and produces byte-identical
output in every browser and in the Node test runner. `DD/MM/AAAA` is unambiguous to a Brazilian
reader, which is what FR-018 asks for; the `datetime` attribute carries the machine-readable form.

**Alternatives considered**:

- *`Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' })` → "12 de março de 2025".* Genuinely nicer
  prose for a one-day event, and browser-native, which Principle IX prefers. Rejected on two
  counts: its exact output is a function of the ICU version bundled with the runtime, so a unit
  test asserting the string is asserting a property of the environment rather than of the code;
  and it would put the site's only long-form date beside `03/2025` in "Experiência", which reads
  as an inconsistency rather than a refinement.
- *A month-name lookup table in the component.* Deterministic, and defensible — components already
  hold UI vocabulary such as "Atual" and the case-study labels. Rejected as twelve content strings
  bought for a stylistic preference, when the numeric form already satisfies the requirement.
- *Storing the display string in the data.* Rejected outright: it makes the date unsortable and
  un-validatable, and invites two entries formatted differently.

---

## R5 · Photograph: a fixed 16:9 frame, so the data carries only a path and its description

**Decision**: `Talk.photo` is an asset path and `Talk.photoAlt` its description — two flat required
fields, no per-entry dimensions. The component emits `width="1280" height="720"` from module
constants; `css/sections.css` sets `aspect-ratio: 16 / 9`, `width: 100%`, `height: auto` and
`object-fit: cover`.

**Rationale**: this is the exact pattern `js/components/projects.js` already uses for its preview
image (module-level `IMAGE_WIDTH`/`IMAGE_HEIGHT`, fixed frame), and it is correct precisely
*because* the frame is fixed. The `width`/`height` attributes exist to reserve the right box before
the bytes arrive; when CSS forces a 16:9 box, the box to reserve is 16:9 — per-entry intrinsic
dimensions would describe a shape the page never renders. `object-fit: cover` then absorbs a
portrait, square or 4:3 source without distortion, which is FR-019 satisfied by construction rather
than by authoring discipline.

The payoff is in the data model: the owner drops in a photograph and writes two lines. They never
measure anything. That is what makes SC-003 — "one content entry and one image file" — literally
true rather than aspirationally true.

**Alternatives considered**:

- *Reuse the `EvidenceImage` composite `{ src, alt, width, height }` from `Certification`.* The
  obvious move, and it would have made this the second consumer that justifies generalising the
  schema's name. Rejected once the fixed frame was settled: the two extra fields would be data the
  renderer discards, and every one of them is a chance for the owner to state a number that does
  not match the file. `Certification.evidence` needs them because it has no fixed frame — it renders
  at the photograph's own ratio. Different problem, correctly different shape.
- *A free-form aspect ratio per talk.* Rejected: mixed ratios in one grid is the ragged result
  FR-019 exists to prevent.
- *4:3 or 3:2 frames.* Rejected: 16:9 matches `.project-card__image`, and event photographs are
  overwhelmingly landscape.

---

## R6 · The component sorts, most recent first

**Decision**: `renderTalks` sorts a copy — `[...talks].sort((a, b) => b.date.localeCompare(a.date))`
— and renders in that order. The input array is never mutated.

**Rationale**: FR-011 is a requirement about what the visitor sees, and the component is the only
place that can guarantee it. `AAAA-MM-DD` sorts correctly as a plain string, so this is a
comparison, not date arithmetic. The non-mutating copy is not defensive style: `tests/unit/contracts.test.js`
deep-freezes fixture data before rendering, so a component that sorted in place would throw.

**Alternatives considered**:

- *Array order is display order, as everywhere else on this site.* The consistent choice, and it
  is a real cost to break with it — feature 003 asserts it explicitly (W3-10) for Selected Work.
  Rejected because the two situations differ: a project list has no intrinsic order, so the author
  is the only possible authority; talks have dates, so the data already contains the answer and
  making a human re-encode it by hand is a rule that will eventually be broken quietly.
- *Array order plus a data test asserting descending dates.* Keeps the component dumb and still
  catches mistakes. Rejected as the worse half of both: it reports the problem after the entry is
  written rather than making it impossible, and it puts an ordering rule in a place a person
  editing content will not look. Recorded in the plan's Complexity Tracking as the rejected
  alternative.

---

## R7 · No shared `<img>` helper

**Decision**: build the `<img>` inline in `talks.js` with `el()`, as `projects.js` and
`certifications.js` each already do. `js/components/helpers.js` is unchanged.

**Rationale**: the three are similar but not the same. `certifications.js` reserves space from
per-entry intrinsic dimensions and defers unconditionally; `projects.js` uses a fixed frame and
defers unconditionally; `talks.js` uses a fixed frame and must load its **first** photograph
eagerly and every later one lazily (FR-034). A helper covering all three takes an eager/lazy
parameter only one caller ever passes and a dimensions strategy that varies by caller — an
abstraction shaped by its outlier.

Constitution III permits extraction once a second consumer exists; it does not compel it, and it
also prohibits speculative generality. Adding the helper honestly would mean refactoring two
working, fully-tested components as part of a feature that does not need them touched — regression
risk bought for tidiness.

**Alternative considered**: add `image()` to `helpers.js` and use it from `talks.js` only,
refactoring the other two later. Rejected as the worst option available: a helper with one
consumer is the speculative generality the constitution names, and "later" is where it would stay.

**Trigger to revisit**: a fourth consumer, or the moment `certifications.js` moves to a fixed
frame. Recorded in the plan's Complexity Tracking.

---

## R8 · Photographs live flat in `assets/images/`, WebP, named `talk-<id>.webp`

**Decision**: `assets/images/talk-<id>.webp`, source-authored at 1280×720. No `assets/images/talks/`
subdirectory. No photograph is added by this feature.

**Rationale**: `assets/images/` is flat today (`maratona-programacao-puc-goias-2017.webp`,
`portrait.webp`, `og-card.png`), and a subdirectory for a collection with zero entries is
organising an empty room. Naming the file after the talk's `id` makes the data entry and the file
trivially checkable against each other by eye, and `tests/data/schemas.test.js` already resolves
every `asset`-typed path against the repository, so a typo fails before publication.

WebP because `tests/e2e/network.spec.js` and constitution VII require modern formats, and the
existing raster assets are already WebP. 1280×720 because the card's widest rendered box is the
desktop section body — roughly 800px — so 1280 covers a 2× display with nothing wasted.

**Constraint worth stating**: `tests/e2e/orphans.spec.js` requires every file under `assets/` to be
referenced from `index.html`, `css/` or `js/`. A photograph committed without its data entry is a
failing test, by design.

---

## R9 · Layout: reuse `.project-list`'s grid; no new design token

**Decision**: `.talk-list` is `display: grid` with
`grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr))` and `gap: var(--grid-gap)`
— identical to `.project-list`. Each `<li>` carries `talk card`, reusing `components.css`'s
existing `.card` surface, padding, border and hover. `css/variables.css` gains nothing.

**Rationale**: `sections.css`'s own header states the rule this follows — every collection grid is
`auto-fit` with a `min()` floor rather than a fixed column count, because a fixed count orphans
items. The `min(100%, 20rem)` floor is what keeps a card from demanding 20rem at 320px. Paired with
`min-width: 0` and `overflow-wrap: anywhere` on the card, it is also the established fix for the
horizontal-overflow defect FR-022 restates.

The single-talk case (FR-021) resolves itself: one item in an `auto-fit` track stretches to the
column, exactly as a single project does. At the desktop breakpoint `.section` becomes two columns
(`--section-label` beside the body), so the body column is roughly 50rem, not the full 72rem — a
lone card renders around 800px wide with a 450px-tall photograph. Deliberate, not orphaned.

**Alternatives considered**:

- *A two-column media object — photograph beside the text.* Attractive at desktop width. Rejected:
  it needs a breakpoint to unstack, it makes the photograph narrow exactly where the card is
  narrow, and `certifications.js` already carries a comment recording that this arrangement was
  tried and abandoned for the evidence photo for that reason.
- *A horizontally-scrolling row of talks.* Rejected — the UX guidance loaded for this feature
  names horizontal swipe on main content as an anti-pattern, it hides items from keyboard and
  search, and it conflicts with the page's vertical scroll.
- *A capped grid (`auto-fill`, or a `max-width` on the card).* Rejected as a fix for a problem the
  section layout already solves.

---

## R10 · Scope held: no lightbox, no JSON-LD extension, no cap

**Decision**: photographs are inline and not expandable; the JSON-LD `Person` block is untouched;
the list is uncapped.

**Rationale**: each of these is a separate feature with its own requirements, and each would be the
first of its kind on this site. A lightbox introduces a modal, a focus trap, an escape route and a
scrim to a page that currently has no overlay at all — that is contract surface, not a detail.
Extending JSON-LD with speaking events means choosing a schema.org shape and keeping it in sync
with the data, which is worth doing deliberately rather than as a rider. A cap means a
"mostrar mais" control, which means script-dependent content.

**Trigger to revisit the cap**: the spec's "many entries" edge case becomes real past roughly six
talks, at which point the section's height starts working against the recruiter-first ordering the
page is built around.

---

## R11 · Test environment: e2e cannot run here; unit and data can

**Decision**: author the new e2e assertions as part of this feature, but treat the unit and data
suites as the gate that can actually be run during implementation. Record the exact blocker.

**Measured on this tree, before any change**:

- `npm run test:unit` — **226 pass, 0 fail**
- `npm run test:data` — **142 pass, 0 fail**
- `npm run test:e2e` — Chromium fails to launch:
  `chrome-headless-shell: error while loading shared libraries: libnspr4.so: cannot open shared object file: No such file or directory`

Only the two Playwright tests that never open a browser pass. This is the same blocker feature 003
recorded, still unresolved.

**Fix, to be run by the owner outside this session** — it needs root:

```bash
sudo npx playwright install-deps chromium
```

**Consequence**: FR-014, FR-015, FR-022, FR-030, FR-032 and SC-006/SC-008/SC-010/SC-011 are
verified by e2e assertions that this environment cannot execute. They must be run before the
feature is considered done; `quickstart.md` marks each such scenario explicitly.

---

## R12 · Registration points — five existing tests must be told the section exists

**Decision**: treat these as first-class implementation steps, not incidental edits. Each is a
place where the suite deliberately refuses to let a new module appear unnoticed.

| File | What must change | Enforced by |
|---|---|---|
| `tests/unit/contracts.test.js` | add `talks` to `COMPONENTS` | a test compares `readdirSync('js/components')` against the table and fails on any module that is in neither it nor `BEHAVIOUR_MODULES` |
| `tests/data/schemas.test.js` | add the collection to `COLLECTIONS`, and `'talks.js'` to the data-module file list | the second list drives the "data only — no `function`, no `=>`, no `import`" assertion |
| `tests/e2e/structure.spec.js` | add `talks` to `SECTION_ORDER`, second | asserted against the **served** HTML, so it covers the section even while its collection is empty |
| `tests/data/parity.test.js` | verify only — no change expected | `SECTION_IDS` lists sections that must be *present* on the rendered page; an empty collection removes `#talks`, so it does not belong there yet. `NAV_LABELS` and `SECTION_HEADINGS` are containment checks, which a new label does not break |
| `tests/e2e/orphans.spec.js` | verify only — no change expected | it walks `js/` for references, so a photograph referenced from `js/data/talks.js` is reachable |

**Rationale**: these are the mechanism by which this repository stops a component from being added
without a decision being made about it. Discovering them during implementation is how a task list
slips; naming them here makes each one a task.

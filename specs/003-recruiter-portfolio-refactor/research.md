# Phase 0 Research: Recruiter-Focused Portfolio Refactor

**Feature**: `003-recruiter-portfolio-refactor` | **Date**: 2026-08-14

Each entry resolves one unknown that the Technical Context could not answer from the existing
codebase. Decisions here are binding on Phase 1 and on `tasks.md`.

---

## R1 — How a section disappears when its collection is empty, *with scripts disabled*

**Requirement**: FR-002, FR-003, FR-074, SC-003, SC-012. Today `index.html` authors a full
`<section>` + `<h2>` + `<div data-mount>` for every data-driven section, and `js/app.js` removes
the section when its component returns `null`. With scripts disabled nothing is removed, so the
page renders six headings above six empty regions — the currently-failing
`structure.spec.js:78` and `no-js.spec.js:58`.

**Decision**: author every data-driven `<section>` with the **`hidden` attribute** in
`index.html`. `js/app.js` clears `hidden` only after a component returns a non-null fragment; a
component returning `null` or throwing leaves the section hidden *and* removes it, as today.

- No scripts → every data-driven section stays hidden. Only Hero, About and Contact render, and
  all three are static, real content. FR-003 and FR-074 hold by construction.
- Scripts + data → section revealed.
- Scripts + empty data → section removed outright (existing `drop()` path, unchanged).

`hidden` is the right primitive: it removes the element from the accessibility tree and from the
rendered box tree without CSS, so the guarantee survives a stylesheet failure as well as a script
failure.

**Alternatives rejected**:

| Alternative | Why rejected |
|---|---|
| CSS `.section:has(> .section__body:empty) { display: none }` | Works, but makes the guarantee depend on the stylesheet loading and on `:has()`. `hidden` needs neither. |
| Components create the whole `<section>` element and `app.js` inserts it | Removes the semantic skeleton from `index.html`, weakening constitution IV, and moves `aria-labelledby` wiring into JS for no gain. |
| A build step that pre-renders sections | FR-053, FR-054, constitution IX. Not available. |

**Consequence**: navigation must follow the same rule (see R2) or FR-004 breaks — a visible link
to a hidden section.

---

## R2 — Navigation: reaching ten sections, on a 320px viewport, without a framework

**Requirement**: FR-004 – FR-008, SC-010. Today: five hardcoded links, no mobile affordance, and
three sections unreachable.

**Decision**, three separable parts:

1. **Link set**: one `<li data-nav-for="<section-id>">` per section, authored in `index.html`.
   Items pointing at a data-driven section carry `hidden`, exactly like the section itself
   (R1); `js/components/navigation.js` clears `hidden` on an item only when its target section
   was revealed. Home / About / Contato are never hidden — their sections are static. FR-004
   then holds in both the scripted and unscripted case.
2. **Mobile disclosure**: the toggle `<button hidden aria-expanded="false" aria-controls="…">`
   is authored hidden and is revealed by JS, which simultaneously collapses the list. With no
   JS the full link list is simply visible — taller, but complete and operable. This is
   progressive enhancement in the literal sense: the *absence* of the enhancement is the
   accessible fallback, not a broken control. `aria-expanded` carries state (FR-006); `Escape`
   and outside-click dismiss without navigating away.
3. **Smooth scrolling**: `html { scroll-behavior: smooth }` in `css/base.css`, overridden to
   `auto` inside the existing `@media (prefers-reduced-motion: reduce)` block. Zero JS, and
   FR-007 is satisfied by the platform.

**Alternatives rejected**:

| Alternative | Why rejected |
|---|---|
| `<details>`/`<summary>` disclosure | Native state and keyboard support, but there is no reliable CSS-only way to force it open at ≥48rem, so desktop would need JS anyway — or a duplicated link list, which duplicates every anchor. |
| Checkbox hack (`input[type=checkbox]` + `:checked`) | A checkbox that is not a checkbox. Fails constitution V's "native element chosen for meaning". |
| Button + `aria-expanded`, authored *visible*, list collapsed in CSS | With no JS the toggle is inert and the nav is unreachable — a worse failure than a long list. |

---

## R3 — Case-study parts: how "problem / solution / architecture / result" are marked up

**Requirement**: FR-022, FR-023, FR-069, plus `structure.spec.js`'s "sections use `<h2>` and
their items use `<h3>`" and its one-`h2`-per-section assertion.

**Decision**: a `<dl class="case-study">` per entry, one `<dt>` label + `<dd>` body per present
part. Absent parts contribute neither element, so FR-023 is structural rather than a runtime
check. `<dt>`/`<dd>` must be direct children of the `<dl>` (axe `definition-list`), so no
wrapper divs.

**Rejected**: `<h4>` + `<p>` per part. It is valid and skips no level, but four sub-headings per
case study floods the heading outline — a screen-reader user navigating by heading through five
case studies meets twenty labels before reaching the next section. The `<dl>` keeps the outline
at `h2` section → `h3` entry title.

**Rejected**: one paragraph with a bold lead-in. `<strong>` is not a label; FR-022 asks for
distinguishable parts.

---

## R4 — Footer copyright year without a build step

**Requirement**: FR-072, SC-017. Today the literal `2024` sits in `index.html`.

**Decision**: reuse the pattern already established for years-of-experience —
`&copy; <span id="copyright-year">2026</span>` with JS overwriting it at load. The static value
is a fallback that can drift by at most one year, and `tests/data/sync.test.js` already contains
a precedent assertion ("the fallback is close enough to the derived value to not read as wrong")
which is extended to cover it.

**Rejected**: JS-only (empty span). With scripts disabled the footer reads `©  Bruno Oliveira`.
**Rejected**: a build step or server render. FR-053, FR-054.

---

## R5 — The duplicated LinkedIn destination

**Requirement**: FR-073. `no-js.spec.js:21` asserts `toHaveCount(1)` for every
`profile.socialLinks[].url`. `index.html` carries the LinkedIn URL twice — the Hero social list
and the contact-form note — so the check fails on an assumption of uniqueness, not on a defect.

**Decision**: LinkedIn appears in exactly two places, deliberately: the Hero social list
(identity) and the Contact routes list (conversion). The contact-form's prose note anchor is
**removed** — with LinkedIn now an explicit contact route, the note duplicated a route that is
already adjacent to it. The test is rewritten to assert *at least one* visible instance per
social URL, and that **every** instance carries a descriptive accessible name (FR-059) — which
is the property that actually matters.

---

## R6 — Module naming: `projects.js` vs a new `work.js`

**Requirement**: FR-019 renames the *section* to Selected Work; the constitution's mandated tree
names the files `js/components/projects.js` and `js/data/projects.js`.

**Decision**: **keep both filenames.** FR-019 governs what the page presents, not what the file
is called. Renaming would deviate from a constitution-mandated path and require an amendment or
a permanent Complexity Tracking entry, for zero user-visible benefit.

The *entity* is named `WorkEntry` in `tests/schemas/index.js` and in `data-model.md`, since
schema names are test-side and unconstrained. The module header comment states the mapping so a
future reader is not confused by it.

---

## R7 — Where the Profile extension lives, and how the static mirror stays honest

**Requirement**: FR-009, FR-010, FR-017, FR-018, SC-006.

**Decision**: every new identity value (`headline`, `availability`, `about`, `cvUrl`,
`primaryCta`, `secondaryCta`) is added to `js/data/profile.js` and **mirrored statically** in
`index.html` — the same mechanism already used for `name`/`role`/`summary`/`location`/`email`
and enforced by `tests/data/sync.test.js`. FR-018 requires positioning statement and About
content to survive a script failure, which rules out rendering them.

`sync.test.js` is extended so each new mirror is asserted character-for-character against
`profile.js`, satisfying FR-010's "MUST be verified to match its source exactly".

**Consequence — About needs no component.** It is static markup mirrored from `profile.about`
(an array of paragraph strings). Adding a component would render content that FR-018 requires to
be static, i.e. it would render it twice. Same reasoning for the Hero's new copy and for the
Contact routes.

---

## R8 — Conditionally-absent identity affordances in static markup

**Requirement**: FR-014, FR-041, SC-004 — a CTA or contact route whose destination is absent must
be *omitted*, and `cvUrl` ships absent.

**Decision**: author the affordance in `index.html` carrying
`data-profile-optional="<profile key>"`, and add `js/components/identity.js` exporting
`pruneOptionalIdentity(profile, doc)`, which removes any such node whose backing value is absent.
`js/app.js` calls it in its own `try`/`catch` after `mount()`.

The no-JS case is covered by authoring nothing for a value the owner has not supplied — while
`cvUrl` is absent, no CV markup exists at all, so nothing needs pruning. The pruner exists so
that *adding* `cvUrl` later is a one-file edit (SC-006) and so that removing it again cannot
leave an inert link behind.

`js/app.js` keeps its "no markup of its own" rule: it removes nodes, it does not create them.

---

## R9 — Structured data (JSON-LD) without new claims

**Requirement**: FR-068, SC-016.

**Decision**: a static `<script type="application/ld+json">` block in `<head>` describing a
`Person` — `name`, `jobTitle`, `description`, `email`, `url`, `sameAs` (the social URLs),
`address.addressLocality`. Every value is already on the page. It is a mirror under FR-010, so
`sync.test.js` parses the block and asserts each field against `profile.js`.

**Rejected**: injecting it with JS. Crawlers that do not execute scripts are precisely the
audience for it.

---

## R10 — Which currently-failing e2e assertions are content-coupled and must be rewritten

Removing the placeholder project (FR-024, FR-025) silently defeats three existing checks, which
would then pass vacuously. Rewriting them is in scope for FR-071.

| Check | Breaks how | Rewrite |
|---|---|---|
| `structure.spec.js:95` "repeated items are announced as lists" — asserts `.project-list` exists | `.project-list` will not exist | Assert against the lists that ship with content (`.skill-groups`, `.certification-list`, `.chip-list`, `.timeline`), and keep the global "no orphan `<li>`" assertion, which is the part that generalises |
| `responsive.spec.js:24` "an artificially long project title does not force horizontal scroll" | mutates `.project-card__title`, which will not exist → test no-ops | Inject the long string into an element that always exists (the About paragraph and each section heading), so the overflow guarantee is still exercised at 320px |
| `keyboard.spec.js:118` "project links are operable without a mouse" | `.project-card__links a` count 0 → loop body never runs | Keep as a live-page check but add the real coverage in `tests/unit/projects.test.js` against fixtures, where entries exist |

`tests/data/parity.test.js`'s `PROJECT_CONTENT` whitelist and its comment are deleted (FR-024),
and replaced with an assertion that the placeholder strings are **absent** — so the placeholder
cannot quietly return.

---

## R11 — Fixtures are the only way to exercise the populated path

**Requirement**: SC-005, and the spec's assumption that Selected Work and Community ship empty.

**Decision**: the populated path for both is covered exclusively in `tests/unit/` against
`tests/fixtures/index.js`. Required fixture set:

- **WorkEntry**: a full case study (every field); a minimal entry (title + description only);
  one entry per individually-omitted optional field; an entry with an image; an entry missing a
  required field (must throw); a hidden entry; an all-hidden collection; the empty collection.
- **CommunityActivity**: with metrics; without metrics; a **zero-valued metric** (FR-036 — the
  case a truthiness check gets wrong); missing period; missing links; empty collection.
- **Principle**: with detail; without detail; empty collection.

`tests/data/independence.test.js` already asserts fixtures never reuse real content and that
mutating every string leaves the DOM shape identical; the three new components join its
`COMPONENTS` table.

---

## R12 — Constraints the existing test suite already imposes on the design

Discovered by reading the suites rather than assumed. These are hard limits on Phase 1:

- **Exactly four stylesheets** (`tests/data/css.test.js` S-4). No new CSS file for the new
  sections; they extend `components.css` and `sections.css`.
- **Only `48rem` and `64rem` breakpoints**, `min-width` only (S-2). The navigation and
  case-study layouts must fit those two.
- **No colour literal outside `variables.css`** (S-1) — new tokens go in `variables.css`.
- **No `outline: none` without a replacement** (S-5).
- **No component may import a data module** (`independence.test.js:154`).
- **No `tests/unit/**` or `tests/data/**` file except `parity.test.js` may contain a literal
  from `js/data/`** (`independence.test.js:93`). The Engineering Philosophy content is real, so
  its tests must be fixture-based only.
- `tests/` must never be referenced by `index.html` or any shipped module (constitution).

---

## R13 — Environment prerequisite: the e2e suite cannot currently run here

**Observed**: `npm run test:unit` → 123/123 pass. `npm run test:data` → 100/100 pass.
`npm run test:e2e` → **68/68 fail before any assertion**, all with:

```
chrome-headless-shell: error while loading shared libraries: libnspr4.so:
cannot open shared object file: No such file or directory
```

This is a missing system library in this WSL2 environment, not a defect in the page. It means
the spec's "eight currently-failing checks" could **not** be independently reproduced during
planning; that number is carried from feature 002's records and the six structural ones were
confirmed by reading the assertions against the current `index.html` (see R1, R5, R10).

**Decision**: installing the browser dependencies is a **prerequisite task**, sequenced first in
`tasks.md`, because FR-071 and SC-008 are unverifiable without it:

```bash
sudo npx playwright install-deps chromium
# or: sudo apt-get install -y libnspr4 libnss3 libasound2t64
```

It requires elevated privileges, so the owner must run it. Nothing else in the feature depends
on it, so implementation is not blocked — only final verification is.

---

## R14 — Engineering Philosophy content, traced to evidence

FR-030/FR-031 require concrete, real principles; the spec's Assumptions require each to trace to
something `js/data/experiences.js` already states. Sourcing is a Phase 1 authoring task, drawn
only from: legacy modernisation (Symfony/Angular → NestJS/Next.js at CWI), code review and
mentoring, observability, performance work, and specification-driven development. No principle
may assert a practice the experience data does not evidence.

---

## Unresolved

None. No `NEEDS CLARIFICATION` remains in the Technical Context.

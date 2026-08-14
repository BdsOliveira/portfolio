# Component Contracts: Recruiter-Focused Portfolio Refactor

**Feature**: `003-recruiter-portfolio-refactor`

Contracts are numbered with a `3` generation marker (`W3-n`, `P3-n`, …) so they never collide
with the `C-`, `P-`, `S-`, `A-`, `E2-`, `D2-` identifiers already cited in the test suite.

Every contract below is a behaviour a test asserts. Tests bind to these contracts and to
`tests/fixtures/index.js` — **never** to values in `js/data/` (constitution: Development
Workflow; enforced by `tests/data/independence.test.js`).

Universal preconditions, inherited from feature 001 and unchanged:

- A render function has the signature `render(data, doc) -> DocumentFragment | null`.
- It returns `null` when there is nothing to show; it never returns an empty container.
- It throws, naming entity / field / id, when a **required** field is missing.
- It reads only its argument. It imports no data module.
- It sets text via `textContent`, never `innerHTML`.

---

## W3 — `js/components/projects.js` (Selected Work)

Module path unchanged (research R6); the rendered section is titled in Portuguese as Selected
Work. Entity is `WorkEntry`.

### W3-1 · Only `title` and `description` are required

`technologies` and `isVisible` move from required to optional (FR-021). Given an entry carrying
only `id`, `title` and `description`, `renderProjects` returns a fragment containing exactly one
card, with no chip list, no links block, no image and no case study.

### W3-2 · An absent `isVisible` means visible

Only an explicit `isVisible === false` hides an entry. `undefined` renders.

### W3-3 · Case-study parts render as a labelled `<dl>`

For each of `problem`, `solution`, `contribution`, `architecture`, `result` that is present, the
card contains one `<dt>` carrying that part's Portuguese label and one immediately-following
`<dd>` carrying its text, both direct children of a single `<dl class="case-study">` (FR-022).
Part order is fixed: problem → solution → contribution → architecture → result — it does not
follow key order in the data object.

### W3-4 · An absent case-study part produces nothing

No `<dt>`, no `<dd>`, no separator, no empty node (FR-023). Asserted per field: the fixture set
includes one entry per individually-omitted optional field, and each must render with zero
elements whose `textContent` is empty.

### W3-5 · No `<dl>` at all when every part is absent

An entry with none of the five parts contains no `<dl>` element — not an empty one.

### W3-6 · `tagline` renders as its own element, above the description

Present → one element carrying it. Absent → no element.

### W3-7 · Links carry destination-identifying accessible names

`repositoryUrl`, `liveUrl` and `caseStudyUrl` each render one anchor whose accessible name
incorporates the entry title (FR-034 scenario 4, FR-059), e.g. `Ver código de {title}`,
`Abrir site de {title}`, `Ler o estudo de caso de {title}`. Absent URL → no anchor. All three
absent → no links container at all.

### W3-8 · Images reserve space and defer loading

Unchanged from feature 001: explicit `width`/`height`, `loading="lazy"`, `decoding="async"`,
`alt` from `imageAlt` (FR-027). Absent `image` → no `<img>`.

### W3-9 · Empty and all-hidden collections return `null`

`renderProjects([], doc) === null`, and a collection whose every entry is `isVisible: false`
returns `null` (FR-002, SC-003).

### W3-10 · Order is array order

No sort at render time (FR-048).

### W3-11 · Card heading level is `<h3>`

One `<h3>` per entry, so the outline stays `h1` → section `h2` → entry `h3` (FR-069).

---

## PH3 — `js/components/philosophy.js` *(new)*

### PH3-1 · One item per principle, in array order

`renderPhilosophy(principles, doc)` returns a fragment containing a single `<ul>` with exactly
`principles.length` `<li>` children.

### PH3-2 · `title` renders as `<h3>`; `detail` renders as a sibling body element

### PH3-3 · An absent `detail` renders the title alone

No empty body element is emitted (FR-029, spec US3 scenario 3).

### PH3-4 · An empty collection returns `null` (FR-002)

### PH3-5 · A missing `title` throws, naming entity, field and id

---

## CM3 — `js/components/community.js` *(new)*

### CM3-1 · One item per activity, in array order

`renderCommunity(activities, doc)` returns a fragment containing a single `<ul>`.

### CM3-2 · `organisation` renders as `<h3>`; `contribution` renders as its own element

Both required; a missing one throws naming entity, field and id.

### CM3-3 · `period` and `description` are conditional

Absent → no element, no dangling label (FR-034, US4 scenario 3).

### CM3-4 · Metrics render as a labelled list

Present `metrics` → one `<ul class="metric-list">` with one `<li>` per metric, each showing the
`value` and its `unit` (FR-035). Absent or empty `metrics` → **no list element at all**.

### CM3-5 · A metric value of `0` renders

The presence test is `value === undefined`, never truthiness (FR-036). A fixture with
`{ value: 0, unit: 'talks' }` must produce a visible `0`. This contract exists because the
obvious implementation gets it wrong.

### CM3-6 · Links carry their own `label` as accessible name

One anchor per `links` entry, with `rel="noopener noreferrer"` and `target="_blank"`, whose
accessible name is the entry's `label` (FR-059). Absent or empty `links` → no container.

### CM3-7 · An empty collection returns `null` (FR-002, FR-038)

### CM3-8 · No metric is emitted that is not present in the data

The renderer never synthesises, defaults or infers a metric (FR-037).

---

## N3 — `js/components/navigation.js` *(new)*

This module carries interaction behaviour as well as DOM reconciliation — see the plan's
Complexity Tracking entry.

### N3-1 · `revealNavigation(doc)` un-hides only reachable items

For each `li[data-nav-for="<id>"]`, the `hidden` attribute is removed **iff** `#<id>` exists in
the document and is not itself `hidden`. Items whose target is absent or hidden stay hidden
(FR-004).

### N3-2 · With no script, no navigation item points at a hidden section

Guaranteed by authoring: data-driven nav items ship `hidden` alongside their sections
(research R1/R2). This is asserted in `tests/e2e/no-js.spec.js`, not in a unit test.

### N3-3 · `enableMobileNavigation(doc)` reveals the toggle and collapses the list

It removes `hidden` from the toggle button and sets `aria-expanded="false"`. Calling it is what
makes the navigation collapsible; **not** calling it leaves the full list visible and operable.

### N3-4 · The toggle conveys its state

Activating it flips `aria-expanded` between `"true"` and `"false"` and shows/hides the list
(FR-006). The control is a `<button>` with `aria-controls` pointing at the list's `id`.

### N3-5 · The navigation is dismissible without navigating away

`Escape` while focus is inside the navigation closes it and returns focus to the toggle. A
pointer or focus event outside the navigation closes it. Neither changes the URL (FR-006).

### N3-6 · Activating a link closes the navigation

On a narrow viewport, following an in-page link closes the disclosure; the browser performs the
navigation (FR-007, FR-008). No `preventDefault`, no script-driven scrolling — smooth behaviour
comes from CSS `scroll-behavior` and yields to `prefers-reduced-motion` (FR-007).

### N3-7 · Every navigation destination resolves

Every `href` is an in-page fragment matching the `id` of an existing section.

---

## I3 — `js/components/identity.js` *(new)*

### I3-1 · `renderCopyrightYear(_, doc)` returns the current year as a text fragment

Mirrors the existing `renderHero` derivation pattern. The static literal in `index.html` is a
fallback, not a second source (FR-072).

### I3-2 · `pruneOptionalIdentity(profile, doc)` removes unbacked affordances

Every element carrying `data-profile-optional="<key>"` is removed when `profile[<key>]` is
`undefined`, `null` or an empty string; it is left untouched otherwise (FR-014, FR-041).

### I3-3 · Pruning removes the element, never merely hides or disables it

An inert CV link is a defect, not a degraded state (FR-041, spec US5 scenario 7).

### I3-4 · Pruning is idempotent and tolerates a missing profile key

Running it twice, or against a profile with no optional keys at all, throws nothing.

---

## H3 — `index.html`

### H3-1 · Section order

`main` contains, in document order: `#hero`, `#about`, `#experience`, `#work`, `#skills`,
`#philosophy`, `#community`, `#education`, `#certifications`, `#contact` (FR-001, SC-002).

`#work` keeps `id="work"` while its module stays `projects.js`; the id names the section as the
recruiter and the navigation see it.

### H3-2 · Every data-driven section is authored `hidden`

`#experience`, `#work`, `#skills`, `#philosophy`, `#community`, `#education`, `#certifications`
each carry the `hidden` attribute and a `[data-mount]` body. `#hero`, `#about` and `#contact`
are static and never hidden (research R1, FR-003, FR-074).

### H3-3 · Hero, About and Contact content is static and mirrored

`headline`, `availability`, `about` paragraphs, both CTA labels and hrefs, `location`, `email`
and the social links are authored as literals carrying `data-profile="<key>"` anchors, and are
asserted against `js/data/profile.js` by `tests/data/sync.test.js` (FR-010, FR-017, FR-018).

### H3-4 · Exactly one `<h1>`, no skipped level

`h1` is the owner's name in the Hero. Each `main > section` other than `#hero` carries exactly
one `<h2>`; item titles are `<h3>` (FR-069, `structure.spec.js`).

### H3-5 · Navigation markup

One `<nav aria-label>` containing a brand link, a `<button hidden>` toggle with `aria-controls`
and `aria-expanded`, and one `<ul>` of `<li data-nav-for>` items — `hidden` on those bound to a
data-driven section (N3-1).

### H3-6 · JSON-LD `Person` block

A single static `<script type="application/ld+json">` in `<head>` whose `name`, `jobTitle`,
`description`, `email`, `url`, `sameAs` and `address.addressLocality` all mirror `profile.js`
and add no claim not already on the page (FR-068, research R9).

### H3-7 · The copyright year is a `<span id="copyright-year">`, not a literal sentence

### H3-8 · The contact-form prose LinkedIn anchor is removed

LinkedIn is reachable from exactly two deliberate places: the Hero social list and the Contact
routes list (FR-073, research R5).

### H3-9 · The contact form and static contact details are preserved

Unchanged markup, labels, and `mailto:` behaviour (FR-043).

---

## S3 — `tests/schemas/index.js`

### S3-1 · Two new field types

`number` (accepts any finite number, including `0`) and `object` (singular composite, with `of`,
mirroring the existing `object[]`).

### S3-2 · New schemas

`Cta`, `Link`, `Metric`, `Principle`, `CommunityActivity`, and `WorkEntry` replacing `Project`.

### S3-3 · `Profile` gains `headline` (required), `about` (`string[]`, required),
`availability` (optional), `cvUrl` (optional `url`), `primaryCta` / `secondaryCta` (required)

### S3-4 · `WorkEntry` requires only `id`, `title`, `description`

`technologies` and `isVisible` become optional; `tagline`, `problem`, `solution`,
`contribution`, `architecture`, `result`, `caseStudyUrl` are added as optional.

### S3-5 · An empty collection is valid

`validateCollection([], schema)` returns `[]` for every schema (FR-049). This is the shipped
state of two collections and must never be reported as an error.

---

## T3 — Test-suite contracts

### T3-1 · `tests/data/parity.test.js` — the whitelist is deleted

`PROJECT_CONTENT` and its ⚠ WHITELISTED EXCEPTION comment are removed and replaced by an
assertion that the strings `Plataforma E-commerce` and its description are **absent** from the
served page (FR-024). The feature-002 CV content assertions are otherwise untouched (FR-051,
SC-015).

### T3-2 · `tests/data/sync.test.js` — mirrors extended

Adds `headline`, each `about` paragraph, `availability`, both CTA labels and hrefs, and every
JSON-LD field, each asserted character-for-character against `profile.js` (FR-010). Adds the
copyright-year fallback assertion (FR-072, research R4).

### T3-3 · `tests/data/independence.test.js` — three components joined

`philosophy`, `community` and the extended `projects` join the `COMPONENTS` table, so mutating
every displayed string must leave the DOM shape identical.

### T3-4 · `tests/fixtures/index.js` — new fixture sets

As enumerated in research R11. Fixture content stays fictional and distinguishable from real
content, which `independence.test.js` already asserts.

### T3-5 · Content-coupled e2e assertions are rewritten, not deleted

The three assertions identified in research R10 are rewritten to bind to sections that ship with
content, or to structure rather than to the placeholder project.

### T3-6 · New e2e coverage

Section order (H3-1); no section heading above an empty region with scripts disabled (FR-074);
navigation reaches every present section and no absent one at all three viewports (FR-004);
mobile disclosure operable by pointer and keyboard, with `aria-expanded` state (FR-005, FR-006);
`#work` and `#community` absent from the rendered page (SC-003); footer year is the current year
(SC-017); JSON-LD parses and agrees with the page (FR-068).

### T3-7 · Zero known-failure exemptions

No test may be skipped, `.fixme`'d, or carried with a comment excusing a failure (FR-071,
SC-008).

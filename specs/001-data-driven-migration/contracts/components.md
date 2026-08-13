# Component Contracts

**Date**: 2026-08-13 | **Feature**: `001-data-driven-migration`

The UI contract of this project. Every component in `js/components/` conforms to the shared
signature below; the per-component sections state the DOM each one guarantees to produce. These
are the contracts the tier-1 tests assert against (FR-044) — tests target *this document*, never
specific content values (FR-046).

---

## Shared signature

```js
/**
 * @param {object|array} data  Content for this section. Never fetched, never imported
 *                             from js/data/ by the component itself — always passed in.
 * @param {Document} doc       DOM implementation. Injected so tests can pass linkedom.
 * @returns {DocumentFragment|null}  null means "render nothing" (R8).
 */
export function renderX(data, doc) { … }
```

**Universal guarantees** — every component MUST satisfy all of these:

| ID | Guarantee | Traces to |
|----|-----------|-----------|
| C-1 | Pure: no network, no global reads/writes, no mutation of `data` | FR-011 |
| C-2 | Returns a fragment or `null`; never touches the live document itself | FR-010 |
| C-3 | Contains no literal portfolio content — every string comes from `data` or is a structural label | FR-004 |
| C-4 | Empty collection (after `isVisible` filtering) → returns `null` | FR-007 |
| C-5 | Missing optional field → element not created; never an empty node | FR-006 |
| C-6 | Missing required field → throws `Error` naming the entity, field, and `id` | FR-006 |
| C-7 | Text set via `textContent`; never `innerHTML` | R1 |
| C-8 | Every image carries `alt`, explicit `width`/`height`, and `loading="lazy"` below the fold | FR-029, FR-037 |
| C-9 | Every icon is `<svg aria-hidden="true">` beside a text label, or carries an accessible name | FR-029 |
| C-10 | Interactive elements are `<a>` or `<button>` by behaviour — never a styled `<div>` or `<i>` | FR-028 |
| C-11 | Section heading level is `<h2>`; sub-items use `<h3>`. Never skips a level | FR-024 |
| C-12 | Repeated items render as `<ul>`/`<li>` so assistive tech announces the count | FR-023 |

---

## `app.js` — entry point

**Not a component.** Responsibilities, and nothing else:

1. Import data modules and component modules.
2. Call each `renderX(data, document)`.
3. Append the returned fragment to its section container, or **remove the container** when
   `null` is returned.
4. Nothing else — no markup construction of its own (constitution: `app.js` rules).

```js
const sections = [
  ['#projects',       renderProjects,       projects],
  ['#skills',         renderSkills,         skills],
  ['#certifications', renderCertifications, certifications],
  ['#experience',     renderExperience,     experiences],   // ships empty → removed
  ['#education',      renderEducation,      education],     // ships empty → removed
];
```

**Contract A-1**: a component throwing MUST NOT prevent other sections from rendering. Each call
is isolated; a failure logs and removes that one section. Guarantees SC-013 — the static hero
survives any rendering failure.

---

## `hero.js`

**Input**: `Profile` object.

**Deliberately narrow.** Name, role, summary, and social links are static in `index.html`
(R2) — this component does **not** render them. It only enhances what cannot be static.

**Guarantees**:

- Returns a fragment containing the derived years-of-experience value only.
- Computes `currentYear - profile.experienceStartYear` at call time (FR-017). Never a literal.
- Throws when `experienceStartYear` is absent or exceeds the current year.
- Target element in `index.html` carries a sensible pre-JS fallback, so the sentence reads
  correctly even if the script never runs.

**Test fixtures**: `experienceStartYear` of 2022 in year 2026 → `4`. Start year in the future →
throws.

---

## `projects.js`

**Input**: `Project[]`.

**Guarantees**:

- Filters `isVisible === false` before anything else. All-hidden → `null` (C-4).
- One `<li>` per visible project, in array order.
- Card structure: `<h3>` title, description paragraph, `<ul>` of technology tags.
- **Technology tags render exactly `technologies.length` chips** — never a fixed five, never an
  empty chip. This is the defect in `Project.js` that must not survive.
- `repositoryUrl` / `liveUrl` absent → that link is not created.
- Links carry descriptive accessible names incorporating the project title (FR-043) — "Ver
  código de {title}", not "GitHub".
- No hover-only affordance: any information the old tooltip conveyed is in the link's accessible
  name, available to keyboard users (FR-031).

---

## `skills.js`

**Input**: `SkillGroup[]`.

**Guarantees**: one group per entry, `<h3>` group name, `<ul>` of skills with exactly
`skills.length` items. Empty group array → `null`.

---

## `certifications.js`

**Input**: `Certification[]`.

**Guarantees**: `<h3>` title; `issuer` and `detail` omitted when absent; icon is a sprite
`<use>` marked `aria-hidden="true"` next to the visible title; `verificationUrl` absent → no
link. Emoji glyphs are not used as icons.

---

## `experience.js`

**Input**: `Experience[]`. **Ships empty → returns `null` → section removed.**

**Guarantees**: `<h3>` "{title} — {company}"; date range from `startDate`/`endDate` with `null`
rendering as "Atual"; `achievements` omitted entirely when absent or empty; dates in a
`<time datetime="YYYY-MM">` element.

---

## `education.js`

**Input**: `Education[]`. **Ships empty → returns `null` → section removed.**

**Guarantees**: `<h3>` qualification; institution; `field` omitted when absent; `endYear` of
`null` renders as "Em andamento".

---

## Page-level contracts (`index.html`)

Not a component, but contractual — asserted by tier-2 tests.

| ID | Guarantee | Traces to |
|----|-----------|-----------|
| P-1 | Exactly one `<h1>`; heading outline nests with no skipped level | FR-024 |
| P-2 | `<header>`/`<nav>`, `<main>`, `<footer>` landmarks present and distinct | FR-023 |
| P-3 | Name, role, summary, and social links present in the served HTML before any script runs | FR-042 |
| P-4 | Those static strings match `profile.js` exactly | R2 |
| P-5 | Zero requests to hosts outside the origin | FR-019 |
| P-6 | Every form field has a `<label>`; placeholders are supplementary only | FR-027 |
| P-7 | Every focusable element shows a visible focus indicator | FR-026 |
| P-8 | Every navigation destination reachable at every width — nothing `display:none` on mobile | FR-034 |
| P-9 | No horizontal scroll at 320/768/1024 | FR-036 |
| P-10 | `lang`, canonical, description, and Open Graph metadata present | FR-039–FR-041 |
| P-11 | Zero axe-core violations at WCAG 2.1 AA | FR-030, SC-005 |
| P-12 | Transitions suppressed under `prefers-reduced-motion: reduce` | FR-032 |

---

## CSS contracts

| ID | Guarantee | Traces to |
|----|-----------|-----------|
| S-1 | Every colour, spacing, and type value is a `var(--token)`; no literal hex outside `variables.css` | FR-012 |
| S-2 | All media queries are `min-width` — zero `max-width` queries, so no breakpoint gap can exist | FR-033, FR-035 |
| S-3 | `--color-accent` as text clears 4.5:1 against whatever surface is behind it. Asserted by computing the ratio, not by naming colours — the palette this contract was first written for had one pairing at 2.7:1; the current one has none (R6, amended) | R6, FR-030 |
| S-4 | `variables.css` = tokens only; `base.css` = reset/elements/typography; `components.css` = reusable pieces; `sections.css` = section layout | constitution |
| S-5 | No `outline: none` without an equal-or-better replacement indicator | FR-026 |

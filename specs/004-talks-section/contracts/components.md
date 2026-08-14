# Component Contracts: Talks Section

**Feature**: `004-talks-section`

Contracts carry a `4` generation marker (`T4-n`, `N4-n`, …) so they never collide with the `C-`,
`P-`, `S-`, `A-`, `E2-`, `D2-`, `W3-`, `PH3-`, `CM3-`, `N3-`, `I3-`, `H3-`, `S3-`, `T3-`
identifiers already cited in the suite.

Every contract below is a behaviour a test asserts. Tests bind to these contracts and to
`tests/fixtures/index.js` — **never** to values in `js/data/` (constitution: Development Workflow;
enforced by `tests/data/independence.test.js`).

Universal preconditions, inherited unchanged from features 001 and 003 and asserted for `talks.js`
by `tests/unit/contracts.test.js` once it is registered (research R12):

- `render(data, doc) -> DocumentFragment | null`.
- Returns `null` when there is nothing to show; never an empty container.
- Throws, naming entity / field / id, when a **required** field is missing.
- Reads only its argument. Imports no data module. Touches no global `document`, `window`,
  `globalThis` or storage. Makes no network call.
- Sets text via `textContent`, never `innerHTML`.
- Does not mutate its input. Fixtures are deep-frozen before rendering, so a mutation throws.

---

## T4 — `js/components/talks.js` *(new)*

Entity is `Talk`. Export is `renderTalks`.

### T4-1 · One list item per talk, wrapped in a single list

`renderTalks(talks, doc)` returns a fragment containing exactly one `<ul class="talk-list">` whose
children are exactly `talks.length` `<li>` elements, each carrying the classes `talk card` and a
`data-talk` attribute set to the entry's `id` (FR-026).

### T4-2 · Order is most recent first, and the input is not mutated

Given entries in any order, the rendered `data-talk` sequence is descending by `date` (FR-011).
Asserted with a fixture deliberately authored oldest-first. The array passed in compares equal to
its pre-render copy afterwards, and rendering a frozen array does not throw (research R6).

Ties — two talks on the same date — retain their relative input order.

### T4-3 · The date renders as `DD/MM/AAAA` inside `<time datetime>`

Each item contains exactly one `<time>` whose `datetime` attribute is the entry's `date` verbatim
(`AAAA-MM-DD`) and whose text is the same date as `DD/MM/AAAA` (FR-018). `2025-03-12` renders as
`12/03/2025`. No locale API is called (research R4).

### T4-4 · Content order inside an item is photograph → title → date → description

The item's element children appear in that order (FR-017). `event`, when present, follows the date;
`link`, when present, is last. Asserted on the element sequence, not on visual position.

### T4-5 · Required fields are required

Given an entry missing any of `id`, `title`, `date`, `description`, `photo`, `photoAlt`,
`renderTalks` throws an `Error` naming `Talk`, the entry's id, and the missing field. Asserted once
per required field.

### T4-6 · The photograph carries a meaningful, non-empty `alt`

Each item contains exactly one `<img class="talk__photo">` whose `src` is the entry's `photo` and
whose `alt` is the entry's `photoAlt`. `alt` is never absent and never the empty string — a talk
photograph is content, not decoration (FR-027, contract C-9's dividing line).

### T4-7 · Optional fields produce an element or nothing at all

Asserted per field, with one fixture per individually-omitted optional field:

- `event` present → exactly one element carrying it, marked `data-event`. Absent → **no** element,
  no separator, no empty node (FR-005).
- `link` present → exactly one `<a>` whose `href` is `link.url` and whose accessible name is
  `link.label` verbatim, carrying `rel="noopener noreferrer"` and `target="_blank"` as every other
  outbound link on the site does. Absent → no anchor and no container for one (FR-006).

No element rendered by this component may have an empty `textContent`.

### T4-8 · The first photograph loads eagerly, every later one lazily

In render order, the first item's `<img>` carries `loading="eager"`; every subsequent item's
carries `loading="lazy"`. All carry `decoding="async"` (FR-034).

This is pinned at contract level on purpose: the section sits directly beneath the hero, so its
first card can fall inside the initial viewport, and `loading="lazy"` on an in-viewport image is a
visible blank. The natural regression — copying `projects.js` and deferring everything — is exactly
what this contract catches.

No `fetchpriority` is set; the hero portrait keeps that.

### T4-9 · Every photograph reserves its box

Each `<img>` carries `width="1280"` and `height="720"` as attributes, from module constants and not
from the data (FR-033, research R5). `tests/e2e/structure.spec.js`'s existing "every image has an
alt attribute and reserved dimensions" assertion covers the rendered page.

### T4-10 · Item heading level is `<h3>`

Exactly one `<h3 class="talk__title">` per item, so the outline stays `h1` → section `h2` →
item `h3` (FR-025). No other heading element appears in the component's output.

### T4-11 · An empty collection returns `null`

`renderTalks([], doc) === null` (FR-013). No `<ul>`, no fragment with an empty list.

### T4-12 · The component holds no talk content

No talk title, date, description or event name appears as a literal in `js/components/talks.js`.
The only strings it may contain are structural: class names, attribute names and values, the `/`
date separator, and the entity name `Talk` used in error messages (constitution I, C-3).

### T4-13 · Rendered structure does not vary with content values

Two fixtures with identical field *presence* but entirely different field *values* produce
identical DOM shape — same tags, same classes, same nesting (enforced by
`tests/data/independence.test.js` once `talks` is registered).

### T4-14 · Registered in the universal contract table

`talks.js` appears in `COMPONENTS` in `tests/unit/contracts.test.js` with
`collection: true`, so C-1 … C-12 apply to it. The suite fails if a module exists under
`js/components/` that is in neither that table nor `BEHAVIOUR_MODULES` (research R12).

---

## A4 — `js/app.js`

### A4-1 · One binding, positioned to match the page

`sections` gains exactly one entry:
`{ mount: '[data-mount="talks"]', section: '#talks', render: renderTalks, data: talks }`.

### A4-2 · No markup is added to `app.js`

The binding is data. `app.js` continues to build nothing (constitution: `js/app.js` rules, FR-057
of feature 003).

### A4-3 · A failure in this component isolates

If `renderTalks` throws, `#talks` is removed, the error is logged, and every other binding still
mounts (FR-037, inherited contract A-1). Asserted with a fixture that throws.

---

## N4 — `index.html` and navigation

### N4-1 · The section is authored `hidden`, between `#hero` and `#about`

```html
<section id="talks" class="section" aria-labelledby="talks-heading" hidden>
    <h2 id="talks-heading" class="section__heading">Palestras</h2>
    <div class="section__body" data-mount="talks"></div>
</section>
```

Position is asserted against the **served** HTML by `tests/e2e/structure.spec.js`'s
`SECTION_ORDER`, which gains `talks` in second place (FR-010, research R12).

`hidden` rather than a CSS rule: it removes the element from the accessibility tree and the box
tree without the stylesheet loading, so the empty-section guarantee survives a CSS failure as well
as a script failure (inherited from feature 003, research R1).

### N4-2 · The navigation item ships `hidden` and is revealed by the existing mechanism

`<li data-nav-for="talks" hidden><a href="#talks">Palestras</a></li>`, placed between the `hero`
and `about` items. `revealNavigation` un-hides it only when `#talks` exists and is not itself
hidden — no change to `js/components/navigation.js` is required (FR-012, FR-013).

### N4-3 · The header gains no row

With every navigation item revealed, the site header occupies no more rows at any width from 320px
to 1440px than it does with the current ten items (FR-015, SC-010). Asserted in
`tests/e2e/responsive.spec.js`.

If this fails, the mitigation is ranked in research R3 — move the navigation disclosure breakpoint
from `48rem` to `64rem`. It is **not** pre-applied.

### N4-4 · Anchor navigation clears the sticky header

Following `#talks` leaves `#talks-heading` fully visible (FR-014). Covered by the existing
`--anchor-offset` scroll-padding; asserted at 375px, 768px and 1440px.

---

## S4 — `css/sections.css`

No new file, no new token, no new breakpoint. Colours come from `variables.css` only — all four
constraints are asserted by `tests/data/css.test.js`, which needs no change.

### S4-1 · The grid matches `.project-list`

`.talk-list` is `display: grid`, `gap: var(--grid-gap)`,
`grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr))` (research R9). One column
at 320px; more as width allows; no media query.

### S4-2 · The card cannot force horizontal scroll

`.talk` sets `min-width: 0` and `overflow-wrap: anywhere`, as `.project-card` does. Without the
first, the grid item refuses to shrink below its longest unbreakable word (FR-022, SC-008).

### S4-3 · The photograph is a fixed 16:9 frame

`.talk__photo` sets `width: 100%`, `height: auto`, `aspect-ratio: 16 / 9`, `object-fit: cover`,
`border-radius: var(--radius-md)`, `display: block`. `height: auto` overrides the intrinsic
attribute while the attribute pair still reserves the ratio before the bytes land (FR-019, FR-033).

### S4-4 · Meta and description use existing type and colour roles

`.talk__meta` (date, and `event` when present) uses `var(--color-text-muted)` at `var(--text-sm)`.
`.talk__description` uses `var(--color-text-muted)` at `var(--leading-relaxed)`. Both pairings are
documented in `variables.css` as clearing AA on `--color-surface` (FR-030). Nothing in the section
conveys meaning by colour alone (FR-031).

### S4-5 · No new motion

The section introduces no transition, transform or animation of its own. It inherits `.card`'s
existing hover treatment, which already sits under the stylesheet's
`prefers-reduced-motion: reduce` block (FR-032).

### S4-6 · The link meets the touch-target minimum

`.talk__link` sets `min-height: var(--touch-target)` and `display: inline-flex`, matching
`.certification__link` (FR-029). It is pinned to the bottom of the card with `margin-block-start:
auto`, as `.project-card__links` is, so cards of differing text length keep their links aligned.

---

## D4 — data and schema

### D4-1 · `Talk` schema exists and is registered

`SCHEMAS.Talk` per [data-model.md](../data-model.md), and `['talks', talks, SCHEMAS.Talk]` in
`COLLECTIONS` in `tests/data/schemas.test.js`.

### D4-2 · The `date` type rejects malformed and impossible dates

`2025-3-12`, `12/03/2025`, `2025-13-01` and `2025-02-30` all fail; `2025-03-12` passes. The
impossible-but-well-formed case is the one a regex alone misses.

### D4-3 · `maxToday` rejects a future date

A `date` after today fails, naming the field. Today's date passes (SC-012).

### D4-4 · A missing photograph file fails validation

`photo` is `asset`-typed, so it must start with `assets/` and must resolve to a file that exists in
the repository (SC-012). Already implemented by the `assetExists` option.

### D4-5 · `js/data/talks.js` contains data only

No `document`, no `window`, no `fetch`, no `import`, no `function`, no `=>`. Enforced by adding
`'talks.js'` to the file list in `tests/data/schemas.test.js`.

### D4-6 · The shipped collection is empty

`js/data/talks.js` exports `[]` with the authoring comment from [data-model.md](../data-model.md).
No talk is invented (FR-008). The section is therefore absent from the live page until the owner
supplies entries — the state `js/data/community.js` is in today.

---

## Fixtures

Added to `tests/fixtures/index.js`. Named so no fixture is reused for two contracts by accident.

| Fixture | Shape | Contracts served |
|---|---|---|
| `talks` | Three complete entries, **authored oldest-first**, mixed optional fields | T4-1, T4-2, T4-4, T4-8 |
| `talkMinimal` | One entry: required fields only, no `event`, no `link` | T4-7, T4-11 boundary |
| `talkWithEvent` | One entry with `event`, no `link` | T4-7 |
| `talkWithLink` | One entry with `link`, no `event` | T4-7 |
| `talksSameDate` | Two entries sharing one `date` | T4-2 tie-breaking |
| `talkWithoutField(field)` | Factory returning the collection minus one required field | T4-5, one case per field |
| `talksDifferentValues` | Same field presence as `talks`, all values different | T4-13 |
| `talkFutureDate` | One entry dated after today | D4-3 |
| `talkImpossibleDate` | One entry dated `2025-02-30` | D4-2 |

Fixture photographs reference paths that do not exist in the repository. That is correct: unit
fixtures never touch the filesystem, and the `assetExists` check runs only against real
`js/data/` content in `tests/data/schemas.test.js`.

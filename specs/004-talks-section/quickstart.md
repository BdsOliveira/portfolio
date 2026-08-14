# Quickstart: Validating the Talks Section

**Feature**: `004-talks-section` | **Date**: 2026-08-14

Runnable scenarios that prove the feature works. Each names the requirement it discharges and how
to tell pass from fail. No implementation code here — that belongs in `tasks.md`.

## Prerequisites

```bash
node --version          # v24.18.0 on this machine; ES2022 modules, node:test
npm ci                  # dev-only: @playwright/test, @axe-core/playwright, linkedom
```

**Browser suite** — the e2e scenarios below **cannot run in this environment** until browser
system libraries are installed (research R11). The current failure is:

```text
chrome-headless-shell: error while loading shared libraries: libnspr4.so:
cannot open shared object file: No such file or directory
```

Fix, run once, outside this session (needs root):

```bash
sudo npx playwright install-deps chromium
```

Scenarios below are tagged **[node]** (runnable now) or **[browser]** (blocked until the above is
done). Every **[browser]** scenario must be run before the feature is called complete.

## Commands

```bash
npm run test:unit       # node --test tests/unit/**       baseline before this feature: 226 pass
npm run test:data       # node --test tests/data/**       baseline before this feature: 142 pass
npm run test:e2e        # playwright
npm test                # all three
npm run serve           # static server, for looking at the page
```

---

## V1 · The section is invisible while the collection is empty **[node]**

**Discharges**: FR-013, SC-009, D4-6.

```bash
npm run test:data
```

With `js/data/talks.js` exporting `[]`, `tests/data/parity.test.js` renders the page through
`js/app.js` and must find **no** `#talks` section and **no** navigation item pointing at it — the
same state `#work` and `#community` are in today.

**Pass**: data suite green, `#talks` absent from the rendered document.
**Fail**: a `#talks` element survives, or a "Palestras" link points at nothing.

---

## V2 · The section appears, correctly ordered, once entries exist **[node]**

**Discharges**: FR-001, FR-002, FR-010, FR-011, T4-1, T4-2.

```bash
npm run test:unit
```

`tests/unit/talks.test.js` renders the `talks` fixture — deliberately authored **oldest-first** —
and asserts the emitted `data-talk` sequence is descending by date.

**Pass**: order is newest → oldest regardless of authoring order.
**Fail**: authoring order leaks through, meaning the sort was dropped or applied to the wrong key.

Also asserted here: the array passed in is unchanged afterwards, and rendering a frozen array does
not throw.

---

## V3 · Every required field is genuinely required **[node]**

**Discharges**: FR-002, T4-5, SC-002.

```bash
npm run test:unit
```

One case per required field via `talkWithoutField(field)`. Each must throw an `Error` naming
`Talk`, the entry's id and the field.

**Pass**: six throws, six useful messages.
**Fail**: a silent render with a hole in it — the failure mode this contract exists to prevent.

---

## V4 · Optional fields leave no trace when absent **[node]**

**Discharges**: FR-005, T4-7.

```bash
npm run test:unit
```

`talkMinimal` must render with no `data-event` element, no anchor, and no element whose
`textContent` is empty.

**Pass**: zero empty nodes in the fragment.
**Fail**: an empty `<p>`, a stray separator, or a link container with nothing in it.

---

## V5 · Dates render as `DD/MM/AAAA` and stay machine-readable **[node]**

**Discharges**: FR-018, T4-3.

```bash
npm run test:unit
```

`2025-03-12` must render as text `12/03/2025` inside `<time datetime="2025-03-12">`.

**Pass**: exact string match, in any runtime, with no locale configured.
**Fail**: a locale-formatted string — meaning `Intl` was reintroduced against research R4, and the
test is now asserting a property of the ICU build rather than of the code.

---

## V6 · Schema rejects bad data before it can be published **[node]**

**Discharges**: SC-012, D4-2, D4-3, D4-4.

```bash
npm run test:data
```

Four rejections asserted: a malformed date (`2025-3-12`), an impossible one (`2025-02-30`), a
future one, and a `photo` path with no file behind it. Plus duplicate `id` detection, already
generic in `validateCollection`.

**Pass**: each produces an error naming the entity and field.
**Fail**: `2025-02-30` validating — the case a regex alone misses, which is why the `date` type
round-trips through `Date.parse`.

---

## V7 · The component holds no content, and its shape does not follow its values **[node]**

**Discharges**: FR-007, FR-009, T4-12, T4-13, constitution I.

```bash
npm run test:unit && npm run test:data
```

`tests/unit/contracts.test.js` (once `talks` is registered) checks the module source for content
literals and for global access; `tests/data/independence.test.js` renders two fixtures with
identical field presence and entirely different values and requires identical DOM shape.

**Pass**: both green.
**Fail**: a title, date or event name found as a literal in `js/components/talks.js`.

---

## V8 · The registration points all fired **[node]**

**Discharges**: research R12.

```bash
npm run test:unit && npm run test:data
```

`tests/unit/contracts.test.js` compares `readdirSync('js/components')` against its `COMPONENTS`
table and fails on any module in neither it nor `BEHAVIOUR_MODULES`.

**Pass**: `talks.js` is in the table with `collection: true`, and `'talks.js'` is in the
data-module list in `tests/data/schemas.test.js`.
**Fail**: "modules … deepEqual" — the suite noticing a component nobody decided about.

---

## V9 · Adding a talk is a two-file change **[node + manual]**

**Discharges**: FR-007, SC-003, US3.

1. Add one entry to `js/data/talks.js` using the shape in [data-model.md](data-model.md).
2. Add `assets/images/talk-<id>.webp` at 1280×720.
3. `npm run test:unit && npm run test:data`
4. `git status --short`

**Pass**: exactly two files changed, both suites green, the talk on the page.
**Fail**: any edit needed to `index.html`, `js/app.js`, `css/` or a test — the feature has not
delivered the property the constitution exists to protect.

Note the deliberate trap: adding the image **without** the data entry fails
`tests/e2e/orphans.spec.js`, which requires every file under `assets/` to be referenced from a
shipped source file.

---

## V10 · The unscripted page shows no empty section **[browser]**

**Discharges**: FR-013, FR-038, SC-009.

```bash
npx playwright test tests/e2e/no-js.spec.js
```

With JavaScript disabled and no talks supplied, there must be no "Palestras" heading, no empty
region and no navigation link to one — because the section ships `hidden` rather than being
removed at runtime.

**Pass**: zero occurrences of the heading in the unscripted DOM.
**Fail**: a heading above nothing — the defect the `hidden`-until-mounted mechanism exists to
prevent, and the one it is easiest to reintroduce by removing the attribute.

---

## V11 · Section order and heading outline **[browser]**

**Discharges**: FR-010, FR-025, SC-011.

```bash
npx playwright test tests/e2e/structure.spec.js
```

`SECTION_ORDER` must place `talks` second, asserted against the served HTML so it holds while the
collection is empty. Heading outline must stay `h1` → `h2` → `h3` with no level skipped, and every
image on the page must have an `alt` and reserved dimensions.

**Pass**: order matches, outline unbroken.
**Fail**: `talks` in the wrong position, or an `<h2>` inside a card.

---

## V12 · Accessibility audit, scripted and unscripted **[browser]**

**Discharges**: FR-025 – FR-032, SC-006, SC-007, SC-011.

```bash
npx playwright test tests/e2e/accessibility.spec.js tests/e2e/keyboard.spec.js
```

Zero axe violations at 320px, 768px and 1024px, with scripts on and off. Every interactive element
in the section reachable by keyboard in visual order with a visible focus ring.

**Pass**: zero violations, zero unreachable controls.
**Fail**: most likely a contrast miss on `.talk__meta`, or a link whose accessible name is the bare
title rather than `link.label`.

---

## V13 · Responsive behaviour and the header row count **[browser]**

**Discharges**: FR-014, FR-015, FR-020 – FR-023, SC-008, SC-010, N4-3, N4-4.

```bash
npx playwright test tests/e2e/responsive.spec.js
```

At 320, 375, 768, 1024 and 1440px: no horizontal scrollbar, no clipped card content, and — with
every navigation item revealed — a header occupying no more rows than the current ten-item
maximum.

**Pass**: all widths clean.
**Fail**: the header taking a third row. Mitigation is ranked in research R3 — move the navigation
disclosure breakpoint from `48rem` to `64rem`, which is already a permitted breakpoint. Do not
reach for a new breakpoint; `tests/data/css.test.js` rejects one.

---

## V14 · Nothing new is fetched from anywhere else **[browser]**

**Discharges**: FR-036, SC-005.

```bash
npx playwright test tests/e2e/network.spec.js tests/e2e/orphans.spec.js
```

Zero requests to any host but the site's own, and no shipped file left unreferenced.

**Pass**: both green.
**Fail**: a photograph hot-linked from a social network instead of committed to `assets/` — the
exact thing `photo` being `asset`-typed is meant to make impossible.

---

## Full gate before calling the feature done

```bash
npm test
```

Expected: unit ≥ 226 + the new `talks.test.js` cases, data ≥ 142 + the new schema cases, e2e green
including V10 – V14. Anything less, with a reason, is an incomplete feature — not a passing one.

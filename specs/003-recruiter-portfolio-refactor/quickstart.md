# Quickstart: Validating the Recruiter-Focused Portfolio Refactor

**Feature**: `003-recruiter-portfolio-refactor`

Runnable scenarios that prove the feature works end to end. Contract IDs (`W3-…`, `H3-…`) refer
to [`contracts/components.md`](contracts/components.md); field definitions are in
[`data-model.md`](data-model.md).

---

## Prerequisites

```bash
cd /home/bdsoliveira/coding/portfolio
npm install
```

**One-time, requires elevated privileges** — without it the entire e2e suite fails before any
assertion runs, with `libnspr4.so: cannot open shared object file` (research R13):

```bash
sudo npx playwright install-deps chromium
npx playwright install chromium
```

Verify the fix before trusting any e2e result:

```bash
npx playwright test tests/e2e/structure.spec.js --reporter=list
```

If this still reports a browser-launch error, every other e2e result in this guide is
meaningless.

---

## Running the suites

```bash
npm run test:unit    # component contracts against tests/fixtures/
npm run test:data    # schemas, mirrors, CSS discipline, content parity
npm run test:e2e     # rendered-page behaviour in Chromium
npm test             # all three, in that order
npm run serve        # static server on http://localhost:8391 for manual checks
```

**Expected on completion**: all three green, zero failures, zero skips (FR-071, SC-008).

---

## V1 · The page reads in the recruiter's order

**Covers**: FR-001, SC-002 · **Contract**: H3-1

```bash
npm run serve
```

Open <http://localhost:8391> and scroll top to bottom. Expected order:

Hero → About → Experience → Skills → Engineering Philosophy → Education → Certifications →
Contact.

**Selected Work and Community must not appear at all** — no heading, no container, no gap
(V3 verifies this mechanically).

---

## V2 · The first screen positions the owner

**Covers**: FR-011 – FR-014, SC-001

At a 320px-wide viewport, without scrolling, confirm all of: name, role, positioning statement,
supporting description, availability, primary CTA, secondary CTA, GitHub link, LinkedIn link.

Then edit `headline` in `js/data/profile.js`, reload, and confirm it changed on the page — and
that `npm run test:data` now **fails** on the mirror assertion until `index.html` is updated to
match. That failure is the FR-010 guarantee working, not a defect.

---

## V3 · An empty collection leaves no trace

**Covers**: FR-002, FR-025, FR-038, SC-003 · **Contract**: W3-9, CM3-7, H3-2

```bash
npx playwright test tests/e2e/structure.spec.js --reporter=list
```

Then check by hand in the browser's devtools console:

```js
[...document.querySelectorAll('main > section')].map(s => s.id)
// must contain neither 'work' nor 'community'
```

---

## V4 · The same guarantee holds with scripts disabled

**Covers**: FR-003, FR-074, SC-012 · **Contract**: H3-2, N3-2

```bash
npx playwright test tests/e2e/no-js.spec.js --reporter=list
```

Manual equivalent: disable JavaScript in devtools, hard-reload, and confirm

- name, role, positioning statement, About paragraphs, location and email are all readable;
- **no section heading appears above an empty region** — this is the check the current
  implementation fails;
- no navigation link points at a section that is not visible.

---

## V5 · Populating Selected Work is a one-file edit

**Covers**: FR-026, SC-004 · **Contract**: W3-1, W3-3

Add one entry to `js/data/projects.js` with only `id`, `title`, `description`. Reload: the
Selected Work section appears, correctly rendered, with a navigation link to it. **No other file
was edited.** Add `problem`, `solution`, `architecture` and `result` to the same entry and
confirm each renders as a labelled part.

Revert the file afterwards — the collection ships empty.

Repeat with `js/data/community.js` for FR-038's equivalent.

---

## V6 · Every optional field can be individually removed

**Covers**: FR-023, FR-044, FR-045, SC-005 · **Contract**: W3-4, W3-5, CM3-3

```bash
npm run test:unit
```

This is fixture-driven and is the only way to exercise the populated path while the shipped
collections are empty (research R11). Confirm the run includes one case per individually-omitted
optional field, and that each asserts **zero empty elements** — not merely that rendering did
not throw.

---

## V7 · A zero-valued metric renders

**Covers**: FR-036 · **Contract**: CM3-5

```bash
node --test tests/unit/community.test.js
```

A fixture carrying `{ value: 0, unit: '…' }` must produce a visible `0`. If this passes while
the implementation uses `if (metric.value)`, the test is wrong, not the code.

---

## V8 · Navigation reaches every section, on every device, by keyboard alone

**Covers**: FR-004 – FR-008, SC-010 · **Contract**: N3-1, N3-3 – N3-7

```bash
npx playwright test tests/e2e/keyboard.spec.js tests/e2e/responsive.spec.js --reporter=list
```

Manually at 320px: open the navigation with `Enter` on the toggle, `Tab` through every link,
follow one, confirm it lands on its section, press `Escape` to dismiss, and confirm focus
returns to the toggle. Every step must show a visible focus ring.

Then enable "Emulate `prefers-reduced-motion: reduce`" in devtools and confirm anchor navigation
**jumps** rather than scrolls (FR-007).

---

## V9 · The closing call to action converts

**Covers**: FR-039 – FR-043, FR-041 · **Contract**: I3-2, I3-3, H3-8, H3-9

Confirm the Contact section states what the owner is open to and offers email, LinkedIn and
GitHub as distinct routes. **No CV route appears** while `profile.cvUrl` is absent — not a
disabled one, not an empty one.

Then add `cvUrl: 'https://example.com/cv.pdf'` to `js/data/profile.js`, reload, and confirm the
CV route appears. Revert.

The contact form and static contact details must be unchanged from feature 002.

---

## V10 · Accessibility, at every width, scripted and unscripted

**Covers**: FR-058 – FR-063, SC-009

```bash
npx playwright test tests/e2e/accessibility.spec.js --reporter=list
```

Zero axe violations at 320 / 768 / 1024px, and zero with JavaScript disabled.

---

## V11 · Nothing overflows, at any width, with the longest content the data can hold

**Covers**: FR-065, SC-011

```bash
npx playwright test tests/e2e/responsive.spec.js --reporter=list
```

The long-content check must inject its synthetic string into an element that exists on the
shipped page (research R10) — if it targets `.project-card__title`, it is silently passing
against an empty collection and proves nothing.

---

## V12 · A failure in one section leaves the rest intact

**Covers**: FR-046, FR-047, SC-013 · **Contract**: `app.test.js`

```bash
node --test tests/unit/app.test.js
```

A binding whose render throws must (a) log, (b) remove its section entirely, (c) leave every
other binding mounted.

---

## V13 · The site's own claims hold

**Covers**: FR-050 – FR-057, FR-068, FR-071, FR-072, SC-007, SC-014 – SC-018

```bash
npm test
git status --porcelain   # no new stylesheet, no new dependency
```

Confirm by inspection:

- `package.json` `dependencies` is still absent and `devDependencies` unchanged (SC-014);
- `ls css/` still lists exactly four files (`tests/data/css.test.js` S-4);
- the page declares `lang="pt-BR"` and all content is Portuguese (SC-018);
- the footer states the current year with no content edit (SC-017);
- the JSON-LD block parses and every field matches `js/data/profile.js` (FR-068);
- `Plataforma E-commerce` appears nowhere in the repository outside `specs/` (FR-024);
- the owner's phone number appears nowhere (FR-052);
- the 19 skills, 3 experiences, 2 education entries and 2 certifications from feature 002 are
  present and unaltered (SC-015).

---

## V14 · The social preview agrees with the page

**Covers**: FR-075, SC-016

```bash
npx playwright test tests/e2e/metadata.spec.js --reporter=list
```

Then paste the deployed URL into a link-preview debugger and confirm the rendered title,
description and image match what the page itself says.

# Quickstart & Validation Guide

**Date**: 2026-08-13 | **Feature**: `001-data-driven-migration`

How to run the portfolio locally and prove the feature works. Scenarios map to the spec's
success criteria; details of *what* is asserted live in [contracts/components.md](contracts/components.md)
and [data-model.md](data-model.md).

---

## Prerequisites

- Node.js 24+ (`node --test` is used as the runner — no test framework dependency)
- A modern browser
- Dev dependencies: `linkedom`, `@playwright/test`, `@axe-core/playwright`

```bash
npm install          # dev dependencies only — the site itself ships zero runtime deps
npx playwright install chromium
```

---

## Run locally

The site is fully static with no build step. Any static server works; a server (rather than
`file://`) is required because ES modules are loaded over HTTP.

```bash
npx serve .          # or: python3 -m http.server 8000
```

Open the printed URL. There is nothing to compile and no watch process.

---

## Validation scenarios

### V1 — Content is data-driven (SC-001, US1)

The headline claim. Should take well under five minutes.

1. Open `js/data/projects.js`, copy an entry, change its `id` and `title`.
2. Open `js/data/skills.js`, add one string to any group's `skills` array.
3. Open `js/data/certifications.js`, add an entry.
4. Reload.

**Expected**: all three appear, styled identically to their siblings.
**Also verify**: `git status` shows only files under `js/data/` modified. Any change to
`index.html`, `js/components/`, or `css/` means the architecture failed its purpose.

### V2 — Empty sections disappear and reappear (SC-014, US1.6)

1. Confirm Experience and Education render nothing on a fresh checkout — no heading, no gap.
2. Inspect the DOM: their section containers are absent, not merely empty.
3. Add one entry to `js/data/experiences.js`. Reload.

**Expected**: the Experience section appears, correctly themed, with zero code changes.

### V3 — Optional and required fields (US1.4, US1.5)

1. Delete `liveUrl` from a project. Reload → that link is gone; no empty icon, no dead link.
2. Reduce a project's `technologies` to one item → exactly one chip renders.
3. Delete a required field, e.g. `title`. Reload → console error naming the entity, field, and
   `id`; **the rest of the page still renders** (contract A-1).
4. Restore the file.

### V4 — Content preserved (SC-002, US2)

Compare against the pre-migration page (`git show HEAD~1:index.html` once the migration is
committed). Every section, visible string, link destination, and skill tag must still exist.
The *appearance* is expected to differ — that is the intended re-theme.

### V5 — Theme applied everywhere (SC-003, US2.3)

At 320px, 768px, and 1024px, every section uses the navy/purple palette. No section may appear
unstyled — the reference stylesheets never covered the skills grid, certifications, or contact
form, so those are the ones to inspect closely.

### V6 — Keyboard traversal (SC-004, US3.1)

Tab from the top of the page to the bottom without touching the mouse.

**Expected**: every link, button, and form field receives focus in visual order; the focus
indicator is unmistakable on every one; focus never traps; nothing is skipped. Project card
links must be reachable — the old hover tooltips were mouse-only.

### V7 — Accessibility audit (SC-005)

```bash
npx playwright test tests/e2e/accessibility.spec.js
```

**Expected**: zero axe-core violations at WCAG 2.1 AA. Contrast is the likely failure point —
see R6, and note that pink text on a purple surface is 2.7:1 and prohibited.

### V8 — No third-party requests (SC-006, US4.2)

Load the page with DevTools → Network. **Expected**: every request is same-origin. Neither
`cdn.tailwindcss.com` nor `fonts.googleapis.com` may appear.

Offline check: load the page with the network disabled after first load — it must render fully
and correctly styled.

### V9 — Performance and layout stability (SC-007, SC-008)

Lighthouse (mobile preset, throttled) on the deployed URL.

**Expected**: meaningful content under 2s; CLS effectively zero. Images must reserve space via
explicit `width`/`height`.

### V10 — Progressive enhancement (SC-013, US4.5)

Disable JavaScript entirely and reload.

**Expected**: owner name, professional role, hero summary, and social links are all still
visible. Data-driven sections are absent — acceptable. A blank page is not.

Also: `curl -s <url> | grep -i "<owner name>"` must match, proving the name is in the served
document rather than injected at runtime.

### V11 — No horizontal scroll (SC-010)

At 320px, 768px, and 1024px, and with an artificially long project title, confirm
`document.documentElement.scrollWidth <= clientWidth`.

### V12 — Dead code removed (SC-011)

```bash
npx playwright test tests/e2e/orphans.spec.js
```

**Expected**: zero files in the repo are unreferenced by the published page. Specifically gone:
`css/style.css`, `css/project-component-style.css`, `js/Project.js`, `js/projectCard.js`,
`js/createProjectComponentYourSelfLikeMagic.js`, and `img/`.

### V13 — Tests are content-independent (SC-012, FR-046)

1. Run the full suite — green.
2. Change several content values across `js/data/`.
3. Re-run.

**Expected**: still green. A test that fails because a *value* changed is coupled to content and
must be rewritten against the contract instead.

---

## Test commands

```bash
node --test tests/unit/            # component render contracts
node --test tests/data/            # data integrity + schema validation
npx playwright test                # a11y, keyboard, responsive, no-external-requests
node --test && npx playwright test # everything
```

---

## Pre-merge gate

Per the constitution's Development Workflow section, all must hold:

- [ ] V1 passes — content changes touched only `js/data/`
- [ ] Tier-1 tests green
- [ ] V7 — zero AA violations
- [ ] V6 — full keyboard traversal, visible focus throughout
- [ ] V5 — correct at 320/768/1024
- [ ] V8 — zero external requests
- [ ] V10 — critical content present with JS disabled
- [ ] No new runtime dependency

---

## Deploy

Push to the connected branch; Vercel serves the repository root statically. No build command.
`vercel.json` sets immutable caching for `assets/**` and revalidating caching for `index.html`
(R10).

Post-deploy: run V8 and V9 against the live URL, and confirm the link preview renders (SC-009 —
requires the OG image and canonical URL noted in the spec's Dependencies).

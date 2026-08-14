# Quickstart & Validation: CV Content Update

**Date**: 2026-08-13 | **Feature**: `002-cv-content-update`

How to run the site and prove this feature is done. Implementation detail belongs in `tasks.md`;
this is the runbook.

## Prerequisites

```bash
node --version            # ≥ 20
npm ci                    # dev-only deps; the site itself ships zero dependencies
npx playwright install    # first run only
```

## Run

```bash
npm run serve             # static server on http://localhost:4173
npm test                  # unit → data → e2e, in that order
```

Individual suites, useful while iterating:

```bash
npm run test:unit         # node:test, tests/unit/
npm run test:data         # node:test, tests/data/  ← schema + parity + sync live here
npm run test:e2e          # Playwright, tests/e2e/
```

## Regenerating the Open Graph card

Run once, after editing `assets/images/og-card.svg` (research R9). Not a test; not committed as
one.

```bash
node -e "
import('@playwright/test').then(async ({ chromium }) => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto('file://' + process.cwd() + '/assets/images/og-card.svg');
  await page.screenshot({ path: 'assets/images/og-card.png' });
  await browser.close();
});
"
```

Then confirm the output is 1200×630 and has not grown (Principle VII):

```bash
file assets/images/og-card.png
ls -l assets/images/og-card.png
```

---

## Validation scenarios

Each maps to spec requirements. V1–V6 are automated; V7–V14 need eyes or a browser.

### V1 · Schemas accept the new data — `npm run test:data`

All six data modules validate. Specifically: two education entries validate with no years; three
experience entries validate with `location`; the CWI entry validates with a `startDate` in the
future and `endDate: null`.
→ FR-006, FR-017, FR-011a · data-model "Validation note"

### V2 · Parity — the page states exactly what the CV states

`tests/data/parity.test.js` passes against
[content-inventory.md](./content-inventory.md): every identity string, all 19 skill chips (exact
count and set), all three employers with titles/locations/periods, every achievement bullet, both
education entries, both certifications, both social URLs, and the email and location.
→ FR-013, FR-026, SC-001, SC-002

### V3 · The phone number is nowhere

Assert mechanically, not by memory:

```bash
grep -rn "99806\|9980-6\|99806-3078" index.html js/ css/ assets/ ; echo "exit=$? (1 means clean)"
```

Expected: no matches, `exit=1`. The parity suite asserts the same thing against the rendered page.
→ FR-023, SC-012

### V4 · HTML ↔ `profile.js` sync — `npm run test:data`

`sync.test.js` passes for all five mirrored fields (`name`, `role`, `summary`, `location`,
`email`), and the email anchor's `href` is `mailto:` + the address.
→ FR-005, contract H2-3, T2-2

### V5 · Component contracts — `npm run test:unit`

Experience renders `[data-location]` when present and omits it when absent; education renders all
four date cases from contract D2-2, including "neither year → no date element".
→ Contracts E2-1, E2-2, D2-2

### V6 · Nothing unrelated broke — `npm test`

Every suite passes. `css.test.js`, `icons.test.js`, `independence.test.js`, and every e2e spec
except `metadata.spec.js` pass **with no edit**. If one needed editing, stop and find out why
before continuing.
→ FR-029, SC-011

### V7 · The two empty sections now appear

Load `/`. `#experience` and `#education` are present, populated, and were not removed by
`app.js`. Confirm `js/app.js` is unmodified in the diff — these sections must appear as a pure
data consequence.
→ FR-012, FR-019, SC-005

### V8 · Reverse-chronological order, with the current role first

`#experience` reads: CWI Software (set 2026 – Atual) → DevSquad (nov 2025 – jul 2026) → CajuTec
(out 2022 – set 2025). Each shows employer, title, location, period, and its bullets.
→ FR-006 to FR-011

### V9 · Education states in-progress correctly, and invents no dates

The MBA reads `Em andamento`. The IFPI entry shows **no date line at all** — not "Em andamento",
not a blank range, not a stray dash. This is the single easiest thing to get wrong in this
feature.
→ FR-017, FR-018, contract D2-2

### V10 · Skills match the CV

Six groups, 19 chips. Spot-check that NestJS, Next.js, React, RabbitMQ, Redis, Oracle Database
and GitLab CI/CD are present, and that Flutter, BLOC, NuxtJS, Vuetify, MongoDB and the whole
Mobile group are gone.
→ FR-013 to FR-016, SC-004

### V11 · Metadata and the social preview agree

View source: `<title>`, `meta[name=description]`, `og:title`, `og:description`, `og:image:alt`,
`twitter:title`, `twitter:description` all say "Software Engineer". Open
`assets/images/og-card.png` and confirm the rendered image does too.
→ FR-001, SC-007, research R9

### V12 · Scripts off

Disable JavaScript, reload. Name, role, summary, location and email are all still visible and
correct. `#experience` and `#education` are absent rather than broken — an empty heading with a
gap under it is a failure.
→ FR-005, SC-008, Principle IV

### V13 · Responsive, with the real content in place

At 360px, 768px and 1280px: no horizontal scrolling, nothing clipped. Two specific risks the old
placeholder content never exercised:

- the longest achievement bullet (CWI #2, ~180 characters) must wrap inside its card;
- the `Arquitetura e Integração` group has 5 chips against `Práticas`' 2 — the card grid must not
  go ragged or leave a hole.

→ SC-009, Principle VI

### V14 · Accessibility — `npm run test:e2e`

The axe audit passes against the longer content. Check by hand that the email link is
keyboard-reachable with a visible focus ring, and that its accessible name is the address rather
than "click here".
→ Principle V, Principle VIII

---

## Done when

- [ ] `npm test` is green.
- [ ] V3's grep returns nothing.
- [ ] V7–V14 confirmed in a browser at all three widths.
- [ ] `js/app.js` and `js/components/{hero,skills,projects,certifications,helpers}.js` are
      untouched in the diff.
- [ ] `js/data/projects.js` and `js/data/certifications.js` are untouched in the diff
      (FR-024, FR-025).
- [ ] No new file under `css/`, `js/`, or `assets/`; no new dependency in `package.json`.

## Known follow-ups, deliberately not done here

- Navigation still omits Experiência and Formação, the two sections this feature makes appear
  (research R10 — spec Out of Scope).
- The footer still reads `© 2024`.
- Both education entries carry no years; supplying them is a pure data edit now that the schema
  accepts them.
- The Projects section still shows the invented `Plataforma E-commerce` placeholder (spec
  exception E-1, owner's decision). Removing it is a one-line data edit; the section disappears
  on its own when the array empties.

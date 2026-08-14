# Component Contracts: CV Content Update

**Date**: 2026-08-13 | **Feature**: `002-cv-content-update`

A **delta** against [feature 001's contracts](../../001-data-driven-migration/contracts/components.md),
which stays in force. Only three modules change, and each change is additive: existing data that
satisfies the old contract still satisfies the new one.

Contract ids continue feature 001's numbering with a `2-` prefix to keep them distinguishable.

---

## E — `js/components/experience.js`

### E2-1 · An entry with `location` renders it as its own line

**Given** an entry carrying a non-empty `location` string,
**when** `renderExperience` runs,
**then** the card contains exactly one element carrying `data-location`, whose text is the
`location` value verbatim.

The line sits between the title heading and the date range — location and period are the two
scanning facts, and they belong together above the prose.

### E2-2 · An entry without `location` renders no location element

**Given** an entry with `location` absent, `null`, or empty,
**when** `renderExperience` runs,
**then** the card contains no `[data-location]` element at all — not an empty one.

This is feature 001's C-4 ("optional fields are omitted, never rendered empty") applied to the new
field. It is what keeps `location` genuinely optional rather than de-facto required.

### E2-3 · `location` is not required

`REQUIRED` stays `['id', 'company', 'title', 'startDate']`. Adding `location` to it would break
every existing fixture and make the field mandatory by accident.

### E2-4 · A future `startDate` renders as a normal current role

**Given** an entry whose `startDate` is later than today and whose `endDate` is `null`,
**when** `renderExperience` runs,
**then** it renders with no error, its date range reads *start* – `Atual`, and its position is
whatever the array says.

No code change implements this — it already holds. The contract exists so a later "helpful"
future-date guard, of the kind `renderHero` has for `experienceStartYear`, cannot be added
without a test failing. (FR-011a, research R8.)

### Unchanged

C-1 through C-9 from feature 001 stand: empty collection → `null`; missing required field →
`Error` naming entity, field and id; `endDate: null` → `Atual`; text via `textContent`.

---

## D — `js/components/education.js`

### D2-1 · `startYear` and `endYear` are optional

`REQUIRED` becomes `['id', 'institution', 'qualification']` — `startYear` is removed.

### D2-2 · The date line is conditional, with four cases

`endYear` is three-state (absent ≠ `null` ≠ integer), which crosses with `startYear`'s two states:

| `startYear` | `endYear` | Renders |
|-------------|-----------|---------|
| `2020` | `2022` | `2020 – 2022` |
| `2020` | `null` | `2020 – Em andamento` |
| absent | `null` | `Em andamento` |
| absent | absent | **no date element at all** |
| `2020` | absent | `Desde 2020` |

**Given** an entry with neither year,
**when** `renderEducation` runs,
**then** the card contains no `[data-dates]` element — not an empty one, and not a stray
separator.

The fourth row is the one that matters: the IFPI entry is complete but undated, and rendering it
as `Em andamento` would state something false about the owner. Collapsing "unknown" into `null`
is precisely the bug this table exists to prevent.

### D2-3 · Institution and qualification stay required

Both remain in `REQUIRED`. An entry without them is meaningless and must still throw an `Error`
naming the field and the entry id (feature 001 C-6).

---

## H — `index.html`

### H2-1 · Contact details are static, not rendered

**Given** JavaScript is disabled or fails,
**when** the page loads,
**then** the owner's location and email are both present in the served HTML.

They are authored directly in `index.html` inside `#contact`, above the form. No component and no
`app.js` binding renders them. (Principle IV, research R3.)

### H2-2 · The email is a `mailto:` anchor whose text is the address

**Then** the anchor's `href` is `mailto:` + the address, and its visible text is the address
itself.

This satisfies the accessible-name requirement (Principle V) and the "never 'click here'"
requirement (Principle VIII) with the same string, and gives `sync.test.js` something exact to
compare.

### H2-3 · Contact details carry `data-profile` anchors

The location element carries `data-profile="location"`; the email anchor carries
`data-profile="email"`. This is the hook `sync.test.js` already uses for `name`, `role` and
`summary`, extended to two more fields.

### H2-4 · The new block adds no heading

`#contact` must still contain exactly one `<h2>` and no other `h1`/`h2`
(`tests/e2e/structure.spec.js`). The contact details are a list, not a subsection.

### H2-5 · No `[data-mount]` container is added

`sync.test.js` asserts every `[data-mount]` element is empty in the served HTML. The contact
details are deliberately *not* a mount point, so no new container appears.

---

## S — `tests/schemas/index.js`

### S2-1 · `Experience.location`

```text
location: { type: 'string', required: false }
```

### S2-2 · `Education.startYear`, `Education.endYear`

```text
startYear: { type: 'integer', required: false }
endYear:   { type: 'integer', required: false, nullable: true }
```

The existing `validateCollection` ordering check already guards
`Number.isInteger(startYear) && Number.isInteger(endYear)`, so it silently skips entries where
either is absent. No change to the validator body.

### S2-3 · No phone field

No field is added to any schema for a phone number, and none may be (FR-023).

---

## T — Test-suite contracts

### T2-1 · `tests/data/parity.test.js` — same file, new reference

The suite keeps its filename, keeping its exemption in `tests/data/independence.test.js`
untouched. Its reference document changes from feature 001's inventory to
[content-inventory.md](../content-inventory.md), and its docblock says so.

**Asserts**: every identity string, all 19 skill chips, all 3 employers with their titles,
locations and periods, all 3 roles' bullets, both education entries, both certifications, all
section headings and nav labels, both social URLs, and the contact email and location.

**Must also assert** the negative: the digit run `99806` appears nowhere in the rendered page
(FR-023).

**Skill-chip count** stays an exact assertion — `chips.length === 19` and a sorted `deepEqual` —
because that is what catches a skill silently dropped during regrouping.

**Whitelisted exception**: the `Plataforma E-commerce` project strings are asserted present while
being knowingly *not* CV-traceable. This must carry an inline comment pointing at spec exception
E-1, or a future reader will delete it as a mistake.

**Kept verbatim**: the `deliberate removals` block (no Tailwind CDN, no Google Fonts, no inline
`getFullYear`, no emoji icons, no Tailwind utility classes). Those are regression guards, not
content parity, and this feature does not touch them.

### T2-2 · `tests/data/sync.test.js` — two more mirrored fields

Extend the `['name', 'role', 'summary']` loop to `['name', 'role', 'summary', 'location',
'email']`, and assert the email anchor's `href` is `mailto:` + `profile.email`.

### T2-3 · `tests/e2e/metadata.spec.js` — content-independent title assertion

Replace `expect(title).toMatch(/Desenvolvedor|Developer/)` with an assertion against
`profile.role` imported from `js/data/profile.js`, matching the pattern `no-js.spec.js` already
uses. The literal `Desenvolvedor` must not survive anywhere in `tests/e2e/`.

### T2-4 · `tests/fixtures/index.js` — cover the new field states

Fixtures gain: an experience entry with `location` and one without; an education entry for each of
the four date cases in D2-2; and an experience entry with a future `startDate` and
`endDate: null` for E2-4.

Fixtures stay fictional. `independence.test.js` asserts fixture values never equal real portfolio
content, and the real content is about to change — so any fixture string that happens to collide
with a new CV string (`Software Engineer` is the obvious risk) must be renamed.

### T2-5 · Every other suite passes untouched

`css.test.js`, `icons.test.js`, `independence.test.js`, all `tests/unit/*` except experience and
education, and every `tests/e2e/*` except `metadata.spec.js` must pass with **no edit**. If any
of them needs one, the change has drifted outside content and the cause must be understood before
proceeding (SC-011, FR-029).

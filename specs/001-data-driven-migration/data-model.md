# Phase 1 Data Model: Data-Driven Structure Migration

**Date**: 2026-08-13 | **Feature**: `001-data-driven-migration`

Every entity below lives in exactly one file under `js/data/`. Those files export plain data and
nothing else — no imports of DOM code, no function calls, no side effects (constitution:
`js/data/` rules; FR-003).

**Conventions used throughout**

- `required` — render throws if absent (R8); data-integrity tests fail (FR-045).
- `optional` — element omitted entirely when absent; never rendered empty (FR-006).
- `url` — must parse as an absolute `https:` URL. Plain `http:` is rejected: the site is served
  over HTTPS and mixed content would be blocked. (The replaced code fetched
  `http://18.231.162.74:3000/projects`, which is exactly this failure.)
- `asset` — repo-relative path under `assets/`; the file must exist (FR-045).
- `id` — kebab-case, unique within its collection, stable across edits. Used as the DOM `id` and
  as the test fixture key.

---

## Profile

**File**: `js/data/profile.js` — single object export, not a collection.

| Field | Type | Req. | Notes |
|-------|------|------|-------|
| `name` | string | required | Must match the static name in `index.html` (R2 sync check) |
| `role` | string | required | Professional title; must match `index.html` |
| `summary` | string | required | Hero paragraph; must match `index.html` |
| `experienceStartYear` | integer | required | 4-digit; `<=` current year. Years-of-experience is derived, never stored (FR-017) |
| `location` | string | optional | |
| `image` | asset | optional | Profile photo. Omitted → placeholder block, layout height reserved (FR-037) |
| `imageAlt` | string | conditional | Required when `image` is present (FR-029) |
| `email` | string | optional | Valid address format |
| `socialLinks` | SocialLink[] | required | At least one entry |

**Derived, not stored**: `yearsOfExperience = currentYear - experienceStartYear`, computed at
render (FR-017). The value `2022` is the current start year, matching the inline script being
replaced.

**Consumers**: hero section, contact section, footer, page metadata (FR-039–FR-042).

### SocialLink (embedded in Profile)

| Field | Type | Req. | Notes |
|-------|------|------|-------|
| `platform` | string | required | Display name, e.g. `GitHub` |
| `url` | url | required | |
| `icon` | string | required | Sprite symbol id, e.g. `icon-github`; must exist in the sprite |
| `label` | string | required | Accessible name, e.g. "Bruno Oliveira no GitHub" — satisfies FR-043; never "click here" |

**Known defect being fixed**: the footer's LinkedIn entry currently renders the GitHub glyph.
Each entry's `icon` must resolve to its own platform's symbol, and a test asserts distinct
symbols across entries.

---

## Project

**File**: `js/data/projects.js` — array export.

| Field | Type | Req. | Notes |
|-------|------|------|-------|
| `id` | id | required | |
| `title` | string | required | |
| `description` | string | required | |
| `technologies` | string[] | required | **Variable length, min 1.** No fixed count (FR-005) |
| `repositoryUrl` | url | optional | Link omitted when absent (edge case: "no source address") |
| `liveUrl` | url | optional | Link omitted when absent |
| `image` | asset | optional | Card preview; space reserved to prevent shift (FR-037) |
| `imageAlt` | string | conditional | Required when `image` is present |
| `isVisible` | boolean | required | `false` → excluded from render; siblings reflow with no gap |

**Replaces**: the `Project` class in `js/Project.js`, which hardcoded exactly five skill slots
(`skillUsed1`…`skillUsed5`) and rendered all five regardless of how many were populated. The
`technologies` array removes that defect at the data-model level, satisfying FR-005 and the
"fewer technology tags" edge case.

**Ordering**: array order is display order. No sort key — reordering is a data edit.

**⚠ Content dependency**: ships with the owner's real projects, not the current placeholder
(spec Dependencies). Components are built and verified against fixture data meanwhile.

---

## Skill Group

**File**: `js/data/skills.js` — array export.

| Field | Type | Req. | Notes |
|-------|------|------|-------|
| `id` | id | required | |
| `name` | string | required | Group heading, e.g. `Frontend` |
| `skills` | string[] | required | Variable length, min 1 |

**Migrated content** (preserved verbatim per FR-014):

| Group | Skills |
|-------|--------|
| Frontend | VueJS, NuxtJS, Tailwind, JavaScript, Vite, Vuetify |
| Backend | PHP, Laravel, Node.js |
| Bancos de Dados | SQL, MySQL, MongoDB, Indexação de Dados, Análise de Dados |
| Ferramentas | Docker, Git, GitHub Actions, Postman, Insomnia |
| Mobile | Flutter, BLOC |

Note: "Tailwind" remains a listed *skill* — that is a statement about the owner's competence and
is unaffected by removing the Tailwind CDN from the page itself.

---

## Certification

**File**: `js/data/certifications.js` — array export.

| Field | Type | Req. | Notes |
|-------|------|------|-------|
| `id` | id | required | |
| `title` | string | required | |
| `issuer` | string | optional | |
| `detail` | string | optional | Award, score, or date line |
| `icon` | string | required | Sprite symbol id |
| `verificationUrl` | url | optional | Link omitted when absent |

**Migrated content**: "II Maratona de Programação da PUC-GOIÁS" (Medalha de Prata – 2017); "EF
SET English Certificate" (Score 49/100, B1 Intermediate).

**Change from current markup**: the emoji glyphs (🏆, 📘) used as icons become sprite symbols, so
they carry proper text alternatives instead of being announced as raw emoji (FR-029).

---

## Experience

**File**: `js/data/experiences.js` — array export, **ships empty (`[]`)**.

| Field | Type | Req. | Notes |
|-------|------|------|-------|
| `id` | id | required | |
| `company` | string | required | |
| `title` | string | required | |
| `startDate` | string | required | `YYYY-MM` |
| `endDate` | string \| null | required | `YYYY-MM`, or `null` meaning ongoing |
| `summary` | string | optional | |
| `achievements` | string[] | optional | Omitted entirely when absent or empty |

**Validation**: `endDate` must not precede `startDate`. `null` renders as "Atual".

Empty on arrival → the Experience section renders nothing (R8). Adding the first entry makes the
section appear with no code change (SC-014).

---

## Education

**File**: `js/data/education.js` — array export, **ships empty (`[]`)**.

| Field | Type | Req. | Notes |
|-------|------|------|-------|
| `id` | id | required | |
| `institution` | string | required | |
| `qualification` | string | required | |
| `field` | string | optional | |
| `startYear` | integer | required | |
| `endYear` | integer \| null | required | `null` meaning in progress |

Same empty-collection behaviour as Experience.

---

## Relationships

```text
Profile (1)
  └── socialLinks (1..n) ── SocialLink

Independent top-level collections (no cross-references):
  Project (0..n)          ← owner-supplied content
  SkillGroup (1..n)       ← migrated verbatim
  Certification (0..n)    ← migrated verbatim
  Experience (0..n)       ← ships empty
  Education (0..n)        ← ships empty
```

Collections are deliberately independent — no entity references another by id. This is what lets
each component be rendered and tested in isolation (FR-010) and keeps a content edit in one file
from breaking tests for another section (FR-046, SC-012).

---

## Validation rules summary

Enforced by `tests/schemas/` (R9), run as data-integrity tests (FR-045):

1. Every `required` field present and of the declared type.
2. Every `id` unique within its collection and kebab-case.
3. Every `url` an absolute `https:` URL that parses.
4. Every `asset` path resolves to a file that exists in the repo.
5. Every `icon` resolves to a symbol present in the inlined sprite.
6. `imageAlt` present whenever `image` is (conditional requirement).
7. `technologies` and `skills` arrays non-empty.
8. `experienceStartYear` ≤ current year; `endDate` ≥ `startDate`.
9. `profile.name` / `role` / `summary` match the static strings in `index.html` (R2).
10. `socialLinks` icons are distinct per platform (guards the LinkedIn/GitHub defect).

---

## State transitions

The portfolio holds no runtime state — no session, no persistence, no mutation after render.
The only state-like behaviour is content visibility:

```text
Project.isVisible: true  → rendered
Project.isVisible: false → excluded; siblings reflow, no gap left behind

Collection length 0 → section container removed from the document
Collection length ≥1 → section rendered
```

Both transitions occur once, at page load. There is no interactive state change, which is why no
state-management approach appears in this plan (constitution Principle IX).

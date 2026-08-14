# Phase 1 Data Model: Recruiter-Focused Portfolio Refactor

**Feature**: `003-recruiter-portfolio-refactor` | **Date**: 2026-08-14

Entities live in `js/data/*.js` as plain ES module exports — data only, no DOM access, no
side effects (constitution I, and the `js/data/` rule in Technology & Structure Constraints).
Their schemas live in `tests/schemas/index.js` and are exercised by
`tests/data/schemas.test.js`; no validator is shipped to a visitor.

Types below are the vocabulary already implemented in `tests/schemas/index.js`: `string`,
`integer`, `boolean`, `string[]`, `id` (kebab-case), `url` (absolute, `https:` only), `asset`
(repo-relative path under `assets/`), `email`, `year-month` (`YYYY-MM`), `object[]` with `of`.

Two type additions are needed:

- **`number`** — a metric value may be a non-integer (`4.5` events per month). Distinct from
  `integer` and required by `Metric.value`.
- **`object`** (singular, with `of`) — for `Profile.primaryCta` / `secondaryCta`, which are one
  object rather than an array. Today `object[]` is the only composite type.

---

## 1. Profile *(extended)*

`js/data/profile.js` — one object, the single origin of identity and positioning (FR-009).

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | `string` | ✅ | unchanged |
| `role` | `string` | ✅ | unchanged |
| `headline` | `string` | ✅ | **new.** Positioning statement (FR-011, FR-012). States value, not a job title. A generic self-description is a defect, not a schema failure — covered by review, not by a regex. |
| `summary` | `string` | ✅ | unchanged. The Hero's supporting description. |
| `about` | `string[]` | ✅ | **new.** One entry per paragraph. Two paragraphs, readable in <30s (FR-015, FR-016). |
| `availability` | `string` | ⬜ | **new.** e.g. "Aberto a oportunidades remotas". Absent → nothing renders in its place (FR-013). |
| `experienceStartYear` | `integer` | ✅ | unchanged, `maxCurrentYear` |
| `location` | `string` | ⬜ | unchanged |
| `email` | `email` | ⬜ | unchanged |
| `cvUrl` | `url` | ⬜ | **new.** Ships **absent** (spec Dependencies). Absent → no CV route, no CV-based secondary CTA (FR-041, FR-007 assumption). |
| `image` / `imageAlt` | `asset` / `string` | ⬜ | unchanged. `imageAlt` `requiredWith: image`. |
| `primaryCta` | `object` of `Cta` | ✅ | **new.** Route to contact. |
| `secondaryCta` | `object` of `Cta` | ✅ | **new.** CV when `cvUrl` exists, GitHub profile otherwise. |
| `socialLinks` | `object[]` of `SocialLink` | ✅ | unchanged |

**Mirroring rule (FR-010, R7).** `name`, `role`, `headline`, `summary`, `about`, `availability`,
`location`, `email`, both CTAs and every social link are authored *statically* in `index.html`
so they survive a script failure (FR-018), and `tests/data/sync.test.js` asserts each mirror
matches `profile.js` exactly. A value may be mirrored; it may never be independently authored.

### 1a. Cta *(new, belongs to Profile)*

| Field | Type | Required | Notes |
|---|---|---|---|
| `label` | `string` | ✅ | visible text and accessible name |
| `href` | `string` | ✅ | in-page anchor (`#contact`), `mailto:`, or absolute `https:` URL. Not `url`-typed: `#contact` is valid and is the primary CTA's value. |

A CTA whose `href` resolves to an absent profile value (e.g. the CV) is omitted entirely
(FR-014), via `data-profile-optional` + `pruneOptionalIdentity` (research R8).

### 1b. SocialLink *(unchanged)*

`platform`, `url`, `icon`, `label` — all required.

---

## 2. WorkEntry *(extended; module stays `js/data/projects.js`)*

Presented as **Selected Work** (FR-019). Module and component filenames are unchanged — see
research R6. **Ships as an empty array** (FR-025); the placeholder `plataforma-e-commerce` entry
is deleted (FR-024).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `id` | ✅ | kebab-case, unique |
| `title` | `string` | ✅ | FR-021 — one of only two required fields |
| `description` | `string` | ✅ | FR-021 |
| `tagline` | `string` | ⬜ | **new** |
| `problem` | `string` | ⬜ | **new.** Case-study part (FR-022) |
| `solution` | `string` | ⬜ | **new.** Case-study part |
| `contribution` | `string` | ⬜ | **new.** The owner's role on the work. Named `contribution`, not `role`, so it can never be confused with `Profile.role`. |
| `architecture` | `string` | ⬜ | **new.** Case-study part |
| `result` | `string` | ⬜ | **new.** Impact/results. Case-study part |
| `technologies` | `string[]` | ⬜ | **was required, now optional** (FR-021) |
| `repositoryUrl` | `url` | ⬜ | unchanged |
| `liveUrl` | `url` | ⬜ | unchanged |
| `caseStudyUrl` | `url` | ⬜ | **new** |
| `image` | `asset` | ⬜ | unchanged |
| `imageAlt` | `string` | ⬜ | `requiredWith: image` |
| `isVisible` | `boolean` | ⬜ | **was required, now optional**, defaulting to visible — the renderer already treats only an explicit `false` as hidden, and FR-021 permits only `title`/`description` to be required. |

**Rules**

1. Absent optional field → **no element, no label, no separator** (FR-023). Enforced structurally
   by returning `null` from the part builder, not by emitting an empty node.
2. `problem`, `solution`, `contribution`, `architecture`, `result` render as labelled parts of a
   `<dl>` (research R3).
3. Display order is array order; no sort at render time (FR-048).
4. `imageAlt` is required when `image` is present, and images reserve their box and defer loading
   (FR-027).

---

## 3. Principle *(new)*

`js/data/philosophy.js` — the Engineering Philosophy section ("Como Trabalho"). **Ships with real
content** (FR-031), authored only from practices the experience data already evidences
(research R14).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `id` | ✅ | kebab-case, unique |
| `title` | `string` | ✅ | FR-029 |
| `detail` | `string` | ⬜ | FR-029. Absent → the item is a title alone, with **no empty body element** (FR-030's structural half; concreteness is a review gate, not a schema rule). |

---

## 4. CommunityActivity *(new)*

`js/data/community.js`. **Ships as an empty array** (FR-038).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `id` | ✅ | kebab-case, unique |
| `organisation` | `string` | ✅ | FR-034 |
| `contribution` | `string` | ✅ | the owner's role. Named as in WorkEntry, for the same reason. |
| `period` | `string` | ⬜ | free text (e.g. "2023 – atual"). **Not** `year-month`: community involvement is often stated in years or as ongoing, and forcing a month would compel an invented date (FR-037). |
| `description` | `string` | ⬜ | |
| `links` | `object[]` of `Link` | ⬜ | |
| `metrics` | `object[]` of `Metric` | ⬜ | |

### 4a. Link *(new, shared)*

| Field | Type | Required | Notes |
|---|---|---|---|
| `label` | `string` | ✅ | must identify the destination unaided (FR-059, FR-034 scenario 4) |
| `url` | `url` | ✅ | absolute `https:` |

### 4b. Metric *(new, belongs to CommunityActivity)*

| Field | Type | Required | Notes |
|---|---|---|---|
| `value` | `number` | ✅ | **`0` is a real value and must render** (FR-036). Every presence check on a metric value must test `value === undefined`, never truthiness. |
| `unit` | `string` | ✅ | what is counted, e.g. "membros", "eventos organizados". FR-035 requires both halves. |

**FR-037 is a governance rule, not a schema rule**: no metric may be estimated, rounded,
extrapolated or invented. The schema cannot detect a fabricated number; the empty shipped
collection is what enforces it today.

---

## 5. Carried forward unchanged

`Experience`, `SkillGroup`, `Education`, `Certification` and their content are untouched
(FR-051, SC-015). Only their **position** in the page order (FR-001) and their visual treatment
change. Their schemas are unmodified.

---

## Collection summary

| Module | Entity | Ships | Section appears? |
|---|---|---|---|
| `js/data/profile.js` | Profile | populated | Hero + About + Contact, always (static) |
| `js/data/experiences.js` | Experience | 3 entries | yes |
| `js/data/projects.js` | WorkEntry | **empty** | **no** (FR-025, SC-003) |
| `js/data/skills.js` | SkillGroup | 6 groups / 19 skills | yes |
| `js/data/philosophy.js` | Principle | populated (new content) | yes |
| `js/data/community.js` | CommunityActivity | **empty** | **no** (FR-038, SC-003) |
| `js/data/education.js` | Education | 2 entries | yes |
| `js/data/certifications.js` | Certification | 2 entries | yes |

---

## Cross-cutting validation rules

Applied by `tests/data/schemas.test.js` to every collection:

1. Every entity validates against its schema; unknown extra fields are permitted (forward
   compatibility) but every declared field must type-check.
2. `id` is unique within a collection.
3. A `requiredWith` field must be present when its companion is.
4. `asset` paths must resolve to a file in the repository.
5. `url` must be absolute and `https:`.
6. **An empty array is valid for every collection** — this is the shipped state for two of them
   and must not be treated as a data error (FR-049).
7. Rendering must be correct for zero, one, and many entries (FR-049).

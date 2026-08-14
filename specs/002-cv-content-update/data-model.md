# Phase 1 Data Model: CV Content Update

**Date**: 2026-08-13 | **Feature**: `002-cv-content-update`

This is a **delta** against [feature 001's data model](../001-data-driven-migration/data-model.md),
which remains the base document. Entities not listed here are unchanged in both shape and
content: `Project` (untouched per FR-025/E-1), `Certification` (untouched per FR-024),
`SkillGroup` (shape unchanged; content replaced), `SocialLink` (unchanged).

Field types, the `required`/`optional`/`nullable` vocabulary, and the validation machinery are
all inherited from feature 001 and from `tests/schemas/index.js`.

---

## Profile — fields activated, none added

**File**: `js/data/profile.js`. No schema change: `location` and `email` are already declared
optional and simply have no value today.

| Field | Change | New value |
|-------|--------|-----------|
| `role` | value | `Software Engineer` (was `Desenvolvedor Fullstack`) |
| `summary` | value | `Especializado em PHP/Laravel, APIs REST e sistemas distribuídos, com foco em arquitetura de software e IA aplicada.` |
| `location` | **now populated** | `Parnaíba, PI – Brasil` |
| `email` | **now populated** | `bds.commus@gmail.com` |
| `name` | unchanged | `Bruno Oliveira` |
| `experienceStartYear` | unchanged | `2022` — the CajuTec start; derived years reads `4` in 2026 (FR-004) |
| `socialLinks` | unchanged | GitHub + LinkedIn, both already matching the CV |

**Newly mirrored into `index.html`**: `role`, `summary`, `location`, `email`. The first two
already have `[data-profile]` anchors; the latter two need them. All four are covered by
`tests/data/sync.test.js` after this change (see contracts).

**Forbidden field**: the CV's phone number MUST NOT be added to this entity, under any name, per
FR-023. There is no schema slot for it and none is to be created.

---

## Experience — one field added, collection populated

**File**: `js/data/experiences.js`. Ships `[]` today; becomes three entries.

### Schema change

| Field | Type | Req. | Notes |
|-------|------|------|-------|
| `location` | string | **optional (new)** | Work-location context: city, region/country, and remote/on-site. Rendered as its own line; omitted entirely when absent (FR-008, research R2). |

All other `Experience` fields keep their feature-001 definitions. `startDate` deliberately gains
**no** future-date restriction — see the validation note below.

### Content

Array order is display order, authored newest-first (FR-010). No sort runs at render time.

| # | `id` | `company` | `title` | `location` | `startDate` | `endDate` |
|---|------|-----------|---------|------------|-------------|-----------|
| 1 | `cwi-software` | CWI Software | Software Engineer | São Leopoldo, RS – Brasil · Remoto | `2026-09` | `null` |
| 2 | `devsquad` | DevSquad | Software Engineer | Utah, EUA · Remoto | `2025-11` | `2026-07` |
| 3 | `cajutec` | CajuTec | Software Engineer / Tech Lead | Parnaíba, PI – Brasil · Presencial | `2022-10` | `2025-09` |

Achievement bullets for each entry are transcribed in
[content-inventory.md](./content-inventory.md); they are `achievements: string[]`, an existing
optional field, and no entry uses `summary`.

### Validation note — the future start date

Entry 1 starts in September 2026, a few weeks after this document was written (FR-011a). It
validates today **without any schema relaxation**, because:

- `maxCurrentYear` is declared only on `Profile.experienceStartYear`, never on
  `Experience.startDate`;
- `validateCollection`'s date-ordering check compares `endDate` against `startDate` and skips
  entirely when `endDate` is `null`.

This is an accidental pass, so it gets an explicit test rather than being left to chance: a
future-dated entry with `endDate: null` must validate and must render as `Atual`. No code change,
one new assertion.

---

## Education — two fields relaxed, collection populated

**File**: `js/data/education.js`. Ships `[]` today; becomes two entries.

### Schema change

| Field | Was | Becomes | Why |
|-------|-----|---------|-----|
| `startYear` | integer, **required** | integer, **optional** | The CV dates neither qualification (research R1) |
| `endYear` | integer, required, nullable | integer, **optional**, nullable | Three states are needed; see below |

`endYear` semantics after this change — the distinction that makes the relaxation necessary
rather than merely convenient:

| Value | Meaning | Renders |
|-------|---------|---------|
| absent | the CV does not state it | nothing |
| `null` | in progress | `Em andamento` |
| integer | completed in that year | the year |

Collapsing "unknown" into `null` would force the completed IFPI course to render as still in
progress — the schema would compel a false statement about the owner. That is the failure this
three-state split exists to prevent.

`institution` and `qualification` remain **required**; every entry still carries the two facts
that make it meaningful.

### Content

| # | `id` | `institution` | `qualification` | `startYear` | `endYear` |
|---|------|---------------|-----------------|-------------|-----------|
| 1 | `mba-engenharia-software-ia` | Faculdade Full Cycle | MBA em Engenharia de Software com Inteligência Artificial | — | `null` (em andamento) |
| 2 | `tecnico-desenvolvimento-software` | Instituto Federal do Piauí (IFPI) | Técnico em Desenvolvimento de Software | — | — |

Neither entry uses the optional `field`; the qualification titles already carry the subject.

**Open to the owner (non-blocking)**: supplying real years for either entry is a pure data edit
once the schema is relaxed, and would make the section stronger.

---

## SkillGroup — shape unchanged, content replaced

**File**: `js/data/skills.js`. Five groups holding 21 skills become six groups holding 19.

| `id` | `name` | `skills` |
|------|--------|----------|
| `backend` | Backend | PHP, Laravel, NestJS |
| `frontend` | Frontend | Next.js, Vue.js, React |
| `bancos-de-dados` | Bancos de Dados | Oracle Database, MySQL, Redis |
| `infraestrutura-e-devops` | Infraestrutura e DevOps | Docker, RabbitMQ, GitLab CI/CD |
| `arquitetura-e-integracao` | Arquitetura e Integração | Arquitetura de Software, Microsserviços, APIs REST, Mensageria, Integração entre Sistemas |
| `praticas` | Práticas | Desenvolvimento Full Stack, Engenharia de Software Assistida por IA |

Every one of the CV's 19 competências appears exactly once (FR-013, FR-016). Grouping rationale
and the full list of dropped technologies are in research R6.

**`id` note**: `arquitetura-e-integracao` and `infraestrutura-e-devops` are ASCII-folded because
`id` must match `^[a-z0-9]+(?:-[a-z0-9]+)*$` — the kebab-case validator rejects `ç` and `ã`. The
display `name` keeps its accents; only the machine identifier is folded.

---

## Validation rules — delta

Feature 001's ten rules all still apply. Changes:

| Rule | Change |
|------|--------|
| 1 (required fields present) | `Education.startYear` and `Education.endYear` leave the required set |
| 8 (date ordering) | Unchanged in code. Now exercised by real data: `devsquad` and `cajutec` both have a real `endDate ≥ startDate`; `cwi-software` skips the check via `endDate: null` |
| 9 (HTML ↔ profile.js sync) | Extended from `name`/`role`/`summary` to also cover `location` and `email` |
| — (new) | **Rule 11**: the string `99806` (and any formatting of the CV phone number) MUST NOT appear anywhere under `js/`, `css/`, `assets/`, or in `index.html`. Enforces FR-023 mechanically instead of by memory. |

---

## Entity relationships

Unchanged from feature 001 — all collections remain independent, with no entity referencing
another by id. Populating Experience and Education adds no coupling; each section still renders
and tests in isolation.

```text
Profile (1) ── socialLinks (2) ── SocialLink

Independent collections:
  Experience (3)      ← newly populated from the CV
  Education (2)       ← newly populated from the CV
  SkillGroup (6)      ← regrouped from the CV
  Certification (2)   ← unchanged
  Project (1)         ← unchanged; placeholder retained by owner decision (E-1)
```

## State transitions

Unchanged. The only content-visibility transitions remain the ones feature 001 defined, and this
feature flips two of them for the first time:

```text
experiences.length 0 → 3   ⇒ #experience stops being removed, section appears
education.length   0 → 2   ⇒ #education   stops being removed, section appears
```

Both flips are pure data consequences — `js/app.js` is not touched (FR-012, FR-019).

# Data Model: Talks Section

**Feature**: `004-talks-section` | **Date**: 2026-08-14

One new entity, one new field type, one new rule flag. Everything else is reused.

Schemas live in `tests/schemas/index.js`, never in `js/data/` — no validator is shipped to a
visitor (constitution: Technology & Structure Constraints).

---

## Entity: `Talk`

**Kind**: collection. **Module**: `js/data/talks.js`. **Ships**: empty (FR-008).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `id` | ✅ | kebab-case, unique across talks. Also the photograph's filename stem (research R8) |
| `title` | `string` | ✅ | The talk's title, as given |
| `date` | `date` | ✅ | `AAAA-MM-DD`. New type — see below. Must be a real calendar date, and must not be in the future |
| `description` | `string` | ✅ | One or two sentences on what the talk covered |
| `photo` | `asset` | ✅ | Repo-relative, `assets/images/talk-<id>.webp`. Existence resolved against the repository at test time |
| `photoAlt` | `string` | ✅ | What the photograph shows. Never empty, never the title repeated — the photograph carries meaning (FR-027) |
| `event` | `string` | ➖ | Name of the event it was given at. Absent → no element at all |
| `link` | `object` (`Link`) | ➖ | One destination: recording, slides, or event page. Reuses the existing `Link` shape |

### Why `photo`/`photoAlt` are flat, not a composite

`Certification.evidence` is a four-field composite (`src`, `alt`, `width`, `height`) because it
renders at the photograph's own proportions and therefore needs them to reserve space. A talk
photograph renders in a fixed 16:9 frame, so its reserved box is fixed too and the component
supplies the dimensions from constants (research R5). Two fields is the whole shape.

The pair is modelled on `WorkEntry.image` / `WorkEntry.imageAlt`, which solves the same problem the
same way — except that both are **required** here, so no `requiredWith` linkage is needed.

### Why `link` is singular, and reuses `Link`

`Link` (`{ label, url }`) already exists and is used by `CommunityActivity`. Reusing it is the
second real consumer of an already-extracted shape, not a new abstraction.

Singular because a talk has one canonical destination in practice, and because the label must
identify where it goes on its own (FR-006) — a list of two links labelled by the author is a
harder thing to get right than one. If a second destination becomes real, `link` becomes `links`
and the renderer emits a list; that is a small, contained change.

---

## New field type: `date`

Added to `TYPES` in `tests/schemas/index.js`, beside the existing `year-month`.

```text
date  →  matches /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
         AND round-trips through Date.parse — so 2025-02-30 and 2025-11-31 are rejected,
         which the regex alone cannot do
```

The round-trip check is the point: a well-formed string that names a day that never existed is
exactly the error a hand-authored date file produces, and it is invisible to a pattern.

**Rejected**: reusing `year-month` and dropping day precision. A talk is a single-day event; the
day is a fact the owner has, and discarding it to avoid a type is the schema compelling the data to
say less than it knows.

## New rule flag: `maxToday`

`{ type: 'date', required: true, maxToday: true }` on `Talk.date`.

Mirrors the existing `maxCurrentYear` flag on `Profile.experienceStartYear`, and satisfies SC-012's
future-date case. A talk that has not happened yet is not a talk that can be evidenced by a
photograph of it.

Comparison is string-to-string against today's date rendered as `AAAA-MM-DD` in the local zone —
no `Date` arithmetic, no timezone reasoning. A talk given today passes.

---

## Validation rules

Enforced by `validateCollection` / `validateEntity`, already implemented. Rules 1–3 need no new
code; 4–6 are what the additions above buy.

1. **Required fields present and non-empty** — `id`, `title`, `date`, `description`, `photo`,
   `photoAlt`. An empty string counts as missing (`isEmpty` already handles this).
2. **Unique ids** — a duplicate `id` fails, naming the id (SC-012).
3. **Asset existence** — `photo` must start with `assets/` and must resolve to a file that exists
   in the repository (SC-012). Already implemented via the `assetExists` option.
4. **Well-formed, real date** — see the `date` type above (SC-012).
5. **Date not in the future** — see `maxToday` (SC-012).
6. **`link`, when present, validates as `Link`** — `label` non-empty, `url` absolute and `https:`.
   Whether the label identifies its destination *out of context* (FR-006) is a review gate; no
   validator distinguishes "Ver gravação da palestra sobre observabilidade" from "Clique aqui".

### Rules this model deliberately does **not** enforce

- **That the photograph is 16:9, or 1280×720.** `object-fit: cover` makes any ratio render without
  distortion, so a wrong ratio costs crop, not correctness. Reading WebP headers in a test to check
  it would be new machinery for a cosmetic guarantee.
- **That `photoAlt` describes the image rather than repeating the title.** A review gate. A
  validator cannot tell a description from a duplicate.
- **That the array is authored newest-first.** The component sorts (research R6), so authoring
  order carries no meaning and asserting it would be asserting nothing.
- **That the talk actually happened.** FR-008 is governance. The empty shipped collection is what
  enforces it today, exactly as it does for `js/data/community.js`.

---

## Authoring shape

The comment block `js/data/talks.js` ships with, so adding a talk needs no other document:

```js
{
  id: 'observabilidade-antes-do-incidente',
  title: 'Observabilidade antes do incidente',
  date: '2025-03-12',                                  // AAAA-MM-DD, real date, not in the future
  description: 'Uma ou duas frases sobre o que a palestra cobriu.',
  photo: 'assets/images/talk-observabilidade-antes-do-incidente.webp',  // 1280×720, WebP
  photoAlt: 'O palestrante diante de um telão, apontando para um gráfico de latência',
  event: 'PHP Piauí Meetup',                           // opcional
  link: {                                              // opcional
    label: 'Assistir à gravação de "Observabilidade antes do incidente"',
    url: 'https://...',
  },
}
```

Rules the comment must state, because each is a mistake the schema catches only after the fact:

- Array order does not matter — the component sorts by date, most recent first.
- The photograph's filename stem should match the `id`.
- Nothing here may be invented. No approximate date, no reconstructed title, no description of a
  photograph nobody has looked at (FR-008).

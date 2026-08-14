# Phase 0 Research: CV Content Update

**Date**: 2026-08-13 | **Feature**: `002-cv-content-update`

The spec left no `[NEEDS CLARIFICATION]` markers — the owner resolved all three before planning.
What follows are the unknowns that surfaced from reading the *code* against the CV: places where
the CV holds a fact the current implementation has nowhere to put, or where an existing test
asserts the very values this feature replaces.

---

## R1 — Education entries have no dates, but `startYear` is required

**Problem**: `tests/schemas/index.js` declares `Education.startYear` as
`{ type: 'integer', required: true }`, and `js/components/education.js` lists it in `REQUIRED`,
so `requireFields` throws without it. The CV gives no years for either entry — the MBA is only
marked "em andamento" and the IFPI technical course carries no dates at all.

**Decision**: relax **both** `startYear` and `endYear` to optional, and make the whole date line
conditional. An entry renders its period when years are known and omits the line when they are
not.

`endYear` needs three distinguishable states, which is why optional and nullable are not the same
thing here:

| `endYear` | Meaning | Renders |
|-----------|---------|---------|
| absent | not stated in the CV | nothing |
| `null` | in progress | `Em andamento` |
| integer | completed in that year | the year |

Without this, the completed IFPI course — which the CV dates not at all — would have to be
written as `endYear: null` and would render as still in progress, i.e. the schema would force a
false statement. That is the trap the three-state distinction exists to avoid.

**Rationale**: FR-026 forbids inventing facts, and a year is exactly the kind of invented fact a
recruiter can check and catch. Optionality is also the pattern already used throughout this
codebase — `summary`, `achievements`, `field`, `issuer`, `repositoryUrl` are all "omitted
entirely when absent, never rendered empty" (feature 001 FR-006). Education dates simply join
that set.

**Consequence**: the MBA must still read as in progress (FR-018) without a date line to carry it.
Handled by `endYear: null` remaining meaningful on its own — see R7.

**Alternatives considered**:

- *Fill in plausible years* — rejected. Fabricates verifiable claims; direct FR-026 violation.
- *Block the feature until the owner supplies years* — rejected. Holds four sections hostage to
  one detail of a two-entry section.
- *Remove the date line from education entirely* — rejected. Destroys the capability for future
  entries that do have years, and `endYear` carries the in-progress signal.

**Follow-up for the owner**: supplying real years for both qualifications would strengthen the
section. Not blocking; the data file takes them with no code change once relaxed.

---

## R2 — Experience has no field for work-location context

**Problem**: FR-008 requires each role to state its location context. The CV gives "São Leopoldo,
RS-Brasil - Remoto", "Utah, EUA – Remoto", "Parnaíba, PI | Presencial". The `Experience` schema
has `id`, `company`, `title`, `startDate`, `endDate`, `summary`, `achievements` — nothing fits.

**Decision**: add an optional `location` string field to the `Experience` schema and render it as
its own line in the timeline card, styled with an existing class.

**Rationale**: remote-vs-on-site is a primary recruiter filter, and it deserves to be an
addressable field rather than a phrase buried in prose. A dedicated field is assertable
(`[data-location]`), independently omittable, and costs one optional entry in a schema that
already has four of them.

**Alternatives considered**:

- *Fold location into `summary`* — rejected. Merges two independent facts into one string, makes
  the parity suite substring-match sentences, and means an entry cannot state a location without
  also carrying a summary.
- *Omit location entirely* — rejected. Fails FR-008, and drops the single most-filtered attribute
  of a remote role.

---

## R3 — Nothing on the page renders `profile.location` or `profile.email`

**Problem**: both fields already exist in the `Profile` schema (optional) and both are absent from
`js/data/profile.js`. No component reads either. FR-021 and FR-022 require both to be published.

**Decision**: author location and email **statically in `index.html`**, inside the existing
`#contact` section, and mirror them in `js/data/profile.js`. Extend `tests/data/sync.test.js` to
fail on drift, exactly as it already does for `name`, `role`, `summary`, and the social links.
**No contact component is added.**

**Rationale**: Principle IV names "primary contact/social links" as content that must be present
in the served HTML, not injected at runtime. The codebase already solved this problem once — the
GitHub and LinkedIn anchors are static in `index.html` and kept honest by `sync.test.js`. Email
is a primary contact route and belongs in the same category. Reusing the established pattern
costs nothing and adds no module.

**Shape**: a `<ul>` of contact details above the existing form, each item an icon plus text; the
email is an `<a href="mailto:…">` whose visible text is the address itself, which satisfies both
"accessible name" (Principle V) and "descriptive link text, never 'click here'" (Principle VIII).

**Alternatives considered**:

- *A new `js/components/contact.js`* — rejected. Puts the primary contact route behind
  JavaScript, contradicting Principle IV, and adds a module that renders two static strings and
  has no dynamic behaviour to justify it (Principle IX).
- *Add them to the hero* — rejected. Feature 001's R2 deliberately kept the hero minimal, and the
  contact section is where a visitor looks for contact details.

**Explicitly excluded**: the phone number, per FR-023. It must not appear in `profile.js`,
`index.html`, metadata, or any other shipped file.

---

## R4 — `tests/data/parity.test.js` asserts the exact values this feature replaces

**Problem**: the suite is content-bound *on purpose* — it was feature 001's proof that the
migration lost nothing, and `tests/data/independence.test.js` exempts it by filename. It
hardcodes `'Desenvolvedor Fullstack'`, `'soluções robustas e escaláveis'`, all 21 current skill
tags, and asserts `chips.length === SKILL_TAGS.length` plus a sorted `deepEqual`. Every one of
those breaks under this feature.

**Decision**: rewrite the suite in place, keeping the filename `parity.test.js`. Its reference
moves from `specs/001-data-driven-migration/content-inventory.md` (the pre-migration page) to
`specs/002-cv-content-update/content-inventory.md` (the CV). Its docblock is rewritten to say so.
The `deliberate removals` block — Tailwind CDN gone, Google Fonts gone, inline `getFullYear`
script gone, no emoji icons, no Tailwind utility classes — is **kept verbatim**; those are
regression guards, not content parity, and nothing in this feature touches them.

**Rationale**: keeping the filename means `independence.test.js` needs no edit — its exemption
list already names this exact file, and touching an exemption list is how exemptions quietly
grow. Retargeting rather than deleting preserves the guarantee itself: after this change, the
suite proves the page states everything the CV states, which is precisely SC-001 and SC-002. The
test's purpose is unchanged; only its reference document moves.

**Alternatives considered**:

- *Delete it* — rejected. Discards the only mechanism that catches content silently going missing,
  at the exact moment the content is being rewritten wholesale.
- *Skip or `todo` it* — rejected. A disabled test reads as a passing test to everyone who did not
  disable it.
- *Rename to `cv-parity.test.js`* — rejected. Requires editing the exemption list in
  `independence.test.js` for zero benefit.

---

## R5 — `tests/e2e/metadata.spec.js` hardcodes the old role

**Problem**: line 21 asserts the page title matches `/Desenvolvedor|Developer/`. "Software
Engineer" matches neither.

**Decision**: import `profile` from `js/data/profile.js` and assert the title contains
`profile.name` and `profile.role`.

**Rationale**: the contract being tested is "the title names the owner and their role", not "the
title contains a specific word". Binding to the data module makes the assertion correct for every
future title change too — this is the same reasoning `no-js.spec.js` already applies at lines
71–72, so the pattern is established in the file's own neighbourhood.

**Alternatives considered**:

- *Widen the regex to `/Desenvolvedor|Developer|Engineer/`* — rejected. Re-hardcodes a content
  value in a contract test and guarantees the same edit again next time.

---

## R6 — Grouping 19 flat CV competências into scannable groups

**Problem**: FR-014 requires named groups; the CV supplies one flat bullet list. FR-013 requires
full coverage, FR-015 forbids non-CV technologies, FR-016 forbids a skill appearing twice.

**Decision**: six groups, 19 skills, each skill appearing exactly once.

| Group | Skills |
|-------|--------|
| Backend | PHP, Laravel, NestJS |
| Frontend | Next.js, Vue.js, React |
| Bancos de Dados | Oracle Database, MySQL, Redis |
| Infraestrutura e DevOps | Docker, RabbitMQ, GitLab CI/CD |
| Arquitetura e Integração | Arquitetura de Software, Microsserviços, APIs REST, Mensageria, Integração entre Sistemas |
| Práticas | Desenvolvimento Full Stack, Engenharia de Software Assistida por IA |

**Rationale**: group sizes stay between 2 and 5, so the card grid does not go ragged (a real
constraint — the groups render as equal-width cards). Redis sits under databases rather than
infrastructure because a recruiter screening "Redis" is screening a datastore. RabbitMQ (a tool)
and Mensageria (the competence) are distinct CV entries and stay distinct, which is not a
duplicate under FR-016.

**Removed by this regrouping** (present today, absent from the CV, so dropped under FR-015):
VueJS→superseded by Vue.js, NuxtJS, Tailwind, JavaScript, Vite, Vuetify, Node.js, SQL, MongoDB,
Indexação de Dados, Análise de Dados, Git, GitHub Actions, Postman, Insomnia, Flutter, BLOC. The
"Mobile" group disappears entirely.

**Not skills**: Symfony, Angular, WebSockets, Sentry, Claude Code, OpenCode and SDD appear only in
CV experience bullets, not in COMPETÊNCIAS. They stay in the experience achievements and are not
promoted to skill chips — the CV's own division is respected.

**Alternatives considered**:

- *Keep dropped technologies "just in case"* — rejected. FR-015, and a stale stack is worse than a
  shorter one.
- *One flat chip list with no groups* — rejected. FR-014, and 19 ungrouped chips do not scan.

---

## R7 — Hero summary, title, and metadata copy

**Problem**: FR-002 wants the CV's "Resumo Profissional" conveyed; FR-003 forbids pasting the
full paragraph (it is ~90 words). Three surfaces need consistent copy: the hero summary (mirrored
in `profile.js`, byte-identical per `sync.test.js`), `<title>`, and the meta/OG/Twitter
descriptions — the last of which `metadata.spec.js` constrains to 50–200 characters.

**Decision**:

- `role`: `Software Engineer`
- `summary`: `Especializado em PHP/Laravel, APIs REST e sistemas distribuídos, com foco em
  arquitetura de software e IA aplicada.`
- `<title>`: `Bruno Oliveira — Software Engineer`
- meta description: one sentence naming the role, the 4+ years, and the core stack, sized inside
  the 50–200 character window.

**Rationale**: every clause traces to a CV line (FR-026). The summary stays one line so it clears
the fold on a phone (FR-003) and can be reused verbatim as the OG card's third line, keeping the
preview and the page consistent.

**Unchanged**: `experienceStartYear: 2022`. The CV's "mais de 4 anos" and the CajuTec start of
October 2022 agree, and the derived figure reads 4 in 2026 with no edit (FR-004). The static
fallback `4` in `index.html` stays within the ±1 tolerance `sync.test.js` enforces.

---

## R8 — Ordering and the future-dated current role

**Problem**: FR-010 fixes the order and FR-011a requires a start date a few weeks ahead (CWI,
September 2026) to still render as the current role.

**Decision**: no code change. `renderExperience` renders array order verbatim, so authoring the
array newest-first *is* the ordering mechanism. Validation needs no relaxation either:
`maxCurrentYear` is declared only on `Profile.experienceStartYear`, and the collection-level date
check only compares `endDate` against `startDate` — neither rejects a future `startDate`.

**Verification owed**: an explicit test that a future-dated, `endDate: null` entry validates and
renders as "Atual", so R8's "it already works" is asserted rather than assumed.

**Note**: `renderHero` *does* throw on a future `experienceStartYear`. That is a different field
and stays 2022, so it is unaffected.

---

## R9 — The Open Graph card has the old title rasterised into it

**Problem**: `assets/images/og-card.svg` contains `<text>` reading "Desenvolvedor Fullstack" and
"Criando soluções robustas e escaláveis.", and `og-card.png` is its 1200×630 render. SC-007
cannot be met by editing meta tags.

**Decision**: edit the three `<text>` nodes in the SVG, then re-render the PNG at 1200×630 using a
throwaway Playwright script (Playwright is already a devDependency). The script is run once and
not committed as a test.

**Rationale**: Principle IX — no new dependency for a one-off raster. `orphans.spec.js` already
treats `assets/**/*.svg` as a deliberately-unserved editable source, so keeping the SVG as the
authoring master is the pattern the repository already documents.

**Also update**: `og:image:alt`, which currently reads "Bruno Oliveira, Desenvolvedor Fullstack".

**Alternatives considered**:

- *Leave the card stale* — rejected. The preview would contradict the title, description, and
  page for every shared link.
- *Add `sharp` or `resvg`* — rejected. A dependency for one image, against Principle IX.

---

## R10 — Navigation omits the two sections that are about to appear

**Problem**: `index.html`'s nav lists Home, Skills, Projetos, Certificações, Contato. Experience
and Formação are absent because they have never rendered. After this feature they will.

**Decision**: leave the navigation unchanged. Record as a follow-up for the owner.

**Rationale**: the spec's Out of Scope section explicitly excludes "adding new page sections or
navigation entries". Adding them anyway would be scope the owner did not authorise, and the
sections remain reachable by scrolling.

**Risk accepted**: the two most substantial new sections are the two the nav does not advertise.
This is worth a one-line follow-up feature; it is not worth silently widening this one.

**Related, also left alone**: the footer reads `© 2024`, which is stale but is not CV content and
sits outside this feature's scope.

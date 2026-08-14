# Feature Specification: CV Content Update

**Feature Branch**: `002-cv-content-update`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "Ajuste o conteúdo do site para usar as informações do meu currículo" — full CV supplied inline (identity, contact, competências, resumo profissional, three professional roles, two academic entries).

## Overview

The portfolio's structure is already data-driven (feature 001). Its *content*, however, is stale
or absent: the professional title and summary predate the owner's current role, the skill list
omits most of the current stack, and the Experience and Education sections ship empty so they do
not render at all. The owner has supplied an authoritative CV. This feature replaces the site's
content with the CV's content so a visitor reads the owner's actual, current professional record.

No structural, visual, or behavioural change is in scope — only the facts the page states.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recruiter reads an accurate professional identity (Priority: P1)

A recruiter opens the portfolio (usually from a shared link on a phone) and, without scrolling,
must learn who the owner is, what they do now, and how long they have been doing it. Today the
page says "Desenvolvedor Fullstack — Criando soluções robustas e escaláveis", which is both
generic and behind the owner's actual title and specialisation.

**Why this priority**: this is the first — and for a majority of visitors the only — content
consumed. Every other section is worthless if the headline misrepresents the owner. It is also
the content that is duplicated into the page title, meta description, and social preview, so it
governs how the link appears before anyone even clicks it.

**Independent Test**: load the page and read only the area above the fold plus the browser tab
title and a shared-link preview; verify all identity facts match the CV. Delivers value on its
own even if no other section changes.

**Acceptance Scenarios**:

1. **Given** a visitor loads the page, **When** the first screen renders, **Then** the owner's
   name, current professional title, and a summary drawn from the CV's "Resumo Profissional" are
   visible without scrolling.
2. **Given** a visitor loads the page, **When** they read the years-of-experience statement,
   **Then** it reflects a career starting in October 2022 and updates on its own as time passes,
   with no content edit required.
3. **Given** a visitor shares the page link on a social platform, **When** the preview renders,
   **Then** the title and description state the owner's current title, not the superseded one.
4. **Given** a visitor loads the page with scripts blocked or failing, **When** the page renders,
   **Then** the name, title, and summary are still present and correct.

---

### User Story 2 - Recruiter reviews the professional experience record (Priority: P2)

A recruiter who is interested after the headline wants the work history: which companies, in
what order, over what period, doing what. The Experience section currently renders nothing at
all, so this information is simply unavailable on the site.

**Why this priority**: work history is the single most-scrutinised part of any candidate
evaluation, and it is the largest gap between the site and the CV. It is second only to identity
because a visitor who rejects the headline never reaches it.

**Independent Test**: with only the experience content supplied, load the page and confirm the
Experience section appears, lists every role from the CV in reverse-chronological order with
correct employers, periods, and responsibilities. Verifiable without touching any other section.

**Acceptance Scenarios**:

1. **Given** the experience content is supplied, **When** the page renders, **Then** the
   Experience section is present and lists all three roles from the CV.
2. **Given** the Experience section renders, **When** a visitor reads it, **Then** roles appear
   newest-first, each showing employer, role title, and period.
3. **Given** a role is ongoing, **When** its period renders, **Then** the end is stated as
   current rather than as a date or a blank.
4. **Given** a role has responsibility bullets in the CV, **When** it renders, **Then** those
   points appear beneath the role; a role with none renders without an empty list.

---

### User Story 3 - Recruiter checks technical stack and qualifications (Priority: P3)

A recruiter screening for a specific technology scans the skills list; one screening for
credentials scans education. The skills list is stale — it advertises a stack the owner has moved
beyond (Flutter/BLOC, NuxtJS, Vuetify) and omits most of the CV's competências (NestJS, Next.js,
React, RabbitMQ, Redis, Oracle, microservices, messaging, AI-assisted engineering, CI/CD). The
Education section renders nothing.

**Why this priority**: keyword-level screening is real but happens after the candidate has
already passed the headline and history filters. Wrong keywords cost opportunities, but an
absent history costs more.

**Independent Test**: load the page and compare the rendered skill groups and education entries
against the CV lists; no other section need change for this to be verifiable.

**Acceptance Scenarios**:

1. **Given** the page renders, **When** a visitor reads the skills section, **Then** every
   competência listed in the CV appears exactly once, grouped by a meaningful category.
2. **Given** the page renders, **When** a visitor reads the skills section, **Then** no
   technology absent from the CV is presented as a current skill.
3. **Given** the education content is supplied, **When** the page renders, **Then** the Formação
   section appears listing both academic entries with institution and qualification.
4. **Given** a qualification is still in progress, **When** it renders, **Then** it is marked as
   ongoing rather than showing a completion year.

---

### User Story 4 - Visitor finds a way to make contact (Priority: P4)

A visitor convinced by the content wants to reach the owner. The contact section offers a form
and a LinkedIn link; the CV additionally supplies a location, an email address, and a phone
number, and the GitHub/LinkedIn handles must match the CV.

**Why this priority**: contact is the conversion step, but it already partly works today, so the
incremental value is smaller than filling the empty sections.

**Independent Test**: load the page, exercise every contact affordance, and confirm each
destination matches the CV.

**Acceptance Scenarios**:

1. **Given** the page renders, **When** a visitor uses any social or contact link, **Then** it
   reaches the destination stated in the CV.
2. **Given** the page renders, **When** a visitor looks for the owner's location, **Then** the
   city and state from the CV are stated.
3. **Given** a direct contact address is published, **When** a visitor activates it, **Then**
   their device opens the matching application pre-addressed to the owner.

---

### Edge Cases

- **Non-contiguous employment periods**: the corrected dates leave two gaps (Oct 2025, and Aug
  2025 between DevSquad ending and CWI beginning). The experience list states each role's own
  period and MUST NOT invent continuity by stretching a period to close a gap.
- **A start date in the near future**: the current role's stated start (September 2026) is a few
  weeks ahead of the present date. It must render as the current role with an ongoing end, not
  be hidden, reordered below older roles, or shown with a negative duration.
- **A role with no end date**: renders as ongoing, and stays correct as months pass without a
  content edit.
- **Derived years of experience crossing a year boundary**: the stated years must increment on
  its own; it must never be a stored number that silently goes stale.
- **A very long responsibility bullet on a narrow viewport**: wraps within the card, never
  forcing horizontal scrolling.
- **A skill group growing past the others**: groups of unequal length must not leave a broken or
  ragged layout.
- **Content containing accented characters, apostrophes, and ampersands** (e.g. "Rede D'Or",
  "Parnaíba", "Integração entre Sistemas"): renders as authored, with no escaping artefacts.
- **A visitor with scripts disabled**: identity content survives; data-rendered sections are
  absent rather than broken.
- **Placeholder content left on the page**: the Projects section keeps its invented stand-in
  entry by owner decision (FR-025). Every other section must be free of stand-in content — a
  section showing invented content misleads a recruiter and is worse than an absent section.

## Requirements *(mandatory)*

### Functional Requirements

**Identity & summary**

- **FR-001**: The site MUST present the owner's professional title as stated in the CV
  ("Software Engineer") everywhere a title currently appears: on-page headline, browser tab
  title, meta description, and social preview metadata.
- **FR-002**: The site MUST present a professional summary derived from the CV's "Resumo
  Profissional", conveying years of experience, the specialisation (PHP/Laravel ecosystem,
  scalable web applications, REST APIs, distributed systems), and the stated interest in
  platforms combining software engineering, cloud, and AI.
- **FR-003**: The summary MUST be short enough to read at a glance above the fold on a phone; the
  full-length CV paragraph MUST NOT be pasted verbatim into the hero.
- **FR-004**: The years-of-experience figure MUST continue to be derived from a career start of
  October 2022 at render time, never stored as a literal count.
- **FR-005**: Identity content that is duplicated between the served document and the content
  data MUST remain byte-identical between the two after this change.

**Experience**

- **FR-006**: The site MUST present all three roles from the CV: CWI Software, DevSquad, and
  CajuTec (Software Engineer / Tech Lead).
- **FR-007**: Each role MUST state employer, role title, and period.
- **FR-008**: Each role MUST state its work-location context as given in the CV (remote,
  on-site, and the employer's city/country).
- **FR-009**: Each role MUST carry its CV responsibility bullets, preserving their substance:
  platform/domain worked on, technologies applied, and outcomes claimed.
- **FR-010**: Roles MUST be ordered newest-first, giving: CWI Software (set 2026 – Atual),
  DevSquad (nov 2025 – jul 2026), CajuTec (out 2022 – set 2025).
- **FR-011**: An ongoing role MUST render its end as "Atual" rather than a date or a blank.
- **FR-011a**: An ongoing role whose start date has not yet arrived MUST still render as the
  newest, current role. Validation MUST NOT reject a start date that is slightly in the future.
- **FR-012**: The Experience section MUST become visible as a consequence of supplying content
  only — no structural or component change.

**Skills**

- **FR-013**: The skills content MUST cover every competência listed in the CV.
- **FR-014**: Skills MUST be organised into named groups that a reader can scan (e.g. backend,
  frontend, data, infrastructure/messaging, practices).
- **FR-015**: Technologies not present in the CV MUST NOT be listed as current skills.
- **FR-016**: No skill MUST appear in more than one group.

**Education**

- **FR-017**: The site MUST present both academic entries from the CV: the in-progress MBA in
  Software Engineering with AI at Faculdade Full Cycle, and the Técnico em Desenvolvimento de
  Software at IFPI.
- **FR-018**: An in-progress qualification MUST be visibly marked as in progress.
- **FR-019**: The Formação section MUST become visible as a consequence of supplying content
  only.

**Contact & links**

- **FR-020**: Social links MUST point to the CV's GitHub and LinkedIn destinations, each with its
  own platform's icon and an accessible name naming the platform.
- **FR-021**: The site MUST state the owner's location as given in the CV.
- **FR-022**: The site MUST publish the owner's email address as an actionable contact.
- **FR-023**: The owner's phone number MUST NOT appear anywhere in the served page — not as
  visible text, not as a link, not in metadata, and not in any content module. Contact routes are
  limited to email, LinkedIn, GitHub, and the existing form.

**Certifications & projects**

- **FR-024**: Existing certification entries MUST be retained; the CV neither adds nor
  contradicts them.
- **FR-025**: The Projects section MUST be left exactly as it is. Its single placeholder entry
  ("Plataforma E-commerce") stays, and no project content is added, changed, or removed by this
  feature. **Recorded exception**: this entry is not drawn from the CV and describes no real
  delivered project, so it stands as a knowingly-accepted violation of FR-026 and SC-006, scoped
  to the Projects section alone. It is owner-directed and MUST NOT be "fixed" during
  implementation. See "Accepted exceptions" below.

**Integrity of the change**

- **FR-026**: Every content statement on the page MUST be traceable to the supplied CV; this
  change MUST NOT introduce invented facts, embellished claims, or filler copy. The pre-existing
  Projects placeholder is the single carved-out exception (FR-025); the exception MUST NOT be
  widened to any other section, and no *new* untraceable content may be added anywhere.
- **FR-027**: All content MUST be authored in Brazilian Portuguese, matching the existing page
  and the CV, except for proper nouns and technology names.
- **FR-028**: This change MUST NOT alter page structure, layout, styling, or interactive
  behaviour.
- **FR-029**: Adding this content MUST NOT require rewriting checks that are unrelated to the
  content itself.

### Key Entities

- **Profile**: the owner's identity — name, professional title, summary, career start, location,
  email, and social destinations. Exactly one exists; it feeds the headline, the page metadata,
  and the contact area.
- **Experience entry**: one employment role — employer, title, location context, start, end (or
  ongoing), and its responsibility points. Three exist; they are ordered by date and reference
  nothing else.
- **Skill group**: a named category holding one or more named skills. Several exist; they
  collectively partition the CV's competências.
- **Education entry**: one academic qualification — institution, qualification, and whether it is
  complete or in progress. Two exist.
- **Certification entry**: an award or credential. Two exist and are unchanged by this feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the CV's competências, roles, and academic entries are represented on the
  page; a line-by-line comparison of the CV against the rendered page finds no omission.
- **SC-002**: Zero statements on the page cannot be traced to a line in the CV.
- **SC-003**: A first-time visitor can state the owner's current role, current employer, and
  years of experience within 30 seconds of opening the page on a phone.
- **SC-004**: A visitor screening for any single CV technology finds it on the page within 15
  seconds.
- **SC-005**: The Experience and Formação sections, which render nothing today, render complete
  content after the change.
- **SC-006**: Zero placeholder, stand-in, or invented content remains visible anywhere on the
  page **outside the Projects section**, which retains its one pre-existing placeholder entry by
  owner decision (FR-025).
- **SC-007**: The shared-link preview states the owner's current professional title.
- **SC-008**: All identity content remains readable with scripts disabled.
- **SC-009**: The page renders with no horizontal scrolling and no clipped content at mobile,
  tablet, and desktop widths, with the longer real content in place.
- **SC-010**: The stated years of experience is still correct one year from now with no edit.
- **SC-011**: Every existing automated check still passes, and no check required modification for
  reasons unrelated to the content values themselves.
- **SC-012**: Every contact and social destination on the page resolves to a live, correct
  destination.

## Assumptions

- The supplied CV is authoritative and current; where it conflicts with what the site says today,
  the CV wins.
- Brazilian Portuguese remains the site's language. The CV's English-language proper nouns and
  technology names stay in English.
- The site's existing information architecture (hero, skills, projects, certifications,
  experience, education, contact) is adequate for the CV's content; no new section is needed.
- The CV's "Resumo Profissional" is a source to condense for the hero, not text to paste. The
  fuller version may live in the experience or about-style copy.
- Career start is October 2022 (the CajuTec start), which is consistent both with the existing
  derived figure and with the CV's "mais de 4 anos" claim as of 2026.
- The CV's competências list is a superset of, not a replacement for, the grouping structure
  already in use; grouping is an editorial decision, and the CV's flat list carries no groups.
- Skills the CV drops (Flutter, BLOC, NuxtJS, Vuetify, MongoDB, Insomnia, and similar) are
  intentionally dropped by the owner and are removed rather than retained.
- The existing certification entries remain accurate; the CV's silence on them is not a
  retraction.
- The portrait remains the existing abstract illustration; the CV supplies no photograph.
- The contact form's submission behaviour is unchanged and out of scope.
- The CWI Software start date is September 2026, the owner having confirmed the CV's "Set 2025"
  as a typo. That date is a few weeks after this spec was written, so the role is stated as
  current slightly before it begins — accepted by the owner, and self-correcting with time.
- The resulting gaps in the timeline (August 2026, October 2025) are stated as they are; the site
  does not explain, annotate, or paper over them.
- The phone number stays out of the page entirely; the CV remains the only place it is shared.

## Accepted exceptions

Recorded here so implementation does not treat these as defects and re-open settled decisions.

| # | Exception | Decided | Rationale | Rejected alternative |
|---|-----------|---------|-----------|----------------------|
| E-1 | The Projects section keeps an invented placeholder entry that no CV line supports, violating FR-026/SC-006 within that section | Owner, 2026-08-13 | Owner elected to leave Projects untouched in this feature rather than delay it on sourcing real project content | Removing the entry so the section disappears until real projects exist; supplying real projects now |
| E-2 | The current role is stated as ongoing from a start date a few weeks in the future | Owner, 2026-08-13 | The role is confirmed and the discrepancy resolves itself in September 2026 | Withholding the role until its start date; back-dating the start to the present |

**Consequence of E-1**: a recruiter comparing the CV against the site finds one project on the
site that appears nowhere in the CV. If that becomes a concern, removing the entry is a
one-line data edit that needs no code change — the section disappears on its own when empty.

## Dependencies

- Feature 001 (data-driven structure migration) is complete; this feature depends on its content
  modules and rendering components already existing.
- All previously open content questions are resolved (see Accepted exceptions); nothing blocks
  content authoring.

## Out of Scope

- Any change to layout, styling, typography, colour, or component behaviour.
- Adding new page sections or navigation entries.
- Contact form backend/submission handling.
- Replacing the portrait illustration with a photograph.
- Translating the site to English or adding a language switcher.
- Sourcing, writing, or building the real projects list beyond the decision recorded above.

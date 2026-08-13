<!--
SYNC IMPACT REPORT
==================
Version change: (unfilled template) → 1.0.0
Bump rationale: Initial ratification. All placeholder tokens replaced with concrete,
                project-specific governance for the vanilla HTML/CSS/JS portfolio.

Modified principles:
  [PRINCIPLE_1_NAME] → I. Data-Driven Content (NON-NEGOTIABLE)
  [PRINCIPLE_2_NAME] → II. Layer Separation
  [PRINCIPLE_3_NAME] → III. Component Isolation & Reuse
  [PRINCIPLE_4_NAME] → IV. Progressive Enhancement & Semantic HTML
  [PRINCIPLE_5_NAME] → V. Accessibility (NON-NEGOTIABLE)
Added principles:
  VI. Mobile-First Responsive Delivery
  VII. Performance as a Feature
  VIII. SEO & Discoverability
  IX. Vanilla-First Simplicity
Added sections:
  [SECTION_2_NAME] → Technology & Structure Constraints (includes mandated directory layout)
  [SECTION_3_NAME] → Development Workflow & Quality Gates
Removed sections: none

Templates requiring updates:
  ✅ .specify/templates/plan-template.md — updated: added "Option 0: Static portfolio
     (MANDATED by constitution)" to the Source Code tree so plans cannot invent a layout.
     "Constitution Check" gate left generic ("[Gates determined based on constitution
     file]"); gates are derived per-feature from Principles I–IX.
  ✅ .specify/templates/spec-template.md — no constitution-specific mandatory sections
     added or removed; no edit required.
  ✅ .specify/templates/tasks-template.md — task categories (Setup, Foundational,
     User Story, Polish) already accommodate a11y/performance/SEO tasks; no edit required.
  ⚠ README.md — pending: does not yet document the mandated directory layout or the
     data-driven authoring workflow (how to edit js/data/*.js to change portfolio content).

Follow-up TODOs:
  - Repository currently uses `img/`, flat `css/style.css` + `css/project-component-style.css`,
    and flat `js/Project.js`, `js/projectCard.js`,
    `js/createProjectComponentYourSelfLikeMagic.js`. These do NOT match the mandated
    structure in "Technology & Structure Constraints". Migration is required and MUST be
    tracked as a feature; the constitution governs the target state.
-->

# Portfolio Constitution

## Core Principles

### I. Data-Driven Content (NON-NEGOTIABLE)

All repeatable and personal portfolio content — profile/personal information, professional
experiences, projects, skills, education, certifications, social links — MUST live in
centralized data modules under `js/data/` (JavaScript data modules or JSON files). Content
MUST NOT be hardcoded inside HTML templates or inlined in component rendering code.

Adding, removing, or editing a portfolio item MUST be achievable by changing only its data
entry, with no changes to HTML structure and no changes to component logic beyond what a
genuinely new field requires.

Rationale: content changes are the most frequent change to a portfolio. Isolating them to
data files makes updates fast, low-risk, reviewable as diffs of facts rather than markup,
and keeps the site maintainable years after it is built.

### II. Layer Separation

Each layer has exactly one responsibility and MUST NOT absorb another's:

- **HTML** defines semantic document structure and section containers only.
- **JavaScript** transforms data into rendered UI and provides interaction behavior.
- **CSS** owns all visual presentation.

JavaScript MUST NOT carry presentational styling as inline style strings when a class will
do. CSS MUST NOT encode content via `content:` for meaningful text. HTML MUST NOT duplicate
content that a component renders from data.

Rationale: single-responsibility layers keep each file predictable and let content, logic,
and design evolve independently.

### III. Component Isolation & Reuse

The UI MUST be organized into independent section components — Hero, About, Experience,
Projects, Skills, Education, Certifications, Contact — each in its own module under
`js/components/`. Every component:

- MUST accept its data as an argument and render from it; it MUST NOT import or reach for
  content it was not given, and MUST NOT contain duplicated literal content.
- MUST be independently renderable and testable without other components.
- MUST NOT read or write shared mutable global state. Cross-component coordination goes
  through explicit function arguments, return values, or DOM events.
- MUST NOT duplicate rendering logic that already exists; shared markup patterns (cards,
  tag lists, date ranges) are extracted only once a second real consumer exists.

Rationale: isolated, data-consuming components are the mechanism that makes Principle I
practically achievable and prevents the site from decaying into copy-pasted markup.

### IV. Progressive Enhancement & Semantic HTML

`index.html` MUST be a valid, meaningful semantic document on its own: correct landmark
elements (`header`, `nav`, `main`, `section`, `footer`), a single `h1`, and a heading
hierarchy that does not skip levels.

JavaScript adds rendering and interaction on top of that structure. It MUST NOT be the only
thing standing between a visitor and the page being intelligible: critical identifying
content (name, role, primary contact/social links) and page metadata MUST be present in the
served HTML, not injected exclusively at runtime. Interactive behavior MUST degrade to a
usable state rather than an empty or broken one when a script fails.

Rationale: the portfolio's job is communicating professional experience. That job cannot be
contingent on a script executing successfully in every visitor's environment.

### V. Accessibility (NON-NEGOTIABLE)

Every rendered view MUST satisfy:

- Semantic HTML elements chosen for meaning, not appearance (`button` for actions, `a` for
  navigation, lists for lists).
- Full keyboard operability: every interactive control reachable and operable by keyboard,
  in a logical tab order, with no keyboard traps.
- Visible focus states on all focusable elements. Focus indicators MUST NOT be removed
  without an equal-or-better replacement.
- Accessible names for all controls, and meaningful `alt` text on content images
  (`alt=""` for decorative ones).
- Color contrast meeting WCAG 2.1 AA (4.5:1 body text, 3:1 large text and UI boundaries).
- ARIA used only when native semantics cannot express the meaning. A native element MUST be
  preferred over an ARIA-annotated `div` in every case where one exists.

Accessibility is a merge blocker, not a follow-up task.

Rationale: an inaccessible portfolio excludes real visitors and directly contradicts the
site's purpose of demonstrating engineering quality.

### VI. Mobile-First Responsive Delivery

Layouts MUST be authored mobile-first: base styles target the smallest supported viewport
and media queries add complexity upward (`min-width`, never a desktop base walked down).
The experience MUST be consistent and complete across mobile, tablet, and desktop — no
section, control, or content may be hidden on small screens as a substitute for designing
it responsively. Layout MUST use fluid units and modern layout primitives (flexbox, grid)
rather than fixed pixel widths that force horizontal scrolling.

Rationale: most portfolio traffic arrives on phones, often from a recruiter following a
link. The small-screen experience is the primary experience.

### VII. Performance as a Feature

Performance is a requirement, not an optimization phase:

- No unnecessary network requests. No render-blocking resources beyond critical CSS.
- JavaScript payload MUST stay minimal; ship no code the page does not use.
- Images MUST be optimized (modern formats, correct dimensions, explicit `width`/`height`
  to prevent layout shift) and MUST use `loading="lazy"` for below-the-fold content.
- Fonts MUST be self-hosted or preloaded deliberately, with `font-display` set to avoid
  invisible text; decorative font weights that are not used MUST NOT be shipped.
- The site MUST remain fully static so Vercel's CDN serves it from the edge. Any runtime
  server dependency requires explicit justification under Governance.

Rationale: load speed is itself a demonstration of the engineering quality the portfolio
claims.

### VIII. SEO & Discoverability

Search and social discoverability MUST be implemented as part of the work, not bolted on:

- Descriptive, unique `<title>` and meta description.
- Semantic heading structure that mirrors the content outline.
- Open Graph and Twitter card metadata with a functioning preview image.
- Crawlable content and real `<a href>` navigation — never JavaScript-only navigation for
  content that should be indexed.
- Canonical URL, `lang` attribute, and descriptive link text (never "click here").

Rationale: the portfolio only works if it is found and previews correctly when shared.

### IX. Vanilla-First Simplicity

Browser-native APIs and vanilla JavaScript are the default. A build step, framework,
library, or any dependency MUST NOT be introduced unless it delivers substantial value that
the platform cannot reasonably provide, and the justification MUST be recorded in the
feature's Complexity Tracking table.

Code MUST prioritize readability, consistency, and clear naming over cleverness. Prohibited
by default: premature abstraction, speculative generality, duplicated rendering logic,
global mutable state, and tight coupling between components.

This is a static personal portfolio, not a single-page application. Every increment in
architectural complexity MUST trace to a concrete product requirement.

Rationale: the simplest thing that satisfies the requirement is the thing that will still
be maintainable — and still be a credible work sample — in three years.

## Technology & Structure Constraints

**Stack**: HTML5, CSS3, and vanilla JavaScript (ES modules). No framework. No mandatory
build step.

**Hosting**: Vercel static delivery. The deployable artifact is static files served from
the CDN.

**Mandated directory structure** — the repository MUST follow this layout:

```text
portfolio/
├── index.html
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── css/
│   ├── variables.css
│   ├── base.css
│   ├── components.css
│   └── sections.css
│
├── js/
│   ├── app.js
│   ├── components/
│   │   ├── hero.js
│   │   ├── experience.js
│   │   ├── projects.js
│   │   ├── skills.js
│   │   └── education.js
│   │
│   └── data/
│       ├── profile.js
│       ├── experiences.js
│       ├── projects.js
│       ├── skills.js
│       └── education.js
│
└── README.md
```

Rules governing this layout:

- `css/variables.css` holds design tokens (color, spacing, typography scales) as custom
  properties. Hardcoded color and spacing literals elsewhere in CSS are a violation.
- `css/base.css` holds resets, element defaults, and typography. `css/components.css` holds
  reusable UI pieces. `css/sections.css` holds section-level layout.
- `js/app.js` is the single entry point: it wires data to components and mounts them. It
  MUST NOT contain rendering markup of its own.
- Files in `js/data/` MUST contain data only — no DOM access, no rendering, no side effects.
- Files in `js/components/` MUST contain rendering only — no embedded content literals.
- New sections (Certifications, Contact, About) extend the structure by adding a sibling
  module in `js/components/` and, where the section is data-driven, in `js/data/`.
- Static assets live under `assets/`. Adding new top-level directories requires the
  amendment procedure in Governance.

## Development Workflow & Quality Gates

**Testing scope** — tests MUST prioritize, in order:

1. Critical rendering logic (a component given known data produces the expected DOM).
2. Data integrity (every entry in `js/data/*` has required fields, valid types, valid
   URLs, and no broken asset references).
3. Accessibility regressions (landmarks, heading order, accessible names, contrast).
4. Responsive behavior at the supported breakpoints.

Tests MUST be written against component contracts and data schemas, never against specific
content values. Changing portfolio data MUST NOT require rewriting tests for unrelated UI
components — if it does, the test was coupled to content and MUST be rewritten.

Exhaustive unit coverage of trivial code is explicitly not a goal.

**Per-change gates** — every change MUST, before merge:

- Pass Principle I: no new content hardcoded in HTML or component logic.
- Pass Principle V: keyboard-operable, focus-visible, contrast-compliant, correctly labeled.
- Render correctly at mobile, tablet, and desktop widths.
- Introduce no new dependency without a recorded justification.
- Keep `index.html` a valid semantic document with intact heading hierarchy.

**Feature workflow**: features follow the Spec Kit flow — `/speckit-specify` →
`/speckit-plan` → `/speckit-tasks` → `/speckit-implement`. The plan's Constitution Check
gate MUST be evaluated against Principles I–IX before Phase 0 research and re-checked after
Phase 1 design.

## Governance

This constitution supersedes all other development practices, conventions, and habits in
this repository. Where a prior pattern in the codebase conflicts with a principle here, the
principle wins and the prior pattern is a migration debt to be tracked, not a precedent.

**Amendment procedure**: amendments MUST be made by editing this file, MUST include a
rationale in the Sync Impact Report comment at the top, MUST bump the version per the
policy below, and MUST update the "Last Amended" date. Any amendment that invalidates
existing code MUST name the migration work required.

**Versioning policy** (semantic versioning):

- **MAJOR**: a principle is removed or redefined in a backward-incompatible way, or
  governance rules change incompatibly.
- **MINOR**: a new principle or section is added, or existing guidance is materially
  expanded.
- **PATCH**: clarifications, wording, typo fixes, and non-semantic refinements.

**Compliance review**: every pull request MUST verify compliance with the per-change gates
above. Complexity that violates a principle MUST be recorded in the feature plan's
Complexity Tracking table with the specific need and the simpler alternative that was
rejected, and why. Unjustified complexity is grounds for rejection.

**Version**: 1.0.0 | **Ratified**: 2026-08-13 | **Last Amended**: 2026-08-13

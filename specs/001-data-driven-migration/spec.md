# Feature Specification: Data-Driven Structure Migration

**Feature Branch**: `001-data-driven-migration`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "Migrate the existing portfolio repository to the constitution-mandated structure and data-driven architecture: move img/ to assets/images|icons|fonts, split css/style.css + css/project-component-style.css into css/{variables,base,components,sections}.css, replace js/Project.js + js/projectCard.js + js/createProjectComponentYourSelfLikeMagic.js with js/app.js + js/components/{hero,experience,projects,skills,education}.js + js/data/{profile,experiences,projects,skills,education}.js, extract all hardcoded content out of index.html into data modules, while preserving the current visual appearance and content, and satisfying accessibility, mobile-first, performance and SEO principles."

## Current State (context for this migration)

The repository today is internally inconsistent, and this migration exists to resolve that:

- `index.html` is a self-contained page whose entire content is hardcoded in markup. It pulls
  its styling from a third-party CDN at request time and its typeface from a second CDN.
- `css/style.css` and `css/project-component-style.css` describe a **different, older visual
  design** (navy/purple palette) than the one `index.html` currently renders (dark
  grey/blue palette). **Neither CSS file is referenced by `index.html`.**
- `js/Project.js`, `js/projectCard.js`, and `js/createProjectComponentYourSelfLikeMagic.js`
  implement a project-card custom element that fetches project records from a remote host over
  an unencrypted connection. **None of these scripts are referenced by `index.html`.**
- `img/` contains a single unused illustration.
- The only script that actually runs on the page is an inline snippet that computes years of
  experience.

In short: roughly half the repository is dead code describing a design the live page does not
use, and the live page hardcodes every piece of content it displays.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Update portfolio content by editing one entry (Priority: P1)

The portfolio owner lands a new job, ships a new project, or earns a new certification. They
open the single data file for that kind of content, add or edit one entry, and the site
reflects the change — with no edits to page markup and no edits to rendering logic.

**Why this priority**: This is the entire point of the migration. Content changes are the most
frequent change to a portfolio; today every one of them means hand-editing markup and
copy-pasting sibling blocks. This story alone delivers a viable, valuable result.

**Independent Test**: Add one new project entry, one new skill within an existing group, and
one new certification entry, changing only content data. Confirm all three appear correctly on
the page and that no markup or rendering file was modified in the process.

**Acceptance Scenarios**:

1. **Given** the portfolio is published, **When** the owner adds a project entry containing
   title, description, and technologies used, **Then** a new project card appears in the
   Projects section styled identically to existing cards, and no markup file changed.
2. **Given** an existing project entry, **When** the owner removes that entry, **Then** its
   card disappears from the page and the remaining cards reflow without leaving a gap.
3. **Given** an existing certification entry, **When** the owner edits its title, **Then** the
   updated title renders on the page.
4. **Given** a content entry is missing an optional field, **When** the page renders, **Then**
   the corresponding element is omitted entirely rather than rendering an empty or broken
   fragment.
5. **Given** a content entry is missing a required field, **When** the page renders, **Then**
   the failure is surfaced to the owner during development rather than silently producing a
   blank card.

---

### User Story 2 - Visitor sees the same portfolio after the migration (Priority: P2)

A visitor who saw the portfolio before the migration visits it afterwards and finds the same
content, the same sections in the same order, and the same visual design. Nothing they could
previously read or click is missing.

**Why this priority**: The migration is a restructuring, not a redesign. Silent content or
behavior loss would make the migration a net negative regardless of how clean the structure is.

**Independent Test**: Capture the rendered page before and after the migration at mobile,
tablet, and desktop widths, and compare content inventory and layout side by side.

**Acceptance Scenarios**:

1. **Given** the pre-migration page, **When** the migrated page is loaded, **Then** every
   section present before (navigation, hero, skills, projects, certifications, contact,
   footer) is present after, in the same order.
2. **Given** the pre-migration page, **When** content is inventoried, **Then** every visible
   text string, link destination, and skill tag present before is present after.
3. **Given** the migrated page, **When** viewed at mobile, tablet, and desktop widths,
   **Then** the layout matches the pre-migration layout at each width.
4. **Given** the years-of-experience figure shown in the hero, **When** the page loads in any
   future year, **Then** it still computes correctly rather than being frozen at a fixed value.
5. **Given** the migrated page, **When** loaded with no network access to any third party,
   **Then** it renders fully and correctly styled.

---

### User Story 3 - Keyboard and screen-reader visitors can use the whole site (Priority: P3)

A visitor navigating by keyboard, or listening via a screen reader, can reach and understand
every section, every link, and every form field.

**Why this priority**: Accessibility is non-negotiable under the project constitution, and the
current page has concrete defects (form fields identified only by disappearing placeholder
text, a call-to-action that looks like a button but goes nowhere, decorative images with no
text alternative) that a restructuring is the natural moment to fix.

**Independent Test**: Traverse the entire page using only the keyboard, then again with a
screen reader, without using a mouse. Every interactive element must be reachable, visibly
focused, and announced with a meaningful name.

**Acceptance Scenarios**:

1. **Given** a keyboard-only visitor, **When** they tab through the page, **Then** every link,
   button, and form field receives focus in a logical order with a clearly visible focus
   indicator, and focus is never trapped.
2. **Given** a screen-reader visitor, **When** they navigate by landmark, **Then** navigation,
   main content, and footer are each announced as distinct regions.
3. **Given** a screen-reader visitor, **When** they navigate by heading, **Then** the headings
   form a single, correctly nested outline with exactly one top-level heading.
4. **Given** any form field, **When** it receives focus, **Then** its purpose is announced from
   a persistent label rather than from placeholder text alone.
5. **Given** any image or icon, **When** encountered by a screen reader, **Then** meaningful
   images are announced with a description and purely decorative ones are skipped.
6. **Given** any text on the page, **When** its contrast against its background is measured,
   **Then** it meets the WCAG 2.1 AA threshold.

---

### User Story 4 - The portfolio loads fast and previews correctly when shared (Priority: P4)

A recruiter opens the portfolio link on a phone over a mediocre mobile connection and sees
meaningful content almost immediately. When someone shares the link in a chat app or on social
media, a correct title, description, and preview image appear.

**Why this priority**: Speed and shareability are how the portfolio actually reaches people,
and the page is currently blocked on two third-party requests before it can render at all.

**Independent Test**: Load the published page on a throttled mobile connection and measure time
to meaningful content. Paste the published URL into a link-preview tool and inspect the result.

**Acceptance Scenarios**:

1. **Given** a visitor on a throttled mobile connection, **When** they open the portfolio,
   **Then** readable, correctly styled content appears without waiting on any third-party host.
2. **Given** the published page, **When** its outgoing requests are listed, **Then** no request
   is made to a host outside the portfolio's own domain.
3. **Given** the page loads, **When** images and layout settle, **Then** content does not jump
   or reflow as assets arrive.
4. **Given** the page URL is shared, **When** a preview is generated, **Then** it shows the
   owner's name, a descriptive summary, and a preview image.
5. **Given** a search crawler fetches the page, **When** it parses the response, **Then** it
   finds the owner's name, professional role, and primary links in the served document.

---

### Edge Cases

- **A content collection is empty** (for example, no education entries yet): the section is
  omitted entirely rather than rendering an empty heading over blank space.
- **A content entry is marked not-visible**: it is excluded from rendering, and the surrounding
  layout closes up with no gap. (The current project data model already carries a visibility
  flag; this behavior must survive the migration.)
- **An entry references a missing image**: the layout does not collapse or shift, and no broken
  image icon is shown.
- **A project has fewer technology tags than another**: the card renders only the tags present,
  with no empty tag chips. (The current implementation renders five fixed tag slots regardless
  of how many are filled — this defect must not be carried forward.)
- **Rendering fails entirely**: the visitor still sees the owner's name, professional role, and
  primary contact links rather than a blank page.
- **A visitor opens the page with an extremely long project title or description**: text wraps
  within its card rather than overflowing horizontally or forcing the page to scroll sideways.
- **A visitor has reduced-motion enabled**: hover and transition effects respect that
  preference.

## Requirements *(mandatory)*

### Functional Requirements

**Content as data**

- **FR-001**: All portfolio content — profile details, professional experiences, projects,
  skills, education, certifications, and social links — MUST be defined in centralized content
  data files, one file per content type.
- **FR-002**: Adding, editing, or removing a portfolio item MUST require changing only that
  item's data entry, with no change to page markup and no change to rendering logic.
- **FR-003**: Content data files MUST contain content only — no rendering instructions, no
  page-manipulation logic, and no side effects.
- **FR-004**: Rendering logic MUST contain no literal portfolio content.
- **FR-005**: Each content type MUST support a variable number of entries and a variable number
  of sub-items per entry (for example, a project's technology tags), with no fixed-count
  assumptions.
- **FR-006**: Each content type MUST define which of its fields are required and which are
  optional; missing optional fields MUST result in the corresponding element being omitted,
  and missing required fields MUST be surfaced as an error during development.

**Structure**

- **FR-007**: The repository MUST conform to the directory layout mandated by the project
  constitution, with content data, rendering logic, page structure, styles, and static assets
  each in their designated location.
- **FR-008**: The page MUST define semantic structure and section containers only; it MUST NOT
  duplicate content that is rendered from data.
- **FR-009**: Each portfolio section MUST be an independent unit that receives its content as
  input and can be rendered and verified on its own, without depending on any other section.
- **FR-010**: Sections MUST NOT share mutable global state; any coordination between them MUST
  be explicit.
- **FR-011**: Design values (colors, spacing, typography scales) MUST be defined once as named
  tokens and referenced everywhere else, rather than repeated as literal values.
- **FR-012**: All code, styles, and assets that are dead after the migration MUST be removed
  from the repository, not left in place alongside their replacements.

**Preservation**

- **FR-013**: Every section, visible text string, link destination, and skill tag present
  before the migration MUST be present after it.
- **FR-014**: The visual design MUST match the pre-migration appearance at mobile, tablet, and
  desktop widths.
- **FR-015**: The years-of-experience figure MUST continue to be derived at page load rather
  than hardcoded, so it stays correct over time.
- **FR-016**: The site's content language MUST remain unchanged.

**Independence from third parties**

- **FR-017**: The published page MUST render fully and correctly styled without requesting any
  resource from a host outside the portfolio's own domain.
- **FR-018**: Typefaces MUST be served from the portfolio's own domain.
- **FR-019**: Presentation MUST be produced by the portfolio's own stylesheets rather than by a
  third-party styling service fetched at page load.

**Accessibility**

- **FR-020**: The page MUST expose distinct navigation, main-content, and footer regions.
- **FR-021**: Headings MUST form a single correctly nested outline with exactly one top-level
  heading and no skipped levels.
- **FR-022**: Every interactive element MUST be reachable and operable by keyboard, in a
  logical order, with no keyboard trap.
- **FR-023**: Every focusable element MUST display a clearly visible focus indicator.
- **FR-024**: Every form field MUST have a persistent label that is not dependent on
  placeholder text.
- **FR-025**: Every element that behaves as a link MUST be a link, and every element that
  behaves as a button MUST be a button; controls MUST NOT merely look like the thing they are
  not.
- **FR-026**: Meaningful images and icons MUST carry a text alternative; decorative ones MUST
  be hidden from assistive technology.
- **FR-027**: All text MUST meet the WCAG 2.1 AA contrast threshold against its background.
- **FR-028**: Motion and transition effects MUST respect a visitor's reduced-motion preference.

**Responsiveness and performance**

- **FR-029**: The layout MUST be authored for the smallest supported viewport first and add
  complexity upward.
- **FR-030**: No content or control may be hidden on small screens as a substitute for
  designing it responsively.
- **FR-031**: The page MUST NOT scroll horizontally at any supported viewport width.
- **FR-032**: Images MUST be served at appropriate dimensions in modern formats, MUST reserve
  their space to prevent layout shift, and MUST defer loading when below the initial viewport.
- **FR-033**: The page MUST remain fully static, deployable to a content delivery network with
  no server-side runtime.

**Discoverability**

- **FR-034**: The page MUST provide a unique descriptive title and a summary description.
- **FR-035**: The page MUST provide social sharing metadata including a title, description, and
  preview image.
- **FR-036**: The page MUST declare its content language and its canonical address.
- **FR-037**: The owner's name, professional role, and primary links MUST be present in the
  served document rather than existing only after rendering logic runs.
- **FR-038**: Link text MUST describe its destination.

**Verification**

- **FR-039**: Automated checks MUST verify that each section, given known content, produces the
  expected result.
- **FR-040**: Automated checks MUST verify that every content entry satisfies its required
  fields, field types, and link validity, and references no missing assets.
- **FR-041**: Automated checks MUST be written against section contracts and content schemas,
  never against specific content values, so that changing portfolio content does not require
  rewriting checks for unrelated sections.

### Key Entities

- **Profile**: The portfolio owner's identity — name, professional role, summary statement, the
  year their professional experience began, profile image, and location. Referenced by the hero
  and contact sections and by the page's sharing metadata.
- **Social Link**: A named external presence — platform name, destination address, and icon.
  Belongs to Profile.
- **Experience**: A professional role — employer, title, start and end dates (end may be
  ongoing), summary, and notable achievements.
- **Project**: A piece of work — title, description, technologies used (variable count), source
  repository address, live address, preview image, and a visibility flag controlling whether it
  is shown.
- **Skill Group**: A named category of competencies (for example Frontend, Backend, Databases,
  Tooling, Mobile) containing a variable-length list of individual skills.
- **Education**: A course of study — institution, qualification, field, and period.
- **Certification**: An award or credential — title, issuing body, date or score, an icon, and
  an optional verification address.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The portfolio owner can add a new project, a new skill, and a new certification —
  and see all three live — by editing content data only, in under 5 minutes total, touching no
  more than one file per item.
- **SC-002**: A reviewer comparing the pre- and post-migration pages finds zero missing
  sections, zero missing text strings, and zero missing or changed link destinations.
- **SC-003**: The migrated page is visually indistinguishable from the pre-migration page at
  mobile, tablet, and desktop widths.
- **SC-004**: A visitor can reach and operate 100% of interactive elements using only the
  keyboard, with a visible focus indicator on every one.
- **SC-005**: An automated accessibility audit reports zero violations at the WCAG 2.1 AA level.
- **SC-006**: The page issues zero requests to hosts outside the portfolio's own domain.
- **SC-007**: On a throttled mobile connection, readable and correctly styled content appears in
  under 2 seconds.
- **SC-008**: Visible content does not shift measurably after initial render.
- **SC-009**: Sharing the published address in a chat or social application produces a preview
  showing the owner's name, a description, and an image.
- **SC-010**: No content or control is unreachable at any supported viewport width, and the page
  never scrolls horizontally.
- **SC-011**: After the migration, zero files in the repository are unreferenced by the
  published page.
- **SC-012**: Changing any portfolio content entry causes zero automated checks for unrelated
  sections to fail.
- **SC-013**: With rendering logic disabled, a visitor still sees the owner's name, professional
  role, and primary contact links.

## Assumptions

- **Design baseline**: The visual design to preserve is the one a visitor sees today — the dark
  grey/blue page that `index.html` currently renders. The navy/purple design in the orphaned
  stylesheets represents an abandoned earlier version and is treated as dead code to be removed,
  not as a design to restore. *(See Q1 below — this materially affects scope.)*
- **Third-party styling service**: The page's current dependence on a CDN-delivered styling
  framework is incompatible with the project constitution's vanilla-first and performance
  principles. The migration reproduces the current appearance using the project's own
  stylesheets and design tokens. This is the single largest piece of work in the migration.
- **Project data source**: Project content moves into a local content data file. The remote
  project service the orphaned scripts referenced is unreachable over a secure connection and
  would be blocked on the published site; wiring up a live content source is a separate future
  feature, noted in the repository's `next-steps.txt`.
- **Contact form**: The contact form has no submission destination today. The migration
  preserves it as a visible, correctly labeled, accessible form and does not introduce a
  submission backend. Making it actually send messages is a separate feature.
- **Sections present**: The migration covers the sections that exist today (navigation, hero,
  skills, projects, certifications, contact, footer). Sections named in the constitution's
  component list but absent from the site today — About, Experience, Education — get their
  content data files and rendering units created and wired, so adding a first entry later is
  purely a content change. *(See Q2 below.)*
- **Rendering approach**: The owner's name, professional role, and primary links appear in the
  served document; the remaining repeatable content is rendered from data at load. This
  satisfies the constitution's progressive-enhancement principle without introducing a build
  step.
- **Supported viewports**: Mobile from 320px, tablet, and desktop. No support target for legacy
  browsers lacking modern layout primitives.
- **Language**: The site's content remains in Brazilian Portuguese. Internationalization is out
  of scope.
- **Content accuracy**: Existing content is migrated as-is. Correcting or expanding the actual
  portfolio content (for example, the placeholder profile image, or the Projects section's
  single example project) is a content task, not part of this migration. *(See Q3 below.)*
- **Known defects fixed in passing**: Two defects in the current page are corrected as part of
  the migration because carrying them forward would violate the constitution — the social icon
  that renders the wrong platform's symbol, and the hero call-to-action that is a button leading
  nowhere.

## Outstanding Clarifications

- **Q1**: Confirm the design baseline — preserve the current dark grey/blue page and delete the
  orphaned navy/purple stylesheets, or restore the navy/purple design instead?
  [NEEDS CLARIFICATION: two conflicting designs exist in the repository; the choice determines
  which stylesheets are rebuilt and which are deleted]
- **Q2**: Confirm the treatment of the About, Experience, and Education sections, which the
  constitution names but the live site does not have.
  [NEEDS CLARIFICATION: create them empty and hidden until content exists, create them with real
  content now, or leave them out of this migration entirely]
- **Q3**: Confirm whether the Projects section ships with real project content or with the
  single placeholder project currently on the page.
  [NEEDS CLARIFICATION: the live page shows one example project and an HTML comment saying "add
  2 more"; the migration can carry that placeholder forward or the owner can supply real
  projects]

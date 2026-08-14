# Feature Specification: Data-Driven Structure Migration

**Feature Branch**: `001-data-driven-migration`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "Migrate the existing portfolio repository to the constitution-mandated structure and data-driven architecture: move img/ to assets/images|icons|fonts, split css/style.css + css/project-component-style.css into css/{variables,base,components,sections}.css, replace js/Project.js + js/projectCard.js + js/createProjectComponentYourSelfLikeMagic.js with js/app.js + js/components/{hero,experience,projects,skills,education}.js + js/data/{profile,experiences,projects,skills,education}.js, extract all hardcoded content out of index.html into data modules, while preserving the current visual appearance and content, and satisfying accessibility, mobile-first, performance and SEO principles."

## Current State (context for this migration)

The repository today is internally inconsistent, and this migration exists to resolve that:

- `index.html` is a self-contained page whose entire content is hardcoded in markup. It pulls
  its styling from a third-party CDN at request time and its typeface from a second CDN. It
  renders a dark grey/blue design.
- `css/style.css` and `css/project-component-style.css` describe a **different visual design**
  — the navy/purple palette that this feature restores. **Neither file is referenced by
  `index.html`.** They are also incomplete: they style a navigation menu, project cards,
  buttons, and a footer, and they reference classes (`.lottie`, `.li-iten-home`, `.scroll-iten`,
  `menu`) belonging to a page structure that no longer exists. They contain no styling for the
  skills grid, certifications, contact form, or hero section as those sections exist today.
- `js/Project.js`, `js/projectCard.js`, and `js/createProjectComponentYourSelfLikeMagic.js`
  implement a project-card custom element that fetches project records from a remote host over
  an unencrypted connection. **None of these scripts are referenced by `index.html`.**
- `img/` contains a single unused illustration.
- The only script that actually runs on the page is an inline snippet that computes years of
  experience.

In short: roughly half the repository is dead code describing a design the live page does not
use, and the live page hardcodes every piece of content it displays.

## Scope Note: this is a re-theme, not a pure restructuring

The chosen design direction is the navy/purple palette, which the live page does not currently
use. This feature therefore changes two things at once:

- **Content and structure**: preserved and moved into data (the migration proper).
- **Visual design**: intentionally changed from the current dark grey/blue appearance to the
  navy/purple palette.

Because the navy stylesheets cover only a fraction of the sections the site now has, the design
is **re-derived** from that palette and typography into a complete, mobile-first system — not
copied verbatim. The old stylesheets are a colour and type reference, not a specification.

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
6. **Given** a content collection is empty, **When** the page renders, **Then** its section is
   omitted entirely, and **When** the owner later adds the first entry, **Then** the section
   appears with no code change.

---

### User Story 2 - Visitor finds the same portfolio in a new theme (Priority: P2)

A visitor who saw the portfolio before returns afterwards. Everything they could previously
read or click is still there, in the same order — but the site now wears the navy/purple
design instead of the dark grey/blue one.

**Why this priority**: Content loss would make the migration a net negative no matter how clean
the resulting structure is. The visual change is intentional and expected; content and
navigation changes are not.

**Independent Test**: Inventory the pre-migration page's sections, text strings, and link
destinations, then confirm every one is present post-migration. Separately confirm the applied
theme matches the navy/purple palette at mobile, tablet, and desktop widths.

**Acceptance Scenarios**:

1. **Given** the pre-migration page, **When** the migrated page is loaded, **Then** every
   section present before (navigation, hero, skills, projects, certifications, contact,
   footer) is present after, in the same order.
2. **Given** the pre-migration page, **When** content is inventoried, **Then** every visible
   text string, link destination, and skill tag present before is present after.
3. **Given** the migrated page, **When** its colours and typeface are inspected, **Then** they
   follow the navy/purple palette and its designated typeface.
4. **Given** the migrated page, **When** viewed at mobile, tablet, and desktop widths, **Then**
   every section is laid out deliberately for that width, with no unstyled or broken region.
5. **Given** the years-of-experience figure shown in the hero, **When** the page loads in any
   future year, **Then** it still computes correctly rather than being frozen at a fixed value.
6. **Given** the migrated page, **When** loaded with no network access to any third party,
   **Then** it renders fully and correctly styled.

---

### User Story 3 - Keyboard and screen-reader visitors can use the whole site (Priority: P3)

A visitor navigating by keyboard, or listening via a screen reader, can reach and understand
every section, every link, and every form field.

**Why this priority**: Accessibility is non-negotiable under the project constitution. Both the
current page and the design being restored contain concrete defects — form fields identified
only by disappearing placeholder text, a call-to-action that looks like a button but goes
nowhere, hover-only tooltips, icon glyphs acting as controls, no focus styling anywhere, and a
navigation item hidden entirely below 720px. A restructuring is the moment to fix these, and
none may be carried forward.

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
7. **Given** supplementary information shown on pointer hover, **When** a keyboard-only visitor
   reaches that element, **Then** the same information is available to them.
8. **Given** any viewport width, **When** the navigation is rendered, **Then** every navigation
   destination remains reachable.

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

- **A content collection is empty** (Experience and Education ship empty): the section is
  omitted entirely rather than rendering an empty heading over blank space.
- **A content entry is marked not-visible**: it is excluded from rendering, and the surrounding
  layout closes up with no gap. (The current project data model already carries a visibility
  flag; this behavior must survive the migration.)
- **An entry references a missing image**: the layout does not collapse or shift, and no broken
  image icon is shown.
- **A project has fewer technology tags than another**: the card renders only the tags present,
  with no empty tag chips. (The current implementation renders five fixed tag slots regardless
  of how many are filled — this defect must not be carried forward.)
- **A project has no live address or no source address**: the corresponding link is omitted
  rather than rendering a link to nowhere.
- **Rendering fails entirely**: the visitor still sees the owner's name, professional role, and
  primary contact links rather than a blank page.
- **A visitor opens the page with an extremely long project title or description**: text wraps
  within its card rather than overflowing horizontally or forcing the page to scroll sideways.
- **A visitor has reduced-motion enabled**: hover and transition effects respect that
  preference.
- **A viewport falls between defined breakpoints**: the layout remains correct. (The current
  stylesheets define rules below 720px and above 740px, leaving widths in between unstyled —
  this gap must not be carried forward.)

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
- **FR-007**: A section whose content collection is empty MUST render nothing at all, and MUST
  begin rendering as soon as a first entry is added, with no code change.

**Structure**

- **FR-008**: The repository MUST conform to the directory layout mandated by the project
  constitution, with content data, rendering logic, page structure, styles, and static assets
  each in their designated location.
- **FR-009**: The page MUST define semantic structure and section containers only; it MUST NOT
  duplicate content that is rendered from data.
- **FR-010**: Each portfolio section MUST be an independent unit that receives its content as
  input and can be rendered and verified on its own, without depending on any other section.
- **FR-011**: Sections MUST NOT share mutable global state; any coordination between them MUST
  be explicit.
- **FR-012**: Design values (colours, spacing, typography scales) MUST be defined once as named
  tokens and referenced everywhere else, rather than repeated as literal values.
- **FR-013**: All code, styles, and assets that are dead after the migration MUST be removed
  from the repository, not left in place alongside their replacements.

**Content preservation and re-theme**

- **FR-014**: Every section, visible text string, link destination, and skill tag present
  before the migration MUST be present after it.
- **FR-015**: The visual design MUST apply the navy/purple palette and its designated typeface,
  re-derived into a complete system covering every section the site has, including the sections
  the reference stylesheets never covered.
- **FR-016**: Palette colours MUST be assigned roles that satisfy the contrast requirement in
  FR-030. The two darkest palette colours do not meet the AA threshold as text against the page
  background and MUST therefore be used as surface and fill colours behind light text, not as
  text or icon colours on the page background.
- **FR-017**: The years-of-experience figure MUST continue to be derived at page load rather
  than hardcoded, so it stays correct over time.
- **FR-018**: The site's content language MUST remain unchanged.

**Independence from third parties**

- **FR-019**: The published page MUST render fully and correctly styled without requesting any
  resource from a host outside the portfolio's own domain.
- **FR-020**: Typefaces MUST be served from the portfolio's own domain.
- **FR-021**: Presentation MUST be produced by the portfolio's own stylesheets rather than by a
  third-party styling service fetched at page load.
- **FR-022**: Icons MUST be served as local assets rather than fetched from a third-party icon
  service.

**Accessibility**

- **FR-023**: The page MUST expose distinct navigation, main-content, and footer regions.
- **FR-024**: Headings MUST form a single correctly nested outline with exactly one top-level
  heading and no skipped levels.
- **FR-025**: Every interactive element MUST be reachable and operable by keyboard, in a
  logical order, with no keyboard trap.
- **FR-026**: Every focusable element MUST display a clearly visible focus indicator.
- **FR-027**: Every form field MUST have a persistent label that is not dependent on
  placeholder text.
- **FR-028**: Every element that behaves as a link MUST be a link, and every element that
  behaves as a button MUST be a button; controls MUST NOT merely look like the thing they are
  not, and icon glyphs MUST NOT act as controls.
- **FR-029**: Meaningful images and icons MUST carry a text alternative; decorative ones MUST
  be hidden from assistive technology.
- **FR-030**: All text MUST meet the WCAG 2.1 AA contrast threshold against its background.
- **FR-031**: Information revealed on pointer hover MUST also be available to keyboard users.
- **FR-032**: Motion and transition effects MUST respect a visitor's reduced-motion preference.

**Responsiveness and performance**

- **FR-033**: The layout MUST be authored for the smallest supported viewport first and add
  complexity upward.
- **FR-034**: No content or control may be hidden on small screens as a substitute for
  designing it responsively.
- **FR-035**: The layout MUST be correct at every width across the supported range, with no
  unstyled gap between breakpoints.
- **FR-036**: The page MUST NOT scroll horizontally at any supported viewport width.
- **FR-037**: Images MUST be served at appropriate dimensions in modern formats, MUST reserve
  their space to prevent layout shift, and MUST defer loading when below the initial viewport.
- **FR-038**: The page MUST remain fully static, deployable to a content delivery network with
  no server-side runtime.

**Discoverability**

- **FR-039**: The page MUST provide a unique descriptive title and a summary description.
- **FR-040**: The page MUST provide social sharing metadata including a title, description, and
  preview image.
- **FR-041**: The page MUST declare its content language and its canonical address.
- **FR-042**: The owner's name, professional role, and primary links MUST be present in the
  served document rather than existing only after rendering logic runs.
- **FR-043**: Link text MUST describe its destination.

**Verification**

- **FR-044**: Automated checks MUST verify that each section, given known content, produces the
  expected result.
- **FR-045**: Automated checks MUST verify that every content entry satisfies its required
  fields, field types, and link validity, and references no missing assets.
- **FR-046**: Automated checks MUST be written against section contracts and content schemas,
  never against specific content values, so that changing portfolio content does not require
  rewriting checks for unrelated sections.

### Key Entities

- **Profile**: The portfolio owner's identity — name, professional role, summary statement, the
  year their professional experience began, profile image, and location. Referenced by the hero
  and contact sections and by the page's sharing metadata.
- **Social Link**: A named external presence — platform name, destination address, and icon.
  Belongs to Profile.
- **Experience**: A professional role — employer, title, start and end dates (end may be
  ongoing), summary, and notable achievements. Ships as an empty collection.
- **Project**: A piece of work — title, description, technologies used (variable count), source
  repository address, live address, preview image, and a visibility flag controlling whether it
  is shown. Content supplied by the owner (see Dependencies).
- **Skill Group**: A named category of competencies (Frontend, Backend, Databases, Tooling,
  Mobile) containing a variable-length list of individual skills.
- **Education**: A course of study — institution, qualification, field, and period. Ships as an
  empty collection.
- **Certification**: An award or credential — title, issuing body, date or score, an icon, and
  an optional verification address.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The portfolio owner can add a new project, a new skill, and a new certification —
  and see all three live — by editing content data only, in under 5 minutes total, touching no
  more than one file per item.
- **SC-002**: A reviewer comparing the pre- and post-migration pages finds zero missing
  sections, zero missing text strings, and zero missing or changed link destinations.
- **SC-003**: Every section renders in the navy/purple theme at mobile, tablet, and desktop
  widths, with zero unstyled or visually broken regions.
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
- **SC-014**: Adding a first Experience or Education entry makes that section appear with zero
  code changes.

## Dependencies

- **Real project content from the owner** — the Projects section ships with the owner's actual
  projects rather than the placeholder currently on the page. Each project needs: title,
  description, technologies used, source repository address, live address (if any), and a
  preview image. Implementation of the Projects section cannot be completed until this content
  is supplied. Every other section is unblocked, and the Projects section can be built and
  verified against sample content in the meantime.
- **A preview image for social sharing** (FR-040) and a **profile image** (currently a grey
  placeholder box) are needed to fully satisfy SC-009.
- **The published canonical address** is needed for FR-041.

## Assumptions

- **Design baseline**: The navy/purple palette (`#1A1A40`, `#270082`, `#7A0BC0`, `#FA58B6`,
  whitesmoke) and the Poppins typeface are the design direction. The current dark grey/blue
  appearance is intentionally discarded. Because the reference stylesheets cover only a
  fraction of the site's present sections and target a page structure that no longer exists,
  they are treated as a colour and type reference rather than as a literal specification.
- **Palette roles**: Light text on dark surfaces. The two darkest palette colours serve as
  surfaces and fills; the lightest two serve as text and accent. This preserves the palette
  while satisfying the contrast requirement.
- **Third-party styling service**: The page's current dependence on a CDN-delivered styling
  framework is incompatible with the constitution's vanilla-first and performance principles,
  and is removed. Reproducing the layout with the project's own stylesheets and design tokens
  is the single largest piece of work in this feature.
- **Absent sections**: Experience and Education get their content data files and rendering
  units created and wired, shipping with empty collections so nothing renders until the owner
  adds a first entry. An About section is treated as part of the hero's summary content rather
  than as a separate section, since no distinct About content exists.
- **Project data source**: Project content lives in a local content data file. The remote
  project service the orphaned scripts referenced is unreachable over a secure connection and
  would be blocked on the published site; wiring up a live content source is a separate future
  feature, noted in the repository's `next-steps.txt`.
- **Contact form**: The form has no submission destination today. This feature preserves it as
  a visible, correctly labeled, accessible form and does not introduce a submission backend.
  Making it actually send messages is a separate feature.
- **Rendering approach**: The owner's name, professional role, and primary links appear in the
  served document; the remaining repeatable content is rendered from data at load. This
  satisfies the constitution's progressive-enhancement principle without introducing a build
  step.
- **Supported viewports**: Mobile from 320px, tablet, and desktop. No support target for legacy
  browsers lacking modern layout primitives.
- **Language**: The site's content remains in Brazilian Portuguese. Internationalization is out
  of scope.
- **Known defects fixed in passing**: Defects that would violate the constitution if carried
  forward are corrected as part of this work — the social icon rendering the wrong platform's
  symbol, the hero call-to-action that is a button leading nowhere, the hover-only tooltips,
  the icon glyphs used as controls, the navigation item hidden below 720px, the fixed five-slot
  technology tags, and the unstyled gap between the 720px and 740px breakpoints.

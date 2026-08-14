# Feature Specification: Recruiter-Focused Portfolio Refactor

**Feature Branch**: `003-recruiter-portfolio-refactor`

**Created**: 2026-08-14

**Status**: Draft

**Input**: User description: "Refactor the existing static portfolio into a recruiter-focused,
data-driven portfolio application." Full brief supplied inline: information-architecture
reorder, three new sections (About, Engineering Philosophy, Community), Selected Work as case
studies, an extended profile model, accessible navigation, a strengthened closing CTA, and
accessibility / responsive / performance / SEO treated as first-class. Three owner decisions
constrain the brief and override it where they conflict:

1. **Content stays Portuguese (pt-BR).** The brief's "use English as the primary content
   language" is explicitly declined. Every existing Portuguese string is preserved.
2. **This is feature 003, specified in full**, not an amendment to feature 002.
3. **Selected Work and Community ship with empty data.** Schema, renderer, styling and tests
   are complete; the arrays are empty until the owner supplies real content.

## Overview

The portfolio is already data-driven (feature 001) and already states the owner's real CV
content (feature 002). What it does not do is *position* the owner. A recruiter landing on the
page today meets a bare name, a one-line role, and then — immediately — a skills list. The
sections appear in an order that answers "what technologies does he know?" before it answers
"who is this and what has he built?", there is no About section, nothing communicates how the
owner approaches engineering, nothing shows community leadership, and the only project on the
page is an acknowledged placeholder.

This feature restructures the site around the question a recruiter is actually asking, in the
order they ask it: **who are you → what have you done → what can you build → how do you think →
what else demonstrates seniority → how do I contact you.**

Three sections are added (About, Engineering Philosophy, Community). One is re-conceived
(Projects → Selected Work, as case studies rather than a gallery). The Hero is redesigned around
a positioning statement rather than a job title. Navigation is extended to reach every section
and made usable on a phone. The closing call to action is made prominent.

Two entities — Selected Work and Community — ship with **no entries**. This is deliberate and is
a first-class requirement, not a shortcut: the owner has not yet supplied real case studies or
real community metrics, and inventing either is forbidden. The feature therefore delivers the
complete machinery (schema, renderer, styles, fixtures, tests) exercised against test fixtures,
plus the guarantee that an empty collection leaves no trace on the page. Populating them later
is a pure data edit.

**Not in scope**: translating content, changing the stack, adding a build step, adding
dependencies, or inventing any fact the owner has not supplied.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recruiter grasps the owner's positioning in the first ten seconds (Priority: P1) 🎯 MVP

A recruiter opens the portfolio from a shared link, almost always on a phone, and gives it a few
seconds before deciding whether to keep scrolling. Today the first screen offers a name, the
words "Software Engineer com +4 anos de experiência", a one-sentence summary, and a single
"Vamos conversar" button. It states a job title but makes no claim about value — nothing tells
the recruiter what kind of engineer this is, what they are known for, or whether they are
available. Scrolling further lands on a technology list, which is the least differentiating
content on the page.

This story delivers a Hero built around a professional positioning statement, an About section
that gives the recruiter a credible two-paragraph read on background and direction, and the
reordered section flow that puts identity and track record before technology inventory.

**Why this priority**: it is the only part of the page a majority of visitors will ever see, and
it governs whether the rest is read at all. It is also the largest single gap between what the
site says and what the owner is. It is shippable entirely on its own: the reorder plus a Hero and
About improvement is a coherent, deployable improvement even if no other story lands.

**Independent Test**: load the page on a phone-width viewport, read only what is visible before
scrolling, then scroll once. Confirm the positioning statement, availability and both calls to
action are present above the fold, that About follows immediately, and that Experience precedes
Skills. No other section need change for this to be verifiable.

**Acceptance Scenarios**:

1. **Given** a visitor loads the page, **When** the first screen renders, **Then** the owner's
   name, professional role, a positioning statement, a short supporting description, a primary
   call to action, a secondary call to action, and links to GitHub and LinkedIn are all present.
2. **Given** the Hero renders, **When** a recruiter reads it, **Then** it states professional
   value rather than a generic self-description, and every string it displays originates from the
   single identity data source.
3. **Given** a visitor scrolls past the Hero, **When** the next section renders, **Then** it is
   About, and it communicates professional background, the kinds of systems the owner builds, and
   career direction in a form readable in under thirty seconds.
4. **Given** a visitor scrolls the whole page, **When** they pass each section, **Then** the order
   is Hero, About, Experience, Selected Work, Skills, Engineering Philosophy, Community,
   Education, Certifications, Contact — with any section whose data is empty simply absent.
5. **Given** a visitor loads the page with scripts blocked or failing, **When** the page renders,
   **Then** the name, role, positioning statement and About content are still readable.
6. **Given** the owner edits the positioning statement in the identity data source, **When** the
   page is reloaded, **Then** the change appears everywhere it is displayed, with no other file
   edited.

---

### User Story 2 - Recruiter evaluates the owner's work as engineering case studies (Priority: P2)

A recruiter who is convinced by the headline wants proof of building capability. Today the
Projects section contains exactly one entry — "Plataforma E-commerce" — which is fictional,
carries no links, and was explicitly whitelisted as a placeholder in the previous feature. A
recruiter reading it learns nothing, and a recruiter who suspects it is filler learns something
worse.

This story replaces the gallery concept with a case-study concept: an entry can carry a tagline,
the problem it addressed, the solution, the owner's role, the architecture, and the result, in
addition to the existing title, description, technologies, repository link, live link and image.
Every one of those fields is optional, so an entry with only a title and description still
renders correctly. The placeholder entry is deleted and the collection ships empty, so the
section does not appear at all until the owner supplies real work.

**Why this priority**: "what can you build" is the second question every technical evaluation
asks, and the current answer actively damages credibility. It ranks below positioning only
because a recruiter who bounces at the Hero never reaches it.

**Independent Test**: with the collection empty, load the page and confirm no Selected Work
section exists anywhere — no heading, no gap, no empty container. Then, in a test harness, render
the component against fixture entries covering a full case study, a minimal entry, and every
individual optional field being absent, and confirm each renders correctly with no empty
elements. Verifiable without touching any other section.

**Acceptance Scenarios**:

1. **Given** the Selected Work collection is empty, **When** the page renders, **Then** the
   section is absent entirely — no heading, no container, no reserved space.
2. **Given** an entry carries problem, solution, architecture and result, **When** it renders,
   **Then** those four appear as clearly distinguished, labelled parts of a single case study
   rather than as one undifferentiated paragraph.
3. **Given** an entry omits any optional field, **When** it renders, **Then** that field produces
   no element at all — not an empty one, not a label with nothing after it, and not a stray
   separator.
4. **Given** an entry carries a repository link, a live link or a case-study link, **When** it
   renders, **Then** each link has a description that identifies its destination without relying
   on surrounding context.
5. **Given** an entry carries an image, **When** the page loads, **Then** the image reserves its
   space before loading so nothing shifts, and it is not fetched until it is needed.
6. **Given** the owner adds an entry to the collection, **When** the page is reloaded, **Then**
   the section appears with that entry, with no change to the page structure.
7. **Given** the collection contains entries, **When** they render, **Then** the display order is
   the collection's own order.

---

### User Story 3 - Recruiter understands how the owner approaches engineering (Priority: P3)

An engineering manager comparing candidates with similar stacks is choosing on judgement, not on
technology lists. Nothing on the site currently speaks to how the owner thinks about
architecture, quality, testing, automation or product trade-offs — the reader is left to infer it
from a chip labelled "Arquitetura de Software".

This story adds an Engineering Philosophy section ("Como Trabalho") backed by its own data
source: a small set of named principles, each with a short, concrete statement. It is the section
that separates a senior engineer from a technology list.

**Why this priority**: it is the highest-signal content for the specific audience the site is
being built for, but it is persuasion rather than evidence, so it ranks below the record of what
the owner has actually done and built.

**Independent Test**: load the page and read the section in isolation; confirm each principle is
concrete enough that a reader could disagree with it. In a test harness, confirm an entry missing
its optional detail renders as a title alone rather than as a title with an empty body.

**Acceptance Scenarios**:

1. **Given** the principles collection has entries, **When** the page renders, **Then** the
   section appears between Skills and Community with a heading and one item per principle.
2. **Given** a principle renders, **When** a recruiter reads it, **Then** it states a specific
   position rather than an unfalsifiable virtue.
3. **Given** a principle omits its supporting detail, **When** it renders, **Then** only its title
   appears, with no empty body element.
4. **Given** the collection is empty, **When** the page renders, **Then** the section is absent
   entirely.
5. **Given** the owner adds, reorders or removes a principle in the data source, **When** the page
   is reloaded, **Then** the section reflects it with no other file edited.

---

### User Story 4 - Recruiter sees evidence of leadership beyond the day job (Priority: P4)

Community involvement — organising a user group, speaking, mentoring, contributing to open
source — is one of the strongest available signals of seniority, and the site currently shows
none of it.

This story adds a Community section backed by its own data source, supporting an activity's
organisation, role, period, description, links, and optional real metrics such as member counts,
events organised or talks given. As with Selected Work, the collection ships **empty** and the
section therefore does not appear until the owner supplies real values. No metric may be
estimated, rounded up, or invented.

**Why this priority**: high signal, but it is supporting evidence rather than a primary
qualification, and it is the section furthest from the recruiter's first question. It also has no
content yet, so the visible outcome of shipping it is deliberately nothing.

**Independent Test**: with the collection empty, confirm the section is absent from the rendered
page. In a test harness, render fixtures covering an activity with metrics, one without, one
missing its period, and one missing links, and confirm each renders without empty elements.

**Acceptance Scenarios**:

1. **Given** the community collection is empty, **When** the page renders, **Then** the section is
   absent entirely.
2. **Given** an activity carries metrics, **When** it renders, **Then** each metric shows its
   value and what it counts, and no metric appears that is not present in the data.
3. **Given** an activity omits metrics, a period, or links, **When** it renders, **Then** no empty
   element or dangling label is produced for the absent field.
4. **Given** an activity carries a link, **When** it renders, **Then** the link's description
   identifies its destination without relying on surrounding context.
5. **Given** the owner adds an activity to the collection, **When** the page is reloaded, **Then**
   the section appears with that activity, with no change to the page structure.

---

### User Story 5 - Visitor navigates the whole page and makes contact from any device (Priority: P5)

A recruiter on a phone needs to reach a specific section quickly and then act. Today the
navigation offers five links — Home, Skills, Projetos, Certificações, Contato — which omit
Experience and Education entirely and will omit all three new sections. There is no mobile
navigation affordance. At the bottom of the page, the closing section is a form with a static
contact list above it and no statement of what the owner is open to.

This story extends navigation to reach every section that exists, adds an accessible mobile
navigation, applies smooth anchor scrolling that yields to a reduced-motion preference, and
strengthens the closing call to action with an availability statement and every contact route —
email, LinkedIn, GitHub and CV — sourced from the identity data.

**Why this priority**: it is the conversion step. It ranks below the content stories because a
navigation improvement to sections that do not yet say anything worth reaching is premature, but
it is what turns a good impression into a message.

**Independent Test**: at phone, tablet and desktop widths, open the navigation, follow every link,
confirm each lands on its section, then exercise every contact route and confirm each destination
matches the owner's real details. Repeat the whole path using only a keyboard.

**Acceptance Scenarios**:

1. **Given** a visitor uses the navigation, **When** they open it, **Then** it offers a link to
   every section currently present on the page and to no section that is absent.
2. **Given** a visitor is on a narrow viewport, **When** they open the navigation, **Then** it is
   fully operable by both pointer and keyboard, its open/closed state is conveyed to assistive
   technology, and it can be dismissed without leaving the page.
3. **Given** a visitor activates a navigation link, **When** the page scrolls, **Then** it scrolls
   smoothly — unless the visitor has expressed a preference for reduced motion, in which case it
   jumps immediately.
4. **Given** a visitor reaches the closing section, **When** they read it, **Then** it states what
   the owner is open to and presents email, LinkedIn, GitHub and CV as distinct routes.
5. **Given** the closing section renders, **When** a visitor reads any contact route, **Then** its
   description identifies the destination on its own — never "clique aqui".
6. **Given** a visitor has scripts blocked or failing, **When** they reach the closing section,
   **Then** the location and email address are still visible and the email address is still
   actionable.
7. **Given** the owner has not supplied a CV link, **When** the closing section renders, **Then**
   no CV route appears at all, rather than a broken or empty one.

---

### User Story 6 - The site withstands the scrutiny it invites (Priority: P6)

The portfolio's closing argument is that it is itself a work sample. That argument fails if the
page has an inconsistent heading structure, overflows on a phone, shows an empty section skeleton
when a script fails, or claims a copyright year two years in the past. Eight automated checks
currently fail against the page and have been carried as known defects since the previous
feature; several of them sit directly on top of what this feature changes.

This story closes them: the heading hierarchy is made consistent, horizontal overflow is
eliminated at every supported width, the no-script experience shows real content rather than
empty section skeletons, the duplicated LinkedIn destination is resolved, the footer year stops
being a hardcoded literal, and the accessibility audit passes with scripts both enabled and
disabled.

**Why this priority**: it is the last story because most of it is only verifiable once the other
five have landed — several of the current failures are caused by content and structure this
feature is replacing. It is not optional: it is the story that makes the site's own claim true.

**Independent Test**: run the full automated suite and confirm it is green with no known-failure
exemptions. Then load the page with scripts disabled and confirm every visible section contains
real content.

**Acceptance Scenarios**:

1. **Given** the full automated suite runs, **When** it completes, **Then** every check passes,
   with no test carried as a known failure.
2. **Given** a visitor loads the page with scripts disabled, **When** it renders, **Then** every
   section heading that appears is followed by real content — no section renders as a heading
   above an empty region.
3. **Given** a visitor views the page at any supported width, **When** they scroll, **Then** the
   page never scrolls horizontally and no element overflows its container.
4. **Given** the page renders, **When** its heading structure is inspected, **Then** there is
   exactly one top-level heading and no level is skipped.
5. **Given** the page renders, **When** the footer is read, **Then** the copyright year is current
   and stays current without a content edit.
6. **Given** an accessibility audit runs at phone, tablet and desktop widths with scripts both
   enabled and disabled, **When** it completes, **Then** it reports no violations.
7. **Given** a visitor shares the page link, **When** the preview renders, **Then** the title,
   description and preview image agree with the page's own content.

---

### Edge Cases

- **A collection is empty.** The section must not exist: no heading, no container, no reserved
  space, no gap between the sections that surround it. This is the shipped state for Selected Work
  and Community, so it is the common case, not the exception.
- **A collection is empty *and* scripts are disabled.** The section still must not appear as an
  empty skeleton. This is the case the current implementation gets wrong.
- **An entry omits every optional field.** It must render as a valid, complete-looking item built
  only from its required fields.
- **A case study carries problem and result but not solution or architecture.** The two present
  parts must render as labelled parts; the two absent ones must produce nothing, and no separator
  or heading may be left orphaned.
- **A community activity carries zero as a metric value.** Zero is a real value and must render;
  it must not be treated as absent.
- **A case study or activity carries a very long title or a very long line of body text.** It must
  wrap inside its container at the narrowest supported width. This is the cause of a currently
  failing overflow check.
- **The owner has not supplied a CV link.** Every affordance that would point at it is omitted
  rather than rendered inert.
- **The same destination is reachable from two places on the page** (LinkedIn appears in both the
  Hero and the closing section). This must be a deliberate, defensible choice rather than an
  accident, and must not break assumptions about link uniqueness.
- **A rendering failure in one section.** Every other section must still render, and the failing
  section must leave no partial or empty remains.
- **The owner reorders a collection.** Display order follows collection order, with no sort at
  render time.
- **A visitor has expressed a reduced-motion preference.** Every motion the page introduces must
  yield to it, including the new navigation.

## Requirements *(mandatory)*

### Functional Requirements

#### Information architecture and navigation

- **FR-001**: The page MUST present its sections in the order Hero, About, Experience, Selected
  Work, Skills, Engineering Philosophy, Community, Education, Certifications, Contact.
- **FR-002**: A section whose backing collection is empty MUST be absent from the rendered page
  entirely — no heading, no container, no reserved vertical space.
- **FR-003**: FR-002 MUST hold whether or not scripts execute successfully.
- **FR-004**: Navigation MUST offer a link to every section present on the page, and MUST NOT
  offer a link to a section that is absent.
- **FR-005**: Navigation MUST be fully operable on the narrowest supported viewport, by both
  pointer and keyboard.
- **FR-006**: The state of any collapsible navigation MUST be conveyed to assistive technology and
  MUST be dismissible without navigating away.
- **FR-007**: Activating a navigation link MUST move the visitor to that section, smoothly by
  default and immediately when a reduced-motion preference is expressed.
- **FR-008**: Navigation MUST use real, crawlable links, never script-only navigation.

#### Identity, Hero and About

- **FR-009**: A single identity data source MUST be the origin of the owner's name, role,
  positioning statement, supporting description, availability, location, email, CV link, portrait,
  social links, primary call to action and secondary call to action.
- **FR-010**: No value in FR-009 may be duplicated as an independently editable literal anywhere
  except where a value is deliberately mirrored to survive a script failure, in which case the
  mirror MUST be verified to match its source exactly.
- **FR-011**: The Hero MUST display name, role, positioning statement, supporting description,
  primary call to action, secondary call to action, and links to GitHub and LinkedIn.
- **FR-012**: The Hero's copy MUST state professional value; a generic self-description such as
  "desenvolvedor apaixonado" is a defect.
- **FR-013**: The Hero MUST display the owner's availability when the identity source states one,
  and display nothing in its place when it does not.
- **FR-014**: The primary and secondary calls to action MUST each carry a label and a destination
  from the identity source, and MUST be omitted entirely when their destination is absent.
- **FR-015**: An About section MUST communicate professional background, engineering interests, the
  kinds of systems the owner builds, professional mindset and career direction.
- **FR-016**: About MUST be concise enough to read in under thirty seconds; it is not a biography.
- **FR-017**: About's content MUST originate from the identity data source.
- **FR-018**: The owner's name, role, positioning statement, About content, location and email MUST
  be present in the served document so they survive a script failure.

#### Selected Work

- **FR-019**: The section currently titled "Projetos Recentes" MUST be re-presented as Selected
  Work, in Portuguese.
- **FR-020**: A work entry MUST support: title, description, technologies, tagline, problem,
  solution, the owner's role, architecture, impact or results, repository link, live link,
  case-study link, image and image description.
- **FR-021**: Of FR-020, only title and description MUST be required; every other field MUST be
  optional.
- **FR-022**: When an entry carries problem, solution, architecture or result, each MUST render as
  a distinguishable, labelled part of the entry.
- **FR-023**: An absent optional field MUST produce no element, no label and no separator.
- **FR-024**: The existing placeholder entry "Plataforma E-commerce" MUST be removed, together with
  the test whitelist that justified it.
- **FR-025**: The Selected Work collection MUST ship empty.
- **FR-026**: Adding, removing or reordering a work entry MUST require editing only the work data
  source.
- **FR-027**: Where an entry carries an image, the image MUST reserve its space before loading and
  MUST NOT be fetched until it is needed.

#### Engineering Philosophy

- **FR-028**: An Engineering Philosophy section MUST exist, presented in Portuguese (for example
  "Como Trabalho"), backed by its own data source.
- **FR-029**: A principle MUST support a title and a supporting statement, of which only the title
  is required.
- **FR-030**: Principles MUST be concrete and specific; an unfalsifiable virtue statement does not
  satisfy FR-030.
- **FR-031**: The Engineering Philosophy collection MUST ship with real content authored from the
  owner's evidenced practices.
- **FR-032**: Adding, removing or reordering a principle MUST require editing only the principles
  data source.

#### Community

- **FR-033**: A Community section MUST exist, backed by its own data source.
- **FR-034**: A community activity MUST support: organisation, the owner's role, period,
  description, links and metrics. Only organisation and role MUST be required.
- **FR-035**: A metric MUST carry both a value and a statement of what it counts, and MUST render
  only when present in the data.
- **FR-036**: A metric value of zero MUST be treated as a real value and rendered.
- **FR-037**: No metric may be estimated, rounded, extrapolated or invented.
- **FR-038**: The Community collection MUST ship empty.

#### Contact and final call to action

- **FR-039**: The closing section MUST state what the owner is open to — opportunities, remote
  roles, interesting projects, collaborations.
- **FR-040**: The closing section MUST present email, LinkedIn, GitHub and CV as distinct contact
  routes, each sourced from the identity data.
- **FR-041**: A contact route whose destination is absent from the identity data MUST be omitted
  entirely rather than rendered inert.
- **FR-042**: The closing call to action MUST be visually prominent without being sales-oriented.
- **FR-043**: The existing static contact details and contact form MUST be preserved.

#### Optional-data resilience

- **FR-044**: Every renderer MUST tolerate the absence of every optional field without throwing.
- **FR-045**: No renderer may emit an element that would be visually empty.
- **FR-046**: A failure in one section's rendering MUST NOT prevent any other section from
  rendering.
- **FR-047**: A section whose rendering fails MUST leave no partial or empty remains.
- **FR-048**: Display order MUST follow collection order; no sorting may occur at render time.
- **FR-049**: Every collection MUST render correctly when empty, when holding one entry, and when
  holding many.

#### Preservation

- **FR-050**: All content MUST remain in Portuguese (pt-BR), and the document's declared language
  and social-preview locale MUST remain pt-BR.
- **FR-051**: The CV content delivered by feature 002 — three professional experiences, six skill
  groups with nineteen skills, two education entries, two certifications, and the owner's identity,
  location and email — MUST be preserved verbatim.
- **FR-052**: The owner's phone number MUST NOT appear anywhere in the delivered site.
- **FR-053**: The site MUST remain a static, buildless deployment servable from a CDN.
- **FR-054**: No framework, and no new runtime dependency, may be introduced.
- **FR-055**: The existing four-stylesheet organisation MUST be preserved, and colour values MUST
  continue to originate from the design-token stylesheet.
- **FR-056**: No new automated-testing framework may be introduced; the existing suites MUST be
  extended.
- **FR-057**: The entry point MUST remain a wiring layer that produces no markup of its own.

#### Presentation quality

- **FR-058**: Every rendered view MUST be operable by keyboard alone, in a logical order, with no
  keyboard trap, and every focusable element MUST show a visible focus indicator.
- **FR-059**: Every link and control MUST have a description that identifies its destination or
  action without relying on surrounding context.
- **FR-060**: Meaningful images MUST carry a description; decorative images MUST be marked as
  decorative.
- **FR-061**: Text and interface boundaries MUST meet WCAG 2.1 AA contrast.
- **FR-062**: Assistive-technology annotations MUST be used only where a native element cannot
  express the meaning.
- **FR-063**: An automated accessibility audit MUST report no violations at phone, tablet and
  desktop widths, with scripts both enabled and disabled.
- **FR-064**: Layouts MUST be authored smallest-viewport-first and MUST adapt typography, spacing,
  navigation, cards, timeline, grids, calls to action and imagery rather than scaling a desktop
  layout down.
- **FR-065**: The page MUST NOT scroll horizontally, and no element may overflow its container, at
  any supported width.
- **FR-066**: Below-the-fold imagery MUST be deferred; above-the-fold imagery MUST be prioritised.
- **FR-067**: The page MUST NOT introduce additional network requests or render-blocking resources.
- **FR-068**: The page MUST carry a descriptive title, meta description, canonical URL, social
  preview metadata, and structured data describing the owner as a person, without keyword stuffing.
- **FR-069**: The heading structure MUST have exactly one top-level heading and MUST skip no level.
- **FR-070**: Visual treatment MUST prioritise typography, spacing, hierarchy, contrast, alignment
  and consistency, and MUST avoid heavy animation, gradients, glassmorphism and oversized
  decorative elements.

#### Defect remediation

- **FR-071**: Every automated check MUST pass on completion; no check may be carried as a known
  failure.
- **FR-072**: The footer's copyright year MUST be current and MUST remain current without a
  content edit.
- **FR-073**: A destination reachable from two places on the page MUST be a deliberate choice, and
  MUST NOT cause a check to fail on an assumption of uniqueness.
- **FR-074**: With scripts disabled, no section heading may appear above an empty region.
- **FR-075**: The rendered social preview image MUST agree with the page's own title and
  description.

### Key Entities

- **Profile** *(extended)*: the single source of identity and positioning. Existing: name, role,
  summary, career start year, location, email, social links. Added: headline (positioning
  statement), availability, about content, CV link, portrait, primary call to action, secondary
  call to action. Consumed by Hero, About, Contact and page metadata.
- **Work Entry** *(extended, formerly Project)*: one piece of showcased engineering, presented as a
  case study. Required: title, description. Optional: tagline, problem, solution, owner's role,
  architecture, impact/results, technologies, repository link, live link, case-study link, image,
  image description, visibility flag. **Ships as an empty collection.**
- **Principle** *(new)*: one stated position on how the owner approaches engineering. Required:
  title. Optional: supporting statement. Ships with real content.
- **Community Activity** *(new)*: one instance of technical-community participation. Required:
  organisation, owner's role. Optional: period, description, links, metrics. **Ships as an empty
  collection.**
- **Metric** *(new, belongs to Community Activity)*: one countable fact about an activity. Required:
  value, and a statement of what is counted. Values are real or the metric is absent.
- **Experience**, **Skill Group**, **Education Entry**, **Certification** *(unchanged)*: carried
  forward from feature 002 with their content intact. Only their position in the page order and
  their visual treatment change.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A recruiter can state who the owner is, what they build and what they are open to
  after reading only the first screen on a phone, without scrolling.
- **SC-002**: The section order read top to bottom is Hero, About, Experience, Selected Work,
  Skills, Engineering Philosophy, Community, Education, Certifications, Contact, with empty
  sections absent.
- **SC-003**: The rendered page contains no Selected Work section and no Community section while
  their collections are empty — verified as the absence of any heading, container or gap.
- **SC-004**: Adding one entry to the Selected Work collection makes the section appear, correctly
  rendered, with no file edited other than that data source. The same holds for Community.
- **SC-005**: Every case-study field can be individually removed from an entry, and in each of the
  resulting variations the entry renders with no empty element and no orphaned label.
- **SC-006**: Changing the positioning statement, availability, CV link, or any social link
  requires editing exactly one file.
- **SC-007**: The page states no fact the owner has not supplied — specifically, zero fabricated
  projects, zero fabricated metrics and zero invented dates.
- **SC-008**: The full automated suite passes with zero failures and zero known-failure exemptions.
- **SC-009**: An automated accessibility audit reports zero violations at phone, tablet and desktop
  widths, with scripts both enabled and disabled.
- **SC-010**: The entire page — including opening and using the navigation on a narrow viewport —
  is operable using only a keyboard, with a visible focus indicator at every step.
- **SC-011**: At every supported width the page does not scroll horizontally and no element
  overflows its container, including with the longest content the data can contain.
- **SC-012**: With scripts disabled, name, role, positioning statement, About content, location and
  email are all readable, and no section heading appears above an empty region.
- **SC-013**: A rendering failure in any one section leaves every other section intact.
- **SC-014**: The delivered site adds zero dependencies, zero build steps and zero new stylesheets,
  and remains deployable as static files.
- **SC-015**: The nineteen skills, three experiences, two education entries and two certifications
  from feature 002 are all still present and unaltered in wording.
- **SC-016**: A shared link previews with a title, description and image that agree with the page.
- **SC-017**: The footer states the current year without any content edit having been made.
- **SC-018**: All content is Portuguese; the page declares pt-BR.

## Out of Scope

- **Translating the site to English, or adding a language switcher.** Explicitly declined by the
  owner. The brief's international-positioning goal is met through structure and presentation.
- **Supplying real Selected Work or Community content.** The owner will provide it later; this
  feature delivers the machinery and ships the collections empty.
- **Adding years to the education entries.** The source CV dates neither qualification and
  inventing dates is forbidden. The entries stay undated.
- **Replacing the Hero portrait with a photograph.** The current abstract illustration is a
  deliberate stand-in; swapping it is a one-file asset change, not feature work.
- **Making the contact form actually submit.** It has no backend today and gaining one would
  require a runtime dependency.
- **Any framework, build step, bundler or CSS toolchain.**

## Assumptions

- **About content is authored by the owner in Portuguese and stored in the identity data source.**
  It is drawn from the existing professional summary and CV, so it introduces no new claims.
- **Engineering Philosophy content is authored from practices already evidenced in the owner's
  experience data** — code review, incremental legacy modernisation, observability, mentoring,
  performance work, and specification-driven / AI-assisted development. Nothing is invented; each
  principle traces to something the CV already states.
- **A CV link may not exist yet.** Every affordance pointing at one is treated as optional and is
  omitted when the link is absent, rather than blocking the feature.
- **The secondary call to action defaults to the CV when one exists, and to the GitHub profile
  otherwise**, with the primary call to action remaining a route to contact.
- **"Selected Work" is rendered in Portuguese**; the English phrase is the brief's label for the
  concept, not required page copy.
- **Empty-collection sections are verified through fixtures**, since the shipped data cannot
  exercise the populated path. Fixture content is fictional and distinguishable from real content.
- **The eight currently-failing automated checks are in scope.** Six of them sit on structure this
  feature replaces (section count, project overflow, heading nesting, duplicated LinkedIn
  destination, and the empty-section behaviour). Fixing the remaining two is cheaper than
  maintaining an exemption list that the feature's own success criteria contradict.
- **Structured data describes the owner as a person**, using the same facts already on the page;
  it adds no new claims.
- **Supported widths are phone, tablet, desktop and large desktop**, consistent with the
  breakpoints the existing responsive checks already exercise.

## Dependencies

- **Owner-supplied Selected Work content** — name, tagline, problem, solution, role, architecture,
  result, technologies, repository/live/case-study links and screenshots for three to five real
  projects. Blocks the Selected Work section becoming visible; does **not** block this feature.
- **Owner-supplied Community content** — organisations (PHP Piauí, PHPWomen and others), roles,
  periods, descriptions, links, and real metrics. Blocks the Community section becoming visible;
  does **not** block this feature.
- **Owner-supplied CV/resume URL** — blocks the CV contact route and the CV-based secondary call to
  action; does **not** block this feature.
- **Feature 002 content** — this feature preserves it and must not regress it.
- **The existing test suites** — extended here, not replaced.

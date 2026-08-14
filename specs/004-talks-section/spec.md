# Feature Specification: Talks Section

**Feature Branch**: `004-talks-section`

**Created**: 2026-08-14

**Status**: Draft

**Input**: User description: "Agora quero planejar a inserção de uma nova sessão no site, ela pode ser chamada de \"Talks\" a qual listará as minhas palestras e apresentações. Imagino que ela seria bem posicionada logo após a sessão Hero, já que ela possuirá fotos. Imagino que cada item da sessão deveria ter o titulo, data, descrição e uma foto de destaque. Use a skill de UX para planejar o componente de maneira que ele se encaixe bem no estado atual do site e que o visitante tenha uma boa experiência ao acessar"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A recruiter sees speaking credibility without scrolling far (Priority: P1)

A recruiter opens the portfolio on a phone from a LinkedIn link. Immediately below the name,
role and positioning statement, they meet a short list of talks the owner has given. Each entry
shows a photograph of the owner presenting, the talk's title, when it happened, and a sentence or
two on what it covered. Within a few seconds — and without tapping anything — the recruiter has
gone from "claims to be a senior engineer" to "has stood in front of a room and explained
engineering to it", with photographic evidence rather than an assertion.

**Why this priority**: This is the entire feature. The section exists to convert a written claim
into visible proof at the earliest point in the page where a visitor is still paying full
attention. Every other story is either navigation to this content or maintenance of it.

**Independent Test**: Supply two or more talk entries, load the page at 375px, and confirm the
section renders below the hero with each entry's photo, title, date and description legible and
correctly ordered — with nothing else built.

**Acceptance Scenarios**:

1. **Given** the talks collection holds three entries, **When** a visitor loads the page,
   **Then** a "Palestras" section appears directly after the hero containing exactly three
   entries, each showing its photo, title, date and description.
2. **Given** the collection holds entries from different dates, **When** the section renders,
   **Then** the most recent talk appears first and the oldest last.
3. **Given** a visitor is using a screen reader, **When** they move through the section,
   **Then** they hear the section heading, then each talk announced as a list item with its title,
   its date spoken as a date, and a description of what the photograph shows.
4. **Given** the collection is empty, **When** a visitor loads the page — with or without scripts
   running — **Then** no heading, no empty region and no navigation link for the section exist
   anywhere on the page.

---

### User Story 2 - A visitor reaches and shares the section directly (Priority: P2)

A visitor who wants to skim the talks uses the site navigation to jump straight to them, or
receives a link that lands on the section. Someone reading the page on a phone opens the collapsed
menu, taps the entry, and arrives with the section heading clear of the sticky header rather than
hidden behind it.

**Why this priority**: The content is worthless if it is only reachable by scrolling past it. This
is small, but it is what makes the section addressable and shareable.

**Independent Test**: With entries supplied, confirm a navigation item for the section is present
and, once followed, positions the section heading fully below the sticky header at 375px, 768px
and 1440px.

**Acceptance Scenarios**:

1. **Given** the section rendered, **When** a visitor opens the navigation, **Then** a link to the
   section is present, in the same visual order as the section appears on the page.
2. **Given** the section did not render because there are no entries, **When** a visitor opens the
   navigation, **Then** no link to it is offered.
3. **Given** a visitor follows a link ending in the section's anchor, **When** the page settles,
   **Then** the section heading is fully visible and not covered by the sticky header, at every
   supported viewport width.
4. **Given** a visitor on a 768px-wide screen, **When** the navigation renders with the new item
   added, **Then** the header occupies no more rows than it does today and no navigation item is
   clipped or pushed out of view.

---

### User Story 3 - The owner adds a talk by editing content only (Priority: P3)

The owner gives a new talk, has a photograph of it, and wants it on the site. They add one entry
describing the talk and drop the photograph into the site's own assets, and it appears in the
right place, correctly sized, without touching page structure or rendering behaviour.

**Why this priority**: This governs the cost of every future update. It delivers no visitor-facing
value on its own, which is why it sits below the two stories that do — but a section that requires
structural edits to update will simply stop being updated.

**Independent Test**: Add one entry and its image, reload, and confirm the new talk renders in the
correct position with no other file changed.

**Acceptance Scenarios**:

1. **Given** a complete new entry and its image file, **When** the owner adds only that entry and
   that file, **Then** the talk renders correctly in date order with no change to page structure
   or rendering logic.
2. **Given** an entry missing a required field, **When** the automated checks run, **Then** they
   fail naming the entry and the missing field, before the page is ever published.
3. **Given** an entry whose photograph does not exist at the path stated, **When** the automated
   checks run, **Then** they fail naming the broken reference.

---

### Edge Cases

- **Photograph fails to load or is slow.** The talk's title, date and description remain fully
  readable, and nothing below the entry moves once the image resolves or fails.
- **A talk that is visible when the page first paints.** Because the section sits high on the
  page, its first entries may be inside the initial viewport on some screens. Their photographs
  must not be deferred in a way that leaves a visible blank while the visitor is already looking
  at them.
- **A single entry.** One talk must read as a deliberate item, not as a broken grid with an
  obvious gap beside it.
- **Many entries.** A long list must not push the professional history so far down the page that a
  recruiter abandons the scroll before reaching it.
- **A very long title, or one unbroken word.** Text wraps inside the entry; the page never scrolls
  horizontally at 320px.
- **Portrait, landscape and square photographs mixed in one list.** Entries stay visually aligned
  and no photograph is distorted.
- **Scripts fail to run.** The visitor sees no heading over an empty region and no navigation link
  pointing at content that is not there.
- **Stylesheet fails to load.** The section still reads as a titled list of talks in document
  order, with each photograph beneath the entry it belongs to.
- **A visitor who has asked for reduced motion.** No entrance animation, hover movement or scroll
  effect is applied to the section.
- **Two entries given the same identifier, or a date in the future.** Automated checks fail before
  publication.

## Requirements *(mandatory)*

### Functional Requirements

#### Content and data

- **FR-001**: The site MUST present a section listing the owner's talks and presentations.
- **FR-002**: Each talk MUST carry a title, a date, a description, and a featured photograph.
- **FR-003**: A talk's photograph MUST carry a textual description of what it depicts, supplied
  alongside it as content, never generated or omitted.
- **FR-004**: A talk's photograph MUST be stored within the site's own assets, so it cannot rot,
  move behind a login, or change without the owner's knowledge.
- **FR-005**: Each talk MAY additionally carry the name of the event it was given at, and MAY
  carry one link to a related destination (recording, slides, or event page). Both are optional:
  when absent, no label, no empty element and no placeholder appears.
- **FR-006**: A talk's link, when present, MUST be labelled so that its destination is
  identifiable out of context — never "clique aqui", "ver mais" or the bare title.
- **FR-007**: All talk content MUST live in the site's content layer, so adding, removing or
  editing a talk requires no change to page structure or rendering behaviour.
- **FR-008**: No talk, date, description, event name or photograph caption may be invented,
  estimated or approximated. Where the owner has not supplied a fact, the corresponding optional
  field is omitted; where a required fact is missing, the talk is not published.
- **FR-009**: Adding a talk MUST NOT require rewriting tests for unrelated parts of the site.

#### Placement and ordering

- **FR-010**: The section MUST appear directly after the hero, above every other section of the
  page.
- **FR-011**: Talks MUST be presented most recent first.
- **FR-012**: The section MUST be reachable from the site navigation, with the navigation item in
  the same relative order as the section on the page.
- **FR-013**: When there are no talks to show, the section, its heading and its navigation item
  MUST be absent from the page entirely — for a visitor whose scripts run and for one whose
  scripts do not.
- **FR-014**: Following a link to the section MUST leave its heading fully visible and clear of the
  sticky header at every supported viewport width.
- **FR-015**: Adding the section's navigation item MUST NOT increase the number of rows the site
  header occupies at any viewport width, and MUST NOT clip or hide any existing navigation item.

#### Presentation and experience

- **FR-016**: Each talk MUST be presented as one visually self-contained unit in which the
  photograph, title, date and description read as belonging together, consistent with how existing
  sections of the site present their entries.
- **FR-017**: Within a talk, the reading order MUST be photograph, then title, then date, then
  description — the image draws attention, the title says what it was, the date places it, the
  description explains it.
- **FR-018**: The date MUST be rendered in a form a Portuguese-speaking reader reads naturally,
  and MUST also be exposed in a machine-readable form.
- **FR-019**: All photographs MUST be presented at one consistent shape, filling their frame
  without distortion regardless of the source image's proportions.
- **FR-020**: The layout MUST be authored mobile-first, presenting one talk per row on a phone and
  making use of the additional width on larger screens without any entry becoming too narrow to
  read or a photograph becoming too small to interpret.
- **FR-021**: A single talk MUST render as a complete, deliberate-looking entry rather than as an
  incomplete row.
- **FR-022**: The section MUST NOT introduce horizontal scrolling of the page at 320px or above.
- **FR-023**: The section MUST NOT hide, truncate or collapse any part of a talk's content on
  small screens as a substitute for laying it out responsively.
- **FR-024**: The section MUST use the site's existing colour, spacing, typography and shape
  vocabulary; it introduces no new visual language.

#### Accessibility

- **FR-025**: The section MUST be a labelled region introduced by a heading one level below the
  page's top-level heading, with each talk's title one level below that, skipping no levels.
- **FR-026**: The collection of talks MUST be conveyed as a list, so assistive technology
  announces how many there are.
- **FR-027**: Every photograph MUST carry a meaningful textual description; a photograph MUST NOT
  be announced by its filename or as unlabelled.
- **FR-028**: Every interactive element the section introduces MUST be reachable and operable by
  keyboard, in an order matching its visual position, with a clearly visible focus indicator.
- **FR-029**: Every interactive element the section introduces MUST present a touch target no
  smaller than the site's established minimum.
- **FR-030**: All text in the section MUST meet WCAG 2.1 AA contrast against the surface it sits
  on — 4.5:1 for body text, 3:1 for large text and interface boundaries.
- **FR-031**: No information in the section may be conveyed by colour alone.
- **FR-032**: Any motion the section introduces MUST be suppressed when the visitor has requested
  reduced motion.

#### Performance and robustness

- **FR-033**: Every photograph MUST reserve its space before it loads, so no content below it
  moves as images arrive.
- **FR-034**: Photographs that can appear within the initial viewport MUST NOT be deferred;
  photographs below the fold MUST be.
- **FR-035**: Photographs MUST be delivered in an efficient modern image format at dimensions
  appropriate to how they are displayed.
- **FR-036**: The section MUST NOT introduce any dependency on a third-party service, script,
  font or image host.
- **FR-037**: A failure while producing the section MUST NOT prevent any other section of the page
  from rendering, and MUST leave no heading over an empty region.
- **FR-038**: With no stylesheet, the section MUST remain a readable, correctly ordered titled
  list of talks.

### Key Entities

- **Talk**: One speaking engagement the owner delivered. Required: a stable identifier unique
  across talks; a title; the date it was given; a description of what it covered; a featured
  photograph. Optional: the name of the event it was given at; one labelled link to a recording,
  slide deck or event page.
- **Featured photograph**: An image held in the site's own assets, always accompanied by a textual
  description of what it shows and by its intrinsic proportions, so its space can be reserved
  before it loads. These travel together as one unit — a photograph without a description is
  inaccessible, and one without known proportions shifts the page as it loads.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a 375px-wide screen, a visitor who has just landed can see at least one complete
  talk — photograph, title, date and description — within one screen-height of scrolling from the
  page's first view.
- **SC-002**: 100% of published talks display all four required elements; no entry renders with a
  missing photograph, an empty date, or an untitled heading.
- **SC-003**: The owner can publish a new talk by supplying one content entry and one image file,
  touching no page structure and no rendering behaviour — verified by adding a talk and observing
  that exactly two files change.
- **SC-004**: The page's layout shift attributable to the section is nil: no content below a
  photograph moves once that photograph loads, measured on a throttled connection.
- **SC-005**: The section introduces zero requests to any host other than the site's own.
- **SC-006**: Every text/background pair the section introduces measures at or above 4.5:1 (3:1
  for large text and boundaries), verified by measurement, not inspection.
- **SC-007**: Every interactive element in the section is reachable by keyboard within the
  section's own tab order, and each shows a visible focus indicator — 100%, no exceptions.
- **SC-008**: At 320px, 375px, 768px, 1024px and 1440px the page shows no horizontal scrollbar and
  no talk's content is clipped.
- **SC-009**: With scripts disabled and with no talks supplied, a visitor encounters zero empty
  headings, zero empty regions and zero navigation links pointing at absent content.
- **SC-010**: With the section's navigation item added, the site header occupies no more rows at
  any width between 320px and 1440px than it does before the change.
- **SC-011**: An assistive-technology pass reports the section as a named region containing a list
  of N items, with every photograph described and every heading in sequence — zero unlabelled
  images, zero skipped heading levels.
- **SC-012**: Automated checks reject a talk that is missing a required field, references a
  photograph that does not exist, duplicates another talk's identifier, or carries a future date —
  before publication, in every case.

## Assumptions

These are informed defaults chosen where the request did not specify. Each is cheap to reverse.

- **Placement is literal**: the section is placed between the hero and "Sobre", as requested.
  Noted trade-off: this puts talks ahead of the owner's professional history for a recruiter
  audience, and the alternative — hero, "Sobre", talks, then experience — keeps the identity block
  intact while still showing the photographs high on the page. Placement is one line of page
  structure either way.
- **Visible label is Portuguese**: the section is headed "Palestras", matching the site's
  Portuguese section headings, while "talks" remains its internal name and anchor — the same split
  the site already uses for "Trabalhos Selecionados" under the anchor `work`. The navigation item
  reads "Palestras".
- **The photograph is required, not optional**: the section's position immediately after the hero
  is justified by its imagery, and a text-only entry among photographic ones would read as a gap.
  A talk without a usable photograph is not published until one exists.
- **Dates are precise to the day**: a talk is a single-day event, so its date is stated in full
  rather than to the month, unlike the site's employment and education entries.
- **Event name and link are additive**: neither was requested. Both are specified as optional
  because the site's existing entities follow that pattern and because a recruiter reads "given at
  X" as stronger evidence than a bare title. Omitting them entirely is a valid v1.
- **No lightbox, carousel, filtering or pagination**: photographs are shown inline at a readable
  size and are not expandable, the list does not scroll horizontally, and there is no "show more".
  Each of those is a distinct feature that this one does not require, and every one of them adds
  interaction the site currently has none of.
- **The section ships with whatever the owner supplies**: no talk content is authored as part of
  building this. If no entries are supplied when the work lands, the section is complete but
  invisible, exactly as the existing community section is — and populating it later is a content
  edit.
- **The list is not capped**: display order is most recent first with no limit. If the collection
  grows past roughly six entries, the "many entries" edge case above becomes a real problem and
  capping the section becomes its own small feature.
- **Supported viewports are unchanged**: 320px to 1440px, the range the rest of the site is
  already verified against.
- **The audience is unchanged**: the primary visitor is a recruiter or hiring manager reading in
  Portuguese, arriving on a phone from a shared link.

## Dependencies

- The site's existing design tokens, card presentation and list patterns, which this section
  reuses rather than extends.
- The existing behaviour by which a section and its navigation item are present only when that
  section has content.
- The existing automated content-integrity checks, which this section's entries must be brought
  under.
- Photographs of the owner presenting, supplied by the owner, cleared for publication, and of high
  enough resolution to remain legible at the size they are displayed.

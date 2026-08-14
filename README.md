# Portfolio

Bruno Oliveira's portfolio: a static single-page site built with HTML5, CSS3 and vanilla
JavaScript. **No framework, no build step, and zero runtime dependencies** — what is in this
repository is what the browser receives.

Content lives in data, not in markup. Adding a project is a one-file edit.

---

## Editing the content

This is the part you will use most. Everything repeatable lives in `js/data/`. Change a file,
reload the page, done — no markup to touch, no logic to change, nothing to rebuild.

| To change… | Edit | Notes |
|------------|------|-------|
| Talks (palestras) | `js/data/talks.js` | **Ships empty.** One entry plus one photograph — see "Adding a talk" below |
| Selected Work (case studies) | `js/data/projects.js` | **Ships empty.** The section is absent until you add an entry — see "Adding a case study" below |
| Skills | `js/data/skills.js` | Add a string to a group's `skills`, or add a group |
| How I work | `js/data/philosophy.js` | Each principle must trace to something in `experiences.js` — see "Engineering Philosophy" below |
| Community | `js/data/community.js` | **Ships empty.** No metric may be estimated or invented — see "Community metrics" below |
| Certifications | `js/data/certifications.js` | `icon` names a symbol in the sprite |
| Work experience | `js/data/experiences.js` | Newest first — array order is display order. `endDate: null` renders "Atual" |
| Education | `js/data/education.js` | Both years optional; see "Education dates" below |
| Name, role, positioning statement, About, availability, CV link, calls to action, location, email, social links | `js/data/profile.js` **and** `index.html` | See "The one duplication" below |

A section whose collection is empty is removed from the page entirely, so emptying an array is
how you hide a section — no markup change.

The section order is fixed in `index.html` and answers a recruiter's questions in the order they
ask them: who are you → what have you done → what can you build → how do you think → what else
shows seniority → how do I reach you.

### Education dates

`endYear` has three distinct meanings, and they are not interchangeable:

| `endYear` | Means | Renders |
|-----------|-------|---------|
| absent | the end is not recorded | nothing |
| `null` | still in progress | `Em andamento` |
| a year | completed then | the year |

Writing `endYear: null` for a course that finished but whose year you do not have would
announce it as still in progress. Leave the field out instead.

### Adding a talk

`js/data/talks.js` ships **empty**, on purpose: no talk, date or description may be invented, and
a photograph nobody has looked at cannot be described. The section is absent from the page until
you add an entry.

Adding one is two files — an entry, and a photograph:

```js
// js/data/talks.js
{
  id: 'observabilidade-antes-do-incidente',
  title: 'Observabilidade antes do incidente',
  date: '2025-03-12',
  description: 'Uma ou duas frases sobre o que a palestra cobriu.',
  photo: 'assets/images/talk-observabilidade-antes-do-incidente.webp',
  photoAlt: 'O palestrante diante de um telão, apontando para um gráfico de latência',
  event: 'PHP Piauí Meetup',                       // opcional
  link: {                                          // opcional
    label: 'Assistir à gravação de "Observabilidade antes do incidente"',
    url: 'https://exemplo.com/gravacao',
  },
}
```

Worth knowing before you write one:

- **`date` is `AAAA-MM-DD`, a real day, never in the future.** `2025-02-30` is rejected — it looks
  well-formed and names a day that never existed.
- **Array order does not matter.** This is the one section that sorts itself: newest first, from
  the `date`. Append wherever it is convenient.
- **The photograph is 1280×720 WebP**, in `assets/images/`, named after the `id`. It is shown in a
  fixed 16:9 frame and cropped to fill, so any landscape source works and you never measure
  anything. Use `npx @squoosh/cli` or any converter; keep it under a few hundred KB.
- **`photoAlt` is required and must describe the photograph**, not repeat the title. It is what a
  screen-reader user gets instead of the image.
- **`link.label` must say where it goes on its own.** "Assistir à gravação de X" — never "clique
  aqui", and never the bare title, because the title is already the heading above it.
- **Committing the photograph without the entry fails the tests.** Every file under `assets/` must
  be referenced by something the page ships.

### Adding a case study

`js/data/projects.js` ships **empty**, on purpose: there is no placeholder project, because a
recruiter who suspects a project is filler learns something worse than nothing. The section
appears the moment you add an entry, and nothing else needs to change.

Only `id`, `title` and `description` are required. Every other field is optional, and an absent
one produces no element at all — no empty box, no orphaned label.

```js
// js/data/projects.js
{
  id: 'meu-projeto',                       // kebab-case, unique, stable
  title: 'Meu Projeto',
  description: 'O que ele faz, em uma frase.',

  tagline: 'Uma linha sob o título.',      // optional

  // The case study. Each present part renders as a labelled entry; they always read in this
  // order regardless of the order you type them in.
  problem: 'Que problema real ele resolveu.',
  solution: 'O que foi construído.',
  contribution: 'O que você fez, especificamente.',
  architecture: 'Como foi estruturado, e por quê.',
  result: 'O que mudou depois — com números, se você os tiver.',

  technologies: ['Laravel', 'PostgreSQL'], // optional; renders exactly as many chips as it holds
  repositoryUrl: 'https://github.com/…',   // optional
  liveUrl: 'https://…',                    // optional
  caseStudyUrl: 'https://…',               // optional — a written write-up elsewhere
  image: 'assets/images/meu-projeto.webp', // optional
  imageAlt: 'Captura de tela do Meu Projeto', // required whenever `image` is present
  isVisible: true,                         // false hides it; absent means visible
}
```

The file is called `projects.js` and the section is called Selected Work. The filename is fixed
by the constitution's directory layout; the section name is what the recruiter reads.

### Engineering Philosophy

`js/data/philosophy.js` is the only place on the site that states something the CV does not.
Two rules, and both matter more than how the sentence reads:

1. **Every principle must trace to evidence.** Each entry carries a comment naming the role in
   `js/data/experiences.js` it comes from. A principle that traces to nothing does not belong
   there, however good it sounds.
2. **It must be falsifiable.** "Eu me importo com qualidade" is not a position — nobody claims
   the opposite. A reader has to be able to disagree with it.

### Community metrics

`js/data/community.js` ships **empty**, and its metrics carry the strictest rule in the project:
**no number may be estimated, rounded up, extrapolated or invented.** Nothing catches a rounded
figure — a schema cannot tell "240 membros" counted from "about 250, probably". If you do not
know the real number, omit the metric; an activity with no metrics renders perfectly well.

Zero is a real value and renders. "0 palestras este ano" is a true statement; a guessed "5" is
not.

Rules the data files follow, all enforced by `npm run test:data`:

- Every `id` is kebab-case and unique within its collection.
- Every URL is absolute and `https:` — plain `http:` is rejected, because the site is served
  over HTTPS and the browser would block it.
- Every asset path resolves to a file that actually exists.
- `imageAlt` is required whenever `image` is present.
- Files in `js/data/` hold **data only**: no imports, no functions, no DOM access.

### Empty sections disappear

A collection that is empty renders nothing at all — no heading, no container, no gap. This holds
**whether or not JavaScript runs**, which is the part worth understanding before you edit
`index.html`:

- every data-driven `<section>` is authored with the `hidden` attribute;
- `js/app.js` removes `hidden` only after that section's component has actually produced content;
- an empty collection makes the component return `null`, and the section is removed outright.

So with scripts disabled the page shows Hero, About and Contact — all static, all real content —
and nothing else. The alternative, removing empty sections at runtime, left a visitor whose
script never ran looking at six headings above six empty regions.

The navigation follows the same rule: an item bound to a data-driven section ships `hidden` too,
and is revealed only when its target actually rendered. A link never points at a section that is
not there.

`projects.js` and `community.js` ship empty today. Add one entry and the section appears,
correctly themed and reachable from the navigation, with no code change.

### The one duplication

`name`, `role`, `headline`, `summary`, the About paragraphs, `availability`, both calls to
action, `location` and `email` appear both in `js/data/profile.js` and as static text in
`index.html`, as do the social links and the JSON-LD block in `<head>`. That is deliberate: a
visitor whose JavaScript fails, and a crawler that never runs one, must still get the owner's
identity, positioning and a way to make contact. Holding a string twice is only honest if drift is a caught error, so
`tests/data/sync.test.js` fails the moment the two disagree. **Change both, or the tests will
tell you.**

One thing is deliberately absent from both: the owner's phone number. A static page is scraped
continuously and a number published once cannot be recalled, so contact runs through email,
LinkedIn, GitHub and the form. `tests/data/parity.test.js` asserts the number appears in no
shipped file.

---

## Running it

The site is static. A server is needed only because ES modules do not load over `file://`.

```bash
npm install                  # dev tooling only — nothing here ships to visitors
npx playwright install chromium

npm run serve                # http://localhost:8391
```

## Tests

Two tiers. Tier 1 needs no browser and runs in under a second.

```bash
npm run test:unit   # component render contracts (node --test + linkedom)
npm run test:data   # data integrity, HTML/profile sync, CSS discipline, content parity
npm run test:e2e    # accessibility, keyboard, responsive, network, metadata (Playwright)
npm test            # all three
```

Tests bind to **contracts and schemas, never to content values**. Changing a project title must
never mean changing a test — `tests/data/independence.test.js` enforces that. The single
documented exception is `tests/data/parity.test.js`, which exists to prove the migration from
the previous design lost no content.

On a bare Linux box, Playwright's Chromium needs system libraries:

```bash
sudo npx playwright install-deps chromium
```

---

## Structure

The layout is mandated by `.specify/memory/constitution.md`. It is not a suggestion.

```text
index.html          semantic containers, static critical content, inlined SVG sprite
vercel.json         cache headers; no build command

assets/
├── fonts/          self-hosted Poppins 400/600 (WOFF2, latin + latin-ext)
├── icons/          source SVGs — the editable originals behind the inlined sprite
└── images/         portrait, Open Graph card (with their .svg sources)

css/
├── variables.css   design tokens ONLY — every colour and spacing value starts here
├── base.css        reset, @font-face, element defaults, typography, focus ring
├── components.css  card, chip, button, link, form field
└── sections.css    per-section layout; min-width media queries only

js/
├── app.js          the only entry point: wires data to components, mounts them, then
│                   reveals each section that produced content and reconciles the navigation
├── components/     rendering only, no content literals — plus navigation.js and identity.js,
│                   which carry interaction and DOM reconciliation instead (see the plan's
│                   Complexity Tracking entry for why they live here)
└── data/           content only, no logic

tests/
├── unit/           component render contracts
├── data/           schema validation, sync, CSS discipline, parity, independence
├── schemas/        entity schemas (kept out of js/data/ so no validator ships)
├── fixtures/       invented sample content — never the real portfolio data
└── e2e/            Playwright: a11y, keyboard, responsive, network, metadata, orphans
```

### Conventions worth knowing before you edit

- **Components are pure functions**: `render(data, doc) -> DocumentFragment | null`. They take
  the document as an argument so they can be tested without a browser, they never fetch, and
  they never touch the live page — `app.js` does the mounting.
- **`null` means "render nothing"**, and `app.js` removes that section entirely.
- **A missing required field throws**, naming the entity, the field and the `id`, so the error
  points straight at the line to fix. One component throwing never stops the others.
- **Text is set with `textContent`, never `innerHTML`.**
- **Colours come from tokens.** A literal hex anywhere but `variables.css` fails the tests.
- **Media queries are `min-width` only.** A `max-width` query fails the tests: mixing the two
  is how the previous stylesheets ended up with viewports between 721px and 739px that matched
  no rule at all.
- **Pink text on a purple surface is 2.7:1 and is prohibited.** It is the one combination that
  looks right and fails AA. The measured contrast for every pairing is documented at the top of
  `css/variables.css`.

---

## Deploy

Vercel serves the repository root statically. There is no build command. `vercel.json` sets
year-long immutable caching for `assets/**` and revalidating caching for `index.html`.

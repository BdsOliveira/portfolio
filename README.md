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
| Projects | `js/data/projects.js` | Copy an entry, change the values |
| Skills | `js/data/skills.js` | Add a string to a group's `skills`, or add a group |
| Certifications | `js/data/certifications.js` | `icon` names a symbol in the sprite |
| Work experience | `js/data/experiences.js` | Newest first — array order is display order. `endDate: null` renders "Atual" |
| Education | `js/data/education.js` | Both years optional; see "Education dates" below |
| Name, role, summary, location, email, social links | `js/data/profile.js` **and** `index.html` | See "The one duplication" below |

A section whose collection is empty is removed from the page entirely, so emptying an array is
how you hide a section — no markup change.

### Education dates

`endYear` has three distinct meanings, and they are not interchangeable:

| `endYear` | Means | Renders |
|-----------|-------|---------|
| absent | the end is not recorded | nothing |
| `null` | still in progress | `Em andamento` |
| a year | completed then | the year |

Writing `endYear: null` for a course that finished but whose year you do not have would
announce it as still in progress. Leave the field out instead.

### Adding a project

```js
// js/data/projects.js
{
  id: 'meu-projeto',                       // kebab-case, unique, stable
  title: 'Meu Projeto',
  description: 'O que ele faz, em uma frase.',
  technologies: ['VueJS', 'Laravel'],      // any number, minimum one
  repositoryUrl: 'https://github.com/…',   // optional — link omitted when absent
  liveUrl: 'https://…',                    // optional
  image: 'assets/images/meu-projeto.webp', // optional
  imageAlt: 'Captura de tela do Meu Projeto', // required whenever `image` is present
  isVisible: true,                         // false hides it without deleting it
}
```

Rules the data files follow, all enforced by `npm run test:data`:

- Every `id` is kebab-case and unique within its collection.
- Every URL is absolute and `https:` — plain `http:` is rejected, because the site is served
  over HTTPS and the browser would block it.
- Every asset path resolves to a file that actually exists.
- `imageAlt` is required whenever `image` is present.
- Files in `js/data/` hold **data only**: no imports, no functions, no DOM access.

### Empty sections disappear

A collection that is empty renders nothing at all — the whole `<section>` is removed, heading
included, leaving no gap. `experiences.js` and `education.js` ship empty for exactly this
reason. Add one entry and the section appears, correctly themed, with no code change.

### The one duplication

`name`, `role`, `summary`, `location` and `email` appear both in `js/data/profile.js` and as
static text in `index.html`, as do the social links. That is deliberate: a visitor whose
JavaScript fails, and a crawler that never runs one, must still get the owner's identity and a
way to make contact. Holding a string twice is only honest if drift is a caught error, so
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
├── app.js          the only entry point: wires data to components and mounts them
├── components/     rendering only, no content literals
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

import { requireFields, el, icon } from './helpers.js';

/**
 * Selected Work — one piece of showcased engineering per entry, presented as a case study
 * rather than a gallery tile (FR-019 – FR-023).
 *
 * The entity is `WorkEntry`; this module keeps the filename `projects.js` because the
 * constitution's mandated tree names it, and FR-019 renames the *section*, not the file
 * (research R6). `tests/schemas/index.js` calls the schema `WorkEntry`.
 *
 * Only `title` and `description` are required (FR-021). Every other field is optional and must
 * produce **no element, no label and no separator** when absent (FR-023) — which is why each
 * builder below returns `null` rather than an empty node, and why `el()` drops null children.
 */

const REQUIRED = ['id', 'title', 'description'];

/** Preview images are rendered at a fixed 16:9 box so the card reserves space (FR-027). */
const IMAGE_WIDTH = 640;
const IMAGE_HEIGHT = 360;

/**
 * The case-study parts, in the order they are read — not the order they happen to be declared
 * in the data (contract W3-3). A reader needs the problem before the solution regardless of how
 * the entry's keys were typed.
 */
const CASE_STUDY_PARTS = [
  ['problem', 'Problema'],
  ['solution', 'Solução'],
  ['contribution', 'Minha atuação'],
  ['architecture', 'Arquitetura'],
  ['result', 'Resultado'],
];

/**
 * @param {object[]} entries
 * @param {Document} doc
 * @returns {DocumentFragment|null}
 */
export function renderProjects(entries, doc) {
  // Only an explicit `false` hides an entry: `isVisible` is optional now, and an absent flag
  // means visible (contract W3-2).
  const visible = entries.filter((entry) => entry.isVisible !== false);
  if (visible.length === 0) return null;

  const list = el(doc, 'ul', { className: 'project-list' });
  for (const entry of visible) list.append(card(entry, doc));

  const fragment = doc.createDocumentFragment();
  fragment.append(list);
  return fragment;
}

function card(entry, doc) {
  requireFields(entry, REQUIRED, 'WorkEntry');

  return el(doc, 'li', {
    className: 'project-card',
    attrs: { 'data-project': entry.id },
    children: [
      preview(entry, doc),
      el(doc, 'h3', { className: 'project-card__title', text: entry.title }),
      tagline(entry, doc),
      el(doc, 'p', { className: 'project-card__description', text: entry.description }),
      caseStudy(entry, doc),
      technologies(entry, doc),
      links(entry, doc),
    ],
  });
}

function tagline(entry, doc) {
  if (!entry.tagline) return null;

  return el(doc, 'p', { className: 'project-card__tagline', text: entry.tagline });
}

/**
 * The labelled parts of the case study (FR-022).
 *
 * A `<dl>` rather than `<h4>` headings: four sub-headings per entry would flood the heading
 * outline, so a screen-reader user navigating by heading through five case studies would meet
 * twenty labels before reaching the next section (research R3). `<dt>`/`<dd>` must be direct
 * children of the `<dl>` — axe's `definition-list` rule rejects wrapper elements.
 *
 * Returns null when no part is present, so an entry without a case study contains no `<dl>` at
 * all rather than an empty one (contract W3-5).
 */
function caseStudy(entry, doc) {
  const children = [];

  for (const [field, label] of CASE_STUDY_PARTS) {
    const value = entry[field];
    if (!value) continue;

    children.push(
      el(doc, 'dt', { className: 'case-study__label', text: label }),
      el(doc, 'dd', { className: 'case-study__body', text: value, attrs: { 'data-part': field } }),
    );
  }

  return children.length === 0 ? null : el(doc, 'dl', { className: 'case-study', children });
}

function preview(entry, doc) {
  if (!entry.image) return null;

  return el(doc, 'img', {
    className: 'project-card__image',
    attrs: {
      src: entry.image,
      alt: entry.imageAlt ?? '',
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      loading: 'lazy',
      decoding: 'async',
    },
  });
}

/** Exactly `technologies.length` chips. The replaced Project class rendered a fixed five. */
function technologies(entry, doc) {
  if (!entry.technologies || entry.technologies.length === 0) return null;

  return el(doc, 'ul', {
    className: 'chip-list',
    children: entry.technologies.map((technology) =>
      el(doc, 'li', { className: 'chip', text: technology, attrs: { 'data-technology': '' } }),
    ),
  });
}

/**
 * Links carry accessible names incorporating the entry title (FR-059), so a screen-reader user
 * hearing them out of context still knows which piece of work they belong to. The old card
 * conveyed this through a hover tooltip, which keyboard users never received (FR-031).
 */
const LINK_KINDS = [
  ['repositoryUrl', 'Código', 'Ver código de', 'github'],
  ['liveUrl', 'Site', 'Abrir site de', 'external-link'],
  ['caseStudyUrl', 'Estudo de caso', 'Ler o estudo de caso de', 'project'],
];

function links(entry, doc) {
  const children = [];

  for (const [field, text, namePrefix, iconId] of LINK_KINDS) {
    if (!entry[field]) continue;

    children.push(
      link(doc, {
        href: entry[field],
        text,
        label: `${namePrefix} ${entry.title}`,
        iconId,
      }),
    );
  }

  return children.length === 0 ? null : el(doc, 'div', { className: 'project-card__links', children });
}

function link(doc, { href, text, label, iconId }) {
  return el(doc, 'a', {
    className: 'button button--ghost',
    attrs: { href, 'aria-label': label, rel: 'noopener noreferrer', target: '_blank' },
    children: [icon(doc, iconId), doc.createTextNode(text)],
  });
}

import { requireFields, el, icon } from './helpers.js';

const REQUIRED = ['id', 'title', 'description', 'technologies'];

/** Preview images are rendered at a fixed 16:9 box so the card reserves space (FR-037). */
const IMAGE_WIDTH = 640;
const IMAGE_HEIGHT = 360;

/**
 * @param {object[]} projects
 * @param {Document} doc
 * @returns {DocumentFragment|null}
 */
export function renderProjects(projects, doc) {
  const visible = projects.filter((project) => project.isVisible !== false);
  if (visible.length === 0) return null;

  const list = el(doc, 'ul', { className: 'project-list' });
  for (const project of visible) list.append(card(project, doc));

  const fragment = doc.createDocumentFragment();
  fragment.append(list);
  return fragment;
}

function card(project, doc) {
  requireFields(project, REQUIRED, 'Project');

  return el(doc, 'li', {
    className: 'project-card',
    attrs: { 'data-project': project.id },
    children: [
      preview(project, doc),
      el(doc, 'h3', { className: 'project-card__title', text: project.title }),
      el(doc, 'p', { className: 'project-card__description', text: project.description }),
      technologies(project, doc),
      links(project, doc),
    ],
  });
}

function preview(project, doc) {
  if (!project.image) return null;

  return el(doc, 'img', {
    className: 'project-card__image',
    attrs: {
      src: project.image,
      alt: project.imageAlt ?? '',
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      loading: 'lazy',
      decoding: 'async',
    },
  });
}

/** Exactly `technologies.length` chips. The replaced Project class rendered a fixed five. */
function technologies(project, doc) {
  return el(doc, 'ul', {
    className: 'chip-list',
    children: project.technologies.map((technology) =>
      el(doc, 'li', { className: 'chip', text: technology, attrs: { 'data-technology': '' } }),
    ),
  });
}

/**
 * Links carry accessible names incorporating the project title (FR-043), so a screen-reader
 * user hearing them out of context still knows which project they belong to. The old card
 * conveyed this through a hover tooltip, which keyboard users never received (FR-031).
 */
function links(project, doc) {
  const children = [];

  if (project.repositoryUrl) {
    children.push(
      link(doc, {
        href: project.repositoryUrl,
        text: 'Código',
        label: `Ver código de ${project.title}`,
        iconId: 'github',
      }),
    );
  }

  if (project.liveUrl) {
    children.push(
      link(doc, {
        href: project.liveUrl,
        text: 'Site',
        label: `Abrir site de ${project.title}`,
        iconId: 'external-link',
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

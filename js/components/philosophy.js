import { requireFields, el } from './helpers.js';

/**
 * Engineering Philosophy — "Como Trabalho" (FR-028 – FR-032).
 *
 * The section that separates a senior engineer from a technology list: an engineering manager
 * comparing candidates with the same stack is choosing on judgement, and nothing else on the
 * page speaks to it.
 *
 * Deliberately the simplest renderer in the project. Each principle is a title and, optionally,
 * a supporting statement — whether the statement is concrete enough that a reader could disagree
 * with it is a property of js/data/philosophy.js, not of this file (FR-030).
 */

const REQUIRED = ['id', 'title'];

/**
 * @param {object[]} principles
 * @param {Document} doc
 * @returns {DocumentFragment|null}
 */
export function renderPhilosophy(principles, doc) {
  if (principles.length === 0) return null;

  const list = el(doc, 'ul', { className: 'principle-list' });
  for (const principle of principles) list.append(item(principle, doc));

  const fragment = doc.createDocumentFragment();
  fragment.append(list);
  return fragment;
}

function item(principle, doc) {
  requireFields(principle, REQUIRED, 'Principle');

  return el(doc, 'li', {
    className: 'principle',
    attrs: { 'data-principle': principle.id },
    children: [
      el(doc, 'h3', { className: 'principle__title', text: principle.title }),
      // Absent detail renders the title alone. `el()` drops null children, so no empty <p>
      // reaches the page (contract PH3-3, FR-045).
      principle.detail
        ? el(doc, 'p', {
            className: 'principle__detail',
            text: principle.detail,
            attrs: { 'data-detail': '' },
          })
        : null,
    ],
  });
}

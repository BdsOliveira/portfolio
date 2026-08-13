import { requireFields, el, icon } from './helpers.js';

const REQUIRED = ['id', 'title', 'icon'];

/**
 * @param {object[]} certifications
 * @param {Document} doc
 * @returns {DocumentFragment|null}
 */
export function renderCertifications(certifications, doc) {
  if (certifications.length === 0) return null;

  const list = el(doc, 'ul', { className: 'certification-list' });
  for (const entry of certifications) list.append(card(entry, doc));

  const fragment = doc.createDocumentFragment();
  fragment.append(list);
  return fragment;
}

function card(entry, doc) {
  requireFields(entry, REQUIRED, 'Certification');

  const body = el(doc, 'div', {
    className: 'certification__body',
    children: [
      el(doc, 'h3', { className: 'certification__title', text: entry.title }),
      entry.issuer
        ? el(doc, 'p', {
            className: 'certification__issuer',
            text: entry.issuer,
            attrs: { 'data-issuer': '' },
          })
        : null,
      entry.detail
        ? el(doc, 'p', {
            className: 'certification__detail',
            text: entry.detail,
            attrs: { 'data-detail': '' },
          })
        : null,
      entry.verificationUrl
        ? el(doc, 'a', {
            className: 'certification__link',
            text: 'Verificar',
            attrs: {
              href: entry.verificationUrl,
              'aria-label': `Verificar ${entry.title}`,
              rel: 'noopener noreferrer',
              target: '_blank',
            },
          })
        : null,
    ],
  });

  return el(doc, 'li', {
    className: 'certification card',
    attrs: { 'data-certification': entry.id },
    // The icon is decorative: the title beside it already carries the meaning (contract C-9).
    children: [
      el(doc, 'span', { className: 'certification__badge', children: [icon(doc, entry.icon)] }),
      body,
    ],
  });
}

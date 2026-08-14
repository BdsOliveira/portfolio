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
      // Last in the body, after the claim it supports: the title and detail state what was won,
      // the photo shows it. Placing it beside the title instead would put a second visual anchor
      // opposite the badge and squeeze the image to a width where nothing in it is legible.
      evidence(entry, doc),
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

/**
 * The evidence image, shown inline rather than linked. Unlike the decorative badge this one
 * carries meaning, so it takes a real `alt` from the data (contract C-9 draws that line).
 *
 * `width`/`height` are the intrinsic pixel size; CSS overrides the rendered size and keeps the
 * ratio. They are here to reserve the box before the bytes land (contract C-8) — without them
 * every card below this one jumps when the photo decodes. `loading="lazy"` because the section
 * sits well below the fold.
 */
function evidence(entry, doc) {
  if (!entry.evidence) return null;
  const { src, alt, width, height } = entry.evidence;

  return el(doc, 'img', {
    className: 'certification__evidence',
    attrs: {
      src,
      alt,
      width: String(width),
      height: String(height),
      loading: 'lazy',
      decoding: 'async',
      'data-evidence': '',
    },
  });
}

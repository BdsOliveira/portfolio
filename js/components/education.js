import { requireFields, el } from './helpers.js';

const REQUIRED = ['id', 'institution', 'qualification', 'startYear'];

/**
 * Ships with an empty collection, so this component renders nothing and app.js removes the
 * section outright. Adding the first entry to js/data/education.js makes it appear.
 *
 * @param {object[]} education
 * @param {Document} doc
 * @returns {DocumentFragment|null}
 */
export function renderEducation(education, doc) {
  if (education.length === 0) return null;

  const list = el(doc, 'ul', { className: 'timeline' });
  for (const entry of education) list.append(item(entry, doc));

  const fragment = doc.createDocumentFragment();
  fragment.append(list);
  return fragment;
}

function item(entry, doc) {
  requireFields(entry, REQUIRED, 'Education');

  return el(doc, 'li', {
    className: 'timeline__item card',
    attrs: { 'data-education': entry.id },
    children: [
      el(doc, 'h3', { className: 'timeline__title', text: entry.qualification }),
      el(doc, 'p', {
        className: 'timeline__institution',
        text: entry.institution,
        attrs: { 'data-institution': '' },
      }),
      entry.field
        ? el(doc, 'p', {
            className: 'timeline__field',
            text: entry.field,
            attrs: { 'data-field': '' },
          })
        : null,
      dateRange(entry, doc),
    ],
  });
}

/** A null endYear means the course is still running, which reads as "Em andamento". */
function dateRange(entry, doc) {
  return el(doc, 'p', {
    className: 'timeline__dates',
    children: [
      el(doc, 'time', { text: String(entry.startYear), attrs: { datetime: String(entry.startYear) } }),
      doc.createTextNode(' – '),
      entry.endYear
        ? el(doc, 'time', { text: String(entry.endYear), attrs: { datetime: String(entry.endYear) } })
        : el(doc, 'span', { text: 'Em andamento' }),
    ],
  });
}

import { requireFields, el } from './helpers.js';

const REQUIRED = ['id', 'institution', 'qualification'];

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

/**
 * Both years are optional, and `endYear` carries three distinct states:
 *
 *   absent  → the source states no end   → contributes nothing
 *   null    → still running              → "Em andamento"
 *   integer → completed in that year     → the year
 *
 * Crossed with a present or absent `startYear`, that gives five outcomes:
 *
 *   2020 + 2022    → "2020 – 2022"
 *   2020 + null    → "2020 – Em andamento"
 *   2020 + absent  → "Desde 2020"
 *   absent + null  → "Em andamento"
 *   absent + absent→ no element at all
 *
 * The last two are why "unknown" and "in progress" cannot share a representation: a completed
 * qualification whose year was never recorded would otherwise render as still in progress,
 * which states something false about the person.
 */
function dateRange(entry, doc) {
  const hasStart = Number.isInteger(entry.startYear);
  const ongoing = entry.endYear === null;
  const hasEnd = Number.isInteger(entry.endYear);

  if (!hasStart && !ongoing && !hasEnd) return null;

  const year = (value) =>
    el(doc, 'time', { text: String(value), attrs: { datetime: String(value) } });

  const children = [];

  if (hasStart) {
    if (!ongoing && !hasEnd) {
      children.push(doc.createTextNode('Desde '), year(entry.startYear));
    } else {
      children.push(year(entry.startYear), doc.createTextNode(' – '));
    }
  }

  if (hasEnd) children.push(year(entry.endYear));
  else if (ongoing) children.push(el(doc, 'span', { text: 'Em andamento' }));

  return el(doc, 'p', { className: 'timeline__dates', attrs: { 'data-dates': '' }, children });
}

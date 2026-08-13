import { requireFields, el } from './helpers.js';

const REQUIRED = ['id', 'company', 'title', 'startDate'];

/**
 * Ships with an empty collection, so this component renders nothing and app.js removes the
 * section outright. Adding the first entry to js/data/experiences.js makes it appear.
 *
 * @param {object[]} experiences
 * @param {Document} doc
 * @returns {DocumentFragment|null}
 */
export function renderExperience(experiences, doc) {
  if (experiences.length === 0) return null;

  const list = el(doc, 'ul', { className: 'timeline' });
  for (const entry of experiences) list.append(item(entry, doc));

  const fragment = doc.createDocumentFragment();
  fragment.append(list);
  return fragment;
}

function item(entry, doc) {
  requireFields(entry, REQUIRED, 'Experience');

  const achievements =
    Array.isArray(entry.achievements) && entry.achievements.length > 0
      ? el(doc, 'ul', {
          className: 'timeline__achievements',
          children: entry.achievements.map((achievement) =>
            el(doc, 'li', { text: achievement, attrs: { 'data-achievement': '' } }),
          ),
        })
      : null;

  return el(doc, 'li', {
    className: 'timeline__item card',
    attrs: { 'data-experience': entry.id },
    children: [
      el(doc, 'h3', {
        className: 'timeline__title',
        text: `${entry.title} — ${entry.company}`,
      }),
      dateRange(entry, doc),
      entry.summary
        ? el(doc, 'p', {
            className: 'timeline__summary',
            text: entry.summary,
            attrs: { 'data-summary': '' },
          })
        : null,
      achievements,
    ],
  });
}

/** A null endDate means the role is ongoing, which reads as "Atual" rather than a date. */
function dateRange(entry, doc) {
  const children = [time(entry.startDate, doc)];

  children.push(doc.createTextNode(' – '));
  children.push(
    entry.endDate ? time(entry.endDate, doc) : el(doc, 'span', { text: 'Atual' }),
  );

  return el(doc, 'p', { className: 'timeline__dates', children });
}

function time(yearMonth, doc) {
  const [year, month] = yearMonth.split('-');
  return el(doc, 'time', { text: `${month}/${year}`, attrs: { datetime: yearMonth } });
}

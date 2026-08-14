import { requireFields, el } from './helpers.js';

const REQUIRED = ['id', 'title', 'date', 'description', 'photo', 'photoAlt'];

/**
 * The photograph's reserved box, not the file's own size.
 *
 * The frame is fixed at 16:9 in sections.css, so this is the shape the page actually draws — which
 * is what `width`/`height` exist to reserve. Per-entry intrinsic dimensions would describe a box
 * that never appears, and would be one more number the owner could state wrongly (research R5).
 * `object-fit: cover` absorbs whatever proportions the source file happens to have.
 */
const IMAGE_WIDTH = 1280;
const IMAGE_HEIGHT = 720;

/**
 * Ships with an empty collection, so this component renders nothing and app.js removes the
 * section outright. Adding the first entry to js/data/talks.js makes it appear.
 *
 * @param {object[]} talks
 * @param {Document} doc
 * @returns {DocumentFragment|null}
 */
export function renderTalks(talks, doc) {
  if (talks.length === 0) return null;

  const list = el(doc, 'ul', { className: 'talk-list' });
  for (const [index, entry] of byMostRecent(talks).entries()) list.append(item(entry, index, doc));

  const fragment = doc.createDocumentFragment();
  fragment.append(list);
  return fragment;
}

/**
 * Most recent first (FR-011).
 *
 * This is the one component on the site that sorts; every other renders in array order. Talks
 * carry a date, so the data already contains the answer, and making a human re-encode it as
 * authoring order is a rule that gets broken quietly. `AAAA-MM-DD` sorts lexicographically, so
 * this is a string comparison — no Date, no locale (research R6).
 *
 * The copy is not defensive style. Array.prototype.sort works in place, and the unit suite freezes
 * its fixtures, so sorting the argument itself would throw.
 */
function byMostRecent(talks) {
  return [...talks].sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * `index` decides only whether the photograph is deferred. It is passed in rather than derived
 * because the decision belongs to position in the rendered list, which the entry cannot know.
 */
function item(entry, index, doc) {
  requireFields(entry, REQUIRED, 'Talk');

  return el(doc, 'li', {
    className: 'talk card',
    attrs: { 'data-talk': entry.id },
    children: [
      photo(entry, index, doc),
      el(doc, 'h3', { className: 'talk__title', text: entry.title }),
      meta(entry, doc),
      el(doc, 'p', {
        className: 'talk__description',
        text: entry.description,
        attrs: { 'data-description': '' },
      }),
      link(entry, doc),
    ],
  });
}

/**
 * The photograph leads the card: it is the reason this section sits directly under the hero, and
 * the reason a visitor stops on it at all.
 *
 * The first one is NOT deferred. The section is the first thing below the hero, so on a tall phone
 * this card can already be inside the initial viewport, and `loading="lazy"` on an image the
 * visitor is looking at is a visible blank (FR-034). Everything after it is deferred.
 *
 * No `fetchpriority`: the hero portrait owns that, and two images competing for it means neither
 * is prioritised.
 */
function photo(entry, index, doc) {
  return el(doc, 'img', {
    className: 'talk__photo',
    attrs: {
      src: entry.photo,
      alt: entry.photoAlt,
      width: String(IMAGE_WIDTH),
      height: String(IMAGE_HEIGHT),
      loading: index === 0 ? 'eager' : 'lazy',
      decoding: 'async',
    },
  });
}

/**
 * Date, and the event when there is one. One line rather than two: they are the two facts a
 * visitor scans for after the title, and separating them would give the card a second thin row
 * saying almost nothing.
 */
function meta(entry, doc) {
  const children = [date(entry.date, doc)];

  if (entry.event) {
    children.push(doc.createTextNode(' · '));
    children.push(el(doc, 'span', { text: entry.event, attrs: { 'data-event': '' } }));
  }

  return el(doc, 'p', { className: 'talk__meta', children });
}

/** `12/03/2025` from `2025-03-12`, alongside the machine-readable form (FR-018). */
function date(isoDate, doc) {
  const [year, month, day] = isoDate.split('-');

  return el(doc, 'time', {
    className: 'talk__date',
    text: `${day}/${month}/${year}`,
    attrs: { datetime: isoDate },
  });
}

/**
 * The label comes from the data and is used verbatim, because only the data knows where the link
 * goes — a recording, a slide deck and an event page are three different promises, and a generated
 * name would have to pick one (FR-006).
 */
function link(entry, doc) {
  if (!entry.link) return null;

  return el(doc, 'a', {
    className: 'talk__link',
    text: entry.link.label,
    attrs: {
      href: entry.link.url,
      rel: 'noopener noreferrer',
      target: '_blank',
      'data-link': '',
    },
  });
}

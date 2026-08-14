import { requireFields, el, icon } from './helpers.js';

/**
 * Community — technical-community participation (FR-033 – FR-038).
 *
 * Organising a user group, speaking, mentoring, contributing to open source: one of the
 * strongest available signals of seniority, and the site showed none of it.
 *
 * The collection SHIPS EMPTY (FR-038), so nothing here reaches a visitor today. That is
 * deliberate, and it is why the fixture coverage in tests/unit/community.test.js is the only
 * thing standing between this file and a defect the owner discovers on the day they finally
 * supply real content.
 */

const REQUIRED = ['id', 'organisation', 'contribution'];

/**
 * @param {object[]} activities
 * @param {Document} doc
 * @returns {DocumentFragment|null}
 */
export function renderCommunity(activities, doc) {
  if (activities.length === 0) return null;

  const list = el(doc, 'ul', { className: 'community-list' });
  for (const activity of activities) list.append(item(activity, doc));

  const fragment = doc.createDocumentFragment();
  fragment.append(list);
  return fragment;
}

function item(activity, doc) {
  requireFields(activity, REQUIRED, 'CommunityActivity');

  return el(doc, 'li', {
    className: 'community card',
    attrs: { 'data-community': activity.id },
    children: [
      el(doc, 'h3', { className: 'community__organisation', text: activity.organisation }),
      el(doc, 'p', {
        className: 'community__contribution',
        text: activity.contribution,
        attrs: { 'data-contribution': '' },
      }),
      optional(doc, activity.period, 'community__period', 'data-period'),
      optional(doc, activity.description, 'community__description', 'data-description'),
      metrics(activity, doc),
      links(activity, doc),
    ],
  });
}

/** Absent → null, which `el()` drops. No empty element, no dangling label (contract CM3-3). */
function optional(doc, value, className, flag) {
  if (!value) return null;

  return el(doc, 'p', { className, text: value, attrs: { [flag]: '' } });
}

/**
 * Metrics (FR-035, FR-036).
 *
 * The presence test is `value === undefined`, NOT truthiness. A metric of `0` is a real
 * measurement — "zero incidentes", "zero palestras este ano" — and the obvious `if (m.value)`
 * silently deletes it. That is the single most likely defect in this file, which is why
 * contract CM3-5 exists and why tests/fixtures/index.js carries a zero-valued fixture.
 *
 * Nothing is synthesised, defaulted or inferred: a metric absent from the data produces no
 * element (FR-037, contract CM3-8).
 */
function metrics(activity, doc) {
  const entries = (activity.metrics ?? []).filter(
    (metric) => metric && metric.value !== undefined && metric.value !== null,
  );

  if (entries.length === 0) return null;

  return el(doc, 'ul', {
    className: 'metric-list',
    children: entries.map((metric) =>
      el(doc, 'li', {
        className: 'metric',
        attrs: { 'data-metric': '' },
        children: [
          el(doc, 'span', { className: 'metric__value', text: String(metric.value) }),
          el(doc, 'span', { className: 'metric__unit', text: metric.unit }),
        ],
      }),
    ),
  });
}

/**
 * Each link's accessible name is its own `label`, which the schema requires to identify the
 * destination unaided (FR-059, contract CM3-6). Absent or empty `links` produces no container.
 */
function links(activity, doc) {
  const entries = activity.links ?? [];
  if (entries.length === 0) return null;

  return el(doc, 'div', {
    className: 'community__links',
    children: entries.map((entry) =>
      el(doc, 'a', {
        className: 'button button--ghost',
        attrs: {
          href: entry.url,
          'aria-label': entry.label,
          rel: 'noopener noreferrer',
          target: '_blank',
        },
        children: [icon(doc, 'external-link'), doc.createTextNode(entry.label)],
      }),
    ),
  });
}

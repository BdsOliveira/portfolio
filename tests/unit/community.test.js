import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { renderCommunity } from '../../js/components/community.js';
import { createDocument, mountFragment, textsOf } from './_setup.js';
import {
  community,
  communityZeroMetric,
  communityEmptyMetrics,
  communityNoPeriod,
  communityLinksOnly,
  communityMissingContribution,
  emptyCollection,
} from '../fixtures/index.js';

/**
 * Contracts CM3-1 … CM3-8.
 *
 * js/data/community.js ships empty (FR-038), so this file is the *only* place the populated path
 * is ever exercised. Everything below is the coverage standing between the renderer and a defect
 * the owner would discover on the day they supply real content.
 */

const render = (data) => {
  const doc = createDocument();
  const fragment = renderCommunity(data, doc);
  return fragment === null ? null : mountFragment(doc, fragment);
};

const emptyElementsIn = (host) =>
  [...host.querySelectorAll('*')]
    .filter(
      (node) =>
        node.children.length === 0 &&
        node.textContent.trim() === '' &&
        !['IMG', 'USE', 'SVG', 'BR'].includes(node.tagName),
    )
    .map((node) => node.tagName);

describe('renderCommunity', () => {
  test('CM3-1 · one item per activity, in array order, as a single <ul>', () => {
    const host = render(community);

    assert.equal(host.querySelectorAll('ul.community-list').length, 1);
    assert.deepEqual(
      textsOf(host, 'li h3'),
      community.map((activity) => activity.organisation),
    );
  });

  test('CM3-1 · order follows the array, with no sort at render time', () => {
    const forward = textsOf(render(community), 'li h3');
    const reversed = textsOf(render([...community].reverse()), 'li h3');

    assert.deepEqual(reversed, [...forward].reverse());
  });

  test('CM3-2 · organisation is an <h3> and contribution is its own element', () => {
    const host = render([community[0]]);

    assert.equal(host.querySelector('h3').textContent, community[0].organisation);
    assert.equal(
      host.querySelector('[data-contribution]').textContent,
      community[0].contribution,
    );
  });

  test('CM3-2 · a missing required field throws naming entity, field and id', () => {
    const doc = createDocument();

    assert.throws(() => renderCommunity(communityMissingContribution, doc), (error) => {
      assert.match(error.message, /CommunityActivity/i);
      assert.match(error.message, /contribution/);
      assert.match(error.message, /fixture-community-broken/);
      return true;
    });
  });

  test('CM3-3 · an activity with only its required fields renders no empty element', () => {
    const host = render([community[1]]);

    assert.equal(host.querySelectorAll('[data-period]').length, 0);
    assert.equal(host.querySelectorAll('[data-description]').length, 0);
    assert.equal(host.querySelectorAll('.metric-list').length, 0);
    assert.equal(host.querySelectorAll('.community__links').length, 0);
    assert.deepEqual(emptyElementsIn(host), []);
  });

  test('CM3-3 · a missing period leaves no dangling label', () => {
    const host = render(communityNoPeriod);

    assert.equal(host.querySelectorAll('[data-period]').length, 0);
    assert.deepEqual(emptyElementsIn(host), []);
    // The rest of the activity still renders.
    assert.equal(host.querySelectorAll('[data-metric]').length, 1);
  });

  test('CM3-4 · metrics render with both value and unit', () => {
    const host = render([community[0]]);
    const metrics = [...host.querySelectorAll('[data-metric]')];

    assert.equal(metrics.length, community[0].metrics.length);

    metrics.forEach((node, index) => {
      const expected = community[0].metrics[index];
      assert.equal(node.querySelector('.metric__value').textContent, String(expected.value));
      assert.equal(node.querySelector('.metric__unit').textContent, expected.unit);
    });
  });

  test('CM3-4 · metrics are a <ul> of <li> (contract C-12)', () => {
    const host = render([community[0]]);

    for (const metric of host.querySelectorAll('[data-metric]')) {
      assert.equal(metric.tagName, 'LI');
      assert.equal(metric.parentElement.tagName, 'UL');
    }
  });

  test('CM3-4 · no metrics key produces no list element at all', () => {
    assert.equal(render([community[1]]).querySelectorAll('.metric-list').length, 0);
  });

  test('CM3-4 · a declared-but-empty metrics array is indistinguishable from none', () => {
    const host = render(communityEmptyMetrics);

    assert.equal(host.querySelectorAll('.metric-list').length, 0, 'an empty metric list rendered');
    assert.equal(host.querySelectorAll('.community__links').length, 0);
    assert.deepEqual(emptyElementsIn(host), []);
  });

  /**
   * FR-036. The whole reason this contract is written down.
   *
   * `if (metric.value)` deletes a zero. So does `metric.value || fallback`. Both read as
   * obviously correct, and both turn "0 palestras este ano" — a true, deliberate statement —
   * into silence.
   */
  test('CM3-5 · a metric value of zero renders', () => {
    const host = render(communityZeroMetric);
    const metric = host.querySelector('[data-metric]');

    assert.ok(metric, 'a zero-valued metric was dropped entirely');
    assert.equal(metric.querySelector('.metric__value').textContent, '0');
    assert.equal(
      metric.querySelector('.metric__unit').textContent,
      communityZeroMetric[0].metrics[0].unit,
    );
    assert.match(host.textContent, /0/);
  });

  test('CM3-6 · each link carries its own label as accessible name', () => {
    const host = render(communityLinksOnly);
    const anchors = [...host.querySelectorAll('a')];

    assert.equal(anchors.length, communityLinksOnly[0].links.length);

    anchors.forEach((anchor, index) => {
      const expected = communityLinksOnly[0].links[index];

      assert.equal(anchor.getAttribute('href'), expected.url);
      assert.equal(anchor.getAttribute('aria-label'), expected.label);
      assert.equal(anchor.getAttribute('rel'), 'noopener noreferrer');
      assert.equal(anchor.getAttribute('target'), '_blank');
    });
  });

  test('CM3-6 · links render without metrics, and metrics without links', () => {
    const linksOnly = render(communityLinksOnly);
    assert.ok(linksOnly.querySelector('.community__links'));
    assert.equal(linksOnly.querySelectorAll('.metric-list').length, 0);

    const metricsOnly = render(communityNoPeriod);
    assert.ok(metricsOnly.querySelector('.metric-list'));
    assert.equal(metricsOnly.querySelectorAll('.community__links').length, 0);
  });

  test('CM3-7 · an empty collection returns null', () => {
    assert.equal(render(emptyCollection), null);
  });

  test('CM3-8 · no metric appears that is not in the data', () => {
    const host = render(communityLinksOnly);

    // This activity declares no metrics. Nothing may be synthesised, defaulted or inferred.
    assert.equal(host.querySelectorAll('[data-metric]').length, 0);
  });

  test('the whole fixture set renders with no visually empty element', () => {
    for (const fixture of [
      community,
      communityZeroMetric,
      communityEmptyMetrics,
      communityNoPeriod,
      communityLinksOnly,
    ]) {
      assert.deepEqual(emptyElementsIn(render(fixture)), [], 'an empty element was rendered');
    }
  });
});
